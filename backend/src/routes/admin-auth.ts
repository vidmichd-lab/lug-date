/**
 * Admin Authentication Routes
 * Simple token-based authentication for admin panel
 */

import { Router, Request, Response } from 'express';
import { logger } from '../logger';

const router = Router();

// Simple admin credentials (should be moved to environment variables in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';

/**
 * POST /api/admin/auth/login
 * Login endpoint for admin panel
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username and password are required',
          code: 'MISSING_CREDENTIALS',
        },
      });
    }

    // Simple credential check
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      logger.info({ type: 'admin_login_success', username });

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
        message: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS',
      },
    });
  } catch (error) {
    logger.error({ error, type: 'admin_login_error' });
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
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
