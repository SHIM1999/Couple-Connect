# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Run the frontend (couple-space) locally — defaults to port 5173
pnpm --filter @workspace/couple-space run dev

# Build the frontend for deployment
pnpm --filter @workspace/couple-space run build

# Typecheck all packages
pnpm run typecheck

# Build everything (typecheck + esbuild)
pnpm run build

# Regenerate Zod schemas and React Query hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes to Postgres (dev only)
pnpm --filter @workspace/db run push

# Deploy frontend to Firebase Hosting
firebase deploy --only hosting
```

Required env for API server: `DATABASE_URL` (Postgres connection string).
Required env for frontend production build: `VITE_API_BASE_URL` (deployed backend URL, e.g. `https://your-app.onrender.com`).

## Architecture

This is a pnpm monorepo for a couples shared planning app. The workspace is split into `artifacts/` (runnable apps) and `lib/` (shared packages).

### Packages

| Package | Path | Role |
|---|---|---|
| `@workspace/couple-space` | `artifacts/couple-space` | React/Vite SPA — the real frontend app |
| `@workspace/api-server` | `artifacts/api-server` | Express 5 REST API |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox` | Replit canvas component preview tool (dev only) |
| `@workspace/db` | `lib/db` | Drizzle ORM schema + Postgres pool |
| `@workspace/api-zod` | `lib/api-zod` | Zod validation schemas (generated) |
| `@workspace/api-client-react` | `lib/api-client-react` | React Query hooks (generated) |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI YAML — source of truth for the API contract |

### API contract flow

`lib/api-spec/openapi.yaml` is the single source of truth. Running codegen (Orval) generates both `lib/api-zod/src/generated/` (Zod schemas used by the server) and `lib/api-client-react/src/generated/` (React Query hooks for the frontend). After editing `openapi.yaml`, always run codegen.

The OpenAPI title must stay `"Api"` — Orval uses it to name the generated output files; changing it breaks import paths.

### API server patterns

- All routes import Zod schemas from `@workspace/api-zod` to validate request bodies and serialize responses.
- `Date` values from Drizzle rows must be passed through `serializeRow()` (`artifacts/api-server/src/lib/serialize.ts`) before `res.json()`, because Drizzle returns JS `Date` objects which won't round-trip cleanly through JSON otherwise.
- The `couple_profile` table is a singleton — every route that reads/writes it calls `ensureProfile()` (defined in `profile.ts`) which creates the row if it doesn't exist.

### DB schema

Tables live in `lib/db/src/schema/`: `couple_profile`, `todos`, `goals`, `wishlist`, `bucketlist`, `events`. Each schema file uses `drizzle-zod`'s `createInsertSchema` to derive insert types.

### Happiness gauge logic

Partner happiness values are stored as a number + timestamp in `couple_profile`. The value decays to 0 by midnight of the day it was set. The current value is computed at read time in `artifacts/api-server/src/routes/happiness.ts` via `computeCurrentValue()` — nothing is stored on each read.

### Frontend app (couple-space)

Full SPA at `artifacts/couple-space/`. Routes: `/` (Home), `/calendar`, `/todos`, `/goals`, `/wishlist`, `/bucketlist`, `/settings`, `/more`. Router: wouter. Layout: fixed bottom nav via `AppLayout` + `BottomNav`.

The frontend calls the API at `/api/...` relative paths by default. In production (different domain), set `VITE_API_BASE_URL` to the backend URL before building — `main.tsx` calls `setBaseUrl()` with it. The `setBaseUrl` function is exported from `@workspace/api-client-react`.

i18n: `artifacts/couple-space/src/lib/i18n.tsx` — all strings are keyed in `en`/`ko` objects; add new strings to both. Import alias `@/` maps to `artifacts/couple-space/src/`, `@assets/` maps to `attached_assets/`.

**Deployment:** `firebase.json` points Firebase Hosting at `artifacts/couple-space/dist/public`. `render.yaml` configures the Render.com backend service. The Replit plugins (`@replit/vite-plugin-*`) only activate when `REPL_ID` env var is present, so local and production builds are clean.

### Mockup sandbox

`artifacts/mockup-sandbox/` is a Replit canvas tool for component previewing only — not the production app.
