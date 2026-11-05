import request from 'supertest';
import { app } from './app';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';


describe('GET /', () => {
  it('should return 200 OK and success message', async () => {
    const res = await request(app).get('/');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'the GROW API is running successfully!');
  });
});
