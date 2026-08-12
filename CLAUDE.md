# CLAUDE.md

## Project

Monorepo: `backend/` (Express + TypeScript API — COMPLETE; do not modify without being explicitly asked) and `frontend/` (React app — in progress).

## Division of labor (non-negotiable)

Claude Code handles ONLY: scaffolding, config files, folder structure, dependency setup, routing shells, and repetitive presentational JSX.
Claude Code must NEVER implement: authentication logic, state management, API client code, form handlers, data fetching, or any business logic. For these, generate empty components/functions with `// TODO(James)` stubs and stop.
The developer (James) writes all core logic himself — this is a deliberate learning constraint, not an oversight.

## Frontend conventions

- Vite + React + TypeScript, Tailwind CSS, react-router, Context API (no Redux)
- Functional components only; files in `src/pages`, `src/components`, `src/context`, `src/api`
- Auth: JWT stored in localStorage, sent as `Authorization: Bearer <token>`
- API base URL from `VITE_API_URL` env var (dev: http://localhost:3000)

## Backend notes (read-only context)

- ESM TypeScript: imports use `.js` extensions
- Tests are Vitest + supertest in `backend/tests` — never modify tests
- Run: `npm run dev` (backend), `npm run test:run`
