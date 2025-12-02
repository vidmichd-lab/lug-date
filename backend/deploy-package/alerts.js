"use strict";
/**
 * Alert system for critical errors
 * Supports Telegram and Email notifications
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAlert = sendAlert;
exports.sendCriticalAlert = sendCriticalAlert;
exports.sendErrorAlert = sendErrorAlert;
const logger_1 = require("./logger");
const monitoring_1 = require("./monitoring");
/**
 * Send alert to Telegram
 */
async function sendTelegramAlert(options) {
    const telegramBotToken = process.env.TELEGRAM_ALERT_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_ALERT_CHAT_ID;
    if (!telegramBotToken || !telegramChatId) {
        logger_1.logger.warn('Telegram alert not configured');
        return;
    }
    try {
        const emoji = options.level === 'critical' ? '🚨' : options.level === 'error' ? '❌' : '⚠️';
        const text = `${emoji} *${options.level.toUpperCase()}*\n\n${options.message}`;
        const contextText = options.context
            ? `\n\n*Context:*\n${JSON.stringify(options.context, null, 2)}`
            : '';
        const errorText = options.error
            ? `\n\n*Error:*\n\`\`\`\n${options.error.message}\n\`\`\``
            : '';
        const message = `${text}${contextText}${errorText}`;
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.statusText}`);
        }
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'telegram_alert_failed' });
    }
}
/**
 * Send alert to Email
 */
async function sendEmailAlert(options) {
    // For production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log
    logger_1.logger.warn('Email alerts not implemented. Use external service like SendGrid or AWS SES.');
    // Example integration with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: process.env.ALERT_EMAIL,
    //   from: process.env.FROM_EMAIL,
    //   subject: `${options.level.toUpperCase()}: ${options.message}`,
    //   text: JSON.stringify({ ...options, timestamp: new Date().toISOString() }, null, 2),
    // });
}
/**
 * Send alerts to all configured channels
 */
async function sendAlert(options) {
    // Always log
    logger_1.logger[options.level === 'critical' || options.level === 'error' ? 'error' : 'warn']({
        type: 'alert',
        ...options,
    });
    // Send to error monitoring for critical errors
    if (options.level === 'critical' && options.error) {
        (0, monitoring_1.captureException)(options.error, {
            tags: {
                alert: 'true',
                ...(options.context ? Object.fromEntries(Object.entries(options.context).map(([key, value]) => [key, String(value)])) : {}),
            },
        });
    }
    // Send to all configured channels
    const promises = [];
    if (process.env.TELEGRAM_ALERT_ENABLED === 'true') {
        promises.push(sendTelegramAlert(options));
    }
    if (process.env.EMAIL_ALERT_ENABLED === 'true') {
        promises.push(sendEmailAlert(options));
    }
    await Promise.allSettled(promises);
}
/**
 * Helper for critical errors (server crashes, etc.)
 */
async function sendCriticalAlert(message, error, context) {
    await sendAlert({
        level: 'critical',
        message,
        error,
        context,
    });
}
/**
 * Helper for regular errors
 */
async function sendErrorAlert(message, error, context) {
    await sendAlert({
        level: 'error',
        message,
        error,
        context,
    });
}
