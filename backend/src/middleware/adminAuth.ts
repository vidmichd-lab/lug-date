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
  // Skip auth for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Skip auth for login and logout endpoints
  const path = req.path || req.url || '';
  const fullPath = req.originalUrl || req.url || '';

  // Skip auth for login and logout endpoints
  if (path.includes('/api/admin/auth/login') || path.includes('/api/admin/auth/logout')) {
    return next();
  }

  // Log all admin requests for debugging (including analytics)
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'not set';

  logger.info({
    type: 'admin_auth_middleware_check',
    path: path,
    fullPath: fullPath,
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    origin: req.headers.origin || 'not set',
    referer: req.headers.referer || 'not set',
    clientIp,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // Log ALL headers for debugging (especially Authorization)
  logger.info({
    type: 'admin_auth_check',
    path: req.path || req.url,
    fullPath: req.originalUrl || req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader ? authHeader.substring(0, 30) : null,
    authHeaderFull: authHeader || 'not set', // Log full header for debugging
    allHeaders: Object.keys(req.headers),
    authorizationHeader: req.headers.authorization || 'not set',
    origin: req.headers.origin || 'not set',
    referer: req.headers.referer || 'not set',
    clientIp: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'not set',
    timestamp: new Date().toISOString(),
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'not set';

    logger.warn({
      type: 'admin_auth_failed',
      reason: 'no_token',
      httpStatus: 403,
      path: req.path || req.url,
      fullPath: req.originalUrl || req.url,
      method: req.method,
      origin: req.headers.origin || 'not set',
      referer: req.headers.referer || 'not set',
      clientIp,
      userAgent,
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader ? authHeader.substring(0, 50) : 'not set',
      timestamp: new Date().toISOString(),
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
  const tokensMatch = token === ADMIN_TOKEN;

  logger.info({
    type: 'admin_auth_token_check',
    path: req.path || req.url,
    fullPath: req.originalUrl || req.url,
    method: req.method,
    tokenLength: token.length,
    expectedTokenLength: ADMIN_TOKEN.length,
    tokenPrefix: token.substring(0, 10),
    expectedTokenPrefix: ADMIN_TOKEN.substring(0, 10),
    tokenSuffix: token.substring(token.length - 10),
    expectedTokenSuffix: ADMIN_TOKEN.substring(ADMIN_TOKEN.length - 10),
    tokensMatch,
    hasTokenEnv: !!process.env.ADMIN_TOKEN,
    origin: req.headers.origin || 'not set',
    clientIp: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'not set',
    timestamp: new Date().toISOString(),
  });

  // Если токены не совпадают, выводим более детальную информацию
  if (!tokensMatch) {
    logger.warn({
      type: 'admin_auth_token_mismatch_details',
      receivedTokenLength: token.length,
      expectedTokenLength: ADMIN_TOKEN.length,
      receivedTokenFirst20: token.substring(0, 20),
      expectedTokenFirst20: ADMIN_TOKEN.substring(0, 20),
      receivedTokenLast20: token.substring(Math.max(0, token.length - 20)),
      expectedTokenLast20: ADMIN_TOKEN.substring(Math.max(0, ADMIN_TOKEN.length - 20)),
      path: req.path || req.url,
      origin: req.headers.origin || 'not set',
    });
  }

  if (token !== ADMIN_TOKEN) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'not set';

    logger.warn({
      type: 'admin_auth_failed',
      reason: 'invalid_token',
      httpStatus: 403,
      path: req.path || req.url,
      fullPath: req.originalUrl || req.url,
      method: req.method,
      tokenLength: token.length,
      expectedTokenLength: ADMIN_TOKEN.length,
      tokenPrefix: token.substring(0, 10),
      expectedTokenPrefix: ADMIN_TOKEN.substring(0, 10),
      tokenSuffix: token.substring(token.length - 10),
      expectedTokenSuffix: ADMIN_TOKEN.substring(ADMIN_TOKEN.length - 10),
      tokensMatch: false,
      origin: req.headers.origin || 'not set',
      referer: req.headers.referer || 'not set',
      clientIp,
      userAgent,
      hasTokenEnv: !!process.env.ADMIN_TOKEN,
      timestamp: new Date().toISOString(),
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
  logger.info({
    type: 'admin_auth_success',
    path: req.path || req.url,
    fullPath: req.originalUrl || req.url,
    method: req.method,
    clientIp: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'not set',
    timestamp: new Date().toISOString(),
  });
  next();
};
