import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

beforeEach(async () => {
  await pool.query('TRUNCATE users, trips, scheduled_stops CASCADE');
});

async function registerTestUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      ...overrides,
    });
}

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.firstName).toBe('Test');
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.password).toBeUndefined();
    expect(res.body.password_hash).toBeUndefined();

    const check = await pool.query('SELECT * FROM users WHERE email = $1', [
      'test@example.com',
    ]);
    expect(check.rows).toHaveLength(1);
    expect(check.rows[0].password_hash).not.toBe('password123');
  });

  it('rejects a duplicate email with 409', async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res2 = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(409);
  });

  it('rejects a case-insensitive duplicate with 409', async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res2 = await request(app).post('/api/auth/register').send({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'TeSt@example.com',
      password: 'PASSWORD123',
    });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(409);
  });

  it('normalize email addresses to lowercase during registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test3',
      lastName: 'User3',
      email: 'TEST3@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.firstName).toBe('Test3');
    expect(res.body.email).toBe('TEST3@example.com');
    expect(res.body.password).toBeUndefined();
    expect(res.body.password_hash).toBeUndefined();

    const check = await pool.query('SELECT * FROM users WHERE email = $1', [
      'test3@example.com',
    ]);
    expect(check.rows).toHaveLength(1);
    expect(check.rows[0].password_hash).not.toBe('Password123');
    expect(check.rows[0].first_name).toBe('Test3');
  });

  it('returns 400 if firstName, lastName, email, or password is missing', async () => {
    const validUser = {
      firstName: 'Test3',
      lastName: 'User3',
      email: 'TEST3@example.com',
      password: 'Password123',
    };

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        firstName: '',
      });

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        lastName: '',
      });

    const res3 = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        email: '',
      });

    const res4 = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        password: '',
      });

    for (const res of [res1, res2, res3, res4]) {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('All fields are required');
    }
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 and an access token on successful login', async () => {
    await registerTestUser();
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
  });

  it('returns 401 with an "Invalid email or password" message and no access token for an incorrect email', async () => {
    await registerTestUser();
    const res = await request(app).post('/api/auth/login').send({
      email: 'tesT1@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
    expect(res.body.id).toBeUndefined();
    expect(res.body.accessToken).toBeUndefined();
  });

  it('returns 401 with an "Invalid email or password" message and no access token for an incorrect password', async () => {
    await registerTestUser();
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password1234',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
    expect(res.body.id).toBeUndefined();
    expect(res.body.accessToken).toBeUndefined();
  });

  it('allows login with a case-insensitive email address and returns 200', async () => {
    await registerTestUser();
    const res = await request(app).post('/api/auth/login').send({
      email: 'TEST@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
  });

  it('returns 400 when required login fields are missing', async () => {
    await registerTestUser();
    const res1 = await request(app).post('/api/auth/login').send({
      email: '',
      password: 'password123',
    });

    const res2 = await request(app).post('/api/auth/login').send({
      email: 'TEST@example.com',
      password: '',
    });

    for (const res of [res1, res2]) {
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('All fields are required');
    }
  });
});
