/**
 * YDB Database Connection
 * Handles connection to Yandex Database (YDB) using official SDK
 */

import { Driver, getCredentialsFromEnv, Logger } from 'ydb-sdk';
import { config } from '../config';
import { logger } from '../logger';

class YDBClient {
  private driver: Driver | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize YDB connection
   * 
   * YDB SDK 5.x uses getCredentialsFromEnv() which automatically handles:
   * - Token from YDB_TOKEN environment variable
   * - Service account key from YC_SERVICE_ACCOUNT_KEY_FILE or YC_SERVICE_ACCOUNT_KEY
   * - Metadata service (when running in Yandex Cloud)
   * 
   * See: https://github.com/ydb-platform/ydb-nodejs-sdk
   */
  async connect(): Promise<void> {
    try {
      if (!config.database.endpoint || !config.database.database) {
        throw new Error('YDB endpoint and database are required');
      }

      // Set YDB_TOKEN environment variable if token is provided in config
      // This allows getCredentialsFromEnv() to pick it up
      if (config.database.token && !process.env.YDB_TOKEN) {
        process.env.YDB_TOKEN = config.database.token;
      }

      // Ensure YC_SERVICE_ACCOUNT_KEY_FILE uses absolute path if relative
      if (process.env.YC_SERVICE_ACCOUNT_KEY_FILE && !process.env.YC_SERVICE_ACCOUNT_KEY_FILE.startsWith('/')) {
        const path = require('path');
        const absPath = path.resolve(process.cwd(), process.env.YC_SERVICE_ACCOUNT_KEY_FILE);
        process.env.YC_SERVICE_ACCOUNT_KEY_FILE = absPath;
        logger.debug({ type: 'ydb_service_account_path_resolved', path: absPath });
      }

      // Get credentials - YDB SDK automatically handles token, service account, or metadata
      let credentials;
      try {
        logger.debug({ 
          type: 'ydb_credentials_check',
          hasToken: !!process.env.YDB_TOKEN,
          hasServiceAccountFile: !!process.env.YC_SERVICE_ACCOUNT_KEY_FILE,
          hasServiceAccountKey: !!process.env.YC_SERVICE_ACCOUNT_KEY,
        });
        credentials = getCredentialsFromEnv();
        logger.info({ type: 'ydb_credentials_loaded' });
      } catch (error) {
        logger.error({ error, type: 'ydb_credentials_env_failed' });
        throw new Error('YDB credentials not found. Set YDB_TOKEN or configure service account.');
      }

      // Try both formats: connectionString (new) and endpoint/database (deprecated but may work better)
      // Some SDK versions may prefer one format over another
      const connectionString = `${config.database.endpoint}?database=${encodeURIComponent(config.database.database)}`;
      
      logger.debug({
        type: 'ydb_driver_config',
        endpoint: config.database.endpoint,
        database: config.database.database,
        connectionString: connectionString.replace(/\?database=.*/, '?database=***'),
      });

      // Create YDB driver configuration
      // Use only connectionString (new format) - SDK warns about endpoint/database
      const driverConfig: any = {
        connectionString,
        authService: credentials,
      };

      // Add logging if logger interface matches
      try {
        driverConfig.logger = {
          error: (message: string) => logger.error({ message, type: 'ydb_sdk_error' }),
          warn: (message: string) => logger.warn({ message, type: 'ydb_sdk_warn' }),
          info: (message: string) => logger.info({ message, type: 'ydb_sdk_info' }),
          debug: (message: string) => logger.debug({ message, type: 'ydb_sdk_debug' }),
        } as Logger;
      } catch (error) {
        // Logger may not be supported in this SDK version
        logger.debug({ error, type: 'ydb_logger_config_failed' });
      }

      logger.info({ type: 'ydb_driver_creating' });
      this.driver = new Driver(driverConfig);

      // Wait for driver to be ready with increased timeout
      const timeout = 30000; // 30 seconds (increased from 10)
      logger.info({ type: 'ydb_driver_waiting', timeout });
      
      const isReady = await this.driver.ready(timeout);
      if (!isReady) {
        logger.error({ type: 'ydb_driver_timeout', timeout });
        throw new Error(`YDB driver initialization timeout after ${timeout}ms. Check your network connection and credentials.`);
      }
      
      logger.info({ type: 'ydb_driver_ready' });

      this.isConnected = true;
      logger.info({
        type: 'ydb_connection',
        endpoint: config.database.endpoint,
        database: config.database.database,
        connectionString: connectionString.replace(/\?database=.*/, '?database=***'), // Hide database path in logs
        status: 'connected',
      });
    } catch (error) {
      logger.error({ error, type: 'ydb_connection_failed' });
      if (this.driver) {
        try {
          await this.driver.destroy();
        } catch (destroyError) {
          logger.warn({ error: destroyError, type: 'ydb_driver_destroy_failed' });
        }
        this.driver = null;
      }
      throw error;
    }
  }

  /**
   * Get YDB driver instance
   */
  getDriver(): Driver {
    if (!this.driver || !this.isConnected) {
      throw new Error('YDB not connected. Call connect() first.');
    }
    return this.driver;
  }

  /**
   * Execute query using YDB SDK 5.x
   * 
   * Uses withSessionRetry for automatic session management and retries
   */
  async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    const driver = this.getDriver();

      logger.debug({
        type: 'ydb_query',
        query,
        params,
      });

    // Use withSessionRetry for automatic session management
    return await driver.tableClient.withSessionRetry(async (session) => {
      // Execute query using YDB SDK 5.x API
      const result = await session.executeQuery(query, params || {});
      
      // Transform result to array of objects
      const rows: T[] = [];
      
      if (result.resultSets && result.resultSets.length > 0) {
        const resultSet = result.resultSets[0];
        
        // Convert YDB result set to array of objects
        if (resultSet.rows) {
          for (const row of resultSet.rows) {
            const obj: any = {};
            if (resultSet.columns) {
              resultSet.columns.forEach((col: any, index: number) => {
                // Extract value from YDB row structure
                const rowValue: any = row.items?.[index];
                // Extract the actual value from YDB value structure
                let value: any = rowValue;
                if (rowValue && typeof rowValue === 'object') {
                  // YDB values can be in different formats
                  if ('value' in rowValue) {
                    value = (rowValue as any).value;
                  } else if ('bytesValue' in rowValue) {
                    value = rowValue.bytesValue;
                  } else if ('textValue' in rowValue) {
                    value = rowValue.textValue;
                  } else if ('uint64Value' in rowValue) {
                    value = rowValue.uint64Value;
                  } else if ('int64Value' in rowValue) {
                    value = rowValue.int64Value;
                  } else if ('boolValue' in rowValue) {
                    value = rowValue.boolValue;
                  } else if ('timestampValue' in rowValue) {
                    value = rowValue.timestampValue;
                  }
                }
                // Use column name if available, otherwise use index
                const columnName = col?.name || `column_${index}`;
                obj[columnName] = value;
              });
            }
            rows.push(obj as T);
          }
        }
      }

      return rows;
    });
  }

  /**
   * Execute transaction using YDB SDK 5.x
   * 
   * Uses withSessionRetry for automatic session management
   */
  async executeTransaction<T>(
    queries: Array<{ query: string; params?: Record<string, any> }>
  ): Promise<T> {
    const driver = this.getDriver();

      logger.debug({
        type: 'ydb_transaction',
        queriesCount: queries.length,
      });

    // Use withSessionRetry for automatic session management
    return await driver.tableClient.withSessionRetry(async (session) => {
      // Execute transaction using YDB SDK 5.x API
      // Note: Transaction API may vary - using executeTransaction if available
      // Otherwise, we'll use a simpler approach with individual queries
      try {
        // Try to use executeTransaction if available
        if (typeof (session as any).executeTransaction === 'function') {
          const result = await (session as any).executeTransaction(async (tx: any) => {
        const results: any[] = [];
        for (const { query, params } of queries) {
          const queryResult = await tx.executeQuery(query, params || {});
          results.push(queryResult);
        }
        return results;
      });
      return result as T;
        } else {
          // Fallback: execute queries sequentially
          const results: any[] = [];
          for (const { query, params } of queries) {
            const queryResult = await session.executeQuery(query, params || {});
            results.push(queryResult);
          }
          return results as T;
        }
    } catch (error) {
      logger.error({ error, type: 'ydb_transaction_failed' });
      throw error;
      }
    });
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.driver !== null;
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.destroy();
      this.driver = null;
    }
    this.isConnected = false;
    logger.info({ type: 'ydb_disconnected' });
  }
}

// Export singleton instance
export const ydbClient = new YDBClient();

/**
 * Initialize YDB connection on app start
 * In development, allows app to start without DB (doesn't throw)
 */
export async function initYDB(): Promise<void> {
  try {
    await ydbClient.connect();
    logger.info({ type: 'ydb_initialized' });
  } catch (error) {
    logger.error({ error, type: 'ydb_init_failed' });
    // Don't throw - allow app to start without DB in development
    if (config.nodeEnv === 'production') {
      throw error;
    }
  }
}

/**
 * Initialize YDB connection for migrations
 * Always throws error if connection fails (migrations require DB)
 */
export async function initYDBForMigrations(): Promise<void> {
  await ydbClient.connect();
  logger.info({ type: 'ydb_initialized_for_migrations' });
}

