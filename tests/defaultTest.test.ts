import { describe, it, expect } from 'vitest';
// import pool from '../src/db.js';

describe('defaultTest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// TEMP: DB connection-target check (commented out — uncomment to verify)
// ---------------------------------------------------------------------------
// Proves the NODE_ENV switch in db.ts points at the right database:
//   - `npm run test:run` should log the dayplanner_test host
//   - `npm run dev`      should log the neondb (production) host
// Importing the pool is what loads db.ts and fires its top-level log.
// Re-run this after any change to db.ts, the .env URLs, or vitest.config.ts.
// --

// describe('db connection', () => {
//   it('points at the test database', () => {
//     expect(pool).toBeDefined();
//   });
// });
