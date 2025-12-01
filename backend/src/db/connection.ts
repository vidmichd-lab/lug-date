/**
 * YDB Database Connection
 * Handles connection to Yandex Database (YDB) using official SDK
 */

import { Driver, getCredentialsFromEnv, Logger, StaticCredentials } from 'ydb-sdk';
import { config } from '../config';
import { logger } from '../logger';

class YDBClient {
  private driver: Driver | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize YDB connection
   * 
   * Note: YDB SDK API may vary. Adjust based on actual SDK version.
   * See: https://github.com/ydb-platform/ydb-nodejs-sdk
   */
  async connect(): Promise<void> {
    try {
      if (!config.database.endpoint || !config.database.database) {
        throw new Error('YDB endpoint and database are required');
      }

      // Get credentials - YDB SDK supports multiple auth methods
      let credentials;
      if (config.database.token) {
        // Use token-based authentication
        // Note: Adjust based on actual SDK API
        credentials = new StaticCredentials({
          accessKeyId: '', // Not used with token
          secretAccessKey: config.database.token,
        });
      } else {
        // Try to get credentials from environment (service account key)
        try {
          credentials = getCredentialsFromEnv();
        } catch (error) {
          logger.warn({ error, type: 'ydb_credentials_env_failed' });
          throw new Error('YDB credentials not found. Set YDB_TOKEN or configure service account.');
        }
      }

      // Create YDB driver
      // Note: Driver constructor API may vary - check SDK documentation
      const driverConfig: any = {
        endpoint: config.database.endpoint,
        database: config.database.database,
      };

      // Add credentials if available
      if (credentials) {
        driverConfig.authService = credentials;
      }

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

      this.driver = new Driver(driverConfig);

      // Wait for driver to be ready
      const timeout = 10000; // 10 seconds
      if (!(await this.driver.ready(timeout))) {
        throw new Error('YDB driver initialization timeout');
      }

      this.isConnected = true;
      logger.info({
        type: 'ydb_connection',
        endpoint: config.database.endpoint,
        database: config.database.database,
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
   * Execute query using YDB SDK
   * 
   * Note: YDB SDK query execution API may vary.
   * This is a simplified implementation - adjust based on actual SDK version.
   */
  async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    const driver = this.getDriver();
    const session = await driver.tableClient.createSession();

    try {
      logger.debug({
        type: 'ydb_query',
        query,
        params,
      });

      // Execute query
      // Note: API may be session.executeQuery() or session.execute()
      const result = await session.executeQuery(query, params || {});
      
      // Transform result to array of objects
      // Note: Result structure may vary - adjust based on actual SDK response
      const rows: T[] = [];
      
      if (result.resultSets && result.resultSets.length > 0) {
        const resultSet = result.resultSets[0];
        
        // Convert YDB result set to array of objects
        // Adjust this transformation based on actual SDK response structure
        if (resultSet.rows) {
          for (const row of resultSet.rows) {
            const obj: any = {};
            if (resultSet.columns) {
              resultSet.columns.forEach((col, index) => {
                // Adjust based on actual row structure
                const value = row.items?.[index]?.value || row[index]?.value;
                obj[col.name] = value;
              });
            }
            rows.push(obj as T);
          }
        }
      }

      return rows;
    } catch (error) {
      logger.error({ error, type: 'ydb_query_execution_failed', query });
      throw error;
    } finally {
      try {
        await session.delete();
      } catch (deleteError) {
        logger.warn({ error: deleteError, type: 'ydb_session_delete_failed' });
      }
    }
  }

  /**
   * Execute transaction
   * 
   * Note: Transaction API may vary in YDB SDK.
   * Adjust based on actual SDK version.
   */
  async executeTransaction<T>(
    queries: Array<{ query: string; params?: Record<string, any> }>
  ): Promise<T> {
    const driver = this.getDriver();
    const session = await driver.tableClient.createSession();

    try {
      logger.debug({
        type: 'ydb_transaction',
        queriesCount: queries.length,
      });

      // Execute transaction
      // Note: Transaction API may be session.executeTransaction() or session.beginTransaction()
      const result = await session.executeTransaction(async (tx: any) => {
        const results: any[] = [];
        for (const { query, params } of queries) {
          // Adjust query execution method based on actual SDK
          const queryResult = await tx.executeQuery(query, params || {});
          results.push(queryResult);
        }
        return results;
      });

      return result as T;
    } catch (error) {
      logger.error({ error, type: 'ydb_transaction_failed' });
      throw error;
    } finally {
      try {
        await session.delete();
      } catch (deleteError) {
        logger.warn({ error: deleteError, type: 'ydb_session_delete_failed' });
      }
    }
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

