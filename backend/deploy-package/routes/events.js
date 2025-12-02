"use strict";
/**
 * Events API routes
 * Get event details
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramAuth_1 = require("../middleware/telegramAuth");
const eventRepository_1 = require("../repositories/eventRepository");
const router = (0, express_1.Router)();
// Get event by ID
router.get('/events/:eventId', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const event = await eventRepository_1.eventRepository.getEventById(eventId);
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
