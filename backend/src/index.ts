// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });

import express from 'express';
import adminRoutes from './routes/admin';
import adminManagementRoutes from './routes/admin-management';
import matchesRoutes from './routes/matches';
import photosRoutes from './routes/photos';
import feedRoutes from './routes/feed';
import savedEventsRoutes from './routes/saved-events';
import notificationsRoutes from './routes/notifications';
import userRoutes from './routes/user';
import eventsRoutes from './routes/events';
import { config } from './config';
import { initErrorMonitoring } from './monitoring';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter, adminLimiter, uploadLimiter } from './middleware/rateLimiter';
import { sanitizeMiddleware } from './utils/sanitize';
import { telegramAuthMiddleware } from './middleware/telegramAuth';
import { logger } from './logger';
import { sendCriticalAlert } from './alerts';
import { initYDB } from './db/connection';
import { runMigrations } from './db/migrations';
import { initObjectStorage } from './services/objectStorage';

// Initialize error monitoring (Yandex Cloud Logging + Catcher)
initErrorMonitoring();

// Initialize YDB connection and run migrations
initYDB()
  .then(async () => {
    // Run migrations after successful connection
    try {
      await runMigrations();
    } catch (error) {
      logger.error({ error, type: 'migrations_failed_on_startup' });
      // In production, fail if migrations fail
      if (config.nodeEnv === 'production') {
        process.exit(1);
      }
    }
  })
  .catch((error) => {
    logger.error({ error, type: 'ydb_init_failed_on_startup' });
    // In development, allow app to start without DB
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  });

// Initialize Object Storage
initObjectStorage();

const app = express();
const PORT = config.port;

// Request logging middleware (before routes)
app.use(requestLogger);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// JSON body parser - only for requests with Content-Type: application/json
app.use(
  express.json({
    strict: false, // Allow empty JSON bodies
    type: 'application/json',
  })
);

// Sanitize user input to prevent XSS attacks
// Skip sanitization for GET requests (only sanitize body, not query)
app.use((req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    sanitizeMiddleware(req, res, next);
  }
});

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Get allowed origins from environment variable
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  // In development, allow all origins for easier testing
  // In production, only allow configured origins
  const isDevelopment = config.nodeEnv === 'development';

  // Default allowed origins for admin panel
  const defaultAdminOrigins = [
    'https://lug-admin-deploy.website.yandexcloud.net',
    'http://localhost:5174',
    'http://localhost:5173',
  ];

  // Combine configured and default origins
  const allAllowedOrigins = [...allowedOrigins, ...defaultAdminOrigins];

  const allowOrigin = isDevelopment
    ? origin || '*'
    : origin && allAllowedOrigins.includes(origin)
      ? origin
      : allAllowedOrigins[0] || null;

  if (allowOrigin) {
    res.header('Access-Control-Allow-Origin', allowOrigin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// API routes with specific rate limiters and authentication
// Admin routes - no Telegram auth (may have separate admin auth later)
// Add error handling middleware before routes to catch any errors
app.use(
  '/api/admin',
  adminLimiter,
  (req, res, next) => {
    // Log admin requests for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info({
        type: 'admin_request',
        method: req.method,
        url: req.url,
        query: req.query,
        headers: req.headers,
      });
    }
    next();
  },
  adminRoutes
);

app.use(
  '/api/admin/management',
  adminLimiter,
  (req, res, next) => {
    // Log management requests for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info({
        type: 'admin_management_request',
        method: req.method,
        url: req.url,
        query: req.query,
      });
    }
    next();
  },
  adminManagementRoutes
);

// User API routes - require Telegram authentication
app.use('/api/v1/matches', telegramAuthMiddleware, matchesRoutes);
app.use('/api/v1/photos', uploadLimiter, telegramAuthMiddleware, photosRoutes);
app.use('/api/v1', telegramAuthMiddleware, feedRoutes);
app.use('/api/v1', telegramAuthMiddleware, savedEventsRoutes);
app.use('/api/v1', telegramAuthMiddleware, notificationsRoutes);
app.use('/api/v1', telegramAuthMiddleware, userRoutes);
app.use('/api/v1', telegramAuthMiddleware, eventsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error({ error, type: 'uncaught_exception' });
  await sendCriticalAlert('Uncaught Exception - Server may crash', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error({ error, type: 'unhandled_rejection', promise });
  await sendCriticalAlert('Unhandled Promise Rejection', error);
});

// Export app for serverless handler
export default app;

// Start server only if not in serverless environment
if (process.env.SERVERLESS !== 'true' && require.main === module) {
  app.listen(PORT, () => {
    logger.info({
      type: 'server_started',
      port: PORT,
      environment: config.nodeEnv,
      database: config.database.database || 'not configured',
      message: `Backend server running on port ${PORT} in ${config.nodeEnv} mode`,
    });
  });
}
// Deployment trigger
// Trigger deployment Tue Dec  2 14:50:29 MSK 2025
