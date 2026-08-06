# Day Planner — Backend

> Plans your whole day from one sentence: an AI pipeline parses what you want to do, finds the places, and builds a feasible schedule around real travel times.

**API:** https://day-planner-api.onrender.com _(free-tier cold start: the first request after idle may take ~60s)_

---

## What it does

Day Planner turns a plain-English description of your day — _"see the Eiffel Tower and Notre-Dame, lunch at La Jacobine at noon, the PSG game at 8"_ — into a complete, scheduled itinerary. An AI pipeline extracts what you want to do, locates each stop, computes real travel times between them, and searches for the stop order that fits your day, returning arrival and departure times plus a written summary. If nothing fits, it says so honestly — and still returns the best achievable schedule rather than failing. This repo is the API powering it.

## Demo

**Request** — `POST /api/trips` _(the planning pipeline takes ~30 seconds)_:

```json
{
  "rawText": "I am planning a trip for September 15th, 2026. I would like to visit: Big Ben (spend 45 minutes), Westminster Abbey (spend 1 hour), the Tower of London (spend 1.5 hours), lunch at Dishoom Covent Garden at 12:30pm (spend 1.5 hours) and the Tottenham game at 7pm (get there by 6pm and leave around 10pm). Driving. Can start the day as early as 9am, and would like to finish by 11pm or midnight."
}
```

**Response** _(trimmed)_:

```json
{
  "rawText": "I am planning a trip....",
  "date": "2026-09-15",
  "transportMode": "driving",
  "dayStart": "09:00",
  "dayEnd": "23:59",
  "scheduledStops": [
    {
      "stop": {
        "name": "Tower of London",
        "address": "Tower of London, London EC3N 4AB",
        "durationMinutes": 90,
        "place_id": "280066263",
        "location": { "lat": 51.508217, "lng": -0.0761879 }
      },
      "arrivalTime": "09:00",
      "departureTime": "10:30",
      "travelToNextMinutes": 13
    },
    {
      "stop": {
        "name": "Dishoom Covent Garden",
        "address": "12 Upper St Martin's Lane, London",
        "durationMinutes": 90,
        "fixedTimes": { "start": "12:30", "end": "14:00" },
        "place_id": "280031883",
        "location": { "lat": 51.5124271, "lng": -0.126856 }
      },
      "arrivalTime": "10:43",
      "departureTime": "14:00",
      "travelToNextMinutes": 5
    }
  ],
  "feasible": true,
  "summary": "# Your September 15th London Day Trip – All Set! ⚽ ... (natural-language, stop-by-stop day plan with buffer-time advice)"
}
```

## Architecture

The pipeline is five stages; each takes the trip object and hands it forward enriched:

```
rawText → parseTrip (Anthropic) → ParsedTrip → geocodeTrip (Nominatim) → GeocodedTrip
        → routeTrip (OSRM) → RoutableTrip → scheduleTrip (custom solver) → ScheduledTrip
        → narrateTrip (Anthropic) → NarratedTrip → saved to Postgres
```

**parseTrip** — the LLM parses free-form text into a list of stops plus general trip meta (date, transport mode, day start/end). It also normalizes vague times and durations and resolves vague references into clean, searchable names (_"the Spurs game"_ → _"Tottenham Hotspur Stadium"_).

**geocodeTrip** — takes those clean names and resolves each to precise coordinates via the Nominatim geocoding API.

**routeTrip** — feeds the coordinates to OSRM to build a travel-time matrix: real driving/walking/transit minutes between every pair of stops.

**scheduleTrip** — a custom solver that tries stop orderings against the matrix, honoring fixed-time anchors and the day window, and returns the best feasible schedule — or, if nothing fits, flags the trip infeasible and still returns the best achievable one.

**narrateTrip** — the LLM turns the solver's structured output into a readable, natural-language day plan, which is saved to Postgres along with the trip.

## Tech stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (Neon)
- **Testing:** Vitest + supertest
- **Deployment:** Render

## Key technical decisions

### 1. The read model: `json_agg` vs JOIN + reshape

`GET /api/trips/:id` must return one trip object with a nested `scheduledStops` array, but SQL only returns flat rows. A JOIN gives back a "rectangle" — one row per stop, with the trip's columns repeated on every row — which then has to be collapsed in JavaScript (read the trip fields once from `rows[0]`, loop the rows to build the stops array). I built that version, and also a version where Postgres does the collapsing itself with `json_agg`. I shipped `json_agg`, because the two aren't behaviorally equivalent: an INNER JOIN returns zero rows for a stopless trip, making it indistinguishable from a trip that doesn't exist, while `json_agg` with `COALESCE(..., '[]')` keeps "does the trip exist?" and "does it have stops?" as separate questions — a stopless trip correctly returns the trip with an empty array. The tradeoff is denser SQL, which I accepted; a test pins the empty-array behavior.

### 2. Ownership responses: 404 over 403

When user B requests a trip owned by user A, B is fully authenticated — the token is valid — so the semantically "correct" status is 403 Forbidden. But a 403 confirms the resource exists, which enables enumeration: an attacker probing random ids learns which ones are real. I return 404 instead, making "not yours" and "doesn't exist" indistinguishable from outside (the same choice GitHub makes for private repos). The mechanism is that there's no ownership `if`-check to forget: every query is scoped by the authenticated user's id (`WHERE id = $1 AND user_id = $2`), so a non-owned row simply never matches, and the ordinary not-found path returns the 404.

### 3. The parallel-test race: `fileParallelism: false`

Every test passed when its file ran alone, but running the full suite produced five failures. The cause: Vitest runs test _files_ in parallel workers, and both files share one test database — so one file's `TRUNCATE` wiped users mid-test in the other, and both files registering the same test email collided (409 → no token → cascading 401s). Classic race condition: shared mutable state plus parallel workers. The fix is `fileParallelism: false` in the Vitest config, which runs the files sequentially. The tradeoff is a slightly slower suite — the right price at this scale; per-worker databases would be the scaling solution.

## Testing

23 integration tests across two files (`auth.test.ts`, `trips.test.ts`), written with Vitest + supertest and run against a real, separate Postgres test database — selected by a `NODE_ENV` switch in the db module, so the suite can truncate tables freely with zero risk to production.

The auth suite covers registration (success with a DB-level check, duplicate email → 409, case-insensitive duplicate → 409, lowercase normalization, missing fields → 400) and login (success → 200 + token, wrong password and unknown email both → 401 with the identical generic message, so responses can't be used to enumerate accounts).

The trips suite seeds data directly with SQL rather than calling `POST /api/trips`, because these tests target the route layer — auth guarding, ownership, status codes — and invoking the real pipeline would add ~30 seconds per test, spend API credits, and couple the suite to three external services. What the tests prove: every route rejects missing and invalid tokens (401); users can only ever see their own trips (two-user tests assert another user's trip is absent from lists and returns 404 by id); deletes are verified at the database level (a non-owner's delete leaves the row in place, an owner's delete removes it); and the `json_agg` read model returns nested, ordered stops — including an empty array for a stopless trip.

Test files share one database, so file-level parallelism is disabled in the Vitest config (`fileParallelism: false`) — every test passed in isolation, and only the full-suite run exposed the race.

Run them:

```bash
npm run test:run
```

## Running locally

Prerequisites: Node 18+, and a PostgreSQL database (Neon free tier or local Postgres).

```bash
git clone https://github.com/jamesvk/day-planner.git
cd day-planner/backend
npm install
```

Create `backend/.env` with:

```
DATABASE_URL=        # your Postgres connection string
TEST_DATABASE_URL=   # a separate, empty database for the test suite
JWT_SECRET=          # any long random string
ANTHROPIC_API_KEY=   # for the parse and narrate stages
```

_(Nominatim and OSRM are public services — no keys required.)_

Apply the schema to your database by running `src/db/schema.sql` (e.g. in the Neon SQL editor), then:

```bash
npm run dev        # dev server on :3000
npm run test:run   # test suite (needs TEST_DATABASE_URL, with the schema applied there too)
```

## Known limitations

**Malformed trip ids return 500 instead of 400.** `GET /api/trips/not-a-uuid` produces a 500: Postgres throws when casting the string to the `uuid` column type — before any row matching happens — and the catch block reports it as a server error. The fix is validating the id format in the route (or a small middleware) and returning 400 for garbage ids. Deferred for v1 because the frontend only ever sends real UUIDs; the case is reachable only by manual probing.

**Free-tier cold start.** The API runs on Render's free tier, which spins the service down after ~15 idle minutes; the first request after a nap can take 30–60 seconds while it wakes. Fix: a paid instance or an external keep-alive ping. Accepted as the economics of a portfolio deployment.

**JWTs can't be truly revoked.** Auth is stateless: logout just deletes the token client-side, so an issued token remains technically valid until it expires. A real revocation story needs server-side state — a token blocklist or short-lived access tokens with refresh rotation — which trades away the simplicity that makes stateless JWTs attractive. Documented as a deliberate tradeoff rather than patched.

**Database-failure paths are untested.** Every route has a catch that returns 500, but no test forces `pool.query` to throw — that would require mocking the pool, which I judged disproportionate for a v1 integration suite that covers everything reachable through the API. I'd add it via dependency injection on the pool if the error handling ever grew real logic.

## Roadmap

- **React frontend** _(in progress)_ — trip list, trip detail, and a create flow with progress feedback for the ~30s planning pipeline
- **Smarter time optimization** — v1 anchors the schedule at the day's start even when that creates idle gaps before fixed-time stops; v2 will shift the day's start/end within the user's window to minimize waiting, optimizing for a _tight_ day, not just a feasible one
- **Map integration** — a map view of the route, with deep links to Google/Apple Maps for each stop and leg
- **Trip editing via re-planning** — trips are immutable in v1 by design (edit = delete + re-plan); a proper edit flow would re-run the pipeline against modified stops
- **UUID validation** — return 400 for malformed trip ids instead of the current 500 (see Known limitations)
- **POST happy-path tests** — with a mocked pipeline, closing the deliberately-skipped coverage
