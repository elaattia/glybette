# Glybette Client

Frontend client for Glybette built with React + Vite.

## Auth flow

This app uses Better Auth browser sessions with Google sign-in:

- `GET/POST /api/auth/*` for OAuth/session endpoints
- `GET /api/users/me` for authenticated profile fetch
- cookie-based auth (`credentials: "include"`) for protected requests

Routes:

- `/login` - dedicated login page
- `/auth/callback` - OAuth callback completion
- `/dashboard` - auth-protected test page

## Environment variables

- `VITE_API_BASE_URL` (optional): absolute API base URL.  
  If omitted, requests use same-origin `/api/*`.
- `VITE_API_PROXY_TARGET` (optional, dev server): target for Vite `/api` proxy (default `http://localhost:3000`).

## Development

```bash
pnpm --filter @glybette/client dev
```

The Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET`, so local auth cookies work against the gateway without CORS setup.
