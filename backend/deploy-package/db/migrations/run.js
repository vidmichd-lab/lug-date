"use strict";
/**
 * Run database migrations
 * Usage: npm run migrate
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection");
const index_1 = require("./index");
const logger_1 = require("../../logger");
async function main() {
    try {
        console.log('🔄 Initializing YDB connection...');
        await (0, connection_1.initYDBForMigrations)();
        // Verify connection is actually established
        if (!connection_1.ydbClient.getConnectionStatus()) {
            throw new Error('YDB connection failed. Check your credentials and network connection.');
        }
        console.log('✅ YDB connected successfully');
        console.log('🔄 Running migrations...');
        await (0, index_1.runMigrations)();
        console.log('✅ Migrations completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        logger_1.logger.error({ error, type: 'migration_script_failed' });
        // Provide helpful error message
        if (error instanceof Error) {
            if (error.message.includes('credentials')) {
                console.error('\n💡 Tip: Make sure you have set one of:');
                console.error('   - YDB_TOKEN_DEV in .env');
                console.error('   - YC_SERVICE_ACCOUNT_KEY_FILE in .env (pointing to yc-service-account-key.json)');
                console.error('   - YC_SERVICE_ACCOUNT_KEY in .env');
            }
        }
        process.exit(1);
    }
}
main();
