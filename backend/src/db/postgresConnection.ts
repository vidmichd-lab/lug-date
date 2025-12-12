/**
 * PostgreSQL Database Connection
 * Handles connection to PostgreSQL database using pg driver
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config';
import { logger } from '../logger';

class PostgreSQLClient {
  private pool: Pool | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

  /**
   * Initialize PostgreSQL connection
   */
  async connect(): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'postgresConnection.ts:18',
        message: 'connect() called',
        data: {
          isConnecting: this.isConnecting,
          isConnected: this.isConnected,
          hasPool: !!this.pool,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      logger.debug({ type: 'postgres_connection_already_in_progress' });
      return;
    }

    if (this.isConnected && this.pool) {
      logger.debug({ type: 'postgres_already_connected' });
      return;
    }

    this.isConnecting = true;
    try {
      if (!config.database.connectionString) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'postgresConnection.ts:32',
            message: 'Connection string missing',
            data: { hasConnectionString: !!config.database.connectionString },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
        // #endregion
        throw new Error('PostgreSQL connection string is required');
      }

      logger.info({
        type: 'postgres_connection_starting',
        connectionString: config.database.connectionString.replace(/:[^:@]+@/, ':****@'), // Hide password
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'postgresConnection.ts:40',
          message: 'Connection starting',
          data: {
            hasConnectionString: !!config.database.connectionString,
            connectionStringLength: config.database.connectionString.length,
            connectionStringPreview: config.database.connectionString.substring(0, 50),
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'E',
        }),
      }).catch(() => {});
      // #endregion

      // Parse connection string and configure SSL
      const connectionString = config.database.connectionString;
      // Remove sslmode from connection string if present (we'll configure it in code)
      const cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');

      // Create connection pool
      this.pool = new Pool({
        connectionString: cleanConnectionString,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
        ssl: {
          rejectUnauthorized: false, // Allow self-signed certificates for Yandex Cloud
        },
      });

      // Handle pool errors
      this.pool.on('error', (err) => {
        logger.error({
          error: err,
          type: 'postgres_pool_error',
          message: 'Unexpected error on idle client',
        });
      });

      // Test connection
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'postgresConnection.ts:67',
          message: 'Before pool.connect()',
          data: { hasPool: !!this.pool },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'E',
        }),
      }).catch(() => {});
      // #endregion
      const client = await this.pool.connect();
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'postgresConnection.ts:75',
            message: 'Client connected, testing query',
            data: { hasClient: !!client },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
        // #endregion
        const result = await client.query('SELECT NOW()');
        logger.info({
          type: 'postgres_connection_test',
          timestamp: result.rows[0].now,
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'postgresConnection.ts:85',
            message: 'Test query successful',
            data: { timestamp: result.rows[0].now },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
        // #endregion
      } finally {
        client.release();
      }

      this.isConnected = true;
      this.isConnecting = false;

      logger.info({
        type: 'postgres_connected',
        status: 'connected',
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'postgresConnection.ts:98',
          message: 'Connection established successfully',
          data: { isConnected: this.isConnected, hasPool: !!this.pool },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'E',
        }),
      }).catch(() => {});
      // #endregion
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      logger.error({
        error,
        type: 'postgres_connection_failed',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'postgresConnection.ts:105',
          message: 'Connection failed',
          data: {
            errorMessage: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
            hasPool: !!this.pool,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'E',
        }),
      }).catch(() => {});
      // #endregion
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      throw error;
    }
  }

  /**
   * Get connection pool
   */
  getPool(): Pool {
    if (!this.pool || !this.isConnected) {
      throw new Error('PostgreSQL not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Execute query
   */
  async executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    if (!this.isConnected || !this.pool) {
      if (this.isConnecting) {
        // Wait a bit if connection is in progress (max 10 seconds)
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (this.isConnected && this.pool) {
            break;
          }
        }
        if (!this.isConnected || !this.pool) {
          throw new Error(
            'Database connection timeout. Please check PostgreSQL configuration and connection.'
          );
        }
      } else {
        logger.warn({ type: 'postgres_not_connected_attempting_reconnect', query });
        try {
          await this.connect();
        } catch (error) {
          logger.error({
            type: 'postgres_reconnect_failed',
            query,
            error: error instanceof Error ? error.message : String(error),
          });
          throw new Error(
            'Database not connected. Please check PostgreSQL configuration and connection.'
          );
        }
      }
    }

    if (!this.pool || !this.isConnected) {
      throw new Error(
        'Database connection failed. Please check PostgreSQL configuration and connection.'
      );
    }

    logger.debug({
      type: 'postgres_query_start',
      query: query.substring(0, 200),
      hasParams: !!params,
    });

    try {
      const result: QueryResult = await this.pool.query(query, params);
      logger.debug({ type: 'postgres_query_success', rowsCount: result.rows.length });
      return result.rows as T[];
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        ...(error instanceof Error && 'code' in error ? { code: (error as any).code } : {}),
      };
      logger.error({
        error: errorDetails,
        type: 'postgres_query_failed',
        query: query.substring(0, 200),
      });
      throw error;
    }
  }

  /**
   * Execute transaction
   */
  async executeTransaction<T>(queries: Array<{ query: string; params?: any[] }>): Promise<T> {
    const pool = this.getPool();
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');
      logger.debug({
        type: 'postgres_transaction',
        queriesCount: queries.length,
      });

      const results: any[] = [];
      for (const { query, params } of queries) {
        const result = await client.query(query, params);
        results.push(result.rows);
      }

      await client.query('COMMIT');
      logger.debug({ type: 'postgres_transaction_committed' });
      return results as T;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({ error, type: 'postgres_transaction_failed' });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.isConnected = false;
    logger.info({ type: 'postgres_disconnected' });
  }
}

// Export singleton instance
export const postgresClient = new PostgreSQLClient();

/**
 * Initialize PostgreSQL connection on app start
 */
export async function initPostgreSQL(): Promise<void> {
  try {
    logger.info({ type: 'postgres_init_starting' });
    await postgresClient.connect();
    logger.info({ type: 'postgres_initialized', status: 'connected' });
  } catch (error) {
    logger.error({
      error,
      type: 'postgres_init_failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Don't throw - allow app to start without DB even in production
    // Health check endpoint will show DB status
    logger.warn({
      type: 'postgres_init_skipped',
      reason: 'connection_failed_but_continuing',
      environment: config.nodeEnv,
      message:
        'PostgreSQL connection failed, but server will continue. Health check will show DB status.',
    });
  }
}

/**
 * Initialize PostgreSQL connection for migrations
 * Always throws error if connection fails (migrations require DB)
 */
export async function initPostgreSQLForMigrations(): Promise<void> {
  await postgresClient.connect();
  logger.info({ type: 'postgres_initialized_for_migrations' });
}
