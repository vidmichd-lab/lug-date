/**
 * Test YDB connection
 * Usage: tsx scripts/test-ydb-connection.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { initYDBForMigrations, ydbClient } from '../backend/src/db/connection';
import { logger } from '../backend/src/logger';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function testConnection() {
  try {
    console.log('🔌 Testing YDB connection...\n');

    // Initialize connection
    console.log('1. Initializing YDB connection...');
    await initYDBForMigrations();

    console.log('2. Checking connection status...');
    const isConnected = ydbClient.getConnectionStatus();
    console.log(`   Status: ${isConnected ? '✅ Connected' : '❌ Not connected'}\n`);

    if (isConnected) {
      console.log('3. Testing simple query...');
      try {
        const result = await ydbClient.executeQuery('SELECT 1 as test');
        console.log(`   ✅ Query successful: ${JSON.stringify(result)}\n`);
      } catch (error) {
        console.error(
          `   ❌ Query failed: ${error instanceof Error ? error.message : String(error)}\n`
        );
      }
    }

    console.log('✅ Connection test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    logger.error({ error, type: 'ydb_connection_test_failed' });
    process.exit(1);
  }
}

testConnection();
