/**
 * Jest setup file
 * Runs before all tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.TELEGRAM_BOT_TOKEN_DEV = 'test-bot-token';
process.env.YDB_ENDPOINT_DEV = 'grpcs://test.ydb.serverless.yandexcloud.net:2135';
process.env.YDB_DATABASE_DEV = '/test/database';

// Increase timeout for async operations
jest.setTimeout(10000);
