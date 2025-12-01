// Configuration for bot based on NODE_ENV

// Load environment variables from .env file FIRST
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

// Find project root by looking for .env file
// When running from workspace, process.cwd() might be in bot/ directory
// So we need to go up to find project root
function findEnvFile(): string | null {
  let currentDir = process.cwd();
  const maxDepth = 5; // Prevent infinite loop
  
  for (let i = 0; i < maxDepth; i++) {
    const envPath = resolve(currentDir, '.env');
    if (existsSync(envPath)) {
      return envPath;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached filesystem root
    }
    currentDir = parentDir;
  }
  
  return null;
}

const envPath = findEnvFile();
if (envPath) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('Warning: Failed to load .env file:', result.error.message);
  }
} else {
  // Fallback: try default location (current directory)
  dotenv.config();
}

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

