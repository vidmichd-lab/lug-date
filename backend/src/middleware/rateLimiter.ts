/**
 * Rate limiting middleware
 * Protects API from DDoS attacks and abuse
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: () => config.nodeEnv === 'test',
});

/**
 * File upload rate limiter
 * 10 requests per minute (more restrictive)
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 uploads per minute
  message: {
    success: false,
    error: {
      message: 'Too many upload requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test',
});

/**
 * Admin API rate limiter
 * 200 requests per minute (more permissive for admin operations)
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many admin requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per minute
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 auth requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test',
});

