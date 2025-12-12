/**
 * Admin Authentication Middleware
 * Validates JWT access token for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt';
import { logger } from '../logger';

// Extend Express Request to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        adminId: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to validate JWT access token
 * Expects Authorization header: "Bearer <accessToken>"
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Skip auth for login and refresh endpoints
  const path = req.path || req.url || '';
  if (path.includes('/api/admin/auth/login') || path.includes('/api/admin/auth/refresh')) {
    return next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'no_token',
      path: req.path,
      originalUrl: req.originalUrl,
      url: req.url,
      origin: req.headers.origin || 'not set',
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Authorization token required. Please login first.',
        code: 'UNAUTHORIZED',
      },
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify token
  let payload: ReturnType<typeof verifyAccessToken> = null;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    logger.error({
      type: 'admin_auth_verification_error',
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      origin: req.headers.origin || 'not set',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  if (!payload) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'invalid_token',
      path: req.path,
      originalUrl: req.originalUrl,
      url: req.url,
      origin: req.headers.origin || 'not set',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token. Please login again.',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Attach admin to request
  req.admin = {
    adminId: payload.adminId,
    email: payload.email,
  };

  logger.debug({
    type: 'admin_auth_success',
    adminId: payload.adminId,
    path: req.path,
  });

  next();
};
