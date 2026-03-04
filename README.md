# Glybette

pnpm monorepo with apps (client, api-gateway, users-service) and shared packages (types, env, utils). Database: MongoDB Atlas (connection string via env).

## Structure

- **apps/client** – Vite React app
- **apps/api-gateway** – Hono API gateway (routes under `/api`, health, CORS, proxy to users-service)
- **apps/users-service** – Hono users service
- **packages/types** – Shared types
- **packages/env** – Config and schema validation (Zod)
- **packages/utils** – Shared utilities

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Runs all workspace `dev` scripts in parallel. Run apps on different ports (e.g. client 5173, api-gateway 3000, users-service 3001) by setting `PORT` in each app’s env.

## Environment

- **API gateway:** `PORT` (default 3000), `USERS_SERVICE_URL` (optional, for proxying to users-service).
- **Users service:** `PORT` (default 3000; set to 3001 when running alongside the gateway), `MONGODB_URI` (required when using DB; MongoDB Atlas connection string).

Create a `.env` in the repo root (or per app). For Docker, set `MONGODB_URI` for any service that uses the database (e.g. users-service). Keep `.env` out of version control.

Example `.env`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

## Docker

```bash
pnpm docker:up   # docker compose up -d
pnpm docker:down  # docker compose down
```

Build context is the monorepo root. Compose runs api-gateway (port 3000) and users-service (port 3001). Pass `MONGODB_URI` via `.env` or host environment for services that need Atlas.
