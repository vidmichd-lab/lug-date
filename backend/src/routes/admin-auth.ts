/**
 * Admin Authentication Routes
 * Simple token-based authentication for admin panel
 */

import { Router, Request, Response } from 'express';
import { logger } from '../logger';

const router = Router();

// Handle OPTIONS requests for CORS preflight
// This ensures OPTIONS requests return 200 with proper CORS headers
// CORS middleware will add the headers, we just need to return 200
router.options('*', (req: Request, res: Response) => {
  // CORS middleware already handles headers, just return success
  res.status(200).end();
});

// Simple admin credentials (should be moved to environment variables in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';

// Log admin credentials setup (without exposing actual values)
logger.info({
  type: 'admin_auth_config',
  hasUsername: !!process.env.ADMIN_USERNAME,
  hasPassword: !!process.env.ADMIN_PASSWORD,
  hasToken: !!process.env.ADMIN_TOKEN,
  tokenLength: ADMIN_TOKEN.length,
  usingDefaults:
    !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN,
});

/**
 * POST /api/admin/auth/login
 * Login endpoint for admin panel
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Проверка авторизации
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      logger.info({
        type: 'admin_login_success',
        username,
        tokenLength: ADMIN_TOKEN.length,
        tokenPrefix: ADMIN_TOKEN.substring(0, 10),
        tokenSuffix: ADMIN_TOKEN.substring(ADMIN_TOKEN.length - 10),
        tokenFirst20: ADMIN_TOKEN.substring(0, 20),
        tokenLast20: ADMIN_TOKEN.substring(Math.max(0, ADMIN_TOKEN.length - 20)),
        hasTokenEnv: !!process.env.ADMIN_TOKEN,
        origin: req.headers.origin || 'not set',
      });
      return res.json({
        success: true,
        data: {
          token: ADMIN_TOKEN,
          username: ADMIN_USERNAME,
        },
      });
    }

    logger.warn({ type: 'admin_login_failed', username });
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      },
    });
  } catch (error) {
    logger.error({ error, type: 'admin_login_error' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/auth/logout
 * Logout endpoint (optional, mainly for logging)
 */
router.post('/logout', async (req: Request, res: Response) => {
  logger.info({ type: 'admin_logout' });
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
