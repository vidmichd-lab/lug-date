"use strict";
/**
 * User Repository
 * Handles all database operations for users
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const connection_1 = require("../db/connection");
const logger_1 = require("../logger");
class UserRepository {
    /**
     * Create or update user
     */
    async upsertUser(user) {
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
            await connection_1.ydbClient.executeQuery(query, params);
            logger_1.logger.info({ type: 'user_upserted', userId: user.id });
            return user;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'user_upsert_failed', userId: user.id });
            throw error;
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const query = `
        SELECT * FROM users WHERE id = $id;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, { id: userId });
            return results[0] || null;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'user_get_failed', userId });
            throw error;
        }
    }
    /**
     * Get user by Telegram ID
     */
    async getUserByTelegramId(telegramId) {
        try {
            const query = `
        SELECT * FROM users WHERE telegramId = $telegramId;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, { telegramId });
            return results[0] || null;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'user_get_by_telegram_failed', telegramId });
            throw error;
        }
    }
    /**
     * Get all users with pagination
     */
    async getAllUsers(limit = 50, offset = 0) {
        try {
            const query = `
        SELECT * FROM users 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                limit,
                offset,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'users_get_all_failed' });
            throw error;
        }
    }
    /**
     * Get total users count
     */
    async getUsersCount() {
        try {
            const query = `
        SELECT COUNT(*) as count FROM users;
      `;
            const results = await connection_1.ydbClient.executeQuery(query);
            return results[0]?.count || 0;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'users_count_failed' });
            throw error;
        }
    }
    /**
     * Update user
     */
    async updateUser(userId, updates) {
        try {
            const setClause = [];
            const params = { id: userId };
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
            await connection_1.ydbClient.executeQuery(query, params);
            // Fetch updated user
            const updatedUser = await this.getUserById(userId);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }
            logger_1.logger.info({ type: 'user_updated', userId });
            return updatedUser;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'user_update_failed', userId });
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
// Export singleton instance
exports.userRepository = new UserRepository();
