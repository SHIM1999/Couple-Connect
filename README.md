# Couple Connect

Couple Connect is a shared planning app for couples. It combines a React/Vite mobile-first frontend with an Express REST API, PostgreSQL persistence through Drizzle ORM, and an OpenAPI-driven contract that generates both server-side Zod schemas and frontend React Query hooks.

The app includes shared spaces for calendar events, todos, goals, wishlist items, bucket list plans, profile settings, invite links, language switching, and a happiness gauge.

## Tech Stack

- **Monorepo:** pnpm workspaces
- **Frontend:** React 19, Vite, Wouter, TanStack Query, Tailwind CSS, Radix UI, lucide-react
- **Backend:** Express 5, Pino, Zod validation
- **Database:** PostgreSQL, Drizzle ORM, drizzle-zod
- **API contract:** OpenAPI 3.1 + Orval code generation
- **Deployment:** Firebase Hosting for the frontend, Render for the API server

## Repository Layout

```text
artifacts/
  api-server/        Express REST API
  couple-space/      Production React/Vite SPA
  mockup-sandbox/    Replit component preview sandbox

lib/
  api-spec/          OpenAPI source of truth
  api-zod/           Generated Zod schemas for the API server
  api-client-react/  Generated React Query API client
  db/                Drizzle schema, database client, migrations

scripts/             Workspace utility scripts
attached_assets/     Imported design/reference assets
```

## Prerequisites

- Node.js compatible with the workspace dependencies
- pnpm `11.1.2`
- PostgreSQL database
- Firebase CLI, only for frontend deployment

Install dependencies:

```bash
pnpm install
```

## Environment Variables

API server:

```bash
DATABASE_URL=postgres://user:password@host:5432/database
PORT=5000
```

Frontend production build:

```bash
VITE_API_BASE_URL=https://your-api-service.onrender.com
```

In local development, the frontend uses relative `/api/...` paths by default. If the API is on a different origin, set `VITE_API_BASE_URL`.

## Development

Run the API server:

```bash
PORT=5000 DATABASE_URL=postgres://user:password@host:5432/database pnpm --filter @workspace/api-server run dev
```

Run the frontend:

```bash
pnpm --filter @workspace/couple-space run dev
```

The frontend defaults to port `5173`. The API server is typically run on port `5000`.

## Common Commands

```bash
# Typecheck every package
pnpm run typecheck

# Build all packages
pnpm run build

# Build only the frontend
pnpm --filter @workspace/couple-space run build

# Preview the built frontend
pnpm --filter @workspace/couple-space run serve

# Regenerate API schemas and client hooks from OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Push Drizzle schema changes to the development database
pnpm --filter @workspace/db run push

# Deploy frontend to Firebase Hosting
firebase deploy --only hosting
```

## API Contract Workflow

`lib/api-spec/openapi.yaml` is the source of truth for the backend contract.

When you change the API:

1. Update `lib/api-spec/openapi.yaml`.
2. Run:

   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```

3. Use generated Zod schemas from `@workspace/api-zod` in API routes.
4. Use generated React Query hooks from `@workspace/api-client-react` in the frontend.

Keep the OpenAPI title as `Api`. Orval uses that title when generating output paths, and changing it breaks imports.

## API Server Notes

All API routes are mounted under `/api`.

Available areas:

- `GET /api/healthz`
- Profile and partner status
- Todos
- Goals
- Wishlist
- Bucket list
- Calendar events
- Dashboard summary
- Happiness gauge

Most data routes require the `X-Couple-Code` header. The frontend creates or adopts a couple code in local storage and sends it with API requests. Invite links use `?c=<code>` so a partner can join the same shared space.

Drizzle returns JavaScript `Date` objects, so API rows should be passed through `serializeRow()` before being returned as JSON.

## Frontend Notes

The production app lives in `artifacts/couple-space`.

Routes:

- `/` home dashboard
- `/calendar`
- `/todos`
- `/goals`
- `/wishlist`
- `/bucketlist`
- `/settings`
- `/more`

The app uses:

- `wouter` for routing
- `@tanstack/react-query` for server state
- `AppLayout` and `BottomNav` for the mobile navigation shell
- `artifacts/couple-space/src/lib/i18n.tsx` for English and Korean strings
- `@/` as an alias for `artifacts/couple-space/src`
- `@assets/` as an alias for `attached_assets`

When adding visible text, add both English and Korean translations.

## Database

Database schema lives in `lib/db/src/schema`.

Current tables:

- `couple_profile`
- `todos`
- `goals`
- `wishlist`
- `bucketlist`
- `events`

Push schema changes during development with:

```bash
pnpm --filter @workspace/db run push
```

## Deployment

Frontend deployment is configured in `firebase.json`. Firebase Hosting serves:

```text
artifacts/couple-space/dist/public
```

Backend deployment is configured in `render.yaml`. The Render service needs:

```bash
DATABASE_URL=...
PORT=...
```

For production frontend builds that call a separately hosted backend, set:

```bash
VITE_API_BASE_URL=https://your-api-service.onrender.com
```

Then build and deploy:

```bash
pnpm --filter @workspace/couple-space run build
firebase deploy --only hosting
```

## Mockup Sandbox

`artifacts/mockup-sandbox` is a development-only Replit canvas preview tool. It is not the deployed Couple Connect app.

