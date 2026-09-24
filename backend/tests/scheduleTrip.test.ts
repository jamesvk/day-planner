import { describe, it, expect } from 'vitest';
// No vi import needed — nothing to mock. That absence IS the point (card #44).
import type { RoutableTrip } from '../src/types.js';
import { scheduleTrip } from '../src/pipeline/scheduleTrip.ts';

// Pure-function fixture: values are RIGGED, not arbitrary. The matrix makes
// [0,2,1] the travel-cheapest order (25 vs 55) so the test proves the scorer
// weighs inversions, not just travel. If the numbers were symmetric/equal,
// a broken scorer could still pass.
const mockTrip = {
  rawText: 'test trip',
  city: 'Ridgefield',
  date: '2026-09-24',
  transportMode: 'driving',
  dayStart: '09:00',
  dayEnd: '17:00',
  stops: [
    {
      name: 'Stop A',
      address: '1 Main St, Ridgefield, NJ',
      location: { lat: 40.8343, lng: -74.0121 },
      durationMinutes: 30,
    },
    {
      name: 'Stop B',
      address: '2 Broad Ave, Palisades Park, NJ',
      location: { lat: 40.8481, lng: -73.9971 },
      durationMinutes: 30,
    },
    {
      name: 'Stop C',
      address: '3 Grand Ave, Fort Lee, NJ',
      location: { lat: 40.8509, lng: -73.9701 },
      durationMinutes: 30,
    },
  ],
  travelTimes: [
    [0, 40, 10],
    [40, 0, 15],
    [10, 15, 0],
  ],
} as RoutableTrip;

describe('scheduleTrip', () => {
  it('chooses the lowest-score order and schedules it (guided)', () => {
    const result = scheduleTrip(mockTrip);

    // HAND DERIVATION (before first run):
    // idle = 0 for every order (no fixedTimes → departure−arrival−duration = 0).
    // score = travel + 45×inversions:
    //   [0,1,2]: 55 + 45×0 = 55  ← winner
    //   [0,2,1]: 25 + 45×1 = 70  (saves 30 travel, loses to one inversion charge)
    //   others: worse on both terms.
    // Design property surfaced: ORDER_WEIGHT=45 makes input order sticky —
    // a reorder must save >45 travel minutes to win.
    expect(result.feasible).toBe(true);

    // Identity check: stops returned in the winning order [0,1,2]
    expect(result.scheduledStops.map((s) => s.stop.name)).toEqual([
      'Stop A',
      'Stop B',
      'Stop C',
    ]);

    // Exact clock math from 09:00: visit 30, hop 40, visit 30, hop 15, visit 30
    expect(
      result.scheduledStops.map((s) => [s.arrivalTime, s.departureTime]),
    ).toEqual([
      ['09:00', '09:30'],
      ['10:10', '10:40'],
      ['10:55', '11:25'],
    ]);
  });
});
