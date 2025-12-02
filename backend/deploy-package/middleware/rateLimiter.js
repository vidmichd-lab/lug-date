"use strict";
/**
 * Rate limiting middleware
 * Protects API from DDoS attacks and abuse
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.adminLimiter = exports.uploadLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
/**
 * General API rate limiter
 * 100 requests per minute
 */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting in test environment
    skip: () => config_1.config.nodeEnv === 'test',
});
/**
 * File upload rate limiter
 * 10 requests per minute (more restrictive)
 */
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 uploads per minute
    message: {
        success: false,
        error: {
            message: 'Too many upload requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config_1.config.nodeEnv === 'test',
});
/**
 * Admin API rate limiter
 * 200 requests per minute (more permissive for admin operations)
 */
exports.adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // Limit each IP to 200 requests per minute
    message: {
        success: false,
        error: {
            message: 'Too many admin requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config_1.config.nodeEnv === 'test',
});
/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per minute
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 auth requests per minute
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config_1.config.nodeEnv === 'test',
});
