/**
 * Database Migrations System for YDB
 * Manages database schema migrations
 */

import { ydbClient } from '../connection';
import { logger } from '../../logger';
import { allSchemas, generateCreateTableSQL } from '../schema';

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
      id String NOT NULL,
      name String NOT NULL,
      executed_at Timestamp NOT NULL,
      PRIMARY KEY (id)
    );
  `;

  try {
    await ydbClient.executeQuery(createTableQuery);
    logger.info({ type: 'migrations_table_created' });
  } catch (error) {
    // Table might already exist, which is fine
    logger.debug({ error, type: 'migrations_table_check' });
  }
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const results = await ydbClient.executeQuery<{ id: string }>(
      'SELECT id FROM migrations ORDER BY executed_at'
    );
    return results.map((r) => r.id);
  } catch (error) {
    // If migrations table doesn't exist, return empty array
    logger.debug({ error, type: 'get_executed_migrations' });
    return [];
  }
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(id: string, name: string): Promise<void> {
  const query = `
    INSERT INTO migrations (id, name, executed_at)
    VALUES ($id, $name, CurrentUtcTimestamp());
  `;

  await ydbClient.executeQuery(query, {
    $id: id,
    $name: name,
  });
}

/**
 * Initial migration: Create all tables
 */
const initialMigration: Migration = {
  id: '001_initial_schema',
  name: 'Create initial database schema',
  up: async () => {
    logger.info({ type: 'migration_start', migration: '001_initial_schema' });

    // Create all tables
    for (const schema of allSchemas) {
      const createTableSQL = generateCreateTableSQL(schema);
      await ydbClient.executeQuery(createTableSQL);
      logger.info({ type: 'table_created', table: schema.name });
    }

    logger.info({ type: 'migration_complete', migration: '001_initial_schema' });
  },
};

/**
 * All migrations in order
 */
const migrations: Migration[] = [initialMigration];

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get executed migrations
    const executed = await getExecutedMigrations();

    // Filter pending migrations
    const pending = migrations.filter((m) => !executed.includes(m.id));

    if (pending.length === 0) {
      logger.info({ type: 'migrations_up_to_date' });
      return;
    }

    logger.info({
      type: 'migrations_start',
      pending: pending.length,
      migrations: pending.map((m) => m.id),
    });

    // Execute pending migrations
    for (const migration of pending) {
      try {
        logger.info({
          type: 'migration_executing',
          id: migration.id,
          name: migration.name,
        });

        await migration.up();
        await markMigrationExecuted(migration.id, migration.name);

        logger.info({
          type: 'migration_success',
          id: migration.id,
        });
      } catch (error) {
        logger.error({
          error,
          type: 'migration_failed',
          id: migration.id,
        });
        throw error;
      }
    }

    logger.info({
      type: 'migrations_complete',
      executed: pending.length,
    });
  } catch (error) {
    logger.error({ error, type: 'migrations_error' });
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  executed: string[];
  pending: string[];
}> {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();
  const all = migrations.map((m) => m.id);
  const pending = all.filter((id) => !executed.includes(id));

  return {
    executed,
    pending,
  };
}

