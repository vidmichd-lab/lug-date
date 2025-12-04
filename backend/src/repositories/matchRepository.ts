/**
 * Match Repository
 * Handles all database operations for matches
 */

import { ydbClient } from '../db/connection';
import { logger } from '../logger';
import type { Match } from '@dating-app/shared';

export class MatchRepository {
  /**
   * Create match
   */
  async createMatch(match: Match): Promise<Match> {
    try {
      const query = `
        INSERT INTO matches (id, userId1, userId2, eventId, createdAt)
        VALUES ($id, $userId1, $userId2, $eventId, $createdAt);
      `;

      const params = {
        id: match.id,
        userId1: match.userId1,
        userId2: match.userId2,
        eventId: match.eventId || null,
        createdAt: match.createdAt,
      };

      await ydbClient.executeQuery(query, params);
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
        SELECT * FROM matches WHERE id = $id;
      `;

      const results = await ydbClient.executeQuery<Match>(query, { id: matchId });

      return results[0] || null;
    } catch (error) {
      logger.error({ error, type: 'match_get_failed', matchId });
      throw error;
    }
  }

  /**
   * Get matches for user
   * Uses composite indexes (userId1, createdAt) and (userId2, createdAt) for optimal performance
   * Note: YDB will use indexes for both parts of OR condition
   */
  async getMatchesByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Match[]> {
    try {
      // YDB can use both composite indexes idx_matches_user1_created and idx_matches_user2_created
      // for the OR condition, making this query efficient
      const query = `
        SELECT * FROM matches 
        WHERE userId1 = $userId OR userId2 = $userId
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<Match>(query, {
        userId,
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'matches_get_failed', userId });
      throw error;
    }
  }

  /**
   * Check if match exists between two users
   * Uses composite index (userId1, userId2) for optimal performance
   */
  async matchExists(userId1: string, userId2: string): Promise<boolean> {
    try {
      // Use composite index idx_matches_user1_user2 for faster lookup
      // Check both directions: (userId1, userId2) and (userId2, userId1)
      const query = `
        SELECT COUNT(*) as count FROM matches 
        WHERE (userId1 = $userId1 AND userId2 = $userId2)
           OR (userId1 = $userId2 AND userId2 = $userId1);
      `;

      const results = await ydbClient.executeQuery<{ count: number }>(query, {
        userId1,
        userId2,
      });

      return (results[0]?.count || 0) > 0;
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
        SELECT * FROM matches 
        ORDER BY createdAt DESC;
      `;

      const results = await ydbClient.executeQuery<Match>(query);
      return results;
    } catch (error) {
      logger.error({ error, type: 'matches_get_all_failed' });
      throw error;
    }
  }
}

// Export singleton instance
export const matchRepository = new MatchRepository();
