/**
 * Matches API routes
 * Example implementation with logging and bot notifications
 */

import { Router, Request, Response, NextFunction } from 'express';
import { logMatch } from '../logger';
import { logger } from '../logger';

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
    // TODO: Replace with actual database query
    const user1TelegramId = 123456789; // Get from DB
    const user2TelegramId = 987654321; // Get from DB
    
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

// Example: Create a match
router.post('/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId1, userId2, eventId } = req.body;

    // Validate input
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        error: 'userId1 and userId2 are required',
      });
    }

    // TODO: Create match in database
    const matchId = `match-${Date.now()}`;

    // Log match creation
    logMatch(matchId, userId1, userId2, eventId);

    // Send notification to bot (async, don't wait)
    notifyBotAboutMatch({ userId1, userId2, matchId, eventId }).catch((error) => {
      logger.error({ error, type: 'match_notification_error' });
    });

    res.json({
      success: true,
      data: {
        id: matchId,
        userId1,
        userId2,
        eventId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Example: Get matches
router.get('/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Fetch matches from database
    const matches: any[] = [];

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

