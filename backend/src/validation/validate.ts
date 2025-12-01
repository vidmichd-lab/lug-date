/**
 * Validation middleware for Express
 * Validates request body, query, and params using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../logger';

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationOptions {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

/**
 * Validation middleware factory
 */
export function validate(options: ValidationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (options.body) {
        req.body = await options.body.parseAsync(req.body);
      }

      // Validate query
      if (options.query) {
        req.query = await options.query.parseAsync(req.query);
      }

      // Validate params
      if (options.params) {
        req.params = await options.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({
          type: 'validation_error',
          errors,
          method: req.method,
          url: req.url,
        });

        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
      }

      // Unexpected error
      next(error);
    }
  };
}

/**
 * Helper to format Zod error for response
 */
export function formatZodError(error: ZodError) {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

