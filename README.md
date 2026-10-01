# Day Planner

AI-powered day-trip planner: describe your day in plain English, get back a scheduled, routed itinerary.

**Live demo:** https://day-planner-theta-ochre.vercel.app
_(The API runs on Render's free tier — the first request after idle can take ~30 seconds to wake up.)_

## What it does

Day Planner turns a list of places you want to visit into a complete, scheduled day. It finds each location, calculates drive times between them, and works out an order and timetable that fits your day and any fixed commitments. You get back a saved itinerary with arrival and departure times for every stop and a short written summary of the plan.

## Repo layout

| Folder | What's in it |
| --- | --- |
| [`backend/`](./backend) | Node + Express + TypeScript API: the five-stage AI pipeline, JWT auth, PostgreSQL persistence, Vitest test suite |
| [`frontend/`](./frontend) | React + Vite + TypeScript client: auth, trip list, trip detail, create-trip flow |

## Architecture

```
React (Vercel)  ──HTTPS + Bearer JWT──►  Express API (Render)  ──►  PostgreSQL (Neon)
                                               │
                                               ▼
                         parse → geocode → route → schedule → narrate
                       (Claude)  (Nominatim)  (OSRM)  (solver)  (Claude)
```

### The pipeline

1. **Parse** — Claude turns free text into structured JSON (city, date, day window, stops, fixed times). Output is validated at the boundary; unparseable output becomes a `400` asking the user to rephrase.
2. **Geocode** — Nominatim (OpenStreetMap) resolves each stop, biased toward the trip's city, with an address-only fallback and a distance sanity check.
3. **Route** — OSRM computes drive times between every pair of stops.
4. **Schedule** — a deterministic solver tries every stop order and scores each one on travel time, idle time, and how far it strays from the order the user wrote. It prefers schedules that fit the day and fixed commitments.
5. **Narrate** — Claude writes a short readable summary of the final schedule.

Only the first and last stages use an LLM. Everything that has to be correct — coordinates, travel times, the schedule — is computed in code.

## Tech stack

**Backend:** Node, Express, TypeScript (ESM), PostgreSQL (`pg`), bcryptjs, jsonwebtoken, Anthropic SDK, Vitest + supertest
**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Context API
**Infra:** Vercel (frontend), Render (API), Neon (Postgres)

## API

All trip routes require `Authorization: Bearer <token>` and are scoped to the logged-in user.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account (logs you in) |
| `POST` | `/api/auth/login` | Log in, returns an access token |
| `POST` | `/api/trips` | Run the pipeline and save the trip → `201` with the new id |
| `GET` | `/api/trips` | List your trips (summary view with stop count) |
| `GET` | `/api/trips/:id` | Full trip with all stops |
| `DELETE` | `/api/trips/:id` | Delete a trip → `204` |

## Design decisions

- **Trips are immutable.** A trip is the output of a pipeline run, so there's no `UPDATE` route — re-plan instead of editing.
- **Ownership on every query.** Every trip query filters on `user_id`. Another user's trip returns `404`, not `403`, so the API never confirms a trip exists.
- **Auth checks the user still exists.** The auth middleware verifies the JWT *and* confirms the user is still in the database, so deleting a user invalidates their tokens.
- **Enforce invariants in code, not prompts.** Rules the LLM didn't reliably follow (like widening the day window to fit fixed commitments) are enforced deterministically after the parse.
- **User errors vs. server errors.** A custom `ValidationError` lets the controller tell bad input (`400`) apart from failures on our side (`500`).
- **Atomic saves.** A trip and its stops are written in one transaction, so a failed save never leaves half a trip.
- **Nominatim over Google Places.** Free with no billing account for a public demo. The tradeoff is thinner coverage of small businesses, handled with city bias and fallbacks. Geocoding is isolated in its own stage, so the provider can be swapped.
- **Token in localStorage.** The frontend and API live on different domains, so an auth cookie would be third-party. The token is sent as a Bearer header.

## Testing

Vitest + supertest run against a separate Neon test database: auth flows, ownership scoping, deleted-user tokens, and the trip routes. External services (Claude API, Nominatim) are mocked at their boundaries so tests are fast and deterministic. Test files run serially because they share one database.

```bash
cd backend
npm test
```

## Running locally

```bash
# Backend
cd backend
npm install
cp .env.example .env    # DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm run dev

# Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev
```

The schema lives in `db/schema.sql` and is the single source of truth — apply it to each database rather than editing a live database by hand.

## Known limitations & roadmap

- **Driving only** — routing uses OSRM's driving profile; walking and transit aren't supported yet.
- **No CI yet** — the test suite runs locally; a GitHub Action to run it on every PR is next.
- **Schema changes are manual** — `schema.sql` is applied by hand; numbered migrations will come once there's real user data.
- **Malformed trip ids** return `500` instead of `400`.
- **Cold starts** on Render's free tier.
- **Planned:** map links for each stop, filtering past trips, structured input fields alongside free text.
