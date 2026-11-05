import request from 'supertest';
import { app } from '../../src/app';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';


describe('Core Endpoints', () => {
  describe('GET /', () => {
    it('should return 200 OK and success message', async () => {
      const res = await request(app).get('/');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'the GROW API is running successfully!');
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.statusCode, 200);
      assert.ok('status' in res.body);
      assert.ok('uptime' in res.body);
    });
  });

  describe('GET /api-docs', () => {
    it('should serve Swagger API documentation', async () => {
      const res = await request(app).get('/api-docs/');
      assert.equal(res.statusCode, 200);
    });
  });
});

describe('404 Not Found', () => {
  it('should return 404 for undefined routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    assert.equal(res.statusCode, 404);
  });
});

describe('CORS Configuration', () => {
  it('should include CORS headers for valid origin', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    
    assert.notEqual(res.headers['access-control-allow-origin'], undefined);
  });
});

describe('Request Validation Middleware', () => {
  it('should handle malformed JSON gracefully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .set('Content-Type', 'application/json')
      .send('invalid json');
    
    assert.ok(res.statusCode >= 400);
  });
});
