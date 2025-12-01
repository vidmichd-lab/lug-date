/**
 * Notifications API routes
 * Manage user notifications about matches
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { logger } from '../logger';
import { matchRepository } from '../repositories/matchRepository';
import { userRepository } from '../repositories/userRepository';
import { eventRepository } from '../repositories/eventRepository';

const router = Router();

// Get notifications
router.get('/notifications', telegramAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    // Get user's matches (these are notifications)
    const matches = await matchRepository.getMatchesByUserId(user.id, 50, 0);

    // Enrich matches with user and event data
    const notifications = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.userId1 === user.id ? match.userId2 : match.userId1;
        const otherUser = await userRepository.getUserById(otherUserId);
        const event = match.eventId ? await eventRepository.getEventById(match.eventId) : null;

        return {
          id: match.id,
          type: 'match',
          matchId: match.id,
          user: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            photoUrl: otherUser.photoUrl,
          } : null,
          event: event ? {
            id: event.id,
            title: event.title,
            imageUrl: event.imageUrl,
            location: event.location,
            date: event.date,
          } : null,
          createdAt: match.createdAt,
          read: false, // TODO: Add read status to matches table
        };
      })
    );

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Confirm meeting
router.post(
  '/notifications/:notificationId/confirm-meeting',
  telegramAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.telegramUser?.id.toString();
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // TODO: Implement real meeting confirmation
      // This should mark the meeting as confirmed by this user

      logger.info({
        type: 'meeting_confirmed',
        userId,
        notificationId,
      });

      res.json({
        success: true,
        data: { confirmed: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Archive notification
router.post(
  '/notifications/:notificationId/archive',
  telegramAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.telegramUser?.id.toString();
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // TODO: Implement real archiving
      // This should mark the notification as archived

      logger.info({
        type: 'notification_archived',
        userId,
        notificationId,
      });

      res.json({
        success: true,
        data: { archived: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

