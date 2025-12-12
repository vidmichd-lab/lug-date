/**
 * Admin Authentication Routes
 * JWT-based authentication with refresh tokens
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { logger } from '../logger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiration,
} from '../services/jwt';
import { adminRepository } from '../repositories/adminRepository';
import { validate } from '../validation/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// Handle OPTIONS requests for CORS preflight
router.options('*', (req: Request, res: Response) => {
  res.status(200).end();
});

/**
 * POST /api/admin/auth/login
 * Login endpoint for admin panel
 */
router.post('/login', validate({ body: loginSchema }), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Ensure database connection is established
    const { postgresClient } = await import('../db/postgresConnection');
    if (!postgresClient.getConnectionStatus()) {
      logger.warn({ type: 'admin_login_failed', reason: 'database_not_connected' });
      try {
        await postgresClient.connect();
      } catch (dbError) {
        logger.error({
          error: dbError,
          type: 'admin_login_failed',
          reason: 'database_connection_error',
        });
        return res.status(500).json({
          success: false,
          error: {
            message: 'Database connection failed',
            code: 'DATABASE_ERROR',
          },
        });
      }
    }

    // Find admin by email
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      logger.warn({ type: 'admin_login_failed', reason: 'admin_not_found', email });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      logger.warn({
        type: 'admin_login_failed',
        reason: 'invalid_password',
        email,
        adminId: admin.id,
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Generate tokens
    const tokenPayload = {
      adminId: admin.id,
      email: admin.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await adminRepository.createSession({
      adminId: admin.id,
      refreshToken,
      expiresAt,
    });

    logger.info({
      type: 'admin_login_success',
      adminId: admin.id,
      email: admin.email,
    });

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: getTokenExpiration(),
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error({
      error,
      type: 'admin_login_error',
      message: errorMessage,
      stack: errorStack,
    });

    // Return more detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    return res.status(500).json({
      success: false,
      error: {
        message: isDevelopment ? errorMessage : 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(isDevelopment && errorStack ? { stack: errorStack } : {}),
      },
    });
  }
});

/**
 * POST /api/admin/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validate({ body: refreshSchema }), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      logger.warn({ type: 'admin_refresh_failed', reason: 'invalid_token' });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
      });
    }

    // Check if session exists in database
    const session = await adminRepository.findSessionByToken(refreshToken);
    if (!session) {
      logger.warn({
        type: 'admin_refresh_failed',
        reason: 'session_not_found',
        adminId: payload.adminId,
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      logger.warn({
        type: 'admin_refresh_failed',
        reason: 'session_expired',
        adminId: payload.adminId,
      });
      // Delete expired session
      await adminRepository.deleteSession(refreshToken);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Session expired',
          code: 'SESSION_EXPIRED',
        },
      });
    }

    // Verify admin still exists
    const admin = await adminRepository.findById(payload.adminId);
    if (!admin) {
      logger.warn({
        type: 'admin_refresh_failed',
        reason: 'admin_not_found',
        adminId: payload.adminId,
      });
      await adminRepository.deleteSession(refreshToken);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Admin not found',
          code: 'ADMIN_NOT_FOUND',
        },
      });
    }

    // Generate new tokens
    const tokenPayload = {
      adminId: admin.id,
      email: admin.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update session with new refresh token
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await adminRepository.updateSession(session.id, {
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    });

    logger.info({
      type: 'admin_refresh_success',
      adminId: admin.id,
    });

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: getTokenExpiration(),
      },
    });
  } catch (error) {
    logger.error({ error, type: 'admin_refresh_error' });
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
 * Logout endpoint - invalidates refresh token
 */
router.post('/logout', validate({ body: refreshSchema }), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Delete session
    await adminRepository.deleteSession(refreshToken);

    logger.info({ type: 'admin_logout_success' });

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error({ error, type: 'admin_logout_error' });
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

export default router;
