"use strict";
/**
 * Error handling middleware
 * Integrates with error monitoring (Catcher/Yandex Cloud Logging) and logger
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const monitoring_1 = require("../monitoring");
const logger_1 = require("../logger");
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational !== false;
    // Log error
    (0, logger_1.logError)(err, {
        method: req.method,
        url: req.url,
        statusCode,
        isOperational,
    });
    // Send to error monitoring for non-operational errors
    if (!isOperational) {
        (0, monitoring_1.captureException)(err, {
            tags: {
                endpoint: req.url,
                method: req.method,
            },
            extra: {
                request: {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: req.body,
                },
            },
        });
    }
    // Send response
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}
