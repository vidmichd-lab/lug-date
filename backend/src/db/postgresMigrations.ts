/**
 * Database Migrations System for PostgreSQL
 * Manages database schema migrations
 */

import { postgresClient } from './postgresConnection';
import { logger } from '../logger';
import { allTablesSQL, allIndexesSQL } from './postgresSchema';

// Import init function for migrations
import { initPostgreSQLForMigrations } from './postgresConnection';

export interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await postgresClient.executeQuery(createTableQuery);
    logger.debug({ type: 'migrations_table_ensured' });
  } catch (error) {
    logger.error({ error, type: 'migrations_table_create_failed' });
    throw error;
  }
}

/**
 * Get all executed migrations
 */
export async function getExecutedMigrations(): Promise<string[]> {
  await ensureMigrationsTable();
  const results = await postgresClient.executeQuery<{ id: string }>(
    'SELECT id FROM migrations ORDER BY executed_at ASC;'
  );
  return results.map((row) => row.id);
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(migrationId: string, migrationName: string): Promise<void> {
  await ensureMigrationsTable();
  await postgresClient.executeQuery(
    'INSERT INTO migrations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;',
    [migrationId, migrationName]
  );
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  executed: string[];
  pending: string[];
}> {
  try {
    const executed = await getExecutedMigrations();
    const allMigrationIds = migrations.map((m) => m.id);
    const pending = allMigrationIds.filter((id) => !executed.includes(id));

    return {
      executed,
      pending,
    };
  } catch (error) {
    logger.error({ error, type: 'migration_status_check_failed' });
    throw error;
  }
}

/**
 * Migration 001: Create all tables
 */
const migration001: Migration = {
  id: '001',
  name: 'Create all tables',
  async up() {
    logger.info({ type: 'migration_starting', migrationId: '001' });

    // Create all tables
    for (const tableSQL of allTablesSQL) {
      await postgresClient.executeQuery(tableSQL);
      logger.debug({ type: 'migration_table_created', sql: tableSQL.substring(0, 100) });
    }

    // Create all indexes
    for (const indexSQL of allIndexesSQL) {
      await postgresClient.executeQuery(indexSQL);
      logger.debug({ type: 'migration_index_created', sql: indexSQL.substring(0, 100) });
    }

    logger.info({ type: 'migration_completed', migrationId: '001' });
  },
};

/**
 * All migrations in order
 */
const migrations: Migration[] = [migration001];

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    await ensureMigrationsTable();
    const executed = await getExecutedMigrations();

    logger.info({
      type: 'migrations_starting',
      executedCount: executed.length,
      totalCount: migrations.length,
    });

    for (const migration of migrations) {
      if (executed.includes(migration.id)) {
        logger.debug({
          type: 'migration_skipped',
          migrationId: migration.id,
          reason: 'already_executed',
        });
        continue;
      }

      logger.info({
        type: 'migration_running',
        migrationId: migration.id,
        name: migration.name,
      });

      try {
        await migration.up();
        await markMigrationExecuted(migration.id, migration.name);
        logger.info({
          type: 'migration_completed',
          migrationId: migration.id,
        });
      } catch (error) {
        logger.error({
          error,
          type: 'migration_failed',
          migrationId: migration.id,
        });
        throw error;
      }
    }

    logger.info({ type: 'migrations_completed', totalCount: migrations.length });
  } catch (error) {
    logger.error({ error, type: 'migrations_failed' });
    throw error;
  }
}
