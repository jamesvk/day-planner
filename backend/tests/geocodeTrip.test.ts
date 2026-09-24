// tests/geocodeTrip.test.ts
// UNIT TEST: geocodeTrip. Mock boundaries: fetch (GLOBAL -> vi.stubGlobal) and
// sleep (IMPORTED -> vi.mock). geocodeTrip's REAL code runs: params build,
// ok-guard, city/stop guards, viewbox, kmBetween 100km check, address fallback.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// fetch is a GLOBAL (no import in geocodeTrip.ts), so there is no module
// string for vi.mock to intercept. stubGlobal swaps globalThis.fetch.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// sleep IS imported by geocodeTrip.ts -> normal vi.mock at the module string.
// Mock time, never wait for it: without this, every test eats 1s per geocode.
vi.mock('../src/utils/sleep.js', () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
}));

import { geocodeTrip } from '../src/pipeline/geocodeTrip.js';
import { ValidationError } from '../src/utils/errors.js';

// The shape geocodeOnce touches: response.ok, then response.json() -> ARRAY.
// Nominatim raw: lat/lon are STRINGS (parseFloat in the unit is the tell),
// key is lon not lng, place_id is a number (unit wraps it in String()).
const nominatimResponse = (results: unknown[]) => ({
  ok: true,
  json: async () => results,
});

// Fixtures: NYC city center, one Manhattan stop, one Paris stop (far away).
const nycCity = [{ lat: '40.7128', lon: '-74.0060', place_id: 11111 }];
const momaHit = [{ lat: '40.7614', lon: '-73.9776', place_id: 22222 }];
const katzHit = [{ lat: '40.7223', lon: '-73.9874', place_id: 33333 }];
const parisHit = [{ lat: '48.8606', lon: '2.3376', place_id: 44444 }];

// Minimal valid ParsedTrip; stops swapped per test.
const baseTrip = (stops: any[]) =>
  ({
    rawText: 'test',
    city: 'New York, New York, USA',
    date: '2026-09-25',
    transportMode: 'driving',
    dayStart: '10:00',
    dayEnd: '20:00',
    stops,
  }) as any;

beforeEach(() => {
  mockFetch.mockReset(); // wipe the queue AND call history between tests
});

afterAll(() => {
  vi.unstubAllGlobals(); // restore the real fetch when this file is done
});

describe('geocodeTrip (unit, fetch stubbed)', () => {
  // HAPPY PATH: queue = one response per fetch call, consumed IN ORDER.
  // Call 1 = city, call 2 = stop 1, call 3 = stop 2.
  it('geocodes the city and each stop in order', async () => {
    mockFetch
      .mockResolvedValueOnce(nominatimResponse(nycCity))
      .mockResolvedValueOnce(nominatimResponse(momaHit))
      .mockResolvedValueOnce(nominatimResponse(katzHit));

    const trip = await geocodeTrip(
      baseTrip([
        { name: 'MoMA', durationMinutes: 90 },
        { name: "Katz's Delicatessen", durationMinutes: 60 },
      ]),
    );

    expect(mockFetch).toHaveBeenCalledTimes(3); // city + 2 stops
    expect(trip.stops).toHaveLength(2);
    expect(trip.stops[0].place_id).toBe('22222'); // String(result.place_id)
    expect(trip.stops[0].location).toEqual({ lat: 40.7614, lng: -73.9776 }); // parseFloat ran, lon -> lng
  });

  // CITY MISS: Nominatim returns [] on no match -> data[0] undefined ->
  // !cityResult guard -> user-fixable -> ValidationError (400).
  it('throws ValidationError when the city is not found', async () => {
    mockFetch.mockResolvedValueOnce(nominatimResponse([]));

    await expect(geocodeTrip(baseTrip([]))).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  // NON-OK RESPONSE: Nominatim is DOWN (503). fetch does NOT throw on HTTP
  // errors -> the !response.ok guard does. System fault, not user-fixable:
  // rephrasing the trip cannot fix a dead geocoder -> generic Error -> 500.
  it('throws a generic Error when Nominatim responds non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => [],
    });

    await expect(geocodeTrip(baseTrip([]))).rejects.toThrow(
      'Nominatim responded 503',
    );
    await expect(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => [],
      });
      await geocodeTrip(baseTrip([]));
    }).rejects.not.toBeInstanceOf(ValidationError);
  });

  // 100KM REJECT: stop geocodes fine but lands in Paris while the city is
  // NYC. The viewbox is only a soft bias (bounded: "0"); kmBetween is the
  // hard backstop -> ValidationError (user adds a street address to fix).
  it('throws ValidationError when a stop lands >100km from the city', async () => {
    mockFetch
      .mockResolvedValueOnce(nominatimResponse(nycCity))
      .mockResolvedValueOnce(nominatimResponse(parisHit));

    await expect(
      geocodeTrip(baseTrip([{ name: 'Louvre', durationMinutes: 120 }])),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  // ADDRESS FALLBACK: primary query ("name, address") misses -> unit retries
  // with the bare address -> hit. Queue: city, MISS, hit. Proves the retry
  // branch and that a fallback hit still passes the distance check.
  it('falls back to the bare address when the name+address query misses', async () => {
    mockFetch
      .mockResolvedValueOnce(nominatimResponse(nycCity))
      .mockResolvedValueOnce(nominatimResponse([])) // primary query: miss
      .mockResolvedValueOnce(nominatimResponse(momaHit)); // address retry: hit

    const trip = await geocodeTrip(
      baseTrip([
        {
          name: 'MoMA',
          address: '11 W 53rd St, New York',
          durationMinutes: 90,
        },
      ]),
    );

    expect(mockFetch).toHaveBeenCalledTimes(3); // city + miss + retry
    expect(trip.stops[0].place_id).toBe('22222');
  });
});
