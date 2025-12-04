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
 * Create migration lock table if it doesn't exist
 */
async function ensureLockTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migration_lock (
      id String NOT NULL,
      locked_at Timestamp NOT NULL,
      locked_by String NOT NULL,
      PRIMARY KEY (id)
    );
  `;

  try {
    await ydbClient.executeQuery(createTableQuery);
    logger.debug({ type: 'migration_lock_table_created' });
  } catch (error) {
    logger.debug({ error, type: 'migration_lock_table_check' });
  }
}

/**
 * Acquire migration lock
 * Returns true if lock was acquired, false if already locked
 */
async function acquireLock(processId: string, timeoutMinutes = 30): Promise<boolean> {
  await ensureLockTable();

  try {
    // Check if lock exists and is not expired
    const checkLockQuery = `
      SELECT * FROM migration_lock WHERE id = 'migration_lock';
    `;
    const existingLock = await ydbClient.executeQuery<{
      id: string;
      locked_at: Date;
      locked_by: string;
    }>(checkLockQuery);

    if (existingLock.length > 0) {
      const lockTime = new Date(existingLock[0].locked_at);
      const now = new Date();
      const minutesElapsed = (now.getTime() - lockTime.getTime()) / (1000 * 60);

      // If lock is expired, remove it
      if (minutesElapsed > timeoutMinutes) {
        logger.warn({
          type: 'migration_lock_expired',
          lockedBy: existingLock[0].locked_by,
          minutesElapsed,
        });
        await releaseLock();
      } else {
        // Lock is still valid
        logger.warn({
          type: 'migration_lock_exists',
          lockedBy: existingLock[0].locked_by,
          lockedAt: lockTime.toISOString(),
        });
        return false;
      }
    }

    // Acquire lock
    const acquireLockQuery = `
      INSERT INTO migration_lock (id, locked_at, locked_by)
      VALUES ('migration_lock', CurrentUtcTimestamp(), $lockedBy);
    `;

    await ydbClient.executeQuery(acquireLockQuery, {
      $lockedBy: processId,
    });

    logger.info({
      type: 'migration_lock_acquired',
      lockedBy: processId,
    });

    return true;
  } catch (error: any) {
    // If error is about primary key violation, lock is already held
    if (error.message?.includes('PRIMARY KEY') || error.message?.includes('already exists')) {
      logger.warn({
        type: 'migration_lock_failed',
        error: error.message,
      });
      return false;
    }
    throw error;
  }
}

/**
 * Release migration lock
 */
async function releaseLock(): Promise<void> {
  try {
    const releaseLockQuery = `
      DELETE FROM migration_lock WHERE id = 'migration_lock';
    `;
    await ydbClient.executeQuery(releaseLockQuery);
    logger.info({ type: 'migration_lock_released' });
  } catch (error) {
    logger.error({ error, type: 'migration_lock_release_failed' });
    // Don't throw - lock release failure is not critical
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
 * Import additional migrations
 */
import { migration as adminTablesMigration } from './002_create_admin_tables';
import { migration as compositeIndexesMigration } from './003_add_composite_indexes';

/**
 * All migrations in order
 */
const migrations: Migration[] = [
  initialMigration,
  {
    id: adminTablesMigration.id,
    name: adminTablesMigration.name,
    up: adminTablesMigration.up,
  },
  {
    id: compositeIndexesMigration.id,
    name: compositeIndexesMigration.name,
    up: compositeIndexesMigration.up,
  },
];

/**
 * Run all pending migrations with lock
 */
export async function runMigrations(options?: { skipLock?: boolean }): Promise<void> {
  const processId = `${process.pid}-${Date.now()}`;
  let lockAcquired = false;

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Acquire lock (unless skipped for testing)
    if (!options?.skipLock) {
      lockAcquired = await acquireLock(processId);
      if (!lockAcquired) {
        throw new Error(
          'Migration lock is already held by another process. Please wait for the current migration to complete or manually release the lock if it is stuck.'
        );
      }
    }

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
      processId,
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
  } finally {
    // Always release lock
    if (lockAcquired) {
      await releaseLock();
    }
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
