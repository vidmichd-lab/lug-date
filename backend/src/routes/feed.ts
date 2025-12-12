/**
 * Feed API routes
 * Returns feed of events and profiles for swiping
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { validate } from '../validation/validate';
import { z } from 'zod';
import { logger } from '../logger';
import { eventRepository } from '../repositories/eventRepository';
import { userRepository } from '../repositories/userRepository';
import { likeRepository } from '../repositories/likeRepository';
import { matchRepository } from '../repositories/matchRepository';

const router = Router();

const feedQuerySchema = z.object({
  type: z.enum(['events', 'profiles']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Get feed cards (events or profiles)
router.get(
  '/feed',
  telegramAuthMiddleware,
  validate({ query: feedQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type = 'events', category, limit = 20, offset = 0 } = req.query;
      const telegramId = req.telegramUser?.id;

      if (!telegramId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // Get current user to filter out already liked items
      let currentUser = await userRepository.getUserByTelegramId(telegramId);

      // In development mode, auto-create mock user if it doesn't exist
      if (
        !currentUser &&
        process.env.NODE_ENV === 'development' &&
        process.env.ALLOW_DEV_AUTH_BYPASS === 'true' &&
        req.telegramUser
      ) {
        const mockUserId = `dev-user-${telegramId}`;
        const mockUser = {
          id: mockUserId,
          telegramId: telegramId,
          username: req.telegramUser.username || 'dev_user',
          firstName: req.telegramUser.firstName || 'Dev',
          lastName: req.telegramUser.lastName || 'User',
          photoUrl: null,
          bio: null,
          age: null,
          city: null,
          gender: null,
          interests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await userRepository.upsertUser(mockUser);
        currentUser = await userRepository.getUserByTelegramId(telegramId);

        logger.info({
          type: 'dev_user_created',
          userId: mockUserId,
          telegramId: telegramId,
        });
      }

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      let cards: any[] = [];

      if (type === 'events') {
        // Fetch events
        const events = category
          ? await eventRepository.getEventsByCategory(
              category as string,
              Number(limit),
              Number(offset)
            )
          : await eventRepository.getEvents(Number(limit), Number(offset));

        // Get user's likes to filter out already liked events
        const userLikes = await likeRepository.getSavedEventsByUserId(currentUser.id, 1000, 0);
        const likedEventIds = new Set(userLikes.map((like) => like.eventId).filter(Boolean));

        cards = events
          .filter((event) => !likedEventIds.has(event.id))
          .map((event) => ({
            id: event.id,
            type: 'event',
            title: event.title,
            description: event.description,
            category: event.category,
            imageUrl: event.imageUrl,
            location: event.location,
            date: event.date,
          }));
      } else {
        // Fetch profiles (other users)
        // For now, return empty array as we need to implement profile matching logic
        // This would require filtering by city, age, interests, etc.
        cards = [];
      }

      res.json({
        success: true,
        data: {
          cards,
          pagination: {
            total: cards.length,
            limit: Number(limit),
            offset: Number(offset),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Record user action (like/dislike)
const actionSchema = z.object({
  cardId: z.string(),
  cardType: z.enum(['event', 'profile']),
  action: z.enum(['like', 'dislike']),
});

router.post(
  '/feed/action',
  telegramAuthMiddleware,
  validate({ body: actionSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cardId, cardType, action } = req.body;
      const telegramId = req.telegramUser?.id;

      if (!telegramId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // Get current user
      const currentUser = await userRepository.getUserByTelegramId(telegramId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      if (action === 'like') {
        if (cardType === 'event') {
          // Save like for event
          const likeId = `like-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await likeRepository.createLike({
            id: likeId,
            fromUserId: currentUser.id,
            toUserId: '', // Empty for event likes
            eventId: cardId,
            createdAt: new Date(),
          });

          // Check if other users liked this event - create matches
          const eventLikes = await likeRepository.getLikesByEventId(cardId);
          const otherUserIds = eventLikes
            .filter((like) => like.fromUserId !== currentUser.id)
            .map((like) => like.fromUserId);

          // Create matches with other users who liked this event
          for (const otherUserId of otherUserIds) {
            const matchExists = await matchRepository.matchExists(currentUser.id, otherUserId);
            if (!matchExists) {
              const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              await matchRepository.createMatch({
                id: matchId,
                userId1: currentUser.id,
                userId2: otherUserId,
                eventId: cardId,
                createdAt: new Date(),
              });
            }
          }
        } else if (cardType === 'profile') {
          // Save like for profile
          const targetUser = await userRepository.getUserById(cardId);
          if (!targetUser) {
            return res.status(404).json({
              success: false,
              error: {
                message: 'Target user not found',
                code: 'NOT_FOUND',
              },
            });
          }

          const likeId = `like-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await likeRepository.createLike({
            id: likeId,
            fromUserId: currentUser.id,
            toUserId: targetUser.id,
            eventId: undefined,
            createdAt: new Date(),
          });

          // Check for mutual like - create match
          const mutualLikes = await likeRepository.getMutualLikes(currentUser.id, targetUser.id);
          const hasMutualLike = mutualLikes.some(
            (like) => like.fromUserId === targetUser.id && like.toUserId === currentUser.id
          );

          if (hasMutualLike) {
            const matchExists = await matchRepository.matchExists(currentUser.id, targetUser.id);
            if (!matchExists) {
              const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              await matchRepository.createMatch({
                id: matchId,
                userId1: currentUser.id,
                userId2: targetUser.id,
                eventId: undefined,
                createdAt: new Date(),
              });
            }
          }
        }
      }
      // For 'dislike', we don't save anything - just skip the card

      logger.info({
        type: 'feed_action',
        userId: currentUser.id,
        cardId,
        cardType,
        action,
      });

      res.json({
        success: true,
        data: { recorded: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
