require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Auth flows', () => {
  const user = { name: 'Test User', email: 'test@example.com', password: 'Password1' };

  test('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials and sets cookies', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects invalid password', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  test('blocks access to /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('logout clears the session', async () => {
    await request(app).post('/api/auth/register').send(user);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookies);
    expect(logoutRes.status).toBe(200);
  });
});
