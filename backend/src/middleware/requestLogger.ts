/**
 * Request logging middleware
 * Logs all API requests with timing
 */

import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
    return originalEnd(chunk, encoding, cb);
  };

  next();
}

