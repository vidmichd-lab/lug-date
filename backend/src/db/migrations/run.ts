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
    // Log full error details
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      ...(error instanceof Error && 'code' in error ? { code: (error as any).code } : {}),
    };

    logger.error({
      error: errorDetails,
      type: 'migration_script_failed',
      message: 'Migration failed',
    });

    // Also output to console for better visibility
    console.error('\n❌ Migration failed:');
    console.error(`   ${errorDetails.message}`);
    if (errorDetails.stack) {
      console.error('\nStack trace:');
      console.error(errorDetails.stack);
    }

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        logger.error({
          type: 'migration_credentials_error',
          message: 'YDB credentials not configured',
          tip: 'Make sure you have set one of: YDB_TOKEN_DEV, YC_SERVICE_ACCOUNT_KEY_FILE, or YC_SERVICE_ACCOUNT_KEY in .env',
        });
        console.error('\n💡 Tip: Check your YDB credentials configuration.');
      } else if (error.message.includes('lock')) {
        console.error('\n❌ Migration lock is already held by another process.');
        console.error('   Please wait for the current migration to complete.');
        console.error(
          '   If migrations are stuck, you can manually release the lock in the database.\n'
        );
      } else if (error.message.includes('timeout')) {
        console.error('\n⏱️  Query timeout - YDB connection may be slow or unavailable.');
        console.error('   Check your network connection and YDB endpoint.\n');
      }
    }

    process.exit(1);
  }
}

main();
