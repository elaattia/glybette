# Glybette Deployment (VPS + Jenkins Pipeline)

This guide is a deploy runbook for this repository with an automated Jenkins pipeline, plus routing verification for:

- `https://username.glybette.com`
- `https://glybette.com/user/username`

It aligns with `docs/portfolio-routing.md` and is backed by current code behavior.

## 1) Routing behavior evidence from the codebase

Before deploying, confirm what the code already does:

- Client supports both public routes:
  - `/user/:slug` route exists in `apps/client/src/App.tsx`.
  - `/` renders `PortfolioRoot`, which detects subdomain slug and renders public portfolio when host is `*.{root}` in `apps/client/src/pages/portfolio/PortfolioRoot.tsx`.
- Client root domain is configurable:
  - `VITE_PORTFOLIO_ROOT_DOMAIN` is read in `apps/client/src/lib/env.ts`.
- Public portfolio API endpoints exist:
  - `GET /portfolio/public/:slug` and `GET /portfolio/public/resolve` in `apps/portfolio-service/src/routes/portfolio.routes.ts`.
- Hostname-based slug extraction exists in backend:
  - `extractSlugFromHost(host, rootDomain)` in `apps/portfolio-service/src/services/portfolio.validation.ts`.
  - `resolvePublic()` reads `x-forwarded-host` first, then `host` in `apps/portfolio-service/src/controllers/portfolio.controller.ts`.
- API gateway proxies `/api/portfolio/*` to portfolio-service:
  - Proxy route `mount: "/portfolio"` in `apps/api-gateway/src/config/proxy-routes.ts`.
  - Forwarding sanitizes hop-by-hop headers and keeps `x-forwarded-host` in `packages/utils/src/proxy-headers.ts`.

`docs/portfolio-routing.md` is consistent with this and correctly calls out `X-Forwarded-Host`.

## 2) Target production topology

- **VPS** runs:
  - Jenkins
  - Docker Engine + Compose
  - Host Nginx + Certbot (TLS termination)
  - Glybette services via `docker-compose.yml` (includes production `client` container)
- **Database**: MongoDB Atlas via `MONGODB_URI` (no local `mongodb` container in prod compose)
- **DNS** points:
  - `glybette.com` -> VPS IP
  - `www.glybette.com` -> VPS IP
  - `*.glybette.com` -> VPS IP
- **TLS** includes apex + wildcard cert (`glybette.com`, `*.glybette.com`) via Certbot DNS-01

## 3) One-time VPS setup

## 3.1 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 3.2 Install Jenkins (Docker — recommended on shared VPS)

Port `8080` is often taken by other stacks on a shared host. Run Jenkins in Docker on **18080** instead of apt/systemd.

If you previously installed apt Jenkins, remove it first:

```bash
sudo bash deploy/jenkins/uninstall-apt-jenkins.sh
```

Start Jenkins:

```bash
cd /home/glybette/Glybette
docker compose -p jenkins -f deploy/jenkins/docker-compose.yml up -d --build
docker exec jenkins-glybette cat /var/jenkins_home/secrets/initialAdminPassword
```

The image includes Node 22 + pnpm for `pnpm docker:env:check:prod` in the pipeline. The container mounts the Docker socket and `/home/glybette/Glybette` (compose project `glybette` for deploys).

## 3.3 App directory

Production app path: `/home/glybette/Glybette` (see `APP_DIR` in `Jenkinsfile`). No separate `/opt/glybette` required.

## 3.4 Node.js + pnpm

Bundled in `deploy/jenkins/Dockerfile`. Host Node/pnpm is optional if you only use Docker Jenkins.

## 3.5 Configure GitHub webhook (auto-deploy on `main`)

1. In Jenkins: install **GitHub** / **GitHub Integration** plugin.
2. Create a **Pipeline** job pointing at repo root `Jenkinsfile`.
3. In GitHub repo settings -> Webhooks -> Add webhook:
   - Payload URL: `http://<vps-ip>:18080/github-webhook/`
   - Content type: `application/json`
   - Events: **Just the push event**
4. Restrict Jenkins UI (`18080`) to your IP or VPN where possible.
5. Open firewall ports: `22`, `80`, `443` (and `18080` for GitHub webhooks).

## 4) Production env file

Copy [`.env.production.example`](.env.production.example) as a starting point, then store the filled file in Jenkins credentials (Secret file `glybette-env-prod`).

Validate locally before first deploy:

```bash
cp .env.production.example .env
# fill secrets...
pnpm docker:env:check:prod
```

At minimum, include values required by compose + routing:

```env
NODE_ENV=production

MONGODB_URI=mongodb+srv://...
INTERNAL_SERVICE_SECRET=... # one shared strong secret

PORTFOLIO_PUBLIC_ROOT_DOMAIN=glybette.com
VITE_PORTFOLIO_ROOT_DOMAIN=glybette.com
VITE_API_BASE_URL=

AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

EMAIL_PROVIDER=resend
RESEND_API_KEY=...
EMAIL_FROM=no-reply@glybette.com

CORS_ORIGINS=https://glybette.com,https://www.glybette.com
BETTER_AUTH_TRUSTED_ORIGINS=https://glybette.com,https://www.glybette.com
BETTER_AUTH_URL=https://glybette.com/api/auth
```

Note: enumerate exact HTTPS origins in `CORS_ORIGINS` (wildcard subdomain CORS is not guaranteed).

## 5) Host Nginx + TLS (critical for portfolio routing)

Use the committed template [`deploy/nginx/glybette.conf`](deploy/nginx/glybette.conf):

```bash
sudo cp deploy/nginx/glybette.conf /etc/nginx/sites-available/glybette
sudo ln -sf /etc/nginx/sites-available/glybette /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The config proxies:

- `/` -> `127.0.0.1:15173` (production `client` container: Vite build + nginx on host port 15173)
- `/api/` -> `127.0.0.1:13000` (api-gateway on host port 13000)
- Sets `X-Forwarded-Host` (required for `username.glybette.com` portfolio resolve)
- Sets `client_max_body_size 10m` for project cover uploads

### 5.1 TLS with Certbot

**Apex + www** can use HTTP-01:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d glybette.com -d www.glybette.com
```

**Wildcard `*.glybette.com`** requires **DNS-01** (HTTP-01 cannot issue wildcard certs):

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d glybette.com -d '*.glybette.com'
```

Certbot will prompt for a `_acme-challenge` TXT record. Add it at your DNS provider, wait for propagation, then complete issuance.

After certificate paths are known, uncomment/update `ssl_certificate` directives in `deploy/nginx/glybette.conf` and reload Nginx.

Renewal:

```bash
sudo certbot renew --dry-run
```

## 6) Jenkins pipeline flow

The repo includes [`Jenkinsfile`](Jenkinsfile). Pipeline stages:

1. Checkout `main` into `/opt/glybette`
2. Inject production `.env` from Jenkins credential `glybette-env-prod`
3. Validate env (`pnpm docker:env:check:prod`)
4. Deploy (`docker compose up -d --build`)
5. Smoke-test health + portfolio API resolve

Jenkins setup:

1. Create credentials:
   - `glybette-git` — SSH deploy key for the repo
   - `glybette-env-prod` — secret file (production `.env`)
2. Create Pipeline job from SCM using root `Jenkinsfile`.
3. Update `REPO_URL` in `Jenkinsfile` to your GitHub SSH URL.
4. Set `PORTFOLIO_SMOKE_SLUG` build parameter to a real portfolio slug.

Smoke tests run against compose ports on localhost (before/without host Nginx):

```bash
curl -fsS http://127.0.0.1:13000/api/health
curl -fsS http://127.0.0.1:13007/health
curl -fsS http://127.0.0.1:13003/health
curl -fsS http://127.0.0.1:13008/health
curl -fsS -H "Host: glybette.com" http://127.0.0.1:15173/ -o /dev/null
curl -fsS "http://127.0.0.1:13000/api/portfolio/public/resolve?slug=<slug>"
```

## 7) Verification checklist after each deploy

Replace `demo` with a real existing portfolio slug.

1. `https://glybette.com/user/demo` loads portfolio.
2. `https://demo.glybette.com` loads the same portfolio.
3. `https://demo.glybette.com/api/portfolio/public/resolve?slug=demo` returns portfolio JSON.
4. `https://glybette.com/api/health` returns gateway health JSON.

If (2) fails but (1) works, check in order:

- DNS wildcard `*.glybette.com`
- TLS certificate includes wildcard SAN
- Nginx `server_name *.glybette.com`
- `X-Forwarded-Host` header forwarding
- `.env` values:
  - `PORTFOLIO_PUBLIC_ROOT_DOMAIN=glybette.com`
  - `VITE_PORTFOLIO_ROOT_DOMAIN=glybette.com`

## 8) Optional rollback pattern

Use image tags per commit SHA and deploy by tag:

- Build/tag images with `:${GIT_COMMIT}`
- Keep previous successful SHA in Jenkins
- Roll back by re-running `docker compose` with previous tag env

For now, this repo can also roll back by checking out the previous commit in `/opt/glybette` then running:

```bash
docker compose up -d --build
```

## 9) AI deployment strategy (important)

The AI layer uses a provider adapter in `ai-service`. Select the active provider with `AI_PROVIDER`.

Supported providers:

- `gemini` — recommended for production (no local model runtime required)
- `ollama` — recommended for local development fallback

### 9.1 Production config (Gemini)

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
```

### 9.2 Local dev config (Ollama fallback)

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
```

Linux Docker note for Ollama on host:

- add `extra_hosts: ["host.docker.internal:host-gateway"]` for `ai-service`, or
- set `OLLAMA_BASE_URL=http://host.docker.internal:11434`

### 9.3 AI checks to add in pipeline

Add these smoke checks after deploy:

```bash
curl -fsS http://127.0.0.1:13007/health
```

Expected behavior:

- If provider is reachable: health should be `status: "ok"` with `upstream: "connected"`.
- If unreachable: ai-service returns degraded/503 with `upstream: "unreachable"`.

### 9.4 Operational recommendations

- Monitor AI latency and API quota/cost when using Gemini.
- Keep Ollama model pulls in local dev runbooks only.

## 10) Email deployment (notifications-service)

Email is sent by `notifications-service`, with provider selection in env.

Code evidence:

- `apps/notifications-service/src/config/env.ts` supports `EMAIL_PROVIDER=mock|resend`.
- `apps/notifications-service/src/index.ts` enforces `RESEND_API_KEY` when `EMAIL_PROVIDER=resend`.

### 10.1 Production config

Use Resend in production:

```env
EMAIL_PROVIDER=resend
EMAIL_FROM=no-reply@glybette.com
RESEND_API_KEY=...
```

Also ensure:

- DNS for sender domain is verified in Resend (SPF/DKIM configured).
- `RABBITMQ_URL` is stable, because OTP and project notifications are consumed from queues.

### 10.2 Pipeline/email checks

After deploy:

```bash
curl -fsS http://127.0.0.1:13003/health
docker compose logs notifications-service --since=2m
```

If startup fails with resend, common cause is missing `RESEND_API_KEY`.

### 10.3 Safe rollout approach

- First deploy with `EMAIL_PROVIDER=mock` in staging.
- Validate queue consumption and notification flow.
- Switch to `resend` in production with verified sender domain.

## 11) File upload handling (projects-service)

File uploads are managed by `projects-service` and can use disk or S3.

Code evidence:

- Provider config in `apps/projects-service/src/config/env.ts` (`UPLOAD_PROVIDER=disk|s3`).
- Cover upload endpoint: `POST /projects/:id/cover` in `apps/projects-service/src/routes/projects.routes.ts`.
- Media serving route for disk mode: `GET /projects/media/*` in the same routes file.
- Disk file serving implementation in `apps/projects-service/src/controllers/projects.controller.ts`.

### 11.1 Disk mode (simple VPS start)

Prod compose mounts a named volume `projects_uploads` at `/app/.data/projects-uploads`.

```env
UPLOAD_PROVIDER=disk
PROJECTS_UPLOAD_DISK_DIR=/app/.data/projects-uploads
PROJECTS_UPLOAD_PUBLIC_BASE_URL=/api/projects/media
PROJECTS_UPLOAD_MAX_MB=5
```

Requirements:

- Persist upload directory with a Docker volume or host bind mount.
- Back up this directory (disk-only storage is otherwise single-node fragile).

### 11.2 S3 mode (recommended for scalable production)

```env
UPLOAD_PROVIDER=s3
PROJECTS_UPLOAD_S3_BUCKET=...
PROJECTS_UPLOAD_S3_REGION=...
PROJECTS_UPLOAD_S3_PREFIX=projects/covers
PROJECTS_UPLOAD_S3_ENDPOINT=
PROJECTS_UPLOAD_S3_FORCE_PATH_STYLE=false
PROJECTS_UPLOAD_S3_ACCESS_KEY_ID=...
PROJECTS_UPLOAD_S3_SECRET_ACCESS_KEY=...
PROJECTS_UPLOAD_S3_PUBLIC_BASE_URL=https://cdn.your-domain.com/projects
```

Code enforces bucket/region presence for S3 mode at startup.

### 11.3 Upload checks in pipeline

- Health:

```bash
curl -fsS http://127.0.0.1:13008/health
```

- Functional check (post-login test token): upload one cover image and verify returned `publicUrl` loads.

### 11.4 Nginx and request size

For image uploads, set a request body limit in reverse proxy:

```nginx
client_max_body_size 10m;
```

Keep this aligned with `PROJECTS_UPLOAD_MAX_MB`.
