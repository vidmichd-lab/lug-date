/**
 * Run PostgreSQL migrations
 * Usage: tsx src/db/migrations/run-postgres.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { initPostgreSQLForMigrations, postgresClient } from '../postgresConnection';
import { runMigrations } from '../postgresMigrations';
import { logger } from '../../logger';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function main() {
  try {
    console.log('🔄 Starting PostgreSQL migrations...\n');

    // Initialize connection
    console.log('1. Connecting to PostgreSQL...');
    await initPostgreSQLForMigrations();
    console.log('   ✅ Connected\n');

    // Run migrations
    console.log('2. Running migrations...');
    await runMigrations();
    console.log('   ✅ Migrations completed\n');

    // Check status
    const { getMigrationStatus } = await import('../postgresMigrations');
    const status = await getMigrationStatus();
    console.log('📊 Migration Status:');
    console.log(`   Executed: ${status.executed.length}`);
    console.log(`   Pending: ${status.pending.length}\n`);

    if (status.pending.length > 0) {
      console.log('⚠️  Pending migrations:');
      status.pending.forEach((id) => console.log(`   - ${id}`));
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    logger.error({ error, type: 'postgres_migration_failed' });
    process.exit(1);
  } finally {
    await postgresClient.disconnect();
  }
}

main();
