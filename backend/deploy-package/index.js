"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST, before any other imports
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
dotenv_1.default.config({ path: (0, path_1.resolve)(process.cwd(), '.env') });
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("./routes/admin"));
const admin_management_1 = __importDefault(require("./routes/admin-management"));
const matches_1 = __importDefault(require("./routes/matches"));
const photos_1 = __importDefault(require("./routes/photos"));
const feed_1 = __importDefault(require("./routes/feed"));
const saved_events_1 = __importDefault(require("./routes/saved-events"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const user_1 = __importDefault(require("./routes/user"));
const events_1 = __importDefault(require("./routes/events"));
const config_1 = require("./config");
const monitoring_1 = require("./monitoring");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const sanitize_1 = require("./utils/sanitize");
const telegramAuth_1 = require("./middleware/telegramAuth");
const logger_1 = require("./logger");
const alerts_1 = require("./alerts");
const connection_1 = require("./db/connection");
const migrations_1 = require("./db/migrations");
const objectStorage_1 = require("./services/objectStorage");
// Initialize error monitoring (Yandex Cloud Logging + Catcher)
(0, monitoring_1.initErrorMonitoring)();
// Initialize YDB connection and run migrations
(0, connection_1.initYDB)()
    .then(async () => {
    // Run migrations after successful connection
    try {
        await (0, migrations_1.runMigrations)();
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'migrations_failed_on_startup' });
        // In production, fail if migrations fail
        if (config_1.config.nodeEnv === 'production') {
            process.exit(1);
        }
    }
})
    .catch((error) => {
    logger_1.logger.error({ error, type: 'ydb_init_failed_on_startup' });
    // In development, allow app to start without DB
    if (config_1.config.nodeEnv === 'production') {
        process.exit(1);
    }
});
// Initialize Object Storage
(0, objectStorage_1.initObjectStorage)();
const app = (0, express_1.default)();
const PORT = config_1.config.port;
// Request logging middleware (before routes)
app.use(requestLogger_1.requestLogger);
// Apply general rate limiting to all routes
app.use(rateLimiter_1.generalLimiter);
// JSON body parser - only for requests with Content-Type: application/json
app.use(express_1.default.json({
    strict: false, // Allow empty JSON bodies
    type: 'application/json'
}));
// Sanitize user input to prevent XSS attacks
// Skip sanitization for GET requests (only sanitize body, not query)
app.use((req, res, next) => {
    if (req.method === 'GET') {
        next();
    }
    else {
        (0, sanitize_1.sanitizeMiddleware)(req, res, next);
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
    const isDevelopment = config_1.config.nodeEnv === 'development';
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
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});
// API routes with specific rate limiters and authentication
// Admin routes - no Telegram auth (may have separate admin auth later)
// Add error handling middleware before routes to catch any errors
app.use('/api/admin', rateLimiter_1.adminLimiter, (req, res, next) => {
    // Log admin requests for debugging
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.info({
            type: 'admin_request',
            method: req.method,
            url: req.url,
            query: req.query,
            headers: req.headers,
        });
    }
    next();
}, admin_1.default);
app.use('/api/admin/management', rateLimiter_1.adminLimiter, (req, res, next) => {
    // Log management requests for debugging
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.info({
            type: 'admin_management_request',
            method: req.method,
            url: req.url,
            query: req.query,
        });
    }
    next();
}, admin_management_1.default);
// User API routes - require Telegram authentication
app.use('/api/v1/matches', telegramAuth_1.telegramAuthMiddleware, matches_1.default);
app.use('/api/v1/photos', rateLimiter_1.uploadLimiter, telegramAuth_1.telegramAuthMiddleware, photos_1.default);
app.use('/api/v1', telegramAuth_1.telegramAuthMiddleware, feed_1.default);
app.use('/api/v1', telegramAuth_1.telegramAuthMiddleware, saved_events_1.default);
app.use('/api/v1', telegramAuth_1.telegramAuthMiddleware, notifications_1.default);
app.use('/api/v1', telegramAuth_1.telegramAuthMiddleware, user_1.default);
app.use('/api/v1', telegramAuth_1.telegramAuthMiddleware, events_1.default);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    logger_1.logger.error({ error, type: 'uncaught_exception' });
    await (0, alerts_1.sendCriticalAlert)('Uncaught Exception - Server may crash', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger_1.logger.error({ error, type: 'unhandled_rejection', promise });
    await (0, alerts_1.sendCriticalAlert)('Unhandled Promise Rejection', error);
});
// Export app for serverless handler
exports.default = app;
// Start server only if not in serverless environment
if (process.env.SERVERLESS !== 'true' && require.main === module) {
    app.listen(PORT, () => {
        logger_1.logger.info({
            type: 'server_started',
            port: PORT,
            environment: config_1.config.nodeEnv,
            database: config_1.config.database.database || 'not configured',
        });
        console.log(`Backend server running on port ${PORT} in ${config_1.config.nodeEnv} mode`);
        console.log(`Database: ${config_1.config.database.database || 'not configured'}`);
    });
}
