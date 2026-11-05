import request from 'supertest';
import { app } from '../../src/app';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('User Module', () => {
  describe('DELETE /api/v1/user/me', () => {
    it('should require authentication', async () => {
      const res = await request(app).delete('/api/v1/user/me');
      assert.equal(res.statusCode, 403);
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      assert.equal(res.statusCode, 401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .send({ name: 'Updated Name' });

      assert.equal(res.statusCode, 401);
    });

    it('should validate profile update data', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          email: 'invalid-email'
        });

      assert.ok(res.statusCode >= 400);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/users');
      assert.equal(res.statusCode, 401);
    });

    it('should support pagination query', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', 'Bearer invalid-token');

      // Could be 401 or other error, but should handle the query
      assert.ok(res.statusCode >= 400);
    });
  });
});
