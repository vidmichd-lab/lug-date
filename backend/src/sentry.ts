/**
 * Sentry configuration for backend
 * Error tracking and performance monitoring
 * 
 * Note: Install @sentry/node and @sentry/profiling-node to use Sentry
 * npm install @sentry/node @sentry/profiling-node
 */

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  // Try to import Sentry (optional dependency)
  // Using require() is acceptable for optional dependencies
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ProfilingIntegration } = require('@sentry/profiling-node');

    Sentry.init({
      dsn,
      environment,
      integrations: [
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Release tracking
      release: process.env.APP_VERSION || undefined,
      // Filter out development errors
      beforeSend(event: any, hint: any) {
        // Don't send errors in development unless explicitly enabled
        if (environment === 'development' && !process.env.SENTRY_ENABLE_DEV) {
          return null;
        }
        return event;
      },
    });

    console.log(`✅ Sentry initialized for ${environment} environment`);
  } catch (error) {
    console.warn('⚠️  Sentry packages not installed. Install @sentry/node and @sentry/profiling-node to use Sentry.');
    console.warn('   Using Yandex Cloud Logging and Catcher instead.');
  }
}

