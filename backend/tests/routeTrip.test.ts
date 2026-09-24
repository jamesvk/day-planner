import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { GeocodedTrip } from '../src/types.js';

// Stub BEFORE importing routeTrip: the global must already be swapped
// when the module loads, so every bare `fetch(url)` inside it resolves
// to our vi.fn() on globalThis (rebinding, not interception — card #43).
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { routeTrip } from '../src/pipeline/routeTrip.ts';

// Layer-1 failure fixture: transport-level error. Non-2xx status,
// body is HTML — the exact shape that used to flow into JSON parse.
const osrmErrorResponse = () => ({
  ok: false,
  status: 502,
  text: async () => '<html>Bad Gateway</html>',
});

// Minimal fixture. `as GeocodedTrip` keeps the cast honest against the
// real type while letting us omit fields this test never touches.
const mockTrip = {
  stops: [
    {
      name: 'Stop A',
      address: '1 Main St, Ridgefield, NJ',
      location: { lat: 40.8343, lng: -74.0121 },
    },
    {
      name: 'Stop B',
      address: '2 Broad Ave, Palisades Park, NJ',
      location: { lat: 40.8481, lng: -73.9971 },
    },
  ],
} as GeocodedTrip;

beforeEach(() => {
  mockFetch.mockReset(); // wipe queued responses AND call history per test
});

afterAll(() => {
  vi.unstubAllGlobals(); // restore real fetch so other files aren't poisoned
});

describe('routeTrip', () => {
  it('throws when OSRM returns a transport-level error (non-2xx)', async () => {
    mockFetch.mockResolvedValueOnce(osrmErrorResponse());

    // /502/ proves OUR guard threw — instanceOf(Error) would pass for any crash
    await expect(routeTrip(mockTrip)).rejects.toThrow(/502/);
    expect(mockFetch).toHaveBeenCalledTimes(1); // one table request for all stops
  });
});
