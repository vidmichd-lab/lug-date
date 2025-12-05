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
        const envPath = process.env.YC_SERVICE_ACCOUNT_KEY_FILE;

        // Try multiple resolution strategies for relative paths
        const possiblePaths = envPath.startsWith('/')
          ? [envPath] // Absolute path - use as is
          : [
              resolve(process.cwd(), envPath), // Current working directory
              resolve(process.cwd(), '..', envPath), // One level up (if running from backend/)
              resolve(process.cwd(), '../yc-service-account-key.json'), // Direct parent lookup
              resolve(process.cwd(), 'yc-service-account-key.json'), // Current dir with standard name
            ];

        // Find first existing file
        for (const path of possiblePaths) {
          if (existsSync(path)) {
            serviceAccountKeyFile = path;
            process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
            logger.debug({
              type: 'ydb_service_account_path_resolved',
              path: serviceAccountKeyFile,
              originalPath: envPath,
            });
            break;
          }
        }

        // If file from env not found, try auto-discovery
        if (!serviceAccountKeyFile) {
          logger.warn({
            type: 'ydb_service_account_file_not_found',
            path: envPath,
            searchedPaths: possiblePaths,
            message: 'Service account key file from env not found, trying auto-discovery',
          });
        }
      }

      // Auto-discovery: Try to find service account key in common locations
      if (!serviceAccountKeyFile) {
        const possiblePaths = [
          resolve(process.cwd(), 'yc-service-account-key.json'), // Current directory
          resolve(process.cwd(), '..', 'yc-service-account-key.json'), // One level up (if running from backend/)
          resolve(process.cwd(), '../yc-service-account-key.json'), // One level up (alternative)
        ];

        for (const path of possiblePaths) {
          if (existsSync(path)) {
            serviceAccountKeyFile = path;
            process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
            logger.info({
              type: 'ydb_service_account_auto_found',
              path: serviceAccountKeyFile,
              searchedPaths: possiblePaths,
            });
            break;
          }
        }
      }

      if (process.env.YC_SERVICE_ACCOUNT_KEY_B64 || process.env.YC_SERVICE_ACCOUNT_KEY) {
        // If YC_SERVICE_ACCOUNT_KEY_B64 is set (base64 encoded), decode it first
        // This is used when deploying via GitHub Actions to avoid issues with multiline JSON
        if (process.env.YC_SERVICE_ACCOUNT_KEY_B64) {
          try {
            const decodedKey = Buffer.from(
              process.env.YC_SERVICE_ACCOUNT_KEY_B64,
              'base64'
            ).toString('utf-8');
            process.env.YC_SERVICE_ACCOUNT_KEY = decodedKey;
            logger.debug({ type: 'ydb_service_account_key_decoded_from_base64' });
          } catch (error) {
            logger.error({
              error,
              type: 'ydb_service_account_key_decode_failed',
              message: 'Failed to decode YC_SERVICE_ACCOUNT_KEY_B64',
            });
            throw new Error('Failed to decode YC_SERVICE_ACCOUNT_KEY_B64');
          }
        }
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
          hasServiceAccountKeyB64: !!process.env.YC_SERVICE_ACCOUNT_KEY_B64,
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

        // Use getCredentialsFromEnv() which automatically handles:
        // - YC_SERVICE_ACCOUNT_KEY_FILE (file path)
        // - YC_SERVICE_ACCOUNT_KEY (JSON string)
        // - YDB_TOKEN
        // - Metadata service (when running in Yandex Cloud)
        // This is the recommended approach for YDB SDK 5.x

        // Если есть файл Service Account, используем его напрямую
        // и отключаем metadata service для GitHub Actions
        if (serviceAccountKeyFile && existsSync(serviceAccountKeyFile)) {
          // Устанавливаем переменную окружения для getCredentialsFromEnv()
          process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
          
          // Отключаем metadata service, чтобы SDK не пытался его использовать
          // Это важно для GitHub Actions, где metadata service недоступен
          delete process.env.METADATA_URL;
          delete process.env.GCE_METADATA_HOST;
          
          logger.info({
            type: 'ydb_service_account_file_set',
            path: serviceAccountKeyFile,
          });
        }

        // Используем getCredentialsFromEnv() - он должен использовать файл,
        // если YC_SERVICE_ACCOUNT_KEY_FILE установлен
        try {
          credentials = getCredentialsFromEnv();
        } catch (error) {
          // Если getCredentialsFromEnv() все еще пытается использовать metadata service,
          // используем getSACredentialsFromJson напрямую как fallback
          if (serviceAccountKeyFile && existsSync(serviceAccountKeyFile)) {
            logger.warn({
              error,
              type: 'ydb_getcredentials_failed',
              message: 'getCredentialsFromEnv failed, trying getSACredentialsFromJson',
            });
            // Используем getSACredentialsFromJson напрямую
            const saCredentials = getSACredentialsFromJson(serviceAccountKeyFile);
            // Обертываем в объект с нужными методами
            credentials = {
              getAuthMetadata: async () => {
                const creds = await saCredentials.getAuthMetadata();
                return creds;
              },
            } as any;
            logger.info({
              type: 'ydb_credentials_loaded',
              method: 'getSACredentialsFromJson_fallback',
              hasServiceAccountFile: true,
              path: serviceAccountKeyFile,
            });
          } else {
            throw error;
          }
        }
        logger.info({
          type: 'ydb_credentials_loaded',
          method: 'getCredentialsFromEnv',
          hasServiceAccountFile: !!serviceAccountKeyFile,
        });
      } catch (error) {
        logger.error({
          error,
          type: 'ydb_credentials_env_failed',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new Error(
          `YDB credentials not found. Set YDB_TOKEN or configure service account. Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Build connection string
      // Format: grpcs://endpoint:port?database=/path/to/database
      // Note: Yandex Cloud CLI returns endpoint with ?database= already included
      let connectionString: string;
      if (
        config.database.endpoint.includes('?database=') ||
        config.database.endpoint.includes('/?database=')
      ) {
        // Endpoint already contains database path
        connectionString = config.database.endpoint;
      } else {
        // Build connection string from endpoint and database
        // Ensure database path starts with /
        const dbPath = config.database.database.startsWith('/')
          ? config.database.database
          : `/${config.database.database}`;
        // Use /?database= format (with slash) as shown in Yandex Cloud CLI output
        const separator = config.database.endpoint.endsWith('/') ? '?' : '/?';
        connectionString = `${config.database.endpoint}${separator}database=${encodeURIComponent(dbPath)}`;
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
      // Note: Driver constructor accepts IDriverSettings interface
      const driverConfig = {
        connectionString,
        authService: credentials,
        logger: {
          error: (message: string) => logger.error({ message, type: 'ydb_sdk_error' }),
          warn: (message: string) => logger.warn({ message, type: 'ydb_sdk_warn' }),
          info: (message: string) => logger.info({ message, type: 'ydb_sdk_info' }),
          debug: (message: string) => logger.debug({ message, type: 'ydb_sdk_debug' }),
        } as Logger,
      };

      logger.info({ type: 'ydb_driver_creating' });
      this.driver = new Driver(driverConfig);

      // Wait for driver to be ready with timeout
      // Note: driver.ready() may hang in some network conditions
      // We'll try to wait, but if it fails, we'll skip the check and let the first query establish connection
      const timeout = 30000; // 30 seconds - increased for serverless YDB
      const skipReadyCheck = process.env.YDB_SKIP_READY_CHECK === 'true';

      if (!skipReadyCheck) {
        logger.info({
          type: 'ydb_driver_waiting',
          timeout,
          connectionString: connectionString.replace(/\?database=.*/, '?database=***'),
        });

        try {
          // Try to wait for driver to be ready with a short timeout
          logger.debug({ type: 'ydb_driver_ready_start', timeout });

          const readyPromise = this.driver.ready(timeout);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error(`YDB driver initialization timeout after ${timeout}ms`));
            }, timeout + 1000); // Add 1 second buffer
          });

          const isReady = await Promise.race([readyPromise, timeoutPromise]);

          if (!isReady) {
            logger.warn({
              type: 'ydb_driver_timeout',
              timeout,
              message: 'Driver ready check timed out, will try to connect on first query',
            });
            // Don't throw error - let first query establish connection
          } else {
            logger.info({ type: 'ydb_driver_ready', timeout, isReady });
          }
        } catch (error) {
          // If ready() check fails, log warning but continue
          // The driver will establish connection on first query
          logger.warn({
            error,
            type: 'ydb_driver_ready_check_failed',
            message: 'Driver ready check failed, will try to connect on first query',
            timeout,
          });
        }
      } else {
        logger.info({
          type: 'ydb_driver_ready_check_skipped',
          message: 'Skipping driver.ready() check (YDB_SKIP_READY_CHECK=true)',
        });
      }

      // Mark as connected (even if ready() check failed, connection will be established on first query)
      logger.info({ type: 'ydb_driver_initialized' });

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
        stack: error instanceof Error ? error.stack : undefined,
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
   * Execute DDL query (CREATE TABLE, DROP TABLE, etc.) using YDB SDK 5.x
   * Uses schemeClient for DDL operations
   */
  async executeDDL(query: string, timeoutMs: number = 60000): Promise<void> {
    if (!this.isConnected || !this.driver) {
      if (this.isConnecting) {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (this.isConnected && this.driver) {
            break;
          }
        }
        if (!this.isConnected || !this.driver) {
          throw new Error(
            'Database connection timeout. Please check YDB configuration and connection.'
          );
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
          });
          throw new Error('Database not connected. Please check YDB configuration and connection.');
        }
      }
    }

    if (!this.driver || !this.isConnected) {
      throw new Error('Database connection failed. Please check YDB configuration and connection.');
    }

    const driver = this.driver;

    logger.debug({
      type: 'ydb_ddl_start',
      query: query.substring(0, 200),
      timeoutMs,
    });

    // In YDB SDK 5.x, DDL queries can be executed through tableClient
    // Some versions use schemeClient, but tableClient.withSessionRetry also works for DDL
    const ddlPromise = driver.tableClient.withSessionRetry(async (session) => {
      // Execute DDL query - in YDB SDK 5.x, executeQuery works for both DDL and DML
      await session.executeQuery(query);
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `YDB DDL query timeout after ${timeoutMs}ms. Query: ${query.substring(0, 100)}...`
          )
        );
      }, timeoutMs);
    });

    try {
      await Promise.race([ddlPromise, timeoutPromise]);
      logger.debug({ type: 'ydb_ddl_success' });
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        ...(error instanceof Error && 'code' in error ? { code: (error as any).code } : {}),
      };
      logger.error({
        error: errorDetails,
        type: 'ydb_ddl_failed',
        query: query.substring(0, 200),
        timeoutMs,
      });
      throw error;
    }
  }

  /**
   * Execute query using YDB SDK 5.x
   *
   * Uses withSessionRetry for automatic session management and retries
   * Automatically detects DDL queries and uses executeDDL
   */
  async executeQuery<T = any>(
    query: string,
    params?: Record<string, any>,
    timeoutMs: number = 60000
  ): Promise<T[]> {
    // Check if this is a DDL query (CREATE, DROP, ALTER, etc.)
    const trimmedQuery = query.trim().toUpperCase();
    const isDDL =
      trimmedQuery.startsWith('CREATE') ||
      trimmedQuery.startsWith('DROP') ||
      trimmedQuery.startsWith('ALTER') ||
      trimmedQuery.startsWith('GRANT') ||
      trimmedQuery.startsWith('REVOKE');

    if (isDDL && !params) {
      // DDL queries don't return rows and don't use parameters
      await this.executeDDL(query, timeoutMs);
      return [] as T[];
    }
    // Try to connect if not connected
    if (!this.isConnected || !this.driver) {
      if (this.isConnecting) {
        // Wait a bit if connection is in progress (max 10 seconds)
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (this.isConnected && this.driver) {
            break;
          }
        }
        if (!this.isConnected || !this.driver) {
          throw new Error(
            'Database connection timeout. Please check YDB configuration and connection.'
          );
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
            stack: error instanceof Error ? error.stack : undefined,
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
      type: 'ydb_query_start',
      query: query.substring(0, 200),
      hasParams: !!params,
      timeoutMs,
    });

    // Wrap query execution with timeout
    const queryPromise = driver.tableClient.withSessionRetry(async (session) => {
      logger.debug({ type: 'ydb_query_session_acquired', query: query.substring(0, 100) });
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

      logger.debug({ type: 'ydb_query_result_received', rowsCount: rows.length });
      return rows;
    });

    // Add timeout wrapper
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(`YDB query timeout after ${timeoutMs}ms. Query: ${query.substring(0, 100)}...`)
        );
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      logger.debug({ type: 'ydb_query_success', rowsCount: result.length });
      return result;
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        ...(error instanceof Error && 'code' in error ? { code: (error as any).code } : {}),
      };
      logger.error({
        error: errorDetails,
        type: 'ydb_query_failed',
        query: query.substring(0, 200),
        timeoutMs,
      });
      throw error;
    }
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
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Don't throw - allow app to start without DB even in production
    // Health check endpoint will show DB status
    // This prevents container from crashing and allows debugging
    logger.warn({
      type: 'ydb_init_skipped',
      reason: 'connection_failed_but_continuing',
      environment: config.nodeEnv,
      message: 'YDB connection failed, but server will continue. Health check will show DB status.',
    });

    // Try to send alert about DB connection failure
    try {
      const { sendCriticalAlert } = await import('../alerts');
      sendCriticalAlert(
        'YDB Connection Failed',
        error instanceof Error ? error : new Error(String(error))
      ).catch(() => {
        // Ignore alert errors
      });
    } catch {
      // Ignore import errors
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
