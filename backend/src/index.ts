// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import adminRoutes from './routes/admin';
import adminManagementRoutes from './routes/admin-management';
import adminAuthRoutes from './routes/admin-auth';
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
import { adminAuthMiddleware } from './middleware/adminAuth';
import { logger } from './logger';
import { sendCriticalAlert } from './alerts';
import { initYDB, ydbClient } from './db/connection';
import { runMigrations } from './db/migrations';
import { initObjectStorage } from './services/objectStorage';

// Initialize error monitoring (Yandex Cloud Logging + Catcher)
initErrorMonitoring();

// Log startup information (without secrets)
logger.info({
  type: 'app_startup',
  nodeEnv: config.nodeEnv,
  port: config.port,
  version: '1.0.0',
  databaseEndpoint: config.database.endpoint ? 'configured' : 'not configured',
  databaseName: config.database.database || 'not configured',
  hasTelegramToken: !!config.telegram.botToken,
  hasStorageBucket: !!process.env.YANDEX_STORAGE_BUCKET,
  hasStorageAccessKey: !!process.env.YANDEX_STORAGE_ACCESS_KEY,
  containerMode: process.env.CONTAINER_MODE === 'true',
  isServerless: process.env.SERVERLESS === 'true',
  isMainModule: require.main === module,
  message: 'Application starting...',
});

// Initialize YDB connection and run migrations
// Don't block server startup - allow app to start even if DB is not available
// This ensures health check endpoint works and container doesn't crash
initYDB()
  .then(async () => {
    // Run migrations after successful connection
    try {
      await runMigrations();
      logger.info({
        type: 'ydb_migrations_completed',
        message: 'Migrations completed successfully',
      });
    } catch (error) {
      logger.error({
        error,
        type: 'migrations_failed_on_startup',
        message: 'Migrations failed, but server will continue',
      });
      // Don't exit - allow server to start and handle requests
      // Health check will show DB status
    }
  })
  .catch((error) => {
    logger.error({
      error,
      type: 'ydb_init_failed_on_startup',
      message: 'YDB connection failed, but server will continue. Health check will show DB status.',
    });
    // Don't exit - allow server to start and handle requests
    // This ensures container doesn't crash and health check works
  });

// Initialize Object Storage
initObjectStorage();

const app = express();

// Trust proxy - required for Yandex Cloud Serverless Containers
// This allows Express to correctly identify client IPs and handle X-Forwarded-For headers
// Without this, rate limiter will fail with ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', true);

const PORT = config.port;

// Security headers - MUST be first
// Configure Helmet to work with CORS
// IMPORTANT: Helmet must be configured to not interfere with CORS headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'http:'], // Allow connections to any HTTPS/HTTP endpoint
        fontSrc: ["'self'", 'data:', 'https:'], // Allow fonts from any HTTPS source
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for Telegram WebApp compatibility
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
    // Don't interfere with CORS headers
    crossOriginOpenerPolicy: false,
  })
);

// Request logging middleware (before routes)
app.use(requestLogger);

// CORS configuration - MUST be before rate limiter to allow preflight requests
// This middleware automatically handles OPTIONS preflight requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Combine allowed origins from environment variables
      const allowed = [
        ...(process.env.ALLOWED_ORIGINS?.split(',')
          .map((o) => o.trim())
          .filter(Boolean) || []),
        ...(process.env.ADMIN_ORIGINS?.split(',')
          .map((o) => o.trim())
          .filter(Boolean) || []),
        // Default admin origins
        'https://lug-admin-deploy.website.yandexcloud.net',
        'http://localhost:5174',
        'http://localhost:5173',
      ];

      // Remove duplicates
      const uniqueAllowed = [...new Set(allowed)];

      // In development, allow all origins for easier testing
      const isDevelopment = config.nodeEnv === 'development';

      // Log CORS decisions for debugging
      // In production, log only blocked requests to avoid spam
      const isAllowed = !origin || uniqueAllowed.includes(origin) || isDevelopment;

      if (origin) {
        // Always log CORS checks for admin origins to help debug 403 errors
        const isAdminOrigin = origin.includes('admin') || origin.includes('lug-admin');
        if (isDevelopment || !isAllowed || isAdminOrigin) {
          logger.info({
            type: 'cors_check',
            origin,
            allowed: isAllowed,
            allowedOrigins: uniqueAllowed,
            isDevelopment,
            isAdminOrigin,
            hasAllowedOrigins: !!process.env.ALLOWED_ORIGINS,
            hasAdminOrigins: !!process.env.ADMIN_ORIGINS,
            allowedOriginsValue: process.env.ALLOWED_ORIGINS || 'not set',
            adminOriginsValue: process.env.ADMIN_ORIGINS || 'not set',
          });
        }
      }

      // Allow request if no origin (same-origin) or origin is in allowed list
      // In development, allow all origins
      if (!origin || uniqueAllowed.includes(origin) || isDevelopment) {
        callback(null, true);
      } else {
        logger.warn({
          type: 'cors_blocked',
          origin,
          allowedOrigins: uniqueAllowed,
          hasAllowedOrigins: !!process.env.ALLOWED_ORIGINS,
          hasAdminOrigins: !!process.env.ADMIN_ORIGINS,
          allowedOriginsValue: process.env.ALLOWED_ORIGINS || 'not set',
          adminOriginsValue: process.env.ADMIN_ORIGINS || 'not set',
        });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Content-Length',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours - cache preflight response for 24 hours
    preflightContinue: false, // CORS middleware handles preflight automatically (returns 204/200)
    optionsSuccessStatus: 200, // Return 200 for OPTIONS requests (some browsers expect this)
  })
);

// Apply general rate limiting to all routes (after CORS)
// Note: OPTIONS requests are skipped by rate limiter
app.use(generalLimiter);

// JSON body parser - only for requests with Content-Type: application/json
app.use(
  express.json({
    strict: false, // Allow empty JSON bodies
    type: 'application/json',
  })
);

// Sanitize user input to prevent XSS attacks
// Skip sanitization for GET and OPTIONS requests (only sanitize body, not query)
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    next();
  } else {
    sanitizeMiddleware(req, res, next);
  }
});

app.get('/', (req, res) => {
  // Root endpoint - API information
  res.json({
    service: 'dating-app-backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      admin: '/api/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  // Health check endpoint - should always respond even if DB is not connected
  // This ensures container health checks pass
  const ydbStatus = ydbClient?.getConnectionStatus() ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    service: 'backend',
    database: ydbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes with specific rate limiters and authentication
// Admin auth routes (login/logout) - no auth required
app.use('/api/admin/auth', adminLimiter, adminAuthRoutes);

// Admin routes - require admin token authentication
// Add error handling middleware before routes to catch any errors
// Skip auth for OPTIONS requests (CORS preflight)
app.use(
  '/api/admin',
  (req, res, next) => {
    // Log BEFORE rate limiter to see if request reaches here
    logger.info({
      type: 'admin_route_before_limiter',
      method: req.method,
      url: req.url,
      path: req.path,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
    });
    next();
  },
  adminLimiter,
  (req, res, next) => {
    // Log AFTER rate limiter to see if request passes rate limiting
    logger.info({
      type: 'admin_route_after_limiter',
      method: req.method,
      url: req.url,
      path: req.path,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
    });
    // Skip auth for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    adminAuthMiddleware(req, res, next);
  },
  (req, res, next) => {
    // Log admin requests for debugging
    logger.info({
      type: 'admin_request',
      method: req.method,
      url: req.url,
      path: req.path,
      originalUrl: req.originalUrl,
      query: req.query,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
      isOptions: req.method === 'OPTIONS',
    });
    next();
  },
  adminRoutes
);

app.use(
  '/api/admin/management',
  (req, res, next) => {
    // Log BEFORE rate limiter
    logger.info({
      type: 'admin_management_before_limiter',
      method: req.method,
      url: req.url,
      path: req.path,
      originalUrl: req.originalUrl,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
      authHeaderPrefix: req.headers.authorization?.substring(0, 30) || 'not set',
    });
    next();
  },
  adminLimiter,
  (req, res, next) => {
    // Log AFTER rate limiter
    logger.info({
      type: 'admin_management_after_limiter',
      method: req.method,
      url: req.url,
      path: req.path,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
    });
    // Skip auth for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    adminAuthMiddleware(req, res, next);
  },
  (req, res, next) => {
    // Log management requests for debugging
    logger.info({
      type: 'admin_management_request',
      method: req.method,
      url: req.url,
      path: req.path,
      originalUrl: req.originalUrl,
      query: req.query,
      origin: req.headers.origin || 'not set',
      hasAuthHeader: !!req.headers.authorization,
      isOptions: req.method === 'OPTIONS',
    });
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
// In production, don't exit immediately - log and try to continue
process.on('uncaughtException', async (error) => {
  logger.error({
    error,
    type: 'uncaught_exception',
    message: 'Uncaught exception occurred, but server will continue',
  });

  // Try to send alert, but don't block
  sendCriticalAlert('Uncaught Exception', error).catch((alertError) => {
    logger.error({ error: alertError, type: 'alert_send_failed' });
  });

  // In production, don't exit - allow server to continue
  // This prevents container from crashing
  if (config.nodeEnv !== 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
// In production, don't exit - log and continue
process.on('unhandledRejection', async (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error({
    error,
    type: 'unhandled_rejection',
    promise,
    message: 'Unhandled promise rejection occurred, but server will continue',
  });

  // Try to send alert, but don't block
  sendCriticalAlert('Unhandled Promise Rejection', error).catch((alertError) => {
    logger.error({ error: alertError, type: 'alert_send_failed' });
  });
});

// Export app for serverless handler
export default app;

// Start server for container runtime or local development
// For Yandex Cloud Container, we always start the server (not serverless mode)
// For serverless handler (via handler.ts), SERVERLESS env is set and server won't start
// Strategy:
// 1. If SERVERLESS=true, don't start server (handler.ts manages it)
// 2. If require.main === module, start server (normal execution)
// 3. If require.main !== module but SERVERLESS is not set, start server anyway (container fallback)
const isServerless = process.env.SERVERLESS === 'true';
const isMainModule = require.main === module;
const shouldStartServer = !isServerless && (isMainModule || process.env.CONTAINER_MODE === 'true');

if (shouldStartServer) {
  // Ensure server starts even if there are async initialization errors
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info({
      type: 'server_started',
      port: PORT,
      environment: config.nodeEnv,
      database: config.database.database || 'not configured',
      isMainModule,
      isServerless,
      containerMode: process.env.CONTAINER_MODE === 'true',
      message: `Backend server running on port ${PORT} in ${config.nodeEnv} mode`,
    });
  });

  // Handle server errors gracefully
  server.on('error', (error: NodeJS.ErrnoException) => {
    logger.error({
      error,
      type: 'server_error',
      port: PORT,
      message: `Failed to start server on port ${PORT}`,
    });

    // If port is already in use, try alternative port
    if (error.code === 'EADDRINUSE') {
      logger.warn({
        type: 'port_in_use',
        port: PORT,
        message: `Port ${PORT} is already in use, trying alternative port`,
      });
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info({ type: 'server_shutdown', message: 'SIGTERM received, shutting down gracefully' });
    server.close(() => {
      logger.info({ type: 'server_closed', message: 'Server closed' });
      process.exit(0);
    });
  });
} else {
  logger.info({
    type: 'server_not_started',
    isServerless,
    isMainModule,
    reason: isServerless ? 'serverless_mode' : 'not_main_module',
    message: 'Server not started (serverless mode or not main module)',
  });
}
// Deployment trigger
// Trigger deployment Tue Dec  2 14:50:29 MSK 2025
