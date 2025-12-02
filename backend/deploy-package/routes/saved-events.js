"use strict";
/**
 * Saved Events API routes
 * Manage user's saved events (favorites)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramAuth_1 = require("../middleware/telegramAuth");
const validate_1 = require("../validation/validate");
const zod_1 = require("zod");
const logger_1 = require("../logger");
const likeRepository_1 = require("../repositories/likeRepository");
const eventRepository_1 = require("../repositories/eventRepository");
const userRepository_1 = require("../repositories/userRepository");
const router = (0, express_1.Router)();
const savedEventsQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional().default(20),
    offset: zod_1.z.coerce.number().int().min(0).optional().default(0),
});
// Get saved events
router.get('/saved-events', telegramAuth_1.telegramAuthMiddleware, (0, validate_1.validate)({ query: savedEventsQuerySchema }), async (req, res, next) => {
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
        // Get saved events (likes with eventId)
        const savedLikes = await likeRepository_1.likeRepository.getSavedEventsByUserId(user.id, Number(limit), Number(offset));
        // Get event IDs
        const eventIds = savedLikes
            .map(like => like.eventId)
            .filter((id) => !!id);
        // Fetch events
        const events = await eventRepository_1.eventRepository.getEventsByIds(eventIds);
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
    }
    catch (error) {
        next(error);
    }
});
// Remove from saved
router.delete('/saved-events/:eventId', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
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
        // Remove saved event
        await likeRepository_1.likeRepository.deleteSavedEvent(user.id, eventId);
        logger_1.logger.info({
            type: 'saved_event_removed',
            userId: user.id,
            eventId,
        });
        res.json({
            success: true,
            data: { removed: true },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
