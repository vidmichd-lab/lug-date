/**
 * Matches API routes
 * Example implementation with logging and bot notifications
 */

import { Router, Request, Response, NextFunction } from 'express';
import { logMatch } from '../logger';
import { logger } from '../logger';
import { validate } from '../validation/validate';
import { createMatchSchema, getMatchesQuerySchema } from '../validation/schemas';
import { matchRepository } from '../repositories/matchRepository';
import { userRepository } from '../repositories/userRepository';
import { sendMatchNotification } from '../services/queue';

const router = Router();

// Create a match
router.post(
  '/matches',
  validate({ body: createMatchSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId1, userId2, eventId } = req.body;

      // Check if match already exists
      const exists = await matchRepository.matchExists(userId1, userId2);
      if (exists) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Match already exists',
            code: 'DUPLICATE_ENTRY',
          },
        });
      }

      // Create match in database
      const match = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId1,
        userId2,
        eventId,
        createdAt: new Date(),
      };

      const createdMatch = await matchRepository.createMatch(match);

      // Log match creation
      logMatch(createdMatch.id, userId1, userId2, eventId);

      // Get user telegram IDs for notification
      // Send notification to queue (async, non-blocking)
      // Queue service handles fallback to direct webhook if queue is not configured
      Promise.all([userRepository.getUserById(userId1), userRepository.getUserById(userId2)])
        .then(([user1, user2]) => {
          if (!user1 || !user2) {
            logger.warn({
              type: 'match_notification_skipped',
              reason: 'users_not_found',
              matchId: createdMatch.id,
            });
            return;
          }

          return sendMatchNotification({
            userId1,
            userId2,
            telegramId1: user1.telegramId,
            telegramId2: user2.telegramId,
            matchId: createdMatch.id,
            eventId,
          });
        })
        .catch((error) => {
          // Error is already logged in sendMatchNotification
          logger.error({
            error,
            type: 'match_notification_send_failed',
            matchId: createdMatch.id,
          });
        });

      res.json({
        success: true,
        data: createdMatch,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get matches
router.get(
  '/matches',
  validate({ query: getMatchesQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, eventId, limit = 20, offset = 0 } = req.query;

      // Get current user from Telegram auth
      const currentUserId = req.telegramUser?.id.toString();
      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // Fetch matches from database
      const matches = await matchRepository.getMatchesByUserId(
        (userId as string) || currentUserId,
        Number(limit),
        Number(offset)
      );

      // Filter by eventId if provided
      const filteredMatches = eventId ? matches.filter((m) => m.eventId === eventId) : matches;

      res.json({
        success: true,
        data: filteredMatches,
        pagination: {
          total: filteredMatches.length,
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
