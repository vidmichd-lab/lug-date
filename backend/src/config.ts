// Configuration for backend based on NODE_ENV

// Load environment variables from .env file FIRST
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

// Find project root by looking for .env file
function findEnvFile(): string | null {
  let currentDir = process.cwd();
  const maxDepth = 5;

  for (let i = 0; i < maxDepth; i++) {
    const envPath = resolve(currentDir, '.env');
    if (existsSync(envPath)) {
      return envPath;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

const envPath = findEnvFile();
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

export interface DatabaseConfig {
  endpoint: string;
  database: string;
  token?: string;
}

export interface Config {
  nodeEnv: 'production' | 'development' | 'test';
  port: number;
  database: DatabaseConfig;
  telegram: {
    botToken: string;
  };
  monitoring: {
    catcherEnabled: boolean;
  };
  logging: {
    level: string;
    yandexCloudEnabled: boolean;
  };
}

function getConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'production' | 'development' | 'test';
  const isProduction = nodeEnv === 'production';

  return {
    nodeEnv,
    port: Number(process.env.PORT || process.env.API_PORT || 4000),
    database: {
      // Production uses production database
      // Development uses test database
      endpoint: (isProduction
        ? process.env.YDB_ENDPOINT_PROD || process.env.YDB_ENDPOINT || ''
        : process.env.YDB_ENDPOINT_DEV || process.env.YDB_ENDPOINT || ''
      ).trim(),
      database: (isProduction
        ? process.env.YDB_DATABASE_PROD || process.env.YDB_DATABASE || ''
        : process.env.YDB_DATABASE_DEV || process.env.YDB_DATABASE || ''
      ).trim(),
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

export const config = getConfig();
