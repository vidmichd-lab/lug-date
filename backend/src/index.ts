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

app.use(express.json());

// Sanitize user input to prevent XSS attacks
app.use(sanitizeMiddleware);

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
  const allowOrigin = isDevelopment
    ? origin || '*'
    : origin && allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0] || null;
  
  if (allowOrigin) {
    res.header('Access-Control-Allow-Origin', allowOrigin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/admin/management', adminLimiter, adminManagementRoutes);

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

app.listen(PORT, () => {
  logger.info({
    type: 'server_started',
    port: PORT,
    environment: config.nodeEnv,
    database: config.database.database || 'not configured',
  });
  console.log(`Backend server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Database: ${config.database.database || 'not configured'}`);
});

