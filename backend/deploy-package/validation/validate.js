"use strict";
/**
 * Validation middleware for Express
 * Validates request body, query, and params using Zod schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.formatZodError = formatZodError;
const zod_1 = require("zod");
const logger_1 = require("../logger");
/**
 * Validation middleware factory
 */
function validate(options) {
    return async (req, res, next) => {
        try {
            // Validate body
            if (options.body) {
                req.body = await options.body.parseAsync(req.body);
            }
            // Validate query
            if (options.query) {
                const result = await options.query.safeParseAsync(req.query);
                if (!result.success) {
                    const errors = result.error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));
                    logger_1.logger.warn({
                        type: 'validation_error',
                        errors,
                        method: req.method,
                        url: req.url,
                        query: req.query,
                    });
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            code: 'VALIDATION_ERROR',
                            details: errors,
                        },
                    });
                }
                req.query = result.data;
            }
            // Validate params
            if (options.params) {
                req.params = await options.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.logger.warn({
                    type: 'validation_error',
                    errors,
                    method: req.method,
                    url: req.url,
                });
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        code: 'VALIDATION_ERROR',
                        details: errors,
                    },
                });
            }
            // Unexpected error
            next(error);
        }
    };
}
/**
 * Helper to format Zod error for response
 */
function formatZodError(error) {
    return error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
    }));
}
