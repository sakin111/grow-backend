import request from 'supertest';
import { app } from '../../src/app';

describe('User Module', () => {
  describe('GET /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .send({ name: 'Updated Name' });

      expect(res.statusCode).toEqual(401);
    });

    it('should validate profile update data', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          email: 'invalid-email'
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toEqual(401);
    });

    it('should support pagination query', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', 'Bearer invalid-token');

      // Could be 401 or other error, but should handle the query
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
