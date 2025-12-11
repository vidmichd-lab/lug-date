/**
 * Run database migrations
 * Usage: npm run migrate
 */

import { initYDBForMigrations, ydbClient } from '../connection';
import { runMigrations } from './index';
import { logger } from '../../logger';

async function main() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'run.ts:11',
      message: 'Migration script started',
      data: {
        pid: process.pid,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
        hasYdbEndpoint: !!process.env.YDB_ENDPOINT,
        hasYdbDatabase: !!process.env.YDB_DATABASE,
        hasServiceAccountKey: !!process.env.YC_SERVICE_ACCOUNT_KEY,
        hasServiceAccountKeyFile: !!process.env.YC_SERVICE_ACCOUNT_KEY_FILE,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  console.log('[DEBUG] Migration script started', {
    pid: process.pid,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    hasYdbEndpoint: !!process.env.YDB_ENDPOINT,
    hasYdbDatabase: !!process.env.YDB_DATABASE,
    hasServiceAccountKey: !!process.env.YC_SERVICE_ACCOUNT_KEY,
    hasServiceAccountKeyFile: !!process.env.YC_SERVICE_ACCOUNT_KEY_FILE,
  });
  // #endregion
  try {
    logger.info({ type: 'migration_start', message: 'Initializing YDB connection...' });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:13',
        message: 'Before initYDBForMigrations',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    console.log('[DEBUG] Before initYDBForMigrations');
    // #endregion
    await initYDBForMigrations();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:16',
        message: 'After initYDBForMigrations',
        data: { connectionStatus: ydbClient.getConnectionStatus() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    console.log('[DEBUG] After initYDBForMigrations', {
      connectionStatus: ydbClient.getConnectionStatus(),
    });
    // #endregion

    // Verify connection is actually established
    if (!ydbClient.getConnectionStatus()) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'run.ts:19',
          message: 'Connection status check failed',
          data: { connectionStatus: ydbClient.getConnectionStatus() },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        }),
      }).catch(() => {});
      console.error('[DEBUG] Connection status check failed', {
        connectionStatus: ydbClient.getConnectionStatus(),
      });
      // #endregion
      throw new Error('YDB connection failed. Check your credentials and network connection.');
    }

    logger.info({ type: 'migration_ydb_connected', message: 'YDB connected successfully' });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:24',
        message: 'Before runMigrations',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    console.log('[DEBUG] Before runMigrations');
    // #endregion

    logger.info({ type: 'migration_running', message: 'Running migrations...' });
    await runMigrations();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:27',
        message: 'After runMigrations',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    console.log('[DEBUG] After runMigrations');
    // #endregion

    logger.info({ type: 'migration_completed', message: 'Migrations completed successfully' });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:30',
        message: 'Migration completed successfully',
        data: { exitCode: 0 },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion
    process.exit(0);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'run.ts:28',
        message: 'Migration error caught',
        data: {
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : undefined,
          errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
          hasStack: !!(error instanceof Error && error.stack),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'F',
      }),
    }).catch(() => {});
    console.error('[DEBUG] Migration error caught', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : undefined,
      errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      hasStack: !!(error instanceof Error && error.stack),
    });
    // #endregion
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
