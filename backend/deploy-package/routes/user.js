"use strict";
/**
 * User API routes
 * Manage user profile and account
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramAuth_1 = require("../middleware/telegramAuth");
const validate_1 = require("../validation/validate");
const zod_1 = require("zod");
const logger_1 = require("../logger");
const userRepository_1 = require("../repositories/userRepository");
const router = (0, express_1.Router)();
const updateProfileSchema = zod_1.z.object({
    goal: zod_1.z.enum(['find-friends', 'networking', 'dating', 'serious-relationship', 'other']).optional(),
    bio: zod_1.z.string().max(200).optional(),
    job: zod_1.z.string().max(32).optional(),
    company: zod_1.z.string().max(32).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    city: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['male', 'female', 'prefer-not-to-say']).optional(),
    birthDate: zod_1.z
        .object({
        day: zod_1.z.number().int().min(1).max(31),
        month: zod_1.z.number().int().min(1).max(12),
        year: zod_1.z.number().int().min(1900).max(new Date().getFullYear()),
    })
        .optional(),
    photo: zod_1.z.string().url().optional(),
    settings: zod_1.z
        .object({
        isOnline: zod_1.z.boolean().optional(),
        showMeetingCounter: zod_1.z.boolean().optional(),
        showAge: zod_1.z.boolean().optional(),
        notifyAboutMatches: zod_1.z.boolean().optional(),
        notifyAboutUpdates: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// Get user profile
router.get('/user/profile', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
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
        // Get user by Telegram ID
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
        res.json({
            success: true,
            data: {
                profile: user,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.patch('/user/profile', telegramAuth_1.telegramAuthMiddleware, (0, validate_1.validate)({ body: updateProfileSchema }), async (req, res, next) => {
    try {
        const telegramId = req.telegramUser?.id;
        const profileData = req.body;
        if (!telegramId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED',
                },
            });
        }
        // Get user by Telegram ID first
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
        // Prepare update data
        const updates = {};
        if (profileData.bio !== undefined) {
            updates.bio = profileData.bio;
        }
        if (profileData.photo !== undefined) {
            updates.photoUrl = profileData.photo;
        }
        if (profileData.birthDate) {
            // Calculate age from birthDate
            const birthDate = new Date(profileData.birthDate.year, profileData.birthDate.month - 1, profileData.birthDate.day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            updates.age = age;
        }
        // Update user in database
        const updatedUser = await userRepository_1.userRepository.updateUser(user.id, updates);
        logger_1.logger.info({
            type: 'profile_updated',
            userId: user.id,
            fields: Object.keys(updates),
        });
        res.json({
            success: true,
            data: { profile: updatedUser },
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete user account
router.delete('/user/account', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.telegramUser?.id.toString();
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED',
                },
            });
        }
        // TODO: Implement real account deletion
        // This should:
        // 1. Mark user as deleted (soft delete) or remove from database
        // 2. Remove all related data (matches, likes, etc.)
        // 3. Clean up uploaded photos from Object Storage
        logger_1.logger.info({
            type: 'account_deleted',
            userId,
        });
        res.json({
            success: true,
            data: { deleted: true },
        });
    }
    catch (error) {
        next(error);
    }
});
// Get user by ID (for profile popup)
router.get('/users/:userId', telegramAuth_1.telegramAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await userRepository_1.userRepository.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'NOT_FOUND',
                },
            });
        }
        res.json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
