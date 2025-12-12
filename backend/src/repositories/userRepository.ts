/**
 * User Repository
 * Handles all database operations for users
 */

import { postgresClient } from '../db/postgresConnection';
import { logger } from '../logger';
import type { User } from '@dating-app/shared';

export class UserRepository {
  /**
   * Create or update user
   */
  async upsertUser(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (id, telegram_id, username, first_name, last_name, photo_url, bio, age, city, gender, interests, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          telegram_id = EXCLUDED.telegram_id,
          username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          photo_url = EXCLUDED.photo_url,
          bio = EXCLUDED.bio,
          age = EXCLUDED.age,
          city = EXCLUDED.city,
          gender = EXCLUDED.gender,
          interests = EXCLUDED.interests,
          updated_at = EXCLUDED.updated_at;
      `;

      const params = [
        user.id,
        user.telegramId,
        user.username || null,
        user.firstName,
        user.lastName || null,
        user.photoUrl || null,
        user.bio || null,
        user.age || null,
        (user as any).city || null,
        (user as any).gender || null,
        JSON.stringify((user as any).interests || []),
        user.createdAt || new Date(),
        user.updatedAt || new Date(),
      ];

      await postgresClient.executeQuery(query, params);
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
        SELECT 
          id,
          telegram_id as "telegramId",
          username,
          first_name as "firstName",
          last_name as "lastName",
          photo_url as "photoUrl",
          bio,
          age,
          city,
          gender,
          interests,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users 
        WHERE id = $1;
      `;

      const results = await postgresClient.executeQuery<any>(query, [userId]);

      if (results.length === 0) {
        return null;
      }

      // Map snake_case to camelCase
      const row = results[0];
      return {
        id: row.id,
        telegramId: parseInt(row.telegramId, 10),
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        photoUrl: row.photoUrl,
        bio: row.bio,
        age: row.age ? parseInt(row.age, 10) : null,
        city: row.city,
        gender: row.gender,
        interests: row.interests || [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as User;
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
        SELECT 
          id,
          telegram_id as "telegramId",
          username,
          first_name as "firstName",
          last_name as "lastName",
          photo_url as "photoUrl",
          bio,
          age,
          city,
          gender,
          interests,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users 
        WHERE telegram_id = $1;
      `;

      const results = await postgresClient.executeQuery<any>(query, [telegramId]);

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return {
        id: row.id,
        telegramId: parseInt(row.telegramId, 10),
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        photoUrl: row.photoUrl,
        bio: row.bio,
        age: row.age ? parseInt(row.age, 10) : null,
        city: row.city,
        gender: row.gender,
        interests: row.interests || [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as User;
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
        SELECT 
          id,
          telegram_id as "telegramId",
          username,
          first_name as "firstName",
          last_name as "lastName",
          photo_url as "photoUrl",
          bio,
          age,
          city,
          gender,
          interests,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;

      const results = await postgresClient.executeQuery<any>(query, [limit, offset]);

      return results.map((row) => ({
        id: row.id,
        telegramId: parseInt(row.telegramId, 10),
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        photoUrl: row.photoUrl,
        bio: row.bio,
        age: row.age ? parseInt(row.age, 10) : null,
        city: row.city,
        gender: row.gender,
        interests: row.interests || [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })) as User[];
    } catch (error) {
      logger.error({ error, type: 'users_get_all_failed' });
      throw error;
    }
  }

  /**
   * Get all users without pagination (for metrics calculation)
   * Note: This may be slow for large datasets - consider pagination in production
   */
  async getAllUsersUnpaginated(): Promise<User[]> {
    try {
      const query = `
        SELECT 
          id,
          telegram_id as "telegramId",
          username,
          first_name as "firstName",
          last_name as "lastName",
          photo_url as "photoUrl",
          bio,
          age,
          city,
          gender,
          interests,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users 
        ORDER BY created_at DESC;
      `;

      const results = await postgresClient.executeQuery<any>(query);

      return results.map((row) => ({
        id: row.id,
        telegramId: parseInt(row.telegramId, 10),
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        photoUrl: row.photoUrl,
        bio: row.bio,
        age: row.age ? parseInt(row.age, 10) : null,
        city: row.city,
        gender: row.gender,
        interests: row.interests || [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })) as User[];
    } catch (error) {
      logger.error({ error, type: 'users_get_all_unpaginated_failed' });
      throw error;
    }
  }

  /**
   * Get total users count
   */
  async getUsersCount(): Promise<number> {
    try {
      const query = `SELECT COUNT(*) as count FROM users;`;

      const results = await postgresClient.executeQuery<{ count: string }>(query);

      return parseInt(results[0]?.count || '0', 10);
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
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.firstName !== undefined) {
        setClause.push(`first_name = $${paramIndex++}`);
        params.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        setClause.push(`last_name = $${paramIndex++}`);
        params.push(updates.lastName);
      }
      if (updates.photoUrl !== undefined) {
        setClause.push(`photo_url = $${paramIndex++}`);
        params.push(updates.photoUrl);
      }
      if (updates.bio !== undefined) {
        setClause.push(`bio = $${paramIndex++}`);
        params.push(updates.bio);
      }
      if (updates.age !== undefined) {
        setClause.push(`age = $${paramIndex++}`);
        params.push(updates.age);
      }
      if ((updates as any).city !== undefined) {
        setClause.push(`city = $${paramIndex++}`);
        params.push((updates as any).city);
      }
      if ((updates as any).gender !== undefined) {
        setClause.push(`gender = $${paramIndex++}`);
        params.push((updates as any).gender);
      }
      if ((updates as any).interests !== undefined) {
        setClause.push(`interests = $${paramIndex++}`);
        params.push(JSON.stringify((updates as any).interests));
      }

      setClause.push(`updated_at = $${paramIndex++}`);
      params.push(new Date());

      params.push(userId); // For WHERE clause

      const query = `
        UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex};
      `;

      await postgresClient.executeQuery(query, params);

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
