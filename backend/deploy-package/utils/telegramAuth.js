"use strict";
/**
 * Telegram WebApp initData validation
 * Verifies the signature of Telegram initData to ensure authenticity
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTelegramInitData = verifyTelegramInitData;
exports.extractUserFromInitData = extractUserFromInitData;
exports.isInitDataValid = isInitDataValid;
exports.validateTelegramInitData = validateTelegramInitData;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const logger_1 = require("../logger");
/**
 * Parse Telegram initData string
 * Format: key1=value1&key2=value2&hash=...
 */
function parseInitData(initData) {
    const params = {};
    for (const pair of initData.split('&')) {
        const [key, value] = pair.split('=');
        if (key && value) {
            params[key] = decodeURIComponent(value);
        }
    }
    return params;
}
/**
 * Verify Telegram initData signature
 * Uses HMAC-SHA-256 to verify the hash
 */
function verifyTelegramInitData(initData) {
    try {
        const params = parseInitData(initData);
        const hash = params.hash;
        if (!hash) {
            logger_1.logger.warn({ type: 'telegram_auth', error: 'Missing hash in initData' });
            return false;
        }
        // Remove hash from params for verification
        delete params.hash;
        // Sort params by key
        const sortedKeys = Object.keys(params).sort();
        const dataCheckString = sortedKeys
            .map((key) => `${key}=${params[key]}`)
            .join('\n');
        // Get bot token from config
        const botToken = config_1.config.telegram.botToken;
        if (!botToken) {
            logger_1.logger.error({ type: 'telegram_auth', error: 'Bot token not configured' });
            return false;
        }
        // Create secret key from bot token
        const secretKey = crypto_1.default
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();
        // Calculate hash
        const calculatedHash = crypto_1.default
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        // Compare hashes (timing-safe comparison)
        return crypto_1.default.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculatedHash, 'hex'));
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'telegram_auth_verification_failed' });
        return false;
    }
}
/**
 * Extract user data from initData
 */
function extractUserFromInitData(initData) {
    try {
        const params = parseInitData(initData);
        const userStr = params.user;
        if (!userStr) {
            return null;
        }
        const user = JSON.parse(userStr);
        return user;
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'telegram_auth_extract_user_failed' });
        return null;
    }
}
/**
 * Check if initData is not expired
 * Telegram initData is valid for 24 hours
 */
function isInitDataValid(initData) {
    try {
        const params = parseInitData(initData);
        const authDate = parseInt(params.auth_date, 10);
        if (!authDate) {
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        const age = now - authDate;
        // InitData is valid for 24 hours (86400 seconds)
        const maxAge = 24 * 60 * 60;
        return age >= 0 && age < maxAge;
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'telegram_auth_check_expiry_failed' });
        return false;
    }
}
/**
 * Full validation of Telegram initData
 * Checks signature and expiration
 */
function validateTelegramInitData(initData) {
    // Check if initData is provided
    if (!initData || typeof initData !== 'string') {
        return {
            valid: false,
            error: 'initData is required',
        };
    }
    // Check expiration
    if (!isInitDataValid(initData)) {
        return {
            valid: false,
            error: 'initData expired or invalid',
        };
    }
    // Verify signature
    if (!verifyTelegramInitData(initData)) {
        return {
            valid: false,
            error: 'Invalid initData signature',
        };
    }
    // Extract user
    const user = extractUserFromInitData(initData);
    if (!user) {
        return {
            valid: false,
            error: 'User data not found in initData',
        };
    }
    return {
        valid: true,
        user,
    };
}
