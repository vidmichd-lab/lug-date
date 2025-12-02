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
        const result = await options.query.safeParseAsync(req.query as unknown);
        if (!result.success) {
          const errors = result.error.issues.map((err: z.ZodIssue) => ({
            path: err.path.join('.'),
            message: err.message,
          }));

          logger.warn({
            type: 'validation_error',
            errors,
            method: req.method,
            url: req.url,
            query: req.query,
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
        req.query = result.data as unknown as typeof req.query;
      }

      // Validate params
      if (options.params) {
        req.params = await options.params.parseAsync(req.params as unknown) as unknown as typeof req.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => ({
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
  return error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

