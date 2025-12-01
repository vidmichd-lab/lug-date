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

const router = Router();

// Helper function to send notification to bot
async function notifyBotAboutMatch(matchData: {
  userId1: string;
  userId2: string;
  matchId: string;
  eventId?: string;
}) {
  try {
    // Get user telegram IDs from database
    const user1 = await userRepository.getUserById(matchData.userId1);
    const user2 = await userRepository.getUserById(matchData.userId2);
    
    if (!user1 || !user2) {
      logger.warn({ type: 'bot_notification_skipped', reason: 'users_not_found', matchId: matchData.matchId });
      return;
    }
    
    const user1TelegramId = user1.telegramId;
    const user2TelegramId = user2.telegramId;
    
    // Call bot webhook or use bot service directly
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL || 'http://localhost:3001/notify/match';
    
    await fetch(botWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId1: user1TelegramId,
        userId2: user2TelegramId,
        matchId: matchData.matchId,
        eventId: matchData.eventId,
      }),
    });
  } catch (error) {
    logger.error({ error, type: 'bot_notification_failed', matchId: matchData.matchId });
  }
}

// Create a match
router.post('/matches', validate({ body: createMatchSchema }), async (req: Request, res: Response, next: NextFunction) => {
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

    // Send notification to bot (async, don't wait)
    notifyBotAboutMatch({ userId1, userId2, matchId: createdMatch.id, eventId }).catch((error) => {
      logger.error({ error, type: 'match_notification_error' });
    });

    res.json({
      success: true,
      data: createdMatch,
    });
  } catch (error) {
    next(error);
  }
});

// Get matches
router.get('/matches', validate({ query: getMatchesQuerySchema }), async (req: Request, res: Response, next: NextFunction) => {
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
      userId as string || currentUserId,
      Number(limit),
      Number(offset)
    );

    // Filter by eventId if provided
    const filteredMatches = eventId
      ? matches.filter((m) => m.eventId === eventId)
      : matches;

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
});

export default router;

