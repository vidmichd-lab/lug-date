/**
 * Run database migrations
 * Usage: npm run migrate
 */

import { initYDB } from '../connection';
import { runMigrations } from './index';
import { logger } from '../../logger';

async function main() {
  try {
    console.log('🔄 Initializing YDB connection...');
    await initYDB();

    console.log('🔄 Running migrations...');
    await runMigrations();

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    logger.error({ error, type: 'migration_script_failed' });
    process.exit(1);
  }
}

main();

