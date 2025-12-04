/**
 * Run database migrations
 * Usage: npm run migrate
 */

import { initYDBForMigrations, ydbClient } from '../connection';
import { runMigrations } from './index';
import { logger } from '../../logger';

async function main() {
  try {
    logger.info({ type: 'migration_start', message: 'Initializing YDB connection...' });
    await initYDBForMigrations();

    // Verify connection is actually established
    if (!ydbClient.getConnectionStatus()) {
      throw new Error('YDB connection failed. Check your credentials and network connection.');
    }

    logger.info({ type: 'migration_ydb_connected', message: 'YDB connected successfully' });

    logger.info({ type: 'migration_running', message: 'Running migrations...' });
    await runMigrations();

    logger.info({ type: 'migration_completed', message: 'Migrations completed successfully' });
    process.exit(0);
  } catch (error) {
    logger.error({ error, type: 'migration_script_failed', message: 'Migration failed' });

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        logger.error({
          type: 'migration_credentials_error',
          message: 'YDB credentials not configured',
          tip: 'Make sure you have set one of: YDB_TOKEN_DEV, YC_SERVICE_ACCOUNT_KEY_FILE, or YC_SERVICE_ACCOUNT_KEY in .env',
        });
      } else if (error.message.includes('lock')) {
        console.error('\n❌ Migration lock is already held by another process.');
        console.error('   Please wait for the current migration to complete.');
        console.error(
          '   If migrations are stuck, you can manually release the lock in the database.\n'
        );
      }
    }

    process.exit(1);
  }
}

main();
