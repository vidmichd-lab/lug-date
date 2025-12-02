/**
 * Zod validation schemas for all API endpoints
 */

import { z } from 'zod';

// ============================================
// Common schemas
// ============================================

export const userIdSchema = z.string().min(1, 'User ID is required');
export const eventIdSchema = z.string().min(1, 'Event ID is required').optional();
export const matchIdSchema = z.string().min(1, 'Match ID is required');

// ============================================
// Matches API schemas
// ============================================

export const createMatchSchema = z.object({
  userId1: userIdSchema,
  userId2: userIdSchema,
  eventId: eventIdSchema,
});

export const getMatchesQuerySchema = z.object({
  userId: userIdSchema.optional(),
  eventId: eventIdSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

// ============================================
// Photos API schemas
// ============================================

export const uploadPhotoSchema = z.object({
  userId: userIdSchema,
  // File validation is handled by multer middleware
});

// ============================================
// Admin API schemas
// ============================================

export const analyticsOverviewQuerySchema = z.object({}).passthrough();

export const usersChartQuerySchema = z.object({
  period: z.enum(['7d', '30d']).optional().default('7d'),
}).passthrough();

export const eventsTopQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
}).passthrough();

export const recentMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
}).passthrough();

// ============================================
// Helper type exports
// ============================================

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type GetMatchesQuery = z.infer<typeof getMatchesQuerySchema>;
export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
export type UsersChartQuery = z.infer<typeof usersChartQuerySchema>;
export type EventsTopQuery = z.infer<typeof eventsTopQuerySchema>;
export type RecentMatchesQuery = z.infer<typeof recentMatchesQuerySchema>;

