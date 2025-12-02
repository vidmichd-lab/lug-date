"use strict";
/**
 * Database Migrations System for YDB
 * Manages database schema migrations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
exports.getMigrationStatus = getMigrationStatus;
const connection_1 = require("../connection");
const logger_1 = require("../../logger");
const schema_1 = require("../schema");
/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id String NOT NULL,
      name String NOT NULL,
      executed_at Timestamp NOT NULL,
      PRIMARY KEY (id)
    );
  `;
    try {
        await connection_1.ydbClient.executeQuery(createTableQuery);
        logger_1.logger.info({ type: 'migrations_table_created' });
    }
    catch (error) {
        // Table might already exist, which is fine
        logger_1.logger.debug({ error, type: 'migrations_table_check' });
    }
}
/**
 * Get list of executed migrations
 */
async function getExecutedMigrations() {
    try {
        const results = await connection_1.ydbClient.executeQuery('SELECT id FROM migrations ORDER BY executed_at');
        return results.map((r) => r.id);
    }
    catch (error) {
        // If migrations table doesn't exist, return empty array
        logger_1.logger.debug({ error, type: 'get_executed_migrations' });
        return [];
    }
}
/**
 * Mark migration as executed
 */
async function markMigrationExecuted(id, name) {
    const query = `
    INSERT INTO migrations (id, name, executed_at)
    VALUES ($id, $name, CurrentUtcTimestamp());
  `;
    await connection_1.ydbClient.executeQuery(query, {
        $id: id,
        $name: name,
    });
}
/**
 * Initial migration: Create all tables
 */
const initialMigration = {
    id: '001_initial_schema',
    name: 'Create initial database schema',
    up: async () => {
        logger_1.logger.info({ type: 'migration_start', migration: '001_initial_schema' });
        // Create all tables
        for (const schema of schema_1.allSchemas) {
            const createTableSQL = (0, schema_1.generateCreateTableSQL)(schema);
            await connection_1.ydbClient.executeQuery(createTableSQL);
            logger_1.logger.info({ type: 'table_created', table: schema.name });
        }
        logger_1.logger.info({ type: 'migration_complete', migration: '001_initial_schema' });
    },
};
/**
 * All migrations in order
 */
const migrations = [initialMigration];
/**
 * Run all pending migrations
 */
async function runMigrations() {
    try {
        // Ensure migrations table exists
        await ensureMigrationsTable();
        // Get executed migrations
        const executed = await getExecutedMigrations();
        // Filter pending migrations
        const pending = migrations.filter((m) => !executed.includes(m.id));
        if (pending.length === 0) {
            logger_1.logger.info({ type: 'migrations_up_to_date' });
            return;
        }
        logger_1.logger.info({
            type: 'migrations_start',
            pending: pending.length,
            migrations: pending.map((m) => m.id),
        });
        // Execute pending migrations
        for (const migration of pending) {
            try {
                logger_1.logger.info({
                    type: 'migration_executing',
                    id: migration.id,
                    name: migration.name,
                });
                await migration.up();
                await markMigrationExecuted(migration.id, migration.name);
                logger_1.logger.info({
                    type: 'migration_success',
                    id: migration.id,
                });
            }
            catch (error) {
                logger_1.logger.error({
                    error,
                    type: 'migration_failed',
                    id: migration.id,
                });
                throw error;
            }
        }
        logger_1.logger.info({
            type: 'migrations_complete',
            executed: pending.length,
        });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'migrations_error' });
        throw error;
    }
}
/**
 * Get migration status
 */
async function getMigrationStatus() {
    await ensureMigrationsTable();
    const executed = await getExecutedMigrations();
    const all = migrations.map((m) => m.id);
    const pending = all.filter((id) => !executed.includes(id));
    return {
        executed,
        pending,
    };
}
