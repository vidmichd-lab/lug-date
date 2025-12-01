/**
 * Check migration status
 * Usage: npm run migrate:status
 */

import { initYDB } from '../connection';
import { getMigrationStatus } from './index';
import { logger } from '../../logger';

async function main() {
  try {
    console.log('🔄 Initializing YDB connection...');
    await initYDB();

    console.log('📊 Checking migration status...');
    const status = await getMigrationStatus();

    console.log('\n📋 Migration Status:');
    console.log(`✅ Executed: ${status.executed.length}`);
    if (status.executed.length > 0) {
      status.executed.forEach((id) => console.log(`   - ${id}`));
    }

    console.log(`⏳ Pending: ${status.pending.length}`);
    if (status.pending.length > 0) {
      status.pending.forEach((id) => console.log(`   - ${id}`));
    } else {
      console.log('   All migrations are up to date!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to check migration status:', error);
    logger.error({ error, type: 'migration_status_check_failed' });
    process.exit(1);
  }
}

main();

