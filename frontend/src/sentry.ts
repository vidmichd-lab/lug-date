/**
 * Sentry configuration for frontend
 * Error tracking and performance monitoring
 * 
 * Note: Install @sentry/react to use Sentry
 * npm install @sentry/react
 */

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || 'development';

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  // Dynamic import for optional dependency
  // Using type assertion to avoid TypeScript errors when package is not installed
  import('@sentry/react' as any)
    .then((Sentry: any) => {
      if (!Sentry || !Sentry.init) {
        throw new Error('Sentry not available');
      }

      Sentry.init({
        dsn,
        environment,
        integrations: [
          new Sentry.BrowserTracing({
            // Set tracing origins
            tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.com\/api/],
          }),
          new Sentry.Replay({
            // Session Replay
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        // Session Replay
        replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || undefined,
        // Filter out development errors
        beforeSend(event: any) {
          // Don't send errors in development unless explicitly enabled
          if (environment === 'development' && !import.meta.env.VITE_SENTRY_ENABLE_DEV) {
            return null;
          }
          return event;
        },
      });

      console.log(`✅ Sentry initialized for ${environment} environment`);
    })
    .catch(() => {
      console.warn('⚠️  Sentry packages not installed. Install @sentry/react to use Sentry.');
    });
}

