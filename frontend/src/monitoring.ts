/**
 * Error monitoring for frontend
 * Использует Yandex AppMetrica (работает в России без VPN)
 * Альтернатива Sentry
 */

declare global {
  interface Window {
    ym?: (counterId: number, method: string, target: string, params?: any) => void;
  }
}

const METRICA_ID = import.meta.env.VITE_YANDEX_METRICA_ID;

/**
 * Initialize error monitoring
 */
export function initErrorMonitoring() {
  const environment = import.meta.env.MODE || 'development';

  // Initialize Yandex AppMetrica
  if (METRICA_ID) {
    initAppMetrica();
  } else {
    console.warn('⚠️  Yandex AppMetrica ID not configured. Error monitoring may be limited.');
  }

  // Global error handler
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      reportError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      reportError(error, {
        type: 'unhandledrejection',
        reason: event.reason,
      });
    });
  }

  console.log(`✅ Error monitoring initialized for ${environment} environment`);
}

/**
 * Initialize Yandex AppMetrica
 */
function initAppMetrica() {
  if (!METRICA_ID || typeof window === 'undefined') {
    return;
  }

  // AppMetrica уже инициализирована через metrica.ts
  // Просто проверяем наличие
  if (window.ym) {
    console.log('✅ Yandex AppMetrica ready for error tracking');
  }
}

/**
 * Report error to Yandex AppMetrica
 */
export function reportError(error: Error, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  // Report to Yandex AppMetrica
  if (METRICA_ID && window.ym) {
    try {
      window.ym(Number(METRICA_ID), 'reachGoal', 'error_occurred', {
        error_message: error.message,
        error_name: error.name,
        ...context,
      });
    } catch (e) {
      console.warn('Failed to report error to AppMetrica:', e);
    }
  }

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error('Error reported:', errorData);
  }
}

/**
 * Report custom event to Yandex AppMetrica
 */
export function reportEvent(name: string, params?: Record<string, any>) {
  // Report to Yandex AppMetrica
  if (METRICA_ID && window.ym) {
    try {
      window.ym(Number(METRICA_ID), 'reachGoal', name, params);
    } catch (e) {
      console.warn('Failed to report event to AppMetrica:', e);
    }
  }
}

