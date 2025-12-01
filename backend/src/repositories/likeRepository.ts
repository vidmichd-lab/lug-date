/**
 * Like Repository
 * Handles all database operations for likes and saved events
 */

import { ydbClient } from '../db/connection';
import { logger } from '../logger';
import type { Like } from '@dating-app/shared';

export class LikeRepository {
  /**
   * Create like
   */
  async createLike(like: Like): Promise<Like> {
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

      await ydbClient.executeQuery(query, params);
      logger.info({ type: 'like_created', likeId: like.id });

      return like;
    } catch (error) {
      logger.error({ error, type: 'like_create_failed', likeId: like.id });
      throw error;
    }
  }

  /**
   * Check if like exists
   */
  async likeExists(fromUserId: string, toUserId: string, eventId?: string): Promise<boolean> {
    try {
      let query: string;
      let params: Record<string, any>;

      if (eventId) {
        query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE fromUserId = $fromUserId 
            AND toUserId = $toUserId 
            AND eventId = $eventId;
        `;
        params = { fromUserId, toUserId, eventId };
      } else {
        query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE fromUserId = $fromUserId 
            AND toUserId = $toUserId 
            AND eventId IS NULL;
        `;
        params = { fromUserId, toUserId };
      }

      const results = await ydbClient.executeQuery<{ count: number }>(query, params);

      return (results[0]?.count || 0) > 0;
    } catch (error) {
      logger.error({ error, type: 'like_exists_check_failed' });
      throw error;
    }
  }

  /**
   * Get saved events for user (likes where toUserId is null or eventId is not null)
   * In our schema, saved events are likes where eventId is not null
   */
  async getSavedEventsByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Like[]> {
    try {
      const query = `
        SELECT * FROM likes 
        WHERE fromUserId = $userId 
          AND eventId IS NOT NULL
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<Like>(query, {
        userId,
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'saved_events_get_failed', userId });
      throw error;
    }
  }

  /**
   * Delete saved event (like)
   */
  async deleteSavedEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM likes 
        WHERE fromUserId = $userId 
          AND eventId = $eventId;
      `;

      await ydbClient.executeQuery(query, {
        userId,
        eventId,
      });

      logger.info({ type: 'saved_event_deleted', userId, eventId });
      return true;
    } catch (error) {
      logger.error({ error, type: 'saved_event_delete_failed', userId, eventId });
      throw error;
    }
  }

  /**
   * Get likes between two users (for matching logic)
   */
  async getMutualLikes(userId1: string, userId2: string): Promise<Like[]> {
    try {
      const query = `
        SELECT * FROM likes 
        WHERE ((fromUserId = $userId1 AND toUserId = $userId2)
           OR (fromUserId = $userId2 AND toUserId = $userId1))
        ORDER BY createdAt DESC;
      `;

      const results = await ydbClient.executeQuery<Like>(query, {
        userId1,
        userId2,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'mutual_likes_get_failed' });
      throw error;
    }
  }

  /**
   * Get likes for event (users who liked this event)
   */
  async getLikesByEventId(eventId: string): Promise<Like[]> {
    try {
      const query = `
        SELECT * FROM likes 
        WHERE eventId = $eventId
        ORDER BY createdAt DESC;
      `;

      const results = await ydbClient.executeQuery<Like>(query, { eventId });

      return results;
    } catch (error) {
      logger.error({ error, type: 'likes_get_by_event_failed', eventId });
      throw error;
    }
  }
}

// Export singleton instance
export const likeRepository = new LikeRepository();

