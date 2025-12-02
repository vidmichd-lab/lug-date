"use strict";
/**
 * Telegram authentication middleware
 * Validates Telegram initData from Authorization header
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramAuthMiddleware = telegramAuthMiddleware;
exports.optionalTelegramAuthMiddleware = optionalTelegramAuthMiddleware;
const telegramAuth_1 = require("../utils/telegramAuth");
const logger_1 = require("../logger");
/**
 * Middleware to validate Telegram initData
 * Expects Authorization header: "Bearer <initData>"
 */
function telegramAuthMiddleware(req, res, next) {
    // Skip auth for health check
    if (req.path === '/health') {
        return next();
    }
    // Get initData from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger_1.logger.warn({
            type: 'telegram_auth',
            error: 'Missing or invalid Authorization header',
            path: req.path,
        });
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
            },
        });
    }
    const initData = authHeader.substring(7); // Remove "Bearer " prefix
    // Validate initData
    const validation = (0, telegramAuth_1.validateTelegramInitData)(initData);
    if (!validation.valid || !validation.user) {
        logger_1.logger.warn({
            type: 'telegram_auth',
            error: validation.error,
            path: req.path,
        });
        return res.status(401).json({
            success: false,
            error: {
                message: validation.error || 'Invalid authentication',
                code: 'UNAUTHORIZED',
            },
        });
    }
    // Attach user to request
    req.telegramUser = validation.user;
    logger_1.logger.debug({
        type: 'telegram_auth',
        userId: validation.user.id,
        path: req.path,
    });
    next();
}
/**
 * Optional auth middleware - doesn't fail if auth is missing
 * Useful for endpoints that work with or without auth
 */
function optionalTelegramAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const initData = authHeader.substring(7);
        const validation = (0, telegramAuth_1.validateTelegramInitData)(initData);
        if (validation.valid && validation.user) {
            req.telegramUser = validation.user;
        }
    }
    next();
}
