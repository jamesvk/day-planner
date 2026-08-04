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

async function seedTrip(userId: string, overrides = {}) {
  const trip = {
    rawText: 'test trip',
    date: '2026-09-01',
    transportMode: 'driving',
    dayStart: '09:00',
    dayEnd: '17:00',
    feasible: true,
    summary: 'A test trip summary',
    ...overrides,
  };

  const result = await pool.query(
    `INSERT INTO trips (user_id, raw_text, date, transport_mode, day_start, day_end, feasible, summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId,
      trip.rawText,
      trip.date,
      trip.transportMode,
      trip.dayStart,
      trip.dayEnd,
      trip.feasible,
      trip.summary,
    ],
  );
  return result.rows[0].id;
}

async function seedStop(tripId: string, overrides = {}) {
  const stop = {
    stopOrder: 1,
    name: 'Test Stop',
    event: 'test event',
    address: '123 Test St, New York, NY',
    placeId: 'test-place-id-123',
    lat: 40.7128,
    lng: -74.006,
    arrivalTime: '10:00',
    departureTime: '11:00',
    travelToNextMinutes: 15,
    ...overrides,
  };

  const result = await pool.query(
    `INSERT INTO scheduled_stops (trip_id, stop_order, name, event, address, place_id, lat, lng, arrival_time, departure_time, travel_to_next_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      tripId,
      stop.stopOrder,
      stop.name,
      stop.event,
      stop.address,
      stop.placeId,
      stop.lat,
      stop.lng,
      stop.arrivalTime,
      stop.departureTime,
      stop.travelToNextMinutes,
    ],
  );
  return result.rows[0].id;
}

describe('POST /api/trips', () => {
  it('returns a 401 when no token is provided', async () => {
    const resPost = await request(app)
      .post(`/api/trips/`)
      .send({ rawText: 'Random Test Trip Rawtext Input' });
    expect(resPost.status).toBe(401);
  });
});

describe('GET /api/trips', () => {
  it("returns only the authenticated user's trips", async () => {
    const userA = await registerTestUser();
    const userB = await registerTestUser({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@example.com',
      password: 'Password1234',
    });

    const tripA1 = await seedTrip(userA.body.id);
    const otherUserTrip = await seedTrip(userB.body.id, {
      date: '2026-09-02',
      dayStart: '10:00',
      dayEnd: '20:00',
      feasible: false,
    });
    const tripA2 = await seedTrip(userA.body.id, {
      rawText: 'test trip2',
      date: '2026-09-03',
      dayStart: '08:00',
      dayEnd: '18:00',
      feasible: false,
    });

    const resGet = await request(app)
      .get('/api/trips/')
      .set('Authorization', `Bearer ${userA.body.accessToken}`);

    const olderTrip = resGet.body[1];
    expect(resGet.status).toBe(200);
    expect(resGet.body).toHaveLength(2);
    expect(olderTrip.id).toBe(tripA1);
    expect(olderTrip.rawText).toBe('test trip');
    expect(olderTrip.date.slice(0, 10)).toBe('2026-09-01');
    expect(olderTrip.transportMode).toBe('driving');
    expect(olderTrip.dayStart.slice(0, 5)).toBe('09:00');
    expect(olderTrip.dayEnd.slice(0, 5)).toBe('17:00');
    expect(olderTrip.feasible).toBe(true);
    expect(olderTrip.summary).toBe('A test trip summary');
    expect(resGet.body[0].id).toBe(tripA2);
    expect(resGet.body.map((t: { id: string }) => t.id)).not.toContain(
      otherUserTrip,
    );
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/trips/');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/trips/')
      .set('Authorization', 'Bearer Incorrect_Token');
    expect(res.status).toBe(401);
  });

  it('returns 200 and an empty array when no records exist', async () => {
    const userA = await registerTestUser();

    const resGet = await request(app)
      .get('/api/trips/')
      .set('Authorization', `Bearer ${userA.body.accessToken}`);

    expect(resGet.status).toBe(200);
    expect(resGet.body).toHaveLength(0);
  });
});

describe('GET /api/trips/:id', () => {
  it('returns 200 and the trip with scheduledStops as an empty array', async () => {
    const userA = await registerTestUser();
    const tripA1 = await seedTrip(userA.body.id);
    const resGet = await request(app)
      .get(`/api/trips/${tripA1}`)
      .set('Authorization', `Bearer ${userA.body.accessToken}`);

    expect(resGet.status).toBe(200);
    expect(resGet.body.id).toBe(tripA1);
    expect(resGet.body.scheduledStops).toHaveLength(0);
  });

  it('returns 404 if there are no trips with that id', async () => {
    const userA = await registerTestUser();
    const resGet = await request(app)
      .get(`/api/trips/${crypto.randomUUID()}`)
      .set('Authorization', `Bearer ${userA.body.accessToken}`);

    expect(resGet.status).toBe(404);
  });

  it('returns 404 when the trip belongs to another user', async () => {
    const userA = await registerTestUser();
    const userB = await registerTestUser({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@example.com',
      password: 'Password1234',
    });
    const tripA1 = await seedTrip(userA.body.id);
    const resGet = await request(app)
      .get(`/api/trips/${tripA1}`)
      .set('Authorization', `Bearer ${userB.body.accessToken}`);

    expect(resGet.status).toBe(404);
  });

  it('returns 401 when no token is provided', async () => {
    const resGet = await request(app).get(`/api/trips/${crypto.randomUUID()}`);
    expect(resGet.status).toBe(401);
  });

  it('returns the trip with its scheduled stops ordered by stop_order', async () => {
    const userA = await registerTestUser();
    const tripA1 = await seedTrip(userA.body.id);
    await seedStop(tripA1);
    await seedStop(tripA1, {
      stopOrder: 2,
      name: 'Test Stop2',
      event: 'test event2',
      address: '456 Testing Avenue, New York, NY',
      placeId: 'testing-place-id-1234',
      lat: 41.7128,
      lng: -75.006,
      arrivalTime: '11:15',
      departureTime: '12:00',
      travelToNextMinutes: 0,
    });

    const resGet = await request(app)
      .get(`/api/trips/${tripA1}`)
      .set('Authorization', `Bearer ${userA.body.accessToken}`);

    expect(resGet.status).toBe(200);
    expect(resGet.body.id).toBe(tripA1);
    expect(resGet.body.scheduledStops).toHaveLength(2);
    expect(resGet.body.scheduledStops[1].name).toBe('Test Stop2');
  });
});

describe('DELETE /api/trips/:id', () => {
  it('returns 404 when the trip belongs to another user', async () => {
    const userA = await registerTestUser();
    const userB = await registerTestUser({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@example.com',
      password: 'Password1234',
    });
    const tripA1 = await seedTrip(userA.body.id);

    const resDelete = await request(app)
      .delete(`/api/trips/${tripA1}`)
      .set('Authorization', `Bearer ${userB.body.accessToken}`);

    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [
      tripA1,
    ]);

    expect(resDelete.status).toBe(404);
    expect(result.rows).toHaveLength(1);
  });

  it('returns a 204 when a trip is successfully deleted', async () => {
    const userA = await registerTestUser();
    const tripA1 = await seedTrip(userA.body.id);
    const resDelete = await request(app)
      .delete(`/api/trips/${tripA1}`)
      .set('Authorization', `Bearer ${userA.body.accessToken}`);
    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [
      tripA1,
    ]);

    expect(resDelete.status).toBe(204);
    expect(result.rows).toHaveLength(0);
  });

  it('returns a 401 when no token is provided', async () => {
    const resDelete = await request(app).delete(
      `/api/trips/${crypto.randomUUID()}`,
    );
    expect(resDelete.status).toBe(401);
  });
});
