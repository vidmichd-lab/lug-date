"use strict";
/**
 * Notifications API routes
 * Manage user notifications about matches
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramAuth_1 = require("../middleware/telegramAuth");
const logger_1 = require("../logger");
const matchRepository_1 = require("../repositories/matchRepository");
const userRepository_1 = require("../repositories/userRepository");
const eventRepository_1 = require("../repositories/eventRepository");
const router = (0, express_1.Router)();
// Get notifications
router.get('/notifications', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
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
        const user = await userRepository_1.userRepository.getUserByTelegramId(telegramId);
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
        const matches = await matchRepository_1.matchRepository.getMatchesByUserId(user.id, 50, 0);
        // Enrich matches with user and event data
        const notifications = await Promise.all(matches.map(async (match) => {
            const otherUserId = match.userId1 === user.id ? match.userId2 : match.userId1;
            const otherUser = await userRepository_1.userRepository.getUserById(otherUserId);
            const event = match.eventId ? await eventRepository_1.eventRepository.getEventById(match.eventId) : null;
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
        }));
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount: notifications.filter(n => !n.read).length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Confirm meeting
router.post('/notifications/:notificationId/confirm-meeting', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
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
        logger_1.logger.info({
            type: 'meeting_confirmed',
            userId,
            notificationId,
        });
        res.json({
            success: true,
            data: { confirmed: true },
        });
    }
    catch (error) {
        next(error);
    }
});
// Archive notification
router.post('/notifications/:notificationId/archive', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
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
        logger_1.logger.info({
            type: 'notification_archived',
            userId,
            notificationId,
        });
        res.json({
            success: true,
            data: { archived: true },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
