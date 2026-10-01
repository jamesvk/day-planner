# Day Planner — Frontend

React client for [Day Planner](../README.md). Users sign up, enter the places they want to visit, and get back a saved, scheduled itinerary from the backend pipeline.

**Live:** https://day-planner-theta-ochre.vercel.app

## Tech stack

React · Vite · TypeScript · Tailwind CSS · React Router · Context API

## Pages

| Page | What it does |
| --- | --- |
| **Register / Login** | Create an account or sign in. Registering logs you in automatically. |
| **Trip List** | All of your saved trips, with the date, city, and number of stops. |
| **Trip Detail** | One trip's full schedule: each stop with its arrival and departure times, plus the written summary. |
| **Create Trip** | Enter your stops and run the planner. Redirects to the new trip when it's saved. |

Every page except Login and Register sits behind a `ProtectedRoute`, which sends logged-out users to the login page.

## How it's built

- **API layer.** One `apiFetch` wrapper handles the base URL, JSON, the auth header, and error responses. Small modules (`auth.ts`, `trips.ts`) sit on top of it with one function per endpoint. The API layer is pure: it makes requests and returns data, and doesn't touch storage or React state.
- **Wire types.** TypeScript types mirror exactly what each endpoint returns. Dates arrive as strings (JSON has no Date type) and are only turned into dates for display.
- **Auth state.** `AuthContext` owns the token. It stores it in localStorage, exposes login, register, and logout, and makes the logged-in state available to every page.
- **Token storage.** The frontend (Vercel) and API (Render) are on different domains, so an auth cookie would be third-party. The token is kept in localStorage and sent as a `Bearer` header.
- **Data loading.** Pages fetch in `useEffect` and render explicit loading, error, and empty states before the main content.
- **Forms.** Controlled inputs, so React state is the single source of truth for what the user has typed.

## Running locally

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

The backend needs to be running too. See [`backend/`](../backend).

> `VITE_*` variables are baked into the built bundle and are public. Never put secrets in them.

## Deployment

Deployed on Vercel with the root directory set to `frontend`. `VITE_API_URL` is set in Vercel's environment settings and points at the Render API. A rewrite rule sends every route to `index.html` so client-side routes survive a page refresh.

## Roadmap

- Map links for each stop
- Filtering past trips
- Handle Render cold starts more gracefully (the first request after idle can take ~30 seconds)
