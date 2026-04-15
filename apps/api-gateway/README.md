# API Gateway

Entry: `src/index.ts` loads env, builds the app, and starts the server.

## Layout

- `src/app.ts` — Hono app, global middleware, `/api` mount
- `src/config/` — `env.ts` (Zod), `services.ts` (upstream registry)
- `src/middleware/` — CORS, request id, logging, `onError` handler
- `src/auth/` — JWT gate for routes that need internal auth headers
- `src/proxy/` — sanitized forward + timeout + streaming body
- `src/routes/` — health + `service-routes.ts`; per-service modules under `routes/services/`
- `src/platform/hooks.ts` — optional `registerGatewayHooks` for metrics/tracing later

## Run

```bash
pnpm install
pnpm --filter @glybette/api-gateway dev
```

Gateway listens on `PORT_API_GATEWAY` (default `3000`).

## Env (high level)

Uses `@glybette/env` base fields plus gateway-specific options in `src/config/env.ts` (e.g. `USERS_SERVICE_URL`, `JWT_SECRET`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS`, `PROXY_TIMEOUT_MS`).
