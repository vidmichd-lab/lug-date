/**
 * Admin Repository
 * Handles database operations for admins and admin sessions
 */

import { ydbClient } from '../db/connection';
import { logger } from '../logger';

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  id: string;
  adminId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export const adminRepository = {
  /**
   * Find admin by email
   */
  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const query = `
        SELECT * FROM admins
        WHERE email = $email
      `;
      const result = await ydbClient.executeQuery<Admin>(query, { email });
      return result[0] || null;
    } catch (error) {
      logger.error({ error, type: 'admin_find_by_email_failed', email });
      throw error;
    }
  },

  /**
   * Find admin by ID
   */
  async findById(id: string): Promise<Admin | null> {
    try {
      const query = `
        SELECT * FROM admins
        WHERE id = $id
      `;
      const result = await ydbClient.executeQuery<Admin>(query, { id });
      return result[0] || null;
    } catch (error) {
      logger.error({ error, type: 'admin_find_by_id_failed', id });
      throw error;
    }
  },

  /**
   * Create admin
   */
  async create(
    admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Admin> {
    try {
      const id = admin.id || `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const query = `
        INSERT INTO admins (id, email, password_hash, created_at, updated_at)
        VALUES ($id, $email, $passwordHash, $createdAt, $updatedAt)
      `;

      await ydbClient.executeQuery(query, {
        id,
        email: admin.email,
        passwordHash: admin.passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      logger.info({ type: 'admin_created', adminId: id, email: admin.email });

      return {
        id,
        email: admin.email,
        passwordHash: admin.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      logger.error({ error, type: 'admin_create_failed', email: admin.email });
      throw error;
    }
  },

  /**
   * Create admin session
   */
  async createSession(session: Omit<AdminSession, 'id' | 'createdAt'>): Promise<AdminSession> {
    try {
      const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const query = `
        INSERT INTO admin_sessions (id, admin_id, refresh_token, expires_at, created_at)
        VALUES ($id, $adminId, $refreshToken, $expiresAt, $createdAt)
      `;

      await ydbClient.executeQuery(query, {
        id,
        adminId: session.adminId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        createdAt: now,
      });

      logger.info({ type: 'admin_session_created', sessionId: id, adminId: session.adminId });

      return {
        id,
        adminId: session.adminId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        createdAt: now,
      };
    } catch (error) {
      logger.error({ error, type: 'admin_session_create_failed', adminId: session.adminId });
      throw error;
    }
  },

  /**
   * Find session by refresh token
   */
  async findSessionByToken(refreshToken: string): Promise<AdminSession | null> {
    try {
      const query = `
        SELECT * FROM admin_sessions
        WHERE refresh_token = $refreshToken
      `;
      const result = await ydbClient.executeQuery<AdminSession>(query, { refreshToken });
      return result[0] || null;
    } catch (error) {
      logger.error({ error, type: 'admin_session_find_failed' });
      throw error;
    }
  },

  /**
   * Update session
   */
  async updateSession(
    id: string,
    updates: Partial<Pick<AdminSession, 'refreshToken' | 'expiresAt'>>
  ): Promise<void> {
    try {
      const setParts: string[] = [];
      const params: Record<string, any> = { id };

      if (updates.refreshToken !== undefined) {
        setParts.push('refresh_token = $refreshToken');
        params.refreshToken = updates.refreshToken;
      }

      if (updates.expiresAt !== undefined) {
        setParts.push('expires_at = $expiresAt');
        params.expiresAt = updates.expiresAt;
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      const query = `
        UPDATE admin_sessions
        SET ${setParts.join(', ')}
        WHERE id = $id
      `;

      await ydbClient.executeQuery(query, params);
      logger.info({ type: 'admin_session_updated', sessionId: id });
    } catch (error) {
      logger.error({ error, type: 'admin_session_update_failed', sessionId: id });
      throw error;
    }
  },

  /**
   * Delete session by refresh token
   */
  async deleteSession(refreshToken: string): Promise<void> {
    try {
      const query = `
        DELETE FROM admin_sessions
        WHERE refresh_token = $refreshToken
      `;
      await ydbClient.executeQuery(query, { refreshToken });
      logger.info({ type: 'admin_session_deleted' });
    } catch (error) {
      logger.error({ error, type: 'admin_session_delete_failed' });
      throw error;
    }
  },

  /**
   * Delete all sessions for admin
   */
  async deleteAllSessions(adminId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM admin_sessions
        WHERE admin_id = $adminId
      `;
      await ydbClient.executeQuery(query, { adminId });
      logger.info({ type: 'admin_sessions_deleted_all', adminId });
    } catch (error) {
      logger.error({ error, type: 'admin_sessions_delete_all_failed', adminId });
      throw error;
    }
  },

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<number> {
    try {
      const query = `
        DELETE FROM admin_sessions
        WHERE expires_at < CurrentUtcTimestamp()
      `;
      await ydbClient.executeQuery(query);
      logger.info({ type: 'admin_sessions_cleaned' });
      // Note: YDB doesn't return affected rows count easily, so we return 0
      return 0;
    } catch (error) {
      logger.error({ error, type: 'admin_sessions_clean_failed' });
      throw error;
    }
  },
};
