/**
 * GDPR Compliance Routes
 * Handles user data rights: export, deletion, anonymization
 */

import { Router, Request, Response, NextFunction } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { validate } from '../validation/validate';
import { z } from 'zod';
import { logger } from '../logger';
import { exportUserData, deleteUserData, anonymizeUserData } from '../services/gdpr';
import { userRepository } from '../repositories/userRepository';

const router = Router();

/**
 * GET /api/v1/gdpr/export
 * Export all user data (GDPR right to data portability)
 */
router.get(
  '/export',
  telegramAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
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

      const exportData = await exportUserData(user.id);

      res.json({
        success: true,
        data: exportData,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/gdpr/delete
 * Delete all user data (GDPR right to be forgotten)
 * WARNING: This action is irreversible!
 */
const deleteSchema = z.object({
  confirm: z.literal(true).describe('Must be true to confirm deletion'),
});

router.delete(
  '/delete',
  telegramAuthMiddleware,
  validate({ body: deleteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
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

      // Verify confirmation
      if (req.body.confirm !== true) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Deletion must be confirmed with confirm: true',
            code: 'CONFIRMATION_REQUIRED',
          },
        });
      }

      await deleteUserData(user.id);

      logger.info({
        type: 'gdpr_user_deleted',
        userId: user.id,
        telegramId,
      });

      res.json({
        success: true,
        data: {
          message: 'All user data has been permanently deleted',
          deletedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/gdpr/anonymize
 * Anonymize user data (alternative to deletion)
 */
const anonymizeSchema = z.object({
  confirm: z.literal(true).describe('Must be true to confirm anonymization'),
});

router.post(
  '/anonymize',
  telegramAuthMiddleware,
  validate({ body: anonymizeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
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

      // Verify confirmation
      if (req.body.confirm !== true) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Anonymization must be confirmed with confirm: true',
            code: 'CONFIRMATION_REQUIRED',
          },
        });
      }

      await anonymizeUserData(user.id);

      logger.info({
        type: 'gdpr_user_anonymized',
        userId: user.id,
        telegramId,
      });

      res.json({
        success: true,
        data: {
          message: 'User data has been anonymized',
          anonymizedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
