/**
 * Test PostgreSQL connection
 * Usage: tsx scripts/test-postgres-connection.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { initPostgreSQLForMigrations, postgresClient } from '../backend/src/db/postgresConnection';
import { logger } from '../backend/src/logger';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function testConnection() {
  try {
    console.log('🔌 Testing PostgreSQL connection...\n');

    // Initialize connection
    console.log('1. Initializing PostgreSQL connection...');
    await initPostgreSQLForMigrations();

    console.log('2. Checking connection status...');
    const isConnected = postgresClient.getConnectionStatus();
    console.log(`   Status: ${isConnected ? '✅ Connected' : '❌ Not connected'}\n`);

    if (isConnected) {
      console.log('3. Testing simple query...');
      try {
        const result = await postgresClient.executeQuery(
          'SELECT NOW() as now, version() as version'
        );
        console.log(`   ✅ Query successful:`);
        console.log(`      Current time: ${result[0]?.now}`);
        console.log(`      PostgreSQL version: ${result[0]?.version?.substring(0, 50)}...\n`);
      } catch (error) {
        console.error(
          `   ❌ Query failed: ${error instanceof Error ? error.message : String(error)}\n`
        );
      }

      console.log('4. Checking tables...');
      try {
        const tablesResult = await postgresClient.executeQuery<{ table_name: string }>(
          `SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           ORDER BY table_name`
        );
        console.log(`   ✅ Found ${tablesResult.length} tables:`);
        tablesResult.forEach((row) => {
          console.log(`      - ${row.table_name}`);
        });
        console.log('');
      } catch (error) {
        console.error(
          `   ❌ Tables check failed: ${error instanceof Error ? error.message : String(error)}\n`
        );
      }
    }

    console.log('✅ Connection test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    logger.error({ error, type: 'postgres_connection_test_failed' });
    process.exit(1);
  } finally {
    await postgresClient.disconnect();
  }
}

testConnection();
