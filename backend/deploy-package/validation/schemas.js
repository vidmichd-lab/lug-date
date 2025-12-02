"use strict";
/**
 * Zod validation schemas for all API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recentMatchesQuerySchema = exports.eventsTopQuerySchema = exports.usersChartQuerySchema = exports.analyticsOverviewQuerySchema = exports.uploadPhotoSchema = exports.getMatchesQuerySchema = exports.createMatchSchema = exports.matchIdSchema = exports.eventIdSchema = exports.userIdSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Common schemas
// ============================================
exports.userIdSchema = zod_1.z.string().min(1, 'User ID is required');
exports.eventIdSchema = zod_1.z.string().min(1, 'Event ID is required').optional();
exports.matchIdSchema = zod_1.z.string().min(1, 'Match ID is required');
// ============================================
// Matches API schemas
// ============================================
exports.createMatchSchema = zod_1.z.object({
    userId1: exports.userIdSchema,
    userId2: exports.userIdSchema,
    eventId: exports.eventIdSchema,
});
exports.getMatchesQuerySchema = zod_1.z.object({
    userId: exports.userIdSchema.optional(),
    eventId: exports.eventIdSchema,
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20).optional(),
    offset: zod_1.z.coerce.number().int().min(0).default(0).optional(),
});
// ============================================
// Photos API schemas
// ============================================
exports.uploadPhotoSchema = zod_1.z.object({
    userId: exports.userIdSchema,
    // File validation is handled by multer middleware
});
// ============================================
// Admin API schemas
// ============================================
exports.analyticsOverviewQuerySchema = zod_1.z.object({}).passthrough();
exports.usersChartQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['7d', '30d']).optional().default('7d'),
}).passthrough();
exports.eventsTopQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
}).passthrough();
exports.recentMatchesQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
}).passthrough();
