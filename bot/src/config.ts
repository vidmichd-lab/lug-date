// Configuration for bot based on NODE_ENV

export interface Config {
  nodeEnv: 'production' | 'development' | 'test';
  botToken: string;
}

function getConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'production' | 'development' | 'test';
  const isProduction = nodeEnv === 'production';

  return {
    nodeEnv,
    // Production uses production bot token
    // Development uses test bot token
    botToken: isProduction
      ? process.env.TELEGRAM_BOT_TOKEN_PROD || process.env.TELEGRAM_BOT_TOKEN || ''
      : process.env.TELEGRAM_BOT_TOKEN_DEV || process.env.TELEGRAM_BOT_TOKEN || '',
  };
}

export const config = getConfig();

