import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

jest.setTimeout(15000);

describe('Authentication & Authorization Integration Tests', () => {
  const regularUser = {
    name: 'Regular User',
    email: 'regular@example.com',
    phoneNumber: '+2348000000002',
    password: 'Password123!',
    role: 'USER',
  };

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '+2348000000003',
    password: 'Password123!',
    role: 'ADMIN',
  };

  let regularCookieHeader = '';
  let adminCookieHeader = '';
  let refreshTokenCookie = '';

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [regularUser.email, adminUser.email] },
      },
    });
    await prisma.$disconnect();
  });

  describe('User Registration & Login Setup', () => {
    it('should register regular user and admin user', async () => {
      await request(app).post('/api/v1/auth/register').send(regularUser);
      await request(app).post('/api/v1/auth/register').send(adminUser);
    });

    it('should log in regular user and extract access/refresh cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: regularUser.email, password: regularUser.password });

      expect(res.statusCode).toEqual(200);
      const cookies = res.headers['set-cookie'];
      regularCookieHeader = cookies.join('; ');
      
      // Extract specific refresh token cookie for refresh endpoint testing
      refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    });

    it('should log in admin user and extract admin access cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: adminUser.email, password: adminUser.password });

      expect(res.statusCode).toEqual(200);
      adminCookieHeader = res.headers['set-cookie'].join('; ');
    });
  });

  describe('POST /api/v1/auth/refresh (Token Rotation)', () => {
    it('should issue new access and refresh tokens when valid refresh cookie is provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshTokenCookie]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('accessToken'))).toBe(true);
      expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });

    it('should reject refresh request when no refresh token cookie is provided', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/auth/admin/users (RBAC Authorization)', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/auth/admin/users');
      expect(res.statusCode).toEqual(401);
    });

    it('should block regular USER from accessing admin routes with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users')
        .set('Cookie', [regularCookieHeader]);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should allow ADMIN user to access restricted admin route with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users')
        .set('Cookie', [adminCookieHeader]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });
  });
});