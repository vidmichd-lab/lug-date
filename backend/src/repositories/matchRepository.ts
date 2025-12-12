/**
 * Match Repository
 * Handles all database operations for matches
 */

import { postgresClient } from '../db/postgresConnection';
import { logger } from '../logger';
import type { Match } from '@dating-app/shared';

export class MatchRepository {
  /**
   * Create match
   */
  async createMatch(match: Match): Promise<Match> {
    try {
      const query = `
        INSERT INTO matches (id, user_id1, user_id2, event_id, created_at)
        VALUES ($1, $2, $3, $4, $5);
      `;

      const params = [
        match.id,
        match.userId1,
        match.userId2,
        match.eventId || null,
        match.createdAt || new Date(),
      ];

      await postgresClient.executeQuery(query, params);
      logger.info({ type: 'match_created', matchId: match.id });

      return match;
    } catch (error) {
      logger.error({ error, type: 'match_create_failed', matchId: match.id });
      throw error;
    }
  }

  /**
   * Get match by ID
   */
  async getMatchById(matchId: string): Promise<Match | null> {
    try {
      const query = `
        SELECT 
          id,
          user_id1 as "userId1",
          user_id2 as "userId2",
          event_id as "eventId",
          created_at as "createdAt"
        FROM matches 
        WHERE id = $1;
      `;

      const results = await postgresClient.executeQuery<any>(query, [matchId]);

      return results[0] || null;
    } catch (error) {
      logger.error({ error, type: 'match_get_failed', matchId });
      throw error;
    }
  }

  /**
   * Get matches for user
   * Uses composite indexes (user_id1, created_at) and (user_id2, created_at) for optimal performance
   */
  async getMatchesByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Match[]> {
    try {
      const query = `
        SELECT 
          id,
          user_id1 as "userId1",
          user_id2 as "userId2",
          event_id as "eventId",
          created_at as "createdAt"
        FROM matches 
        WHERE user_id1 = $1 OR user_id2 = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const results = await postgresClient.executeQuery<any>(query, [userId, limit, offset]);

      return results;
    } catch (error) {
      logger.error({ error, type: 'matches_get_failed', userId });
      throw error;
    }
  }

  /**
   * Check if match exists between two users
   * Uses composite index (user_id1, user_id2) for optimal performance
   */
  async matchExists(userId1: string, userId2: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM matches 
        WHERE (user_id1 = $1 AND user_id2 = $2)
           OR (user_id1 = $2 AND user_id2 = $1);
      `;

      const results = await postgresClient.executeQuery<{ count: string }>(query, [
        userId1,
        userId2,
      ]);

      return parseInt(results[0]?.count || '0', 10) > 0;
    } catch (error) {
      logger.error({ error, type: 'match_exists_check_failed' });
      throw error;
    }
  }

  /**
   * Get all matches (for metrics calculation)
   * Note: This may be slow for large datasets - consider pagination in production
   */
  async getAllMatches(): Promise<Match[]> {
    try {
      const query = `
        SELECT 
          id,
          user_id1 as "userId1",
          user_id2 as "userId2",
          event_id as "eventId",
          created_at as "createdAt"
        FROM matches 
        ORDER BY created_at DESC;
      `;

      const results = await postgresClient.executeQuery<any>(query);
      return results;
    } catch (error) {
      logger.error({ error, type: 'matches_get_all_failed' });
      throw error;
    }
  }
}

// Export singleton instance
export const matchRepository = new MatchRepository();
