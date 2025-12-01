/**
 * Logger configuration using Pino
 * Integrates with Yandex Cloud Logging
 */

import pino from 'pino';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Yandex Cloud Logging format
const yandexCloudFormatter = {
  write: (log: string) => {
    try {
      const logObj = JSON.parse(log);
      // Format for Yandex Cloud Logging
      console.log(JSON.stringify({
        ...logObj,
        timestamp: new Date().toISOString(),
        service: 'backend',
        environment: nodeEnv,
      }));
    } catch (e) {
      console.log(log);
    }
  },
};

// Create logger instance
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      env: nodeEnv,
      service: 'backend',
    },
  },
  isProduction && process.env.YANDEX_CLOUD_LOGGING_ENABLED !== 'false'
    ? yandexCloudFormatter
    : pino.destination()
);

// Helper functions for structured logging
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.info({
    type: 'http_request',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

export const logMatch = (matchId: string, userId1: string, userId2: string, eventId?: string) => {
  logger.info({
    type: 'match_created',
    matchId,
    userId1,
    userId2,
    eventId,
  });
};

export const logPhotoError = (error: Error, userId?: string, photoUrl?: string) => {
  logger.error({
    type: 'photo_upload_error',
    error: error.message,
    stack: error.stack,
    userId,
    photoUrl,
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    type: 'error',
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

