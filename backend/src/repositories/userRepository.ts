/**
 * User Repository
 * Handles all database operations for users
 */

import { ydbClient } from '../db/connection';
import { logger } from '../logger';
import type { User } from '@dating-app/shared';

export class UserRepository {
  /**
   * Create or update user
   */
  async upsertUser(user: User): Promise<User> {
    try {
      const query = `
        UPSERT INTO users (id, telegramId, username, firstName, lastName, photoUrl, bio, age, createdAt, updatedAt)
        VALUES ($id, $telegramId, $username, $firstName, $lastName, $photoUrl, $bio, $age, $createdAt, $updatedAt);
      `;

      const params = {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username || null,
        firstName: user.firstName,
        lastName: user.lastName || null,
        photoUrl: user.photoUrl || null,
        bio: user.bio || null,
        age: user.age || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await ydbClient.executeQuery(query, params);
      logger.info({ type: 'user_upserted', userId: user.id });

      return user;
    } catch (error) {
      logger.error({ error, type: 'user_upsert_failed', userId: user.id });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users WHERE id = $id;
      `;

      const results = await ydbClient.executeQuery<User>(query, { id: userId });

      return results[0] || null;
    } catch (error) {
      logger.error({ error, type: 'user_get_failed', userId });
      throw error;
    }
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users WHERE telegramId = $telegramId;
      `;

      const results = await ydbClient.executeQuery<User>(query, { telegramId });

      return results[0] || null;
    } catch (error) {
      logger.error({ error, type: 'user_get_by_telegram_failed', telegramId });
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<User>(query, {
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'users_get_all_failed' });
      throw error;
    }
  }

  /**
   * Get total users count
   */
  async getUsersCount(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM users;
      `;

      const results = await ydbClient.executeQuery<{ count: number }>(query);

      return results[0]?.count || 0;
    } catch (error) {
      logger.error({ error, type: 'users_count_failed' });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const setClause: string[] = [];
      const params: Record<string, any> = { id: userId };

      if (updates.firstName !== undefined) {
        setClause.push('firstName = $firstName');
        params.firstName = updates.firstName;
      }
      if (updates.lastName !== undefined) {
        setClause.push('lastName = $lastName');
        params.lastName = updates.lastName;
      }
      if (updates.photoUrl !== undefined) {
        setClause.push('photoUrl = $photoUrl');
        params.photoUrl = updates.photoUrl;
      }
      if (updates.bio !== undefined) {
        setClause.push('bio = $bio');
        params.bio = updates.bio;
      }
      if (updates.age !== undefined) {
        setClause.push('age = $age');
        params.age = updates.age;
      }
      // Note: isBanned and isModerated would need to be stored in a JSON field or separate table
      // For now, we'll skip them in the update query as they're not in the schema
      // TODO: Add isBanned and isModerated fields to users table schema

      setClause.push('updatedAt = $updatedAt');
      params.updatedAt = new Date();

      const query = `
        UPDATE users SET ${setClause.join(', ')} WHERE id = $id;
      `;

      await ydbClient.executeQuery(query, params);

      // Fetch updated user
      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      logger.info({ type: 'user_updated', userId });
      return updatedUser;
    } catch (error) {
      logger.error({ error, type: 'user_update_failed', userId });
      throw error;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

