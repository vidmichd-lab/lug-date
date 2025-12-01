// Configuration for backend based on NODE_ENV

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

export const config = getConfig();

