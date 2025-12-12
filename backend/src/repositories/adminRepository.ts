/**
 * Admin Repository
 * Handles database operations for admins and admin sessions
 */

import { postgresClient } from '../db/postgresConnection';
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
   * Find admin by email (username)
   */
  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const query = `
        SELECT 
          id,
          username as email,
          password_hash as "passwordHash",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM admin_users
        WHERE username = $1
      `;
      const result = await postgresClient.executeQuery<any>(query, [email]);
      if (result.length === 0) {
        return null;
      }
      const row = result[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.passwordHash,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
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
        SELECT 
          id,
          username as email,
          password_hash as "passwordHash",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM admin_users
        WHERE id = $1
      `;
      const result = await postgresClient.executeQuery<any>(query, [id]);
      if (result.length === 0) {
        return null;
      }
      const row = result[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.passwordHash,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
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
        INSERT INTO admin_users (id, username, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await postgresClient.executeQuery(query, [id, admin.email, admin.passwordHash, now, now]);

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
        VALUES ($1, $2, $3, $4, $5)
      `;

      await postgresClient.executeQuery(query, [
        id,
        session.adminId,
        session.refreshToken,
        session.expiresAt,
        now,
      ]);

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
        SELECT 
          id,
          admin_id as "adminId",
          refresh_token as "refreshToken",
          expires_at as "expiresAt",
          created_at as "createdAt"
        FROM admin_sessions
        WHERE refresh_token = $1
      `;
      const result = await postgresClient.executeQuery<any>(query, [refreshToken]);
      if (result.length === 0) {
        return null;
      }
      return result[0];
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
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.refreshToken !== undefined) {
        setParts.push(`refresh_token = $${paramIndex++}`);
        params.push(updates.refreshToken);
      }

      if (updates.expiresAt !== undefined) {
        setParts.push(`expires_at = $${paramIndex++}`);
        params.push(updates.expiresAt);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      params.push(id); // For WHERE clause

      const query = `
        UPDATE admin_sessions
        SET ${setParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await postgresClient.executeQuery(query, params);
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
        WHERE refresh_token = $1
      `;
      await postgresClient.executeQuery(query, [refreshToken]);
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
        WHERE admin_id = $1
      `;
      await postgresClient.executeQuery(query, [adminId]);
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
        WHERE expires_at < NOW()
      `;
      const result = await postgresClient.executeQuery<{ rowCount?: number }>(query);
      const deleted = (result as any).rowCount || 0;
      logger.info({ type: 'admin_sessions_cleaned', deleted });
      return deleted;
    } catch (error) {
      logger.error({ error, type: 'admin_sessions_clean_failed' });
      throw error;
    }
  },
};
