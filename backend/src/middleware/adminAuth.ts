/**
 * Admin Authentication Middleware
 * Validates Bearer token for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for login endpoint
  if (req.path === '/api/admin/auth/login' || req.path === '/api/admin/auth/logout') {
    return next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({ type: 'admin_auth_failed', reason: 'no_token', path: req.path });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Authorization token required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (token !== ADMIN_TOKEN) {
    logger.warn({ type: 'admin_auth_failed', reason: 'invalid_token', path: req.path });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid authorization token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Token is valid, continue
  next();
};
