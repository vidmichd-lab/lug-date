"use strict";
/**
 * Matches API routes
 * Example implementation with logging and bot notifications
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../logger");
const logger_2 = require("../logger");
const validate_1 = require("../validation/validate");
const schemas_1 = require("../validation/schemas");
const matchRepository_1 = require("../repositories/matchRepository");
const userRepository_1 = require("../repositories/userRepository");
const router = (0, express_1.Router)();
// Helper function to send notification to bot
async function notifyBotAboutMatch(matchData) {
    try {
        // Get user telegram IDs from database
        const user1 = await userRepository_1.userRepository.getUserById(matchData.userId1);
        const user2 = await userRepository_1.userRepository.getUserById(matchData.userId2);
        if (!user1 || !user2) {
            logger_2.logger.warn({ type: 'bot_notification_skipped', reason: 'users_not_found', matchId: matchData.matchId });
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
    }
    catch (error) {
        logger_2.logger.error({ error, type: 'bot_notification_failed', matchId: matchData.matchId });
    }
}
// Create a match
router.post('/matches', (0, validate_1.validate)({ body: schemas_1.createMatchSchema }), async (req, res, next) => {
    try {
        const { userId1, userId2, eventId } = req.body;
        // Check if match already exists
        const exists = await matchRepository_1.matchRepository.matchExists(userId1, userId2);
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
        const createdMatch = await matchRepository_1.matchRepository.createMatch(match);
        // Log match creation
        (0, logger_1.logMatch)(createdMatch.id, userId1, userId2, eventId);
        // Send notification to bot (async, don't wait)
        notifyBotAboutMatch({ userId1, userId2, matchId: createdMatch.id, eventId }).catch((error) => {
            logger_2.logger.error({ error, type: 'match_notification_error' });
        });
        res.json({
            success: true,
            data: createdMatch,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get matches
router.get('/matches', (0, validate_1.validate)({ query: schemas_1.getMatchesQuerySchema }), async (req, res, next) => {
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
        const matches = await matchRepository_1.matchRepository.getMatchesByUserId(userId || currentUserId, Number(limit), Number(offset));
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
