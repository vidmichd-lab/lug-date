/**
 * Error monitoring for backend
 * Использует Yandex Cloud Logging + Catcher (работает в России без VPN)
 * Альтернатива Sentry
 */

import { logger } from './logger';
import { sendErrorAlert } from './alerts';

const CATCHER_API_KEY = process.env.CATCHER_API_KEY;
const CATCHER_PROJECT_ID = process.env.CATCHER_PROJECT_ID;
const CATCHER_ENABLED = CATCHER_API_KEY && CATCHER_PROJECT_ID;

/**
 * Initialize error monitoring
 */
export function initErrorMonitoring() {
  const environment = process.env.NODE_ENV || 'development';

  if (CATCHER_ENABLED) {
    logger.info({ type: 'monitoring_init', message: 'Catcher error monitoring enabled' });
  } else {
    logger.warn({
      type: 'monitoring_init',
      message: 'Catcher not configured. Using Yandex Cloud Logging only.',
    });
  }

  logger.info({ type: 'monitoring_init', environment, message: 'Error monitoring initialized' });
}

/**
 * Report error to monitoring services
 */
export async function reportError(
  error: Error,
  context?: {
    level?: 'error' | 'warning' | 'info';
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: { id: string; email?: string };
  }
) {
  // Error data collected for potential future use
  const _errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context?.extra,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Log to Yandex Cloud Logging (всегда)
  logger.error({
    type: 'error',
    error: error.message,
    stack: error.stack,
    ...context?.tags,
    ...context?.extra,
  });

  // Report to Catcher (если настроен)
  if (CATCHER_ENABLED) {
    try {
      await reportToCatcher(error, context);
    } catch (e) {
      logger.warn({ error: e, type: 'catcher_report_failed' });
    }
  }

  // Send alert for critical errors
  if (context?.level === 'error' || !context?.level) {
    await sendErrorAlert(error.message, error, {
      ...context?.tags,
      ...context?.extra,
    });
  }
}

/**
 * Report error to Catcher
 */
async function reportToCatcher(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: { id: string; email?: string };
  }
) {
  if (!CATCHER_API_KEY || !CATCHER_PROJECT_ID) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.catcher.io/v1/projects/${CATCHER_PROJECT_ID}/errors`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CATCHER_API_KEY}`,
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          level: 'error',
          tags: context?.tags || {},
          extra: context?.extra || {},
          user: context?.user,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Catcher API error: ${response.statusText}`);
    }
  } catch (error) {
    // Не падаем, если Catcher недоступен
    logger.warn({ error, type: 'catcher_api_error' });
  }
}

/**
 * Capture exception (аналог Sentry.captureException)
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: { id: string; email?: string };
  }
) {
  reportError(error, {
    level: 'error',
    ...context,
  });
}

/**
 * Capture message (аналог Sentry.captureMessage)
 */
export function captureMessage(
  message: string,
  level: 'error' | 'warning' | 'info' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  const error = new Error(message);
  reportError(error, {
    level,
    ...context,
  });
}
