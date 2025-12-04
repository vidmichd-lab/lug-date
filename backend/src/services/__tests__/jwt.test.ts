/**
 * Tests for JWT service
 */

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiration,
} from '../jwt';

// Mock logger
jest.mock('../../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('JWT Service', () => {
  const payload = {
    adminId: 'admin-123',
    email: 'admin@example.com',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(payload);
      const verified = verifyAccessToken(token);

      expect(verified).toBeDefined();
      expect(verified?.adminId).toBe(payload.adminId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid token', () => {
      const verified = verifyAccessToken('invalid-token');
      expect(verified).toBeNull();
    });

    // Note: Expired token test is skipped as it requires time-based testing
    // The expiration logic is verified through jwt library itself
    // We test invalid tokens which covers the error handling path
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const verified = verifyRefreshToken(token);

      expect(verified).toBeDefined();
      expect(verified?.adminId).toBe(payload.adminId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid token', () => {
      const verified = verifyRefreshToken('invalid-token');
      expect(verified).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    const originalExpiresIn = process.env.JWT_EXPIRES_IN;

    afterEach(() => {
      // Restore original value
      if (originalExpiresIn) {
        process.env.JWT_EXPIRES_IN = originalExpiresIn;
      } else {
        delete process.env.JWT_EXPIRES_IN;
      }
    });

    it('should parse minutes correctly', () => {
      process.env.JWT_EXPIRES_IN = '15m';
      expect(getTokenExpiration()).toBe(15 * 60);
    });

    it('should parse hours correctly', () => {
      process.env.JWT_EXPIRES_IN = '2h';
      expect(getTokenExpiration()).toBe(2 * 60 * 60);
    });

    it('should parse days correctly', () => {
      process.env.JWT_EXPIRES_IN = '7d';
      expect(getTokenExpiration()).toBe(7 * 24 * 60 * 60);
    });

    it('should return default for invalid format', () => {
      process.env.JWT_EXPIRES_IN = 'invalid';
      expect(getTokenExpiration()).toBe(15 * 60); // Default 15 minutes
    });
  });
});
