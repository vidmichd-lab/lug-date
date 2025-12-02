"use strict";
/**
 * Match Repository
 * Handles all database operations for matches
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchRepository = exports.MatchRepository = void 0;
const connection_1 = require("../db/connection");
const logger_1 = require("../logger");
class MatchRepository {
    /**
     * Create match
     */
    async createMatch(match) {
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
            await connection_1.ydbClient.executeQuery(query, params);
            logger_1.logger.info({ type: 'match_created', matchId: match.id });
            return match;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'match_create_failed', matchId: match.id });
            throw error;
        }
    }
    /**
     * Get match by ID
     */
    async getMatchById(matchId) {
        try {
            const query = `
        SELECT * FROM matches WHERE id = $id;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, { id: matchId });
            return results[0] || null;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'match_get_failed', matchId });
            throw error;
        }
    }
    /**
     * Get matches for user
     */
    async getMatchesByUserId(userId, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM matches 
        WHERE userId1 = $userId OR userId2 = $userId
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
            logger_1.logger.error({ error, type: 'matches_get_failed', userId });
            throw error;
        }
    }
    /**
     * Check if match exists between two users
     */
    async matchExists(userId1, userId2) {
        try {
            const query = `
        SELECT COUNT(*) as count FROM matches 
        WHERE (userId1 = $userId1 AND userId2 = $userId2)
           OR (userId1 = $userId2 AND userId2 = $userId1);
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                userId1,
                userId2,
            });
            return (results[0]?.count || 0) > 0;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'match_exists_check_failed' });
            throw error;
        }
    }
}
exports.MatchRepository = MatchRepository;
// Export singleton instance
exports.matchRepository = new MatchRepository();
