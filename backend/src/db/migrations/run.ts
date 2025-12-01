/**
 * Run database migrations
 * Usage: npm run migrate
 */

import { initYDBForMigrations, ydbClient } from '../connection';
import { runMigrations } from './index';
import { logger } from '../../logger';

async function main() {
  try {
    console.log('🔄 Initializing YDB connection...');
    await initYDBForMigrations();

    // Verify connection is actually established
    if (!ydbClient.getConnectionStatus()) {
      throw new Error('YDB connection failed. Check your credentials and network connection.');
    }

    console.log('✅ YDB connected successfully');

    console.log('🔄 Running migrations...');
    await runMigrations();

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    logger.error({ error, type: 'migration_script_failed' });
    
    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        console.error('\n💡 Tip: Make sure you have set one of:');
        console.error('   - YDB_TOKEN_DEV in .env');
        console.error('   - YC_SERVICE_ACCOUNT_KEY_FILE in .env (pointing to yc-service-account-key.json)');
        console.error('   - YC_SERVICE_ACCOUNT_KEY in .env');
      }
    }
    
    process.exit(1);
  }
}

main();

