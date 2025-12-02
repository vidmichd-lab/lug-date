/**
 * YDB Database Connection
 * Handles connection to Yandex Database (YDB) using official SDK
 */

import { Driver, getCredentialsFromEnv, getSACredentialsFromJson, Logger } from 'ydb-sdk';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { config } from '../config';
import { logger } from '../logger';

class YDBClient {
  private driver: Driver | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

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
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      logger.debug({ type: 'ydb_connection_already_in_progress' });
      return;
    }
    
    if (this.isConnected && this.driver) {
      logger.debug({ type: 'ydb_already_connected' });
      return;
    }
    
    this.isConnecting = true;
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
      // Priority: YC_SERVICE_ACCOUNT_KEY_FILE > YC_SERVICE_ACCOUNT_KEY > YDB_TOKEN
      let serviceAccountKeyFile: string | undefined;
      
      if (process.env.YC_SERVICE_ACCOUNT_KEY_FILE) {
        serviceAccountKeyFile = process.env.YC_SERVICE_ACCOUNT_KEY_FILE.startsWith('/')
          ? process.env.YC_SERVICE_ACCOUNT_KEY_FILE
          : resolve(process.cwd(), process.env.YC_SERVICE_ACCOUNT_KEY_FILE);
        process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
        logger.debug({ type: 'ydb_service_account_path_resolved', path: serviceAccountKeyFile });
      } else if (process.env.YC_SERVICE_ACCOUNT_KEY) {
        // If YC_SERVICE_ACCOUNT_KEY is set as JSON string, write it to temp file
        logger.debug({ type: 'ydb_using_service_account_key_env' });
      }

      // Get credentials - YDB SDK automatically handles token, service account, or metadata
      // Priority: YC_SERVICE_ACCOUNT_KEY_FILE > YC_SERVICE_ACCOUNT_KEY > YDB_TOKEN > metadata service
      let credentials;
      try {
        logger.debug({ 
          type: 'ydb_credentials_check',
          hasToken: !!process.env.YDB_TOKEN,
          hasServiceAccountFile: !!process.env.YC_SERVICE_ACCOUNT_KEY_FILE,
          hasServiceAccountKey: !!process.env.YC_SERVICE_ACCOUNT_KEY,
          serviceAccountKeyFile: serviceAccountKeyFile || 'not set',
        });
        
        // Ensure service account key file is accessible
        if (serviceAccountKeyFile) {
          if (!existsSync(serviceAccountKeyFile)) {
            throw new Error(`Service account key file not found: ${serviceAccountKeyFile}`);
          }
          // Explicitly set the environment variable to absolute path
          process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
          logger.debug({ type: 'ydb_service_account_file_set', path: serviceAccountKeyFile });
        }
        
        // Use service account key file directly if available
        // getSACredentialsFromJson expects a file path, not JSON object
        if (serviceAccountKeyFile) {
          try {
            credentials = getSACredentialsFromJson(serviceAccountKeyFile);
            logger.info({ type: 'ydb_credentials_loaded', method: 'service_account_file_direct', path: serviceAccountKeyFile });
          } catch (error) {
            logger.warn({ 
              error, 
              type: 'ydb_sa_file_direct_failed',
              message: error instanceof Error ? error.message : String(error),
              path: serviceAccountKeyFile
            });
            // Fallback: try to use getCredentialsFromEnv but disable metadata first
            const originalMetadataUrl = process.env.METADATA_URL;
            delete process.env.METADATA_URL;
            try {
              credentials = getCredentialsFromEnv();
              logger.info({ type: 'ydb_credentials_loaded', method: 'service_account_file_fallback' });
            } finally {
              if (originalMetadataUrl) {
                process.env.METADATA_URL = originalMetadataUrl;
              }
            }
          }
        } else {
          // Use getCredentialsFromEnv as fallback
          credentials = getCredentialsFromEnv();
          logger.info({ type: 'ydb_credentials_loaded', method: 'env_fallback' });
        }
      } catch (error) {
        logger.error({ 
          error, 
          type: 'ydb_credentials_env_failed',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`YDB credentials not found. Set YDB_TOKEN or configure service account. Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Build connection string
      // Format: grpcs://endpoint:port?database=/path/to/database
      let connectionString: string;
      if (config.database.endpoint.includes('?database=')) {
        // Endpoint already contains database path
        connectionString = config.database.endpoint;
      } else {
        // Build connection string from endpoint and database
        // Ensure database path starts with /
        const dbPath = config.database.database.startsWith('/') 
          ? config.database.database 
          : `/${config.database.database}`;
        connectionString = `${config.database.endpoint}?database=${encodeURIComponent(dbPath)}`;
      }
      
      logger.info({
        type: 'ydb_driver_config',
        endpoint: config.database.endpoint,
        database: config.database.database,
        connectionString: connectionString.replace(/\?database=.*/, '?database=***'),
        hasCredentials: !!credentials,
      });

      // Create YDB driver configuration
      // Use connectionString format
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
      const timeout = 60000; // 60 seconds (increased for better reliability)
      logger.info({ type: 'ydb_driver_waiting', timeout, connectionString: connectionString.replace(/\?database=.*/, '?database=***') });
      
      try {
        const isReady = await this.driver.ready(timeout);
        if (!isReady) {
          logger.error({ type: 'ydb_driver_timeout', timeout });
          throw new Error(`YDB driver initialization timeout after ${timeout}ms. Check your network connection and credentials.`);
        }
      } catch (error) {
        logger.error({ 
          error, 
          type: 'ydb_driver_ready_failed',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timeout
        });
        throw error;
      }
      
      logger.info({ type: 'ydb_driver_ready' });

      this.isConnected = true;
      this.isConnecting = false;
      logger.info({
        type: 'ydb_connection',
        endpoint: config.database.endpoint,
        database: config.database.database,
        connectionString: connectionString.replace(/\?database=.*/, '?database=***'), // Hide database path in logs
        status: 'connected',
      });
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      logger.error({ 
        error, 
        type: 'ydb_connection_failed',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
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
    // Try to connect if not connected
    if (!this.isConnected || !this.driver) {
      if (this.isConnecting) {
        // Wait a bit if connection is in progress (max 10 seconds)
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (this.isConnected && this.driver) {
            break;
          }
        }
        if (!this.isConnected || !this.driver) {
          throw new Error('Database connection timeout. Please check YDB configuration and connection.');
        }
      } else {
        logger.warn({ type: 'ydb_not_connected_attempting_reconnect', query });
        try {
          await this.connect();
        } catch (error) {
          logger.error({ 
            type: 'ydb_reconnect_failed', 
            query,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          throw new Error('Database not connected. Please check YDB configuration and connection.');
        }
      }
    }
    
    // Now we should be connected, get driver
    if (!this.driver || !this.isConnected) {
      throw new Error('Database connection failed. Please check YDB configuration and connection.');
    }
    
    const driver = this.driver;

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
    logger.info({ type: 'ydb_init_starting' });
    await ydbClient.connect();
    logger.info({ type: 'ydb_initialized', status: 'connected' });
  } catch (error) {
    logger.error({ 
      error, 
      type: 'ydb_init_failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // Don't throw - allow app to start without DB in development
    if (config.nodeEnv === 'production') {
      throw error;
    }
    logger.warn({ type: 'ydb_init_skipped', reason: 'development_mode_allows_start_without_db' });
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

