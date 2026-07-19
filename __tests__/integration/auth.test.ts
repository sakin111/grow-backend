import request from 'supertest';
import { app } from '../../src/app';

describe('Auth Module', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should validate password strength', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should reject duplicate email', async () => {
      // First attempt
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Test User'
        });

      // Second attempt with same email
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(res.statusCode).toEqual(400);
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should require authentication token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Google OAuth', () => {
    it('should handle Google OAuth callback', async () => {
      const res = await request(app).get('/api/v1/auth/google/callback');
      // Expect redirect or appropriate response
      expect([200, 301, 302, 400, 401]).toContain(res.statusCode);
    });
  });
});
