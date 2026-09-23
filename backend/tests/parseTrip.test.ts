// tests/parseTrip.test.ts
// UNIT TEST: parseTrip. Mock boundary = the Anthropic SDK (one level below the unit).
// parseTrip's REAL code runs: prompt build, content[0] guard, JSON slice, error throws.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- MOCK THE SDK MODULE (the string you import from in parseTrip.ts) ----
// Hoisted by Vitest above imports. The default export is the Anthropic class;
// we replace it with a constructor returning { messages: { create } }.
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// Import AFTER the mock declaration (vitest hoists vi.mock anyway, but keep order readable)
import { parseTrip } from '../src/pipeline/parseTrip.js';
import { ValidationError } from '../src/utils/errors.js';

// A valid trip JSON string — what Claude's text block should contain
const validTripJson = JSON.stringify({
  date: '2026-09-12',
  city: 'New York, New York, USA',
  transportMode: 'driving',
  dayStart: '10:00',
  dayEnd: '20:00',
  stops: [
    {
      name: 'Metropolitan Museum of Art',
      address: '1000 Fifth Avenue, New York',
      durationMinutes: 120,
    },
    {
      name: "Katz's Delicatessen",
      address: '205 East Houston Street, New York',
      durationMinutes: 60,
    },
  ],
});

// Helper: shape the raw API envelope the SDK resolves with
const sdkEnvelope = (text: string) => ({
  content: [{ type: 'text', text }],
});

beforeEach(() => {
  mockCreate.mockReset();
});

describe('parseTrip (unit, SDK mocked)', () => {
  // CASE: happy path — clean JSON in the text block
  it('parses a clean JSON response into a trip object', async () => {
    mockCreate.mockResolvedValue(sdkEnvelope(validTripJson));

    const trip = await parseTrip({
      rawText: "Tomorrow in NYC: Met at 10am for 2 hours, then Katz's",
    });

    expect(trip.city).toBe('New York, New York, USA');
    expect(trip.stops).toHaveLength(2);
    expect(trip.stops[0].durationMinutes).toBe(120);
  });

  // CASE 3: JSON wrapped in prose — the slice logic's reason to exist. PASS case.
  it('extracts JSON even when the model wraps it in prose', async () => {
    mockCreate.mockResolvedValue(
      sdkEnvelope(`Here's your trip plan: ${validTripJson} Enjoy your day!`),
    );

    const trip = await parseTrip({ rawText: 'some raw text' });

    expect(trip.city).toBe('New York, New York, USA');
    expect(trip.stops).toHaveLength(2);
  });

  // CASE 1: broken API contract — empty content array. System fault → generic Error.
  it('throws a generic Error when the content array is empty', async () => {
    mockCreate.mockResolvedValue({ content: [] });

    await expect(parseTrip({ rawText: 'some raw text' })).rejects.toThrow(
      Error,
    );
    // And specifically NOT a ValidationError (this is a 500, not a 400):
    await expect(
      parseTrip({ rawText: 'some raw text' }),
    ).rejects.not.toBeInstanceOf(ValidationError);
  });

  // CASE 2: no parseable JSON in the text — DESIGN DECISION EMBEDDED:
  // vague rawText is USER-fixable → ValidationError → 400 "rephrase your trip".
  // If parseTrip currently throws generic Error here, this test FAILS until you
  // change parseTrip to throw ValidationError on parse-fail. Ratify or flip.
  it('throws ValidationError when no JSON can be extracted', async () => {
    mockCreate.mockResolvedValue(
      sdkEnvelope("Sorry, I couldn't understand that trip request."),
    );

    await expect(
      parseTrip({ rawText: 'gibberish input' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  // CASE 4 (your instinct — missing required field post-parse):
  // Same design decision as case 2: parsed but unusable = user-fixable → ValidationError.
  it('throws ValidationError when parsed JSON is missing required fields', async () => {
    const missingCity = JSON.stringify({ date: '2026-09-12', stops: [] });
    mockCreate.mockResolvedValue(sdkEnvelope(missingCity));

    await expect(
      parseTrip({ rawText: 'a trip with no city' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
