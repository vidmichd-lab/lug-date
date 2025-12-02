"use strict";
/**
 * Request logging middleware
 * Logs all API requests with timing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../logger");
function requestLogger(req, res, next) {
    const startTime = Date.now();
    // Override res.end to capture response time
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding, cb) {
        const responseTime = Date.now() - startTime;
        (0, logger_1.logRequest)(req, res, responseTime);
        return originalEnd(chunk, encoding, cb);
    };
    next();
}
