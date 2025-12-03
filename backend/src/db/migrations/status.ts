/**
 * Check migration status
 * Usage: npm run migrate:status
 */

import { initYDBForMigrations } from '../connection';
import { getMigrationStatus } from './index';
import { logger } from '../../logger';

async function main() {
  try {
    logger.info({ type: 'migration_status_start', message: 'Initializing YDB connection...' });
    await initYDBForMigrations();

    logger.info({ type: 'migration_status_checking', message: 'Checking migration status...' });
    const status = await getMigrationStatus();

    logger.info({
      type: 'migration_status_result',
      executed: status.executed.length,
      pending: status.pending.length,
      executedIds: status.executed,
      pendingIds: status.pending,
      message:
        status.pending.length === 0
          ? 'All migrations are up to date!'
          : 'Some migrations are pending',
    });

    // Also output to console for CLI usage (structured logging above is for production)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('\n📋 Migration Status:');
      // eslint-disable-next-line no-console
      console.log(`✅ Executed: ${status.executed.length}`);
      if (status.executed.length > 0) {
        status.executed.forEach((id) => {
          // eslint-disable-next-line no-console
          console.log(`   - ${id}`);
        });
      }
      // eslint-disable-next-line no-console
      console.log(`⏳ Pending: ${status.pending.length}`);
      if (status.pending.length > 0) {
        status.pending.forEach((id) => {
          // eslint-disable-next-line no-console
          console.log(`   - ${id}`);
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('   All migrations are up to date!');
      }
    }

    process.exit(0);
  } catch (error) {
    logger.error({
      error,
      type: 'migration_status_check_failed',
      message: 'Failed to check migration status',
    });
    process.exit(1);
  }
}

main();
