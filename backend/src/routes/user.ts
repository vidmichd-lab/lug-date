/**
 * User API routes
 * Manage user profile and account
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { validate } from '../validation/validate';
import { z } from 'zod';
import { logger } from '../logger';
import { userRepository } from '../repositories/userRepository';

const router = Router();

const updateProfileSchema = z.object({
  goal: z.enum(['find-friends', 'networking', 'dating', 'serious-relationship', 'other']).optional(),
  bio: z.string().max(200).optional(),
  job: z.string().max(32).optional(),
  company: z.string().max(32).optional(),
  interests: z.array(z.string()).optional(),
  city: z.string().optional(),
  gender: z.enum(['male', 'female', 'prefer-not-to-say']).optional(),
  birthDate: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1900).max(new Date().getFullYear()),
    })
    .optional(),
  photo: z.string().url().optional(),
  settings: z
    .object({
      isOnline: z.boolean().optional(),
      showMeetingCounter: z.boolean().optional(),
      showAge: z.boolean().optional(),
      notifyAboutMatches: z.boolean().optional(),
      notifyAboutUpdates: z.boolean().optional(),
    })
    .optional(),
});

// Get user profile
router.get('/user/profile', telegramAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

    res.json({
      success: true,
      data: {
        profile: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch(
  '/user/profile',
  telegramAuthMiddleware,
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
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

      // Prepare update data
      const updates: any = {};
      
      if (profileData.bio !== undefined) {
        updates.bio = profileData.bio;
      }
      if (profileData.photo !== undefined) {
        updates.photoUrl = profileData.photo;
      }
      if (profileData.birthDate) {
        // Calculate age from birthDate
        const birthDate = new Date(
          profileData.birthDate.year,
          profileData.birthDate.month - 1,
          profileData.birthDate.day
        );
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updates.age = age;
      }

      // Update user in database
      const updatedUser = await userRepository.updateUser(user.id, updates);

      logger.info({
        type: 'profile_updated',
        userId: user.id,
        fields: Object.keys(updates),
      });

      res.json({
        success: true,
        data: { profile: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete user account
router.delete('/user/account', telegramAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

    logger.info({
      type: 'account_deleted',
      userId,
    });

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (for profile popup)
router.get('/users/:userId', telegramAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.getUserById(userId);

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
  } catch (error) {
    next(error);
  }
});

export default router;

