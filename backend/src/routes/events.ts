/**
 * Events API routes
 * Get event details
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { logger } from '../logger';
import { eventRepository } from '../repositories/eventRepository';

const router = Router();

// Get event by ID
router.get('/events/:eventId', telegramAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const event = await eventRepository.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Event not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: {
        event,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

