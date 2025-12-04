/**
 * Tests for Telegram Auth utilities
 */

import { isInitDataValid, verifyTelegramInitData, extractUserFromInitData } from '../telegramAuth';
import crypto from 'crypto';

// Mock config
jest.mock('../../config', () => ({
  config: {
    telegram: {
      botToken: 'test-bot-token-12345',
    },
  },
}));

// Mock logger
jest.mock('../../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Telegram Auth', () => {
  const botToken = 'test-bot-token-12345';

  /**
   * Helper to create valid initData for testing
   */
  function createInitData(params: Record<string, string>): string {
    // Remove hash if exists
    const { hash, ...rest } = params;

    // Sort params
    const sortedKeys = Object.keys(rest).sort();
    const dataCheckString = sortedKeys.map((key) => `${key}=${rest[key]}`).join('\n');

    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Build initData string
    const pairs = [
      ...sortedKeys.map((key) => `${key}=${encodeURIComponent(rest[key])}`),
      `hash=${calculatedHash}`,
    ];
    return pairs.join('&');
  }

  describe('isInitDataValid', () => {
    it('should reject expired initData (older than 24 hours)', () => {
      const expiredDate = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours ago
      const initData = createInitData({
        auth_date: expiredDate.toString(),
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
      });

      expect(isInitDataValid(initData)).toBe(false);
    });

    it('should accept valid initData (within 24 hours)', () => {
      const validDate = Math.floor(Date.now() / 1000) - 1 * 60 * 60; // 1 hour ago
      const initData = createInitData({
        auth_date: validDate.toString(),
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
      });

      expect(isInitDataValid(initData)).toBe(true);
    });

    it('should reject initData without auth_date', () => {
      const initData = createInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
      });

      expect(isInitDataValid(initData)).toBe(false);
    });

    it('should reject initData with invalid auth_date', () => {
      const initData = createInitData({
        auth_date: 'invalid',
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
      });

      expect(isInitDataValid(initData)).toBe(false);
    });
  });

  describe('extractUserFromInitData', () => {
    it('should extract user data from valid initData', () => {
      const user = { id: 123, first_name: 'Test', username: 'testuser' };
      const initData = createInitData({
        auth_date: Math.floor(Date.now() / 1000).toString(),
        user: JSON.stringify(user),
      });

      const extracted = extractUserFromInitData(initData);
      expect(extracted).toEqual(user);
    });

    it('should return null if user data is missing', () => {
      const initData = createInitData({
        auth_date: Math.floor(Date.now() / 1000).toString(),
      });

      const extracted = extractUserFromInitData(initData);
      expect(extracted).toBeNull();
    });
  });

  describe('verifyTelegramInitData', () => {
    it('should verify valid initData', () => {
      const user = { id: 123, first_name: 'Test' };
      const authDate = Math.floor(Date.now() / 1000);
      const initData = createInitData({
        auth_date: authDate.toString(),
        user: JSON.stringify(user),
      });

      expect(verifyTelegramInitData(initData)).toBe(true);
    });

    it('should reject initData with invalid hash', () => {
      const user = { id: 123, first_name: 'Test' };
      const authDate = Math.floor(Date.now() / 1000);
      const initData = createInitData({
        auth_date: authDate.toString(),
        user: JSON.stringify(user),
      });

      // Corrupt the hash
      const corrupted = initData.replace(/hash=[^&]+/, 'hash=invalid');

      expect(verifyTelegramInitData(corrupted)).toBe(false);
    });

    it('should reject initData without hash', () => {
      const initData = `auth_date=${Math.floor(Date.now() / 1000)}&user=${JSON.stringify({ id: 123 })}`;

      expect(verifyTelegramInitData(initData)).toBe(false);
    });
  });
});
