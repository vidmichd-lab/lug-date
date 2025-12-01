/**
 * Saved Events API routes
 * Manage user's saved events (favorites)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { validate } from '../validation/validate';
import { z } from 'zod';
import { logger } from '../logger';
import { likeRepository } from '../repositories/likeRepository';
import { eventRepository } from '../repositories/eventRepository';
import { userRepository } from '../repositories/userRepository';

const router = Router();

const savedEventsQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Get saved events
router.get(
  '/saved-events',
  telegramAuthMiddleware,
  validate({ query: savedEventsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const telegramId = req.telegramUser?.id;
      const { category, limit = 20, offset = 0 } = req.query;

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
      const user = await userRepository.getUserByTelegramId(telegramId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      // Get saved events (likes with eventId)
      const savedLikes = await likeRepository.getSavedEventsByUserId(
        user.id,
        Number(limit),
        Number(offset)
      );

      // Get event IDs
      const eventIds = savedLikes
        .map(like => like.eventId)
        .filter((id): id is string => !!id);

      // Fetch events
      const events = await eventRepository.getEventsByIds(eventIds);

      // Filter by category if provided
      const filteredEvents = category
        ? events.filter(event => event.category === category)
        : events;

      res.json({
        success: true,
        data: {
          events: filteredEvents,
          total: filteredEvents.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove from saved
router.delete(
  '/saved-events/:eventId',
  telegramAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const telegramId = req.telegramUser?.id;
      const { eventId } = req.params;

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
      const user = await userRepository.getUserByTelegramId(telegramId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      // Remove saved event
      await likeRepository.deleteSavedEvent(user.id, eventId);

      logger.info({
        type: 'saved_event_removed',
        userId: user.id,
        eventId,
      });

      res.json({
        success: true,
        data: { removed: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

