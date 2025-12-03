/**
 * Error handling middleware
 * Integrates with error monitoring (Catcher/Yandex Cloud Logging) and logger
 */

import { Request, Response, NextFunction } from 'express';
import { captureException } from '../monitoring';
import { logError } from '../logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== false;

  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    logError(err, {
      method: req.method,
      url: req.url,
      statusCode: 403,
      isOperational: true,
      type: 'cors_error',
      origin: req.headers.origin || 'not set',
    });

    return res.status(403).json({
      success: false,
      error: {
        message: 'Origin not allowed by CORS policy',
        code: 'CORS_ERROR',
        origin: req.headers.origin || 'not set',
      },
    });
  }

  // Log error
  logError(err, {
    method: req.method,
    url: req.url,
    statusCode,
    isOperational,
  });

  // Send to error monitoring for non-operational errors
  if (!isOperational) {
    captureException(err, {
      tags: {
        endpoint: req.url,
        method: req.method,
      },
      extra: {
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
        },
      },
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code:
        statusCode === 403 ? 'FORBIDDEN' : statusCode === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
