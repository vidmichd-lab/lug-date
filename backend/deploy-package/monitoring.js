"use strict";
/**
 * Error monitoring for backend
 * Использует Yandex Cloud Logging + Catcher (работает в России без VPN)
 * Альтернатива Sentry
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initErrorMonitoring = initErrorMonitoring;
exports.reportError = reportError;
exports.captureException = captureException;
exports.captureMessage = captureMessage;
const logger_1 = require("./logger");
const alerts_1 = require("./alerts");
const CATCHER_API_KEY = process.env.CATCHER_API_KEY;
const CATCHER_PROJECT_ID = process.env.CATCHER_PROJECT_ID;
const CATCHER_ENABLED = CATCHER_API_KEY && CATCHER_PROJECT_ID;
/**
 * Initialize error monitoring
 */
function initErrorMonitoring() {
    const environment = process.env.NODE_ENV || 'development';
    if (CATCHER_ENABLED) {
        console.log('✅ Catcher error monitoring enabled');
    }
    else {
        console.log('⚠️  Catcher not configured. Using Yandex Cloud Logging only.');
    }
    console.log(`✅ Error monitoring initialized for ${environment} environment`);
}
/**
 * Report error to monitoring services
 */
async function reportError(error, context) {
    const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context?.extra,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    };
    // Log to Yandex Cloud Logging (всегда)
    logger_1.logger.error({
        type: 'error',
        error: error.message,
        stack: error.stack,
        ...context?.tags,
        ...context?.extra,
    });
    // Report to Catcher (если настроен)
    if (CATCHER_ENABLED) {
        try {
            await reportToCatcher(error, context);
        }
        catch (e) {
            logger_1.logger.warn({ error: e, type: 'catcher_report_failed' });
        }
    }
    // Send alert for critical errors
    if (context?.level === 'error' || !context?.level) {
        await (0, alerts_1.sendErrorAlert)(error.message, error, {
            ...context?.tags,
            ...context?.extra,
        });
    }
}
/**
 * Report error to Catcher
 */
async function reportToCatcher(error, context) {
    if (!CATCHER_API_KEY || !CATCHER_PROJECT_ID) {
        return;
    }
    try {
        const response = await fetch(`https://api.catcher.io/v1/projects/${CATCHER_PROJECT_ID}/errors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CATCHER_API_KEY}`,
            },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                level: 'error',
                tags: context?.tags || {},
                extra: context?.extra || {},
                user: context?.user,
                timestamp: new Date().toISOString(),
            }),
        });
        if (!response.ok) {
            throw new Error(`Catcher API error: ${response.statusText}`);
        }
    }
    catch (error) {
        // Не падаем, если Catcher недоступен
        logger_1.logger.warn({ error, type: 'catcher_api_error' });
    }
}
/**
 * Capture exception (аналог Sentry.captureException)
 */
function captureException(error, context) {
    reportError(error, {
        level: 'error',
        ...context,
    });
}
/**
 * Capture message (аналог Sentry.captureMessage)
 */
function captureMessage(message, level = 'info', context) {
    const error = new Error(message);
    reportError(error, {
        level,
        ...context,
    });
}
