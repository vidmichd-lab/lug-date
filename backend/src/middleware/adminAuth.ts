/**
 * Admin Authentication Middleware
 * Validates Bearer token for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';

// Log token configuration on module load
logger.info({
  type: 'admin_auth_middleware_init',
  hasTokenEnv: !!process.env.ADMIN_TOKEN,
  tokenLength: ADMIN_TOKEN.length,
  usingDefault: !process.env.ADMIN_TOKEN,
});

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for login and logout endpoints
  const path = req.path || req.url || '';
  if (path.includes('/api/admin/auth/login') || path.includes('/api/admin/auth/logout')) {
    return next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // Log request for debugging
  logger.info({
    type: 'admin_auth_check',
    path: req.path || req.url,
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader ? authHeader.substring(0, 10) : null,
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'no_token',
      path: req.path || req.url,
      headers: { authorization: req.headers.authorization },
    });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Authorization token required. Please login first.',
        code: 'UNAUTHORIZED',
      },
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Log token comparison (without exposing actual token)
  logger.info({
    type: 'admin_auth_token_check',
    path: req.path || req.url,
    tokenLength: token.length,
    expectedTokenLength: ADMIN_TOKEN.length,
    tokensMatch: token === ADMIN_TOKEN,
  });

  if (token !== ADMIN_TOKEN) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'invalid_token',
      path: req.path || req.url,
      tokenLength: token.length,
      expectedTokenLength: ADMIN_TOKEN.length,
    });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid authorization token. Please login again.',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Token is valid, continue
  logger.info({ type: 'admin_auth_success', path: req.path || req.url });
  next();
};
