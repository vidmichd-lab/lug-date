"use strict";
/**
 * Like Repository
 * Handles all database operations for likes and saved events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeRepository = exports.LikeRepository = void 0;
const connection_1 = require("../db/connection");
const logger_1 = require("../logger");
class LikeRepository {
    /**
     * Create like
     */
    async createLike(like) {
        try {
            const query = `
        INSERT INTO likes (id, fromUserId, toUserId, eventId, createdAt)
        VALUES ($id, $fromUserId, $toUserId, $eventId, $createdAt);
      `;
            const params = {
                id: like.id,
                fromUserId: like.fromUserId,
                toUserId: like.toUserId,
                eventId: like.eventId || null,
                createdAt: like.createdAt,
            };
            await connection_1.ydbClient.executeQuery(query, params);
            logger_1.logger.info({ type: 'like_created', likeId: like.id });
            return like;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'like_create_failed', likeId: like.id });
            throw error;
        }
    }
    /**
     * Check if like exists
     */
    async likeExists(fromUserId, toUserId, eventId) {
        try {
            let query;
            let params;
            if (eventId) {
                query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE fromUserId = $fromUserId 
            AND toUserId = $toUserId 
            AND eventId = $eventId;
        `;
                params = { fromUserId, toUserId, eventId };
            }
            else {
                query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE fromUserId = $fromUserId 
            AND toUserId = $toUserId 
            AND eventId IS NULL;
        `;
                params = { fromUserId, toUserId };
            }
            const results = await connection_1.ydbClient.executeQuery(query, params);
            return (results[0]?.count || 0) > 0;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'like_exists_check_failed' });
            throw error;
        }
    }
    /**
     * Get saved events for user (likes where toUserId is null or eventId is not null)
     * In our schema, saved events are likes where eventId is not null
     */
    async getSavedEventsByUserId(userId, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM likes 
        WHERE fromUserId = $userId 
          AND eventId IS NOT NULL
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                userId,
                limit,
                offset,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'saved_events_get_failed', userId });
            throw error;
        }
    }
    /**
     * Delete saved event (like)
     */
    async deleteSavedEvent(userId, eventId) {
        try {
            const query = `
        DELETE FROM likes 
        WHERE fromUserId = $userId 
          AND eventId = $eventId;
      `;
            await connection_1.ydbClient.executeQuery(query, {
                userId,
                eventId,
            });
            logger_1.logger.info({ type: 'saved_event_deleted', userId, eventId });
            return true;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'saved_event_delete_failed', userId, eventId });
            throw error;
        }
    }
    /**
     * Get likes between two users (for matching logic)
     */
    async getMutualLikes(userId1, userId2) {
        try {
            const query = `
        SELECT * FROM likes 
        WHERE ((fromUserId = $userId1 AND toUserId = $userId2)
           OR (fromUserId = $userId2 AND toUserId = $userId1))
        ORDER BY createdAt DESC;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                userId1,
                userId2,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'mutual_likes_get_failed' });
            throw error;
        }
    }
    /**
     * Get likes for event (users who liked this event)
     */
    async getLikesByEventId(eventId) {
        try {
            const query = `
        SELECT * FROM likes 
        WHERE eventId = $eventId
        ORDER BY createdAt DESC;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, { eventId });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'likes_get_by_event_failed', eventId });
            throw error;
        }
    }
}
exports.LikeRepository = LikeRepository;
// Export singleton instance
exports.likeRepository = new LikeRepository();
