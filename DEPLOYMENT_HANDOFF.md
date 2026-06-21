# Deployment handoff checklist

Use this as your personal runbook to go from “code is ready” to “production is live.”  
Detailed reference: [`deployment.md`](deployment.md) · Portfolio routing: [`docs/portfolio-routing.md`](docs/portfolio-routing.md)

## Already done in the repo

- [x] Production `client` image (`apps/client/Dockerfile` + nginx SPA)
- [x] Production `docker-compose.yml` (Atlas-only, no local Mongo, upload volume, healthchecks)
- [x] `.env.production.example` template
- [x] `pnpm docker:env:check:prod` validation
- [x] `Jenkinsfile` (webhook deploy pipeline)
- [x] `deploy/nginx/glybette.conf` (host reverse proxy template)

---

## Phase 0 — Accounts and secrets (before touching the VPS)

- [ ] **MongoDB Atlas** — cluster created; connection string ready (`MONGODB_URI`)
- [ ] **Gemini API key** — from [Google AI Studio](https://aistudio.google.com/apikey)
- [ ] **Resend** — account + verified sender domain (`RESEND_API_KEY`, SPF/DKIM)
- [ ] **Domain DNS access** — can edit records for `glybette.com`
- [ ] **GitHub** — repo access; decide deploy SSH key or PAT for Jenkins

---

## Phase 1 — VPS baseline

Target: Ubuntu/Debian VPS with public IP.

- [ ] Provision VPS (enough RAM for all compose services; Gemini means no local Ollama)
- [ ] SSH in and update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

- [ ] Open firewall / security group ports:
  - [ ] `22` (SSH)
  - [ ] `80` (HTTP / Certbot)
  - [ ] `443` (HTTPS)
  - [ ] `8080` (Jenkins — restrict to your IP if possible)

---

## Phase 2 — DNS

Point all of these to the VPS public IP:

- [ ] `glybette.com` → A record → VPS IP
- [ ] `www.glybette.com` → A or CNAME → VPS IP
- [ ] `*.glybette.com` → A or CNAME → VPS IP (required for `username.glybette.com`)

Wait for propagation (check with `dig glybette.com` / `dig test.glybette.com`).

---

## Phase 3 — Production environment file

On your **local machine** first (validate before uploading to Jenkins):

- [ ] Copy template: `cp .env.production.example .env`
- [ ] Fill all secrets and production URLs (see checklist below)
- [ ] Run: `pnpm docker:env:check:prod` — must print `OK (production)`

### Required `.env` values (minimum)

| Variable | Example / note |
|----------|----------------|
| `MONGODB_URI` | `mongodb+srv://...` (Atlas) |
| `INTERNAL_SERVICE_SECRET` | long random string (shared by all services) |
| `BETTER_AUTH_SECRET` | ≥ 32 chars |
| `BETTER_AUTH_URL` | `https://glybette.com/api/auth` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | `https://glybette.com,https://www.glybette.com` |
| `CORS_ORIGINS` | same as above (HTTPS, no localhost) |
| `PORTFOLIO_PUBLIC_ROOT_DOMAIN` | `glybette.com` |
| `VITE_PORTFOLIO_ROOT_DOMAIN` | `glybette.com` (must match; baked into client build) |
| `VITE_API_BASE_URL` | leave empty (same-origin `/api`) |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | your key |
| `GEMINI_MODEL` | `gemini-2.0-flash` |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | your key |
| `EMAIL_FROM` | `no-reply@glybette.com` (verified in Resend) |
| `ALLOWED_ORIGINS` | `https://glybette.com,https://www.glybette.com` |

Optional for later: OAuth provider keys, S3 upload vars (disk uploads work out of the box).

- [ ] Store the finished `.env` somewhere safe — you will upload it to Jenkins as a **Secret file** (`glybette-env-prod`). **Do not commit it.**

---

## Phase 4 — Jenkins on VPS

Follow [`deployment.md` §3.2–3.5](deployment.md).

- [ ] Install Jenkins + Java
- [ ] Add `jenkins` user to docker group: `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins`
- [ ] Create deploy directory:

```bash
sudo mkdir -p /opt/glybette
sudo chown -R jenkins:jenkins /opt/glybette
```

- [ ] Install Node 22 + pnpm on VPS (for preflight):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
corepack prepare pnpm@10.17.0 --activate
```

- [ ] Install Jenkins plugins: **Git**, **GitHub**, **Pipeline**, **Credentials**
- [ ] Create Jenkins credentials:
  - [ ] `glybette-git` — SSH private key with read access to the repo (add public key as deploy key on GitHub)
  - [ ] `glybette-env-prod` — Secret file = your production `.env`
- [ ] Update [`Jenkinsfile`](Jenkinsfile): set `REPO_URL` to your real `git@github.com:ORG/REPO.git`
- [ ] Commit and push `Jenkinsfile` change to `main`
- [ ] Create **Pipeline** job → “Pipeline script from SCM” → point at repo + `Jenkinsfile`
- [ ] Set job parameter `PORTFOLIO_SMOKE_SLUG` to a **real** portfolio slug in your DB (or accept default `demo` only if that slug exists)
- [ ] Configure GitHub webhook:
  - URL: `http://<vps-ip>:8080/github-webhook/`
  - Event: push to `main`
- [ ] (Recommended) Restrict Jenkins UI (`8080`) to your IP via firewall

---

## Phase 5 — Host Nginx + TLS

- [ ] Install Nginx: `sudo apt install -y nginx`
- [ ] Copy site config:

```bash
sudo cp deploy/nginx/glybette.conf /etc/nginx/sites-available/glybette
sudo ln -sf /etc/nginx/sites-available/glybette /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # if it conflicts
```

- [ ] **Before TLS works**, you can temporarily comment out the `listen 443` server block and test HTTP proxy to compose ports, OR issue certs first.

### TLS — wildcard required for subdomains

HTTP-01 alone is **not** enough for `*.glybette.com`.

- [ ] Install Certbot: `sudo apt install -y certbot python3-certbot-nginx`
- [ ] Issue cert with DNS-01 (wildcard):

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d glybette.com -d '*.glybette.com'
```

- [ ] Add the `_acme-challenge` TXT record(s) at your DNS provider when prompted
- [ ] Uncomment/update `ssl_certificate` paths in `/etc/nginx/sites-available/glybette`
- [ ] Test and reload: `sudo nginx -t && sudo systemctl reload nginx`
- [ ] Verify renewal: `sudo certbot renew --dry-run`

---

## Phase 6 — First deploy

You can do **one manual deploy** before relying on Jenkins, to catch issues early.

### Option A — Manual (recommended first time)

```bash
cd /opt/glybette
git clone git@github.com:YOUR_ORG/YOUR_REPO.git .
cp /path/to/your/.env .env
pnpm docker:env:check:prod
docker compose up -d --build
```

### Option B — Jenkins

- [ ] Push to `main` (or click “Build Now” on the pipeline job)
- [ ] Watch Jenkins console for: Preflight → Deploy → Smoke Tests

### After containers are up

```bash
docker compose ps
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3007/health
curl -fsS http://127.0.0.1:5173/
```

- [ ] All services show `healthy` or `running` (AI may show degraded until Gemini key is valid)
- [ ] Host Nginx reloaded and serving HTTPS

---

## Phase 7 — End-to-end verification (production URLs)

Replace `demo` with your real portfolio slug.

- [ ] `https://glybette.com` — landing / SPA loads
- [ ] `https://glybette.com/api/health` — `{"status":"ok",...}`
- [ ] `https://glybette.com/user/demo` — public portfolio (path URL)
- [ ] `https://demo.glybette.com` — same portfolio (subdomain URL)
- [ ] `https://glybette.com/login` — auth UI loads
- [ ] Sign up / login flow works (Better Auth + Resend OTP if enabled)
- [ ] Upload a project cover image (confirms `client_max_body_size` + upload volume)
- [ ] Trigger an AI feature (CV or jobs) — confirms Gemini from `ai-service`

### If subdomain works but path doesn’t (or vice versa)

Check in order:

1. DNS wildcard `*.glybette.com`
2. TLS cert includes `*.glybette.com`
3. Nginx `server_name` includes `*.glybette.com`
4. Nginx sets `X-Forwarded-Host $host` on `/api/`
5. `.env`: `PORTFOLIO_PUBLIC_ROOT_DOMAIN` and `VITE_PORTFOLIO_ROOT_DOMAIN` both `glybette.com`
6. Client was **rebuilt** after changing `VITE_*` (Jenkins deploy runs `docker compose up --build`)

---

## Phase 8 — Post-launch ops

- [ ] **Backups**: MongoDB Atlas backups enabled; note `projects_uploads` Docker volume on VPS (backup or plan S3 cutover)
- [ ] **Monitoring**: watch `docker compose logs -f` on first week; set up uptime check on `/api/health`
- [ ] **Secrets rotation** plan: `INTERNAL_SERVICE_SECRET`, `BETTER_AUTH_SECRET`, API keys
- [ ] **Jenkins**: confirm webhook deploy works on next push to `main`
- [ ] **Gemini billing/quotas**: monitor usage in Google AI Studio

---

## Quick troubleshooting

| Symptom | Likely fix |
|---------|------------|
| `pnpm docker:env:check:prod` fails | Fix listed errors; ensure HTTPS URLs and matching portfolio domains |
| Client shows wrong subdomain behavior | Rebuild client (`VITE_PORTFOLIO_ROOT_DOMAIN` is build-time) |
| `502` on `/api/` | `docker compose ps` — is `api-gateway` up? Check logs |
| `502` on `/` | Is `client` container up on port 5173? |
| Subdomain portfolio 404 | Wildcard DNS + TLS + `X-Forwarded-Host` on API proxy |
| AI features fail | `AI_PROVIDER=gemini`, valid `GEMINI_API_KEY`, `curl localhost:3007/health` |
| Emails not sent | `EMAIL_PROVIDER=resend`, verified domain, `RESEND_API_KEY`, RabbitMQ up |
| Upload fails | Nginx `client_max_body_size 10m`; `projects_uploads` volume mounted |

---

## Suggested order (one sitting)

1. Phase 0 — gather secrets  
2. Phase 1–2 — VPS + DNS  
3. Phase 3 — local `.env` + `pnpm docker:env:check:prod`  
4. Phase 6 Option A — manual first deploy  
5. Phase 5 — Nginx + Certbot  
6. Phase 7 — verify URLs  
7. Phase 4 — Jenkins + webhook for ongoing deploys  
8. Phase 8 — backups and monitoring  

When everything is green, day-to-day deploys are: **push to `main` → Jenkins runs → smoke tests pass**.
