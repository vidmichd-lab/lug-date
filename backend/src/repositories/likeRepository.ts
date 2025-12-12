/**
 * Like Repository
 * Handles all database operations for likes and saved events
 */

import { postgresClient } from '../db/postgresConnection';
import { logger } from '../logger';
import type { Like } from '@dating-app/shared';

export class LikeRepository {
  /**
   * Create like
   */
  async createLike(like: Like): Promise<Like> {
    try {
      const query = `
        INSERT INTO likes (id, from_user_id, to_user_id, event_id, created_at)
        VALUES ($1, $2, $3, $4, $5);
      `;

      const params = [
        like.id,
        like.fromUserId,
        like.toUserId,
        like.eventId || null,
        like.createdAt || new Date(),
      ];

      await postgresClient.executeQuery(query, params);
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
      let params: any[];

      if (eventId) {
        query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE from_user_id = $1 
            AND to_user_id = $2 
            AND event_id = $3;
        `;
        params = [fromUserId, toUserId, eventId];
      } else {
        query = `
          SELECT COUNT(*) as count FROM likes 
          WHERE from_user_id = $1 
            AND to_user_id = $2 
            AND event_id IS NULL;
        `;
        params = [fromUserId, toUserId];
      }

      const results = await postgresClient.executeQuery<{ count: string }>(query, params);

      return parseInt(results[0]?.count || '0', 10) > 0;
    } catch (error) {
      logger.error({ error, type: 'like_exists_check_failed' });
      throw error;
    }
  }

  /**
   * Get saved events for user (likes where eventId is not null)
   */
  async getSavedEventsByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Like[]> {
    try {
      const query = `
        SELECT 
          id,
          from_user_id as "fromUserId",
          to_user_id as "toUserId",
          event_id as "eventId",
          created_at as "createdAt"
        FROM likes 
        WHERE from_user_id = $1 
          AND event_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const results = await postgresClient.executeQuery<any>(query, [userId, limit, offset]);

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
        WHERE from_user_id = $1 
          AND event_id = $2;
      `;

      await postgresClient.executeQuery(query, [userId, eventId]);

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
        SELECT 
          id,
          from_user_id as "fromUserId",
          to_user_id as "toUserId",
          event_id as "eventId",
          created_at as "createdAt"
        FROM likes 
        WHERE ((from_user_id = $1 AND to_user_id = $2)
           OR (from_user_id = $2 AND to_user_id = $1))
        ORDER BY created_at DESC;
      `;

      const results = await postgresClient.executeQuery<any>(query, [userId1, userId2]);

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
        SELECT 
          id,
          from_user_id as "fromUserId",
          to_user_id as "toUserId",
          event_id as "eventId",
          created_at as "createdAt"
        FROM likes 
        WHERE event_id = $1
        ORDER BY created_at DESC;
      `;

      const results = await postgresClient.executeQuery<any>(query, [eventId]);

      return results;
    } catch (error) {
      logger.error({ error, type: 'likes_get_by_event_failed', eventId });
      throw error;
    }
  }

  /**
   * Get likes by user ID
   */
  async getLikesByUserId(
    userId: string,
    limit: number = 1000,
    offset: number = 0
  ): Promise<Like[]> {
    try {
      const query = `
        SELECT 
          id,
          from_user_id as "fromUserId",
          to_user_id as "toUserId",
          event_id as "eventId",
          created_at as "createdAt"
        FROM likes 
        WHERE from_user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const results = await postgresClient.executeQuery<any>(query, [userId, limit, offset]);

      return results;
    } catch (error) {
      logger.error({ error, type: 'likes_get_by_user_failed', userId });
      throw error;
    }
  }

  /**
   * Get all likes (for metrics calculation)
   * Note: This may be slow for large datasets - consider pagination in production
   */
  async getAllLikes(): Promise<Like[]> {
    try {
      const query = `
        SELECT 
          id,
          from_user_id as "fromUserId",
          to_user_id as "toUserId",
          event_id as "eventId",
          created_at as "createdAt"
        FROM likes 
        ORDER BY created_at DESC;
      `;

      const results = await postgresClient.executeQuery<any>(query);
      return results;
    } catch (error) {
      logger.error({ error, type: 'likes_get_all_failed' });
      throw error;
    }
  }
}

// Export singleton instance
export const likeRepository = new LikeRepository();
