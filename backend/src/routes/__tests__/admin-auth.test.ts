/**
 * Integration tests for Admin Auth routes
 */

import request from 'supertest';
import express from 'express';
import adminAuthRoutes from '../admin-auth';
import { adminRepository } from '../../repositories/adminRepository';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../repositories/adminRepository');
jest.mock('../../db/connection', () => ({
  ydbClient: {
    executeQuery: jest.fn(),
  },
}));

jest.mock('../../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/admin/auth', adminAuthRoutes);

describe('Admin Auth Routes', () => {
  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@example.com',
    passwordHash: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Hash password for testing
    mockAdmin.passwordHash = await bcrypt.hash('password123', 10);
    jest.clearAllMocks();
  });

  describe('POST /api/admin/auth/login', () => {
    it('should return 400 for invalid email', async () => {
      const response = await request(app).post('/api/admin/auth/login').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for non-existent admin', async () => {
      (adminRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/admin/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for invalid password', async () => {
      (adminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

      const response = await request(app).post('/api/admin/auth/login').send({
        email: 'admin@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return tokens for valid credentials', async () => {
      (adminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);
      (adminRepository.createSession as jest.Mock).mockResolvedValue({
        id: 'session-123',
        adminId: mockAdmin.id,
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app).post('/api/admin/auth/login').send({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresIn');
      expect(response.body.data.admin.email).toBe(mockAdmin.email);
    });
  });

  describe('POST /api/admin/auth/refresh', () => {
    it('should return 400 for missing refreshToken', async () => {
      const response = await request(app).post('/api/admin/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app).post('/api/admin/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /api/admin/auth/logout', () => {
    it('should return 400 for missing refreshToken', async () => {
      const response = await request(app).post('/api/admin/auth/logout').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should logout successfully', async () => {
      (adminRepository.deleteSession as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post('/api/admin/auth/logout').send({
        refreshToken: 'refresh-token',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(adminRepository.deleteSession).toHaveBeenCalledWith('refresh-token');
    });
  });
});
