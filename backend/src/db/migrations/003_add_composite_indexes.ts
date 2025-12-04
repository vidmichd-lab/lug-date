/**
 * Migration 003: Add composite indexes for performance optimization
 * Adds composite indexes for common query patterns
 */

import { ydbClient } from '../connection';
import { logger } from '../../logger';

export const migration = {
  id: '003_add_composite_indexes',
  name: 'Add composite indexes for performance',
  up: async () => {
    logger.info({ type: 'migration_start', migration: '003_add_composite_indexes' });

    try {
      // Composite index for matches: (userId1, userId2) - for checking if match exists
      const createMatchesUser1User2Index = `
        CREATE INDEX idx_matches_user1_user2 ON matches (userId1, userId2);
      `;

      // Composite index for matches: (userId1, createdAt) - for getting user matches sorted by date
      const createMatchesUser1CreatedIndex = `
        CREATE INDEX idx_matches_user1_created ON matches (userId1, createdAt);
      `;

      // Composite index for matches: (userId2, createdAt) - for getting user matches sorted by date
      const createMatchesUser2CreatedIndex = `
        CREATE INDEX idx_matches_user2_created ON matches (userId2, createdAt);
      `;

      // Composite index for likes: (fromUserId, toUserId, eventId) - for checking mutual likes
      const createLikesFromToEventIndex = `
        CREATE INDEX idx_likes_from_to_event ON likes (fromUserId, toUserId, eventId);
      `;

      // Composite index for likes: (toUserId, createdAt) - for getting received likes sorted by date
      const createLikesToCreatedIndex = `
        CREATE INDEX idx_likes_to_created ON likes (toUserId, createdAt);
      `;

      // Composite index for messages: (matchId, createdAt) - for getting messages in match sorted by date
      // Note: This index already exists in schema, but we ensure it's created
      const createMessagesMatchCreatedIndex = `
        CREATE INDEX IF NOT EXISTS idx_messages_match_created ON messages (matchId, createdAt);
      `;

      // Execute index creation
      await ydbClient.executeQuery(createMatchesUser1User2Index);
      logger.info({ type: 'index_created', index: 'idx_matches_user1_user2' });

      await ydbClient.executeQuery(createMatchesUser1CreatedIndex);
      logger.info({ type: 'index_created', index: 'idx_matches_user1_created' });

      await ydbClient.executeQuery(createMatchesUser2CreatedIndex);
      logger.info({ type: 'index_created', index: 'idx_matches_user2_created' });

      await ydbClient.executeQuery(createLikesFromToEventIndex);
      logger.info({ type: 'index_created', index: 'idx_likes_from_to_event' });

      await ydbClient.executeQuery(createLikesToCreatedIndex);
      logger.info({ type: 'index_created', index: 'idx_likes_to_created' });

      await ydbClient.executeQuery(createMessagesMatchCreatedIndex);
      logger.info({ type: 'index_created', index: 'idx_messages_match_created' });

      logger.info({ type: 'migration_complete', migration: '003_add_composite_indexes' });
    } catch (error: any) {
      // Check if indexes already exist (might be from previous run)
      if (
        error?.message?.includes('already exists') ||
        error?.message?.includes('ALREADY_EXISTS') ||
        error?.message?.includes('duplicate')
      ) {
        logger.warn({
          type: 'migration_skipped',
          migration: '003_add_composite_indexes',
          reason: 'indexes_already_exist',
        });
        return;
      }
      throw error;
    }
  },
};
