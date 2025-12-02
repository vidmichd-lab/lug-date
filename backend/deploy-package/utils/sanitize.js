"use strict";
/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripHtml = stripHtml;
exports.escapeHtml = escapeHtml;
exports.sanitizeText = sanitizeText;
exports.sanitizeObject = sanitizeObject;
exports.sanitizeMiddleware = sanitizeMiddleware;
/**
 * Remove HTML tags from string
 */
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
}
/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
/**
 * Sanitize text input - removes HTML and escapes special characters
 */
function sanitizeText(text) {
    if (typeof text !== 'string') {
        return '';
    }
    // Remove HTML tags
    let sanitized = stripHtml(text);
    // Escape HTML entities
    sanitized = escapeHtml(sanitized);
    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    // Trim whitespace
    sanitized = sanitized.trim();
    return sanitized;
}
/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
    const sanitized = { ...obj };
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeText(sanitized[key]);
        }
        else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
        else if (Array.isArray(sanitized[key])) {
            sanitized[key] = sanitized[key].map((item) => typeof item === 'string' ? sanitizeText(item) : typeof item === 'object' ? sanitizeObject(item) : item);
        }
    }
    return sanitized;
}
function sanitizeMiddleware(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}
