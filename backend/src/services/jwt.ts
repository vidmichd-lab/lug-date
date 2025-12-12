/**
 * JWT Service
 * Handles generation and verification of JWT tokens for admin authentication
 */

import jwt from 'jsonwebtoken';
import { logger } from '../logger';

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.ADMIN_TOKEN || 'change-me-in-production-use-strong-secret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'change-me-in-production-use-strong-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

/**
 * Generate access token (short-lived, 15 minutes)
 */
export function generateAccessToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'dating-app-admin',
    audience: 'dating-app',
  } as jwt.SignOptions);
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
    issuer: 'dating-app-admin',
    audience: 'dating-app',
  } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'dating-app-admin',
      audience: 'dating-app',
    }) as AdminTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn({
        type: 'jwt_token_expired',
        token: 'access',
        message: error.message,
        expiredAt: error.expiredAt,
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn({
        type: 'jwt_token_invalid',
        token: 'access',
        error: error.message,
        name: error.name,
      });
    } else {
      logger.warn({
        type: 'jwt_verification_error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'dating-app-admin',
      audience: 'dating-app',
    }) as AdminTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug({ type: 'jwt_token_expired', token: 'refresh' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug({ type: 'jwt_token_invalid', token: 'refresh', error: error.message });
    }
    return null;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiration(): number {
  // Read from process.env dynamically (for testing)
  const expiresIn = process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN;

  // Parse JWT_EXPIRES_IN (e.g., "15m" -> 900 seconds)
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60; // Default 15 minutes
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 15 * 60;
  }
}
