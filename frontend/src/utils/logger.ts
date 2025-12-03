/**
 * Logger utility for frontend
 * Provides structured logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    // In development, use console methods for better debugging
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, context || '', error || '');
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(formattedMessage, context || '', error || '');
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(formattedMessage, context || '', error || '');
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(formattedMessage, context || '', error || '');
          break;
      }
    } else {
      // In production, send to monitoring service
      // Only log warnings and errors
      if (level === 'warn' || level === 'error') {
        // Send to AppMetrica or other monitoring service
        this.sendToMonitoring(level, message, context, error);
      }
    }
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // Send to Yandex AppMetrica via monitoring.ts
    try {
      const METRICA_ID = import.meta.env.VITE_YANDEX_METRICA_ID;
      if (METRICA_ID && typeof window !== 'undefined' && window.ym) {
        window.ym(Number(METRICA_ID), 'reachGoal', 'error_logged', {
          level,
          message,
          context: context ? JSON.stringify(context) : undefined,
          error: error?.message,
          stack: error?.stack,
        });
      }
    } catch (e) {
      // Silently fail - monitoring is not critical
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext };
