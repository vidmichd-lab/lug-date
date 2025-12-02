"use strict";
// Configuration for backend based on NODE_ENV
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// Load environment variables from .env file FIRST
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const fs_1 = require("fs");
// Find project root by looking for .env file
function findEnvFile() {
    let currentDir = process.cwd();
    const maxDepth = 5;
    for (let i = 0; i < maxDepth; i++) {
        const envPath = (0, path_1.resolve)(currentDir, '.env');
        if ((0, fs_1.existsSync)(envPath)) {
            return envPath;
        }
        const parentDir = (0, path_1.dirname)(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    return null;
}
const envPath = findEnvFile();
if (envPath) {
    dotenv_1.default.config({ path: envPath });
}
else {
    dotenv_1.default.config();
}
function getConfig() {
    const nodeEnv = (process.env.NODE_ENV || 'development');
    const isProduction = nodeEnv === 'production';
    return {
        nodeEnv,
        port: Number(process.env.PORT || process.env.API_PORT || 4000),
        database: {
            // Production uses production database
            // Development uses test database
            endpoint: isProduction
                ? process.env.YDB_ENDPOINT_PROD || process.env.YDB_ENDPOINT || ''
                : process.env.YDB_ENDPOINT_DEV || process.env.YDB_ENDPOINT || '',
            database: isProduction
                ? process.env.YDB_DATABASE_PROD || process.env.YDB_DATABASE || ''
                : process.env.YDB_DATABASE_DEV || process.env.YDB_DATABASE || '',
            token: isProduction
                ? process.env.YDB_TOKEN_PROD || process.env.YDB_TOKEN
                : process.env.YDB_TOKEN_DEV || process.env.YDB_TOKEN,
        },
        telegram: {
            // Production uses production bot token
            // Development uses test bot token
            botToken: isProduction
                ? process.env.TELEGRAM_BOT_TOKEN_PROD || process.env.TELEGRAM_BOT_TOKEN || ''
                : process.env.TELEGRAM_BOT_TOKEN_DEV || process.env.TELEGRAM_BOT_TOKEN || '',
        },
        // Error monitoring (используется Yandex AppMetrica/Catcher вместо Sentry)
        monitoring: {
            catcherEnabled: !!(process.env.CATCHER_API_KEY && process.env.CATCHER_PROJECT_ID),
        },
        logging: {
            level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
            yandexCloudEnabled: isProduction && process.env.YANDEX_CLOUD_LOGGING_ENABLED !== 'false',
        },
    };
}
exports.config = getConfig();
