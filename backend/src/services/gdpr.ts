/**
 * GDPR Compliance Service
 * Handles user data rights: right to be forgotten, data export
 */

import { logger } from '../logger';
import { userRepository } from '../repositories/userRepository';
import { likeRepository } from '../repositories/likeRepository';
import { matchRepository } from '../repositories/matchRepository';
import { postgresClient } from '../db/postgresConnection';

export interface UserDataExport {
  user: {
    id: string;
    telegramId: string;
    name?: string;
    age?: number;
    city?: string;
    bio?: string;
    photos?: string[];
    createdAt: string;
    updatedAt: string;
  };
  likes: Array<{
    id: string;
    fromUserId: string;
    toUserId: string;
    eventId?: string;
    createdAt: string;
  }>;
  matches: Array<{
    id: string;
    userId1: string;
    userId2: string;
    eventId?: string;
    createdAt: string;
  }>;
  receivedLikes: Array<{
    id: string;
    fromUserId: string;
    toUserId: string;
    eventId?: string;
    createdAt: string;
  }>;
  exportDate: string;
}

/**
 * Export all user data (GDPR right to data portability)
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  try {
    // Get user
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all likes by user
    const likes = await likeRepository.getLikesByUserId(userId, 10000, 0);

    // Get all matches
    const matches = await matchRepository.getMatchesByUserId(userId, 10000, 0);

    // Get all likes received by user (where user is toUserId)
    const allLikes = await likeRepository.getAllLikes();
    const receivedLikes = allLikes.filter((like) => like.toUserId === userId);

    const exportData: UserDataExport = {
      user: {
        id: user.id,
        telegramId: String(user.telegramId),
        name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
        age: user.age || undefined,
        city: user.city,
        bio: user.bio || undefined,
        photos: user.photoUrl ? [user.photoUrl] : [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
      },
      likes: likes.map((like) => ({
        id: like.id,
        fromUserId: like.fromUserId,
        toUserId: like.toUserId,
        eventId: like.eventId,
        createdAt: like.createdAt.toISOString(),
      })),
      matches: matches.map((match) => ({
        id: match.id,
        userId1: match.userId1,
        userId2: match.userId2,
        eventId: match.eventId,
        createdAt: match.createdAt.toISOString(),
      })),
      receivedLikes: receivedLikes.map((like) => ({
        id: like.id,
        fromUserId: like.fromUserId,
        toUserId: like.toUserId,
        eventId: like.eventId,
        createdAt: like.createdAt.toISOString(),
      })),
      exportDate: new Date().toISOString(),
    };

    logger.info({
      type: 'gdpr_data_exported',
      userId,
      likesCount: likes.length,
      matchesCount: matches.length,
      receivedLikesCount: receivedLikes.length,
    });

    return exportData;
  } catch (error) {
    logger.error({ error, type: 'gdpr_data_export_failed', userId });
    throw error;
  }
}

/**
 * Delete all user data (GDPR right to be forgotten)
 * This permanently deletes all user-related data from the system
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    logger.info({ type: 'gdpr_data_deletion_started', userId });

    // Get user to verify existence
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete all likes by user
    const userLikes = await likeRepository.getLikesByUserId(userId, 10000, 0);
    for (const like of userLikes) {
      try {
        const deleteQuery = `DELETE FROM likes WHERE id = $1;`;
        await postgresClient.executeQuery(deleteQuery, [like.id]);
      } catch (error) {
        logger.warn({ error, type: 'gdpr_like_delete_failed', likeId: like.id });
      }
    }

    // Delete all likes where user is the target (toUserId)
    const allLikes = await likeRepository.getAllLikes();
    const receivedLikes = allLikes.filter((like) => like.toUserId === userId);
    for (const like of receivedLikes) {
      try {
        const deleteQuery = `DELETE FROM likes WHERE id = $1;`;
        await postgresClient.executeQuery(deleteQuery, [like.id]);
      } catch (error) {
        logger.warn({ error, type: 'gdpr_received_like_delete_failed', likeId: like.id });
      }
    }

    // Delete all matches involving user
    const userMatches = await matchRepository.getMatchesByUserId(userId, 10000, 0);
    for (const match of userMatches) {
      try {
        const deleteQuery = `DELETE FROM matches WHERE id = $1;`;
        await postgresClient.executeQuery(deleteQuery, [match.id]);
      } catch (error) {
        logger.warn({ error, type: 'gdpr_match_delete_failed', matchId: match.id });
      }
    }

    // Delete user profile
    try {
      const deleteUserQuery = `DELETE FROM users WHERE id = $1;`;
      await postgresClient.executeQuery(deleteUserQuery, [userId]);
    } catch (error) {
      logger.error({ error, type: 'gdpr_user_delete_failed', userId });
      throw error;
    }

    logger.info({
      type: 'gdpr_data_deletion_completed',
      userId,
      deletedLikes: userLikes.length,
      deletedReceivedLikes: receivedLikes.length,
      deletedMatches: userMatches.length,
    });
  } catch (error) {
    logger.error({ error, type: 'gdpr_data_deletion_failed', userId });
    throw error;
  }
}

/**
 * Anonymize user data (alternative to deletion - keeps data but removes PII)
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  try {
    logger.info({ type: 'gdpr_data_anonymization_started', userId });

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Anonymize user profile using repository
    await userRepository.updateUser(userId, {
      firstName: 'Deleted',
      lastName: 'User',
      bio: null,
      photoUrl: null,
      age: null,
      city: null,
    });

    logger.info({ type: 'gdpr_data_anonymization_completed', userId });
  } catch (error) {
    logger.error({ error, type: 'gdpr_data_anonymization_failed', userId });
    throw error;
  }
}
