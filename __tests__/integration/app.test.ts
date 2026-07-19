import request from 'supertest';
import { app } from '../../src/app';

describe('Core Endpoints', () => {
  describe('GET /', () => {
    it('should return 200 OK and success message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'the GROW API is running successfully!');
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api-docs', () => {
    it('should serve Swagger API documentation', async () => {
      const res = await request(app).get('/api-docs/');
      expect(res.statusCode).toEqual(200);
    });
  });
});

describe('404 Not Found', () => {
  it('should return 404 for undefined routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.statusCode).toEqual(404);
  });
});

describe('CORS Configuration', () => {
  it('should include CORS headers for valid origin', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('Request Validation Middleware', () => {
  it('should handle malformed JSON gracefully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .set('Content-Type', 'application/json')
      .send('invalid json');
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
