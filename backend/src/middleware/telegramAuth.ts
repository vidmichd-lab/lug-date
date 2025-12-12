/**
 * Telegram authentication middleware
 * Validates Telegram initData from Authorization header
 */

import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, TelegramUser } from '../utils/telegramAuth';
import { logger } from '../logger';

// Extend Express Request to include telegram user
declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
    }
  }
}

/**
 * Middleware to validate Telegram initData
 * Expects Authorization header: "Bearer <initData>"
 * In development mode, allows bypassing auth with mock user
 */
export function telegramAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  // Development mode: allow bypassing auth with mock user
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
    const authHeader = req.headers.authorization;

    // If no auth header, use mock user for development
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.debug({
        type: 'telegram_auth',
        message: 'Using mock user for development',
        path: req.path,
      });

      // Create mock Telegram user for development
      // This will be used to create/retrieve user in database
      req.telegramUser = {
        id: 123456789, // Mock Telegram user ID
        first_name: 'Dev',
        last_name: 'User',
        username: 'dev_user',
        language_code: 'en',
      };

      return next();
    }
  }

  // Get initData from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({
      type: 'telegram_auth',
      error: 'Missing or invalid Authorization header',
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  const initData = authHeader.substring(7); // Remove "Bearer " prefix

  // Validate initData
  const validation = validateTelegramInitData(initData);

  if (!validation.valid || !validation.user) {
    logger.warn({
      type: 'telegram_auth',
      error: validation.error,
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      error: {
        message: validation.error || 'Invalid authentication',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Attach user to request
  req.telegramUser = validation.user;

  logger.debug({
    type: 'telegram_auth',
    userId: validation.user.id,
    path: req.path,
  });

  next();
}

/**
 * Optional auth middleware - doesn't fail if auth is missing
 * Useful for endpoints that work with or without auth
 */
export function optionalTelegramAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const initData = authHeader.substring(7);
    const validation = validateTelegramInitData(initData);

    if (validation.valid && validation.user) {
      req.telegramUser = validation.user;
    }
  }

  next();
}
