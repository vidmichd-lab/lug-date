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
  // First, try to check if table exists by querying it
  // If query times out, assume table might exist and try to create (will fail gracefully if exists)
  let tableExists = false;
  try {
    await ydbClient.executeQuery<{ id: string }>('SELECT id FROM migrations LIMIT 1');
    logger.debug({ type: 'migrations_table_exists', message: 'Migrations table already exists' });
    tableExists = true;
  } catch (error: any) {
    // If timeout, table might exist but connection is slow - try to create anyway
    if (error?.message?.includes('timeout')) {
      logger.warn({
        type: 'migrations_table_check_timeout',
        message: 'Table check timed out, will try to create (will fail gracefully if exists)',
      });
    } else {
      // Table doesn't exist, need to create it
      logger.debug({
        type: 'migrations_table_check',
        message: 'Table does not exist, creating...',
      });
    }
  }

  if (tableExists) {
    return;
  }

  const createTableQuery = `CREATE TABLE migrations (
  id String NOT NULL,
  name String NOT NULL,
  executed_at Timestamp NOT NULL,
  PRIMARY KEY (id)
);`;

  try {
    await ydbClient.executeQuery(createTableQuery);
    logger.info({ type: 'migrations_table_created' });
  } catch (error: any) {
    // Table might have been created by another process or manually
    if (
      error?.message?.includes('already exists') ||
      error?.message?.includes('ALREADY_EXISTS') ||
      error?.message?.includes('StatusGenericAlreadyExists')
    ) {
      logger.debug({ type: 'migrations_table_exists', message: 'Migrations table already exists' });
      return;
    }
    // If timeout, assume table might exist (created manually via console)
    if (error?.message?.includes('timeout')) {
      logger.warn({
        type: 'migrations_table_creation_timeout',
        message:
          'Table creation timed out. If table was created manually via console, migrations should work.',
      });
      // Don't throw - assume table exists if created manually
      return;
    }
    // Re-throw other errors
    logger.error({
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        name: error?.name,
      },
      type: 'migrations_table_creation_failed',
    });
    throw error;
  }
}

/**
 * Create migration lock table if it doesn't exist
 */
async function ensureLockTable(): Promise<void> {
  const createTableQuery = `CREATE TABLE migration_lock (
  id String NOT NULL,
  locked_at Timestamp NOT NULL,
  locked_by String NOT NULL,
  PRIMARY KEY (id)
);`;

  try {
    await ydbClient.executeQuery(createTableQuery);
    logger.debug({ type: 'migration_lock_table_created' });
  } catch (error: any) {
    // Table might already exist, which is fine
    if (
      error?.message?.includes('already exists') ||
      error?.message?.includes('ALREADY_EXISTS') ||
      error?.message?.includes('StatusGenericAlreadyExists')
    ) {
      logger.debug({ type: 'migration_lock_table_exists', message: 'Lock table already exists' });
      return;
    }
    // If timeout, assume table might exist (created manually via console)
    if (error?.message?.includes('timeout')) {
      logger.warn({
        type: 'migration_lock_table_creation_timeout',
        message:
          'Lock table creation timed out. If table was created manually via console, migrations should work.',
      });
      // Don't throw - assume table exists if created manually
      return;
    }
    // Re-throw other errors
    logger.error({
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        name: error?.name,
      },
      type: 'migration_lock_table_creation_failed',
    });
    throw error;
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'index.ts:302',
      message: 'runMigrations started',
      data: { processId, skipLock: options?.skipLock },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'K',
    }),
  }).catch(() => {});
  console.log('[DEBUG] runMigrations started', { processId, skipLock: options?.skipLock });
  // #endregion

  try {
    // Ensure migrations table exists
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:308',
        message: 'Before ensureMigrationsTable',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'K',
      }),
    }).catch(() => {});
    console.log('[DEBUG] Before ensureMigrationsTable');
    // #endregion
    await ensureMigrationsTable();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:310',
        message: 'After ensureMigrationsTable',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'K',
      }),
    }).catch(() => {});
    console.log('[DEBUG] After ensureMigrationsTable');
    // #endregion

    // Acquire lock (unless skipped for testing)
    if (!options?.skipLock) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'index.ts:313',
          message: 'Before acquireLock',
          data: { processId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'K',
        }),
      }).catch(() => {});
      console.log('[DEBUG] Before acquireLock', { processId });
      // #endregion
      lockAcquired = await acquireLock(processId);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'index.ts:315',
          message: 'After acquireLock',
          data: { lockAcquired },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'K',
        }),
      }).catch(() => {});
      console.log('[DEBUG] After acquireLock', { lockAcquired });
      // #endregion
      if (!lockAcquired) {
        throw new Error(
          'Migration lock is already held by another process. Please wait for the current migration to complete or manually release the lock if it is stuck.'
        );
      }
    }

    // Get executed migrations
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:323',
        message: 'Before getExecutedMigrations',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'L',
      }),
    }).catch(() => {});
    console.log('[DEBUG] Before getExecutedMigrations');
    // #endregion
    const executed = await getExecutedMigrations();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:325',
        message: 'After getExecutedMigrations',
        data: { executedCount: executed.length, executedIds: executed },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'L',
      }),
    }).catch(() => {});
    console.log('[DEBUG] After getExecutedMigrations', {
      executedCount: executed.length,
      executedIds: executed,
    });
    // #endregion

    // Filter pending migrations
    const pending = migrations.filter((m) => !executed.includes(m.id));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:328',
        message: 'Pending migrations calculated',
        data: { pendingCount: pending.length, pendingIds: pending.map((m) => m.id) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'L',
      }),
    }).catch(() => {});
    console.log('[DEBUG] Pending migrations calculated', {
      pendingCount: pending.length,
      pendingIds: pending.map((m) => m.id),
    });
    // #endregion

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:343',
            message: 'Before migration.up()',
            data: { migrationId: migration.id, migrationName: migration.name },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'M',
          }),
        }).catch(() => {});
        console.log('[DEBUG] Before migration.up()', {
          migrationId: migration.id,
          migrationName: migration.name,
        });
        // #endregion
        logger.info({
          type: 'migration_executing',
          id: migration.id,
          name: migration.name,
        });

        await migration.up();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:350',
            message: 'After migration.up(), before markMigrationExecuted',
            data: { migrationId: migration.id },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'M',
          }),
        }).catch(() => {});
        console.log('[DEBUG] After migration.up(), before markMigrationExecuted', {
          migrationId: migration.id,
        });
        // #endregion
        await markMigrationExecuted(migration.id, migration.name);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:352',
            message: 'After markMigrationExecuted',
            data: { migrationId: migration.id },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'M',
          }),
        }).catch(() => {});
        console.log('[DEBUG] After markMigrationExecuted', { migrationId: migration.id });
        // #endregion

        logger.info({
          type: 'migration_success',
          id: migration.id,
        });
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:360',
            message: 'Migration execution error',
            data: {
              migrationId: migration.id,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'M',
          }),
        }).catch(() => {});
        console.error('[DEBUG] Migration execution error', {
          migrationId: migration.id,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        // #endregion
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
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      ...(error instanceof Error && 'code' in error ? { code: (error as any).code } : {}),
    };
    logger.error({
      error: errorDetails,
      type: 'migrations_error',
      message: 'Migration execution failed',
    });
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
