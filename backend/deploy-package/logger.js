"use strict";
/**
 * Logger configuration using Pino
 * Integrates with Yandex Cloud Logging
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logPhotoError = exports.logMatch = exports.logRequest = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
// Yandex Cloud Logging format
const yandexCloudFormatter = {
    write: (log) => {
        try {
            const logObj = JSON.parse(log);
            // Format for Yandex Cloud Logging
            console.log(JSON.stringify({
                ...logObj,
                timestamp: new Date().toISOString(),
                service: 'backend',
                environment: nodeEnv,
            }));
        }
        catch (e) {
            console.log(log);
        }
    },
};
// Create logger instance
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        env: nodeEnv,
        service: 'backend',
    },
}, isProduction && process.env.YANDEX_CLOUD_LOGGING_ENABLED !== 'false'
    ? yandexCloudFormatter
    : pino_1.default.destination());
// Helper functions for structured logging
const logRequest = (req, res, responseTime) => {
    exports.logger.info({
        type: 'http_request',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
};
exports.logRequest = logRequest;
const logMatch = (matchId, userId1, userId2, eventId) => {
    exports.logger.info({
        type: 'match_created',
        matchId,
        userId1,
        userId2,
        eventId,
    });
};
exports.logMatch = logMatch;
const logPhotoError = (error, userId, photoUrl) => {
    exports.logger.error({
        type: 'photo_upload_error',
        error: error.message,
        stack: error.stack,
        userId,
        photoUrl,
    });
};
exports.logPhotoError = logPhotoError;
const logError = (error, context) => {
    exports.logger.error({
        type: 'error',
        error: error.message,
        stack: error.stack,
        ...context,
    });
};
exports.logError = logError;
