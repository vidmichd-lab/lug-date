/**
 * Telegram WebApp initData validation
 * Verifies the signature of Telegram initData to ensure authenticity
 */

import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../logger';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

/**
 * Parse Telegram initData string
 * Format: key1=value1&key2=value2&hash=...
 */
function parseInitData(initData: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  for (const pair of initData.split('&')) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  }
  
  return params;
}

/**
 * Verify Telegram initData signature
 * Uses HMAC-SHA-256 to verify the hash
 */
export function verifyTelegramInitData(initData: string): boolean {
  try {
    const params = parseInitData(initData);
    const hash = params.hash;
    
    if (!hash) {
      logger.warn({ type: 'telegram_auth', error: 'Missing hash in initData' });
      return false;
    }
    
    // Remove hash from params for verification
    delete params.hash;
    
    // Sort params by key
    const sortedKeys = Object.keys(params).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('\n');
    
    // Get bot token from config
    const botToken = config.telegram.botToken;
    if (!botToken) {
      logger.error({ type: 'telegram_auth', error: 'Bot token not configured' });
      return false;
    }
    
    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare hashes (timing-safe comparison)
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(calculatedHash, 'hex')
    );
  } catch (error) {
    logger.error({ error, type: 'telegram_auth_verification_failed' });
    return false;
  }
}

/**
 * Extract user data from initData
 */
export function extractUserFromInitData(initData: string): TelegramUser | null {
  try {
    const params = parseInitData(initData);
    const userStr = params.user;
    
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr) as TelegramUser;
    return user;
  } catch (error) {
    logger.error({ error, type: 'telegram_auth_extract_user_failed' });
    return null;
  }
}

/**
 * Check if initData is not expired
 * Telegram initData is valid for 24 hours
 */
export function isInitDataValid(initData: string): boolean {
  try {
    const params = parseInitData(initData);
    const authDate = parseInt(params.auth_date, 10);
    
    if (!authDate) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const age = now - authDate;
    
    // InitData is valid for 24 hours (86400 seconds)
    const maxAge = 24 * 60 * 60;
    
    return age >= 0 && age < maxAge;
  } catch (error) {
    logger.error({ error, type: 'telegram_auth_check_expiry_failed' });
    return false;
  }
}

/**
 * Full validation of Telegram initData
 * Checks signature and expiration
 */
export function validateTelegramInitData(initData: string): {
  valid: boolean;
  user?: TelegramUser;
  error?: string;
} {
  // Check if initData is provided
  if (!initData || typeof initData !== 'string') {
    return {
      valid: false,
      error: 'initData is required',
    };
  }
  
  // Check expiration
  if (!isInitDataValid(initData)) {
    return {
      valid: false,
      error: 'initData expired or invalid',
    };
  }
  
  // Verify signature
  if (!verifyTelegramInitData(initData)) {
    return {
      valid: false,
      error: 'Invalid initData signature',
    };
  }
  
  // Extract user
  const user = extractUserFromInitData(initData);
  if (!user) {
    return {
      valid: false,
      error: 'User data not found in initData',
    };
  }
  
  return {
    valid: true,
    user,
  };
}

