/**
 * Simple logger for bot
 * In production, should integrate with Yandex Cloud Logging
 */

export const logger = {
  info: (data: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'info', ...data }));
  },
  warn: (data: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', ...data }));
  },
  error: (data: Record<string, any>) => {
    console.error(JSON.stringify({ level: 'error', ...data }));
  },
  debug: (data: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'debug', ...data }));
    }
  },
};
