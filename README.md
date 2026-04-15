# Glybette

pnpm monorepo with apps (client, api-gateway, users-service) and shared packages (types, env, utils). Database: MongoDB Atlas (connection string via env).

## Structure

- **apps/client** – Vite React app
- **apps/api-gateway** – Hono API gateway (routes under `/api`, health, CORS, proxy to users-service)
- **apps/users-service** – Hono users service
- **packages/contracts** – Shared contracts
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

- **API gateway:** `PORT` (default 3000), `USERS_SERVICE_URL` (optional, for proxying to users-service), `JWT_SECRET` (optional; falls back to `BETTER_AUTH_SECRET` for validating tokens on protected routes).
- **Users service:** `PORT` (default 3000; set to 3001 when running alongside the gateway), `MONGODB_URI` (required; MongoDB Atlas connection string), `USERS_SERVICE_MONGODB_DB_NAME` (optional; defaults to `glybette_users` so the service does not fall back to Mongo's `test` database), `BETTER_AUTH_SECRET` (min 32 chars; used by better-auth), `BETTER_AUTH_URL` (base URL of the gateway, e.g. `http://localhost:3000`, for OAuth callbacks). For OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (each provider optional).

Create a `.env` in the repo root (or per app). For Docker, set `MONGODB_URI` for any service that uses the database (e.g. users-service). Keep `.env` out of version control.

Example `.env`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
USERS_SERVICE_MONGODB_DB_NAME=glybette_users
BETTER_AUTH_SECRET=your-32-char-minimum-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
USERS_SERVICE_URL=http://localhost:3001
# OAuth (optional): GOOGLE_*, GITHUB_*, LINKEDIN_* client IDs and secrets
```

## Docker

```bash
pnpm docker:up   # docker compose up -d
pnpm docker:down  # docker compose down
```

Build context is the monorepo root. Compose runs api-gateway (port 3000) and users-service (port 3001). Pass `MONGODB_URI` via `.env` or host environment for services that need Atlas.
