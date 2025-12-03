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
  const fullPath = req.originalUrl || req.url || '';

  // Skip auth for login and logout endpoints
  if (path.includes('/api/admin/auth/login') || path.includes('/api/admin/auth/logout')) {
    return next();
  }

  // Log all admin requests for debugging (including analytics)
  logger.info({
    type: 'admin_auth_middleware_check',
    path: path,
    fullPath: fullPath,
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
  });

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // Log request for debugging
  logger.info({
    type: 'admin_auth_check',
    path: req.path || req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader ? authHeader.substring(0, 20) : null,
    origin: req.headers.origin || 'not set',
    referer: req.headers.referer || 'not set',
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'no_token',
      path: req.path || req.url,
      method: req.method,
      origin: req.headers.origin || 'not set',
      referer: req.headers.referer || 'not set',
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader || 'not set',
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
    method: req.method,
    tokenLength: token.length,
    expectedTokenLength: ADMIN_TOKEN.length,
    tokenPrefix: token.substring(0, 10),
    expectedTokenPrefix: ADMIN_TOKEN.substring(0, 10),
    tokensMatch: token === ADMIN_TOKEN,
    hasTokenEnv: !!process.env.ADMIN_TOKEN,
  });

  if (token !== ADMIN_TOKEN) {
    logger.warn({
      type: 'admin_auth_failed',
      reason: 'invalid_token',
      path: req.path || req.url,
      method: req.method,
      tokenLength: token.length,
      expectedTokenLength: ADMIN_TOKEN.length,
      tokenPrefix: token.substring(0, 10),
      expectedTokenPrefix: ADMIN_TOKEN.substring(0, 10),
      origin: req.headers.origin || 'not set',
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
