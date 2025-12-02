"use strict";
/**
 * Feed API routes
 * Returns feed of events and profiles for swiping
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramAuth_1 = require("../middleware/telegramAuth");
const validate_1 = require("../validation/validate");
const zod_1 = require("zod");
const logger_1 = require("../logger");
const eventRepository_1 = require("../repositories/eventRepository");
const userRepository_1 = require("../repositories/userRepository");
const likeRepository_1 = require("../repositories/likeRepository");
const matchRepository_1 = require("../repositories/matchRepository");
const router = (0, express_1.Router)();
const feedQuerySchema = zod_1.z.object({
    type: zod_1.z.enum(['events', 'profiles']).optional(),
    category: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional().default(20),
    offset: zod_1.z.coerce.number().int().min(0).optional().default(0),
});
// Get feed cards (events or profiles)
router.get('/feed', telegramAuth_1.telegramAuthMiddleware, (0, validate_1.validate)({ query: feedQuerySchema }), async (req, res, next) => {
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
        const currentUser = await userRepository_1.userRepository.getUserByTelegramId(telegramId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'NOT_FOUND',
                },
            });
        }
        let cards = [];
        if (type === 'events') {
            // Fetch events
            const events = category
                ? await eventRepository_1.eventRepository.getEventsByCategory(category, Number(limit), Number(offset))
                : await eventRepository_1.eventRepository.getEvents(Number(limit), Number(offset));
            // Get user's likes to filter out already liked events
            const userLikes = await likeRepository_1.likeRepository.getSavedEventsByUserId(currentUser.id, 1000, 0);
            const likedEventIds = new Set(userLikes.map(like => like.eventId).filter(Boolean));
            cards = events
                .filter(event => !likedEventIds.has(event.id))
                .map(event => ({
                id: event.id,
                type: 'event',
                title: event.title,
                description: event.description,
                category: event.category,
                imageUrl: event.imageUrl,
                location: event.location,
                date: event.date,
            }));
        }
        else {
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
    }
    catch (error) {
        next(error);
    }
});
// Record user action (like/dislike)
const actionSchema = zod_1.z.object({
    cardId: zod_1.z.string(),
    cardType: zod_1.z.enum(['event', 'profile']),
    action: zod_1.z.enum(['like', 'dislike']),
});
router.post('/feed/action', telegramAuth_1.telegramAuthMiddleware, (0, validate_1.validate)({ body: actionSchema }), async (req, res, next) => {
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
        const currentUser = await userRepository_1.userRepository.getUserByTelegramId(telegramId);
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
                await likeRepository_1.likeRepository.createLike({
                    id: likeId,
                    fromUserId: currentUser.id,
                    toUserId: '', // Empty for event likes
                    eventId: cardId,
                    createdAt: new Date(),
                });
                // Check if other users liked this event - create matches
                const eventLikes = await likeRepository_1.likeRepository.getLikesByEventId(cardId);
                const otherUserIds = eventLikes
                    .filter(like => like.fromUserId !== currentUser.id)
                    .map(like => like.fromUserId);
                // Create matches with other users who liked this event
                for (const otherUserId of otherUserIds) {
                    const matchExists = await matchRepository_1.matchRepository.matchExists(currentUser.id, otherUserId);
                    if (!matchExists) {
                        const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        await matchRepository_1.matchRepository.createMatch({
                            id: matchId,
                            userId1: currentUser.id,
                            userId2: otherUserId,
                            eventId: cardId,
                            createdAt: new Date(),
                        });
                    }
                }
            }
            else if (cardType === 'profile') {
                // Save like for profile
                const targetUser = await userRepository_1.userRepository.getUserById(cardId);
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
                await likeRepository_1.likeRepository.createLike({
                    id: likeId,
                    fromUserId: currentUser.id,
                    toUserId: targetUser.id,
                    eventId: undefined,
                    createdAt: new Date(),
                });
                // Check for mutual like - create match
                const mutualLikes = await likeRepository_1.likeRepository.getMutualLikes(currentUser.id, targetUser.id);
                const hasMutualLike = mutualLikes.some(like => like.fromUserId === targetUser.id && like.toUserId === currentUser.id);
                if (hasMutualLike) {
                    const matchExists = await matchRepository_1.matchRepository.matchExists(currentUser.id, targetUser.id);
                    if (!matchExists) {
                        const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        await matchRepository_1.matchRepository.createMatch({
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
        logger_1.logger.info({
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
