import request from 'supertest';
import { app } from './app';


describe('GET /', () => {
  it('should return 200 OK and success message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'the GROW API is running successfully!');
  });
});
