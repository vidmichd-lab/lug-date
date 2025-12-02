"use strict";
/**
 * Check migration status
 * Usage: npm run migrate:status
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection");
const index_1 = require("./index");
const logger_1 = require("../../logger");
async function main() {
    try {
        console.log('🔄 Initializing YDB connection...');
        await (0, connection_1.initYDBForMigrations)();
        console.log('📊 Checking migration status...');
        const status = await (0, index_1.getMigrationStatus)();
        console.log('\n📋 Migration Status:');
        console.log(`✅ Executed: ${status.executed.length}`);
        if (status.executed.length > 0) {
            status.executed.forEach((id) => console.log(`   - ${id}`));
        }
        console.log(`⏳ Pending: ${status.pending.length}`);
        if (status.pending.length > 0) {
            status.pending.forEach((id) => console.log(`   - ${id}`));
        }
        else {
            console.log('   All migrations are up to date!');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Failed to check migration status:', error);
        logger_1.logger.error({ error, type: 'migration_status_check_failed' });
        process.exit(1);
    }
}
main();
