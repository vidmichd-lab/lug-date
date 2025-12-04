/**
 * Migration 002: Create admin tables
 * Creates admins and admin_sessions tables for JWT-based authentication
 */

import { ydbClient } from '../connection';
import { logger } from '../../logger';

export const migration = {
  id: '002_create_admin_tables',
  name: 'Create admin tables for JWT authentication',
  up: async () => {
    logger.info({ type: 'migration_start', migration: '002_create_admin_tables' });

    // Create admins table
    const createAdminsTable = `
      CREATE TABLE admins (
        id String NOT NULL,
        email String NOT NULL,
        password_hash String NOT NULL,
        created_at Timestamp NOT NULL,
        updated_at Timestamp NOT NULL,
        PRIMARY KEY (id)
      );
    `;

    // Create admin_sessions table
    const createAdminSessionsTable = `
      CREATE TABLE admin_sessions (
        id String NOT NULL,
        admin_id String NOT NULL,
        refresh_token String NOT NULL,
        expires_at Timestamp NOT NULL,
        created_at Timestamp NOT NULL,
        PRIMARY KEY (id)
      );
    `;

    // Create indexes
    const createIndexes = `
      CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions (admin_id);
      CREATE INDEX idx_admin_sessions_refresh_token ON admin_sessions (refresh_token);
      CREATE INDEX idx_admins_email ON admins (email);
    `;

    try {
      await ydbClient.executeQuery(createAdminsTable);
      logger.info({ type: 'table_created', table: 'admins' });

      await ydbClient.executeQuery(createAdminSessionsTable);
      logger.info({ type: 'table_created', table: 'admin_sessions' });

      await ydbClient.executeQuery(createIndexes);
      logger.info({ type: 'indexes_created', table: 'admin_sessions' });

      logger.info({ type: 'migration_complete', migration: '002_create_admin_tables' });
    } catch (error: any) {
      // Check if tables already exist (might be from previous run)
      if (
        error?.message?.includes('already exists') ||
        error?.message?.includes('ALREADY_EXISTS')
      ) {
        logger.warn({
          type: 'migration_skipped',
          migration: '002_create_admin_tables',
          reason: 'tables_already_exist',
        });
        return;
      }
      throw error;
    }
  },
};
