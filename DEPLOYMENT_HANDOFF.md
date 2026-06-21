# Deployment handoff checklist

Use this as your personal runbook to go from “code is ready” to “production is live.”  
Detailed reference: [`deployment.md`](deployment.md) · Portfolio routing: [`docs/portfolio-routing.md`](docs/portfolio-routing.md)

**APP_DIR (this VPS):** `/home/glybette/Glybette` — repo is already cloned here. Run all compose/nginx commands from this path.

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
- [ ] Ensure Jenkins can use the existing app directory (`/home/glybette/Glybette`):

```bash
sudo usermod -aG docker jenkins
# If the pipeline runs as jenkins, grant access to APP_DIR (pick one):
sudo setfacl -R -m u:jenkins:rwx /home/glybette/Glybette
# OR update Jenkinsfile APP_DIR and run the job as user glybette
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
- [ ] Update [`Jenkinsfile`](Jenkinsfile): set `REPO_URL` to your real `git@github.com:ORG/REPO.git` and `APP_DIR` to `/home/glybette/Glybette`
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
cd /home/glybette/Glybette
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
cd /home/glybette/Glybette
git pull origin main
cp /path/to/your/.env .env   # skip if .env already in APP_DIR
pnpm docker:env:check:prod
docker compose up -d --build
```

### Option B — Jenkins

- [ ] Push to `main` (or click “Build Now” on the pipeline job)
- [ ] Watch Jenkins console for: Preflight → Deploy → Smoke Tests

### After containers are up

```bash
docker compose ps
curl -fsS http://127.0.0.1:13000/api/health
curl -fsS http://127.0.0.1:13007/health
curl -fsS http://127.0.0.1:15173/
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
| `502` on `/` | Is `client` container up on host port 15173? |
| Subdomain portfolio 404 | Wildcard DNS + TLS + `X-Forwarded-Host` on API proxy |
| AI features fail | `AI_PROVIDER=gemini`, valid `GEMINI_API_KEY`, `curl localhost:13007/health` |
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

---

## Agent execution (VPS SSH access)

**Short answer:** Yes, with limits. An agent with SSH + `sudo` on the VPS can complete roughly **60–70%** of this handoff autonomously. The rest needs human input (secrets, DNS registrar, GitHub/Jenkins UIs) or will block until you provide those inputs.

Use this section when handing the task to Cursor, Claude, or another agent that can run shell commands on the server.

### What the agent needs upfront (you provide)

| Input | Example | Why |
|-------|---------|-----|
| `DOMAIN` | `glybette.com` | Nginx, TLS, env validation |
| `REPO_URL` | `git@github.com:org/glybette.git` | Clone + Jenkinsfile |
| `GIT_SSH_KEY` or deploy access | private key path on VPS | `git clone` / Jenkins |
| Production `.env` | file contents or path on VPS | **Never** commit; place at `/home/glybette/Glybette/.env` |
| `PORTFOLIO_SMOKE_SLUG` | real slug in DB | Smoke test after deploy |
| DNS | A records already pointing at VPS IP | Required before HTTPS and public checks |
| (Optional) DNS API token | Cloudflare etc. | Only if you want the agent to complete Certbot DNS-01 |

Without a filled `.env`, the agent can still install Docker/Nginx and clone the repo, but **cannot** pass `pnpm docker:env:check:prod` or start a healthy stack.

### Step classification

| Phase | Agent (SSH) | Human only |
|-------|-------------|------------|
| 0 — Secrets / accounts | Write `.env` if you paste secrets | Create Atlas, Gemini, Resend, verify email domain |
| 1 — VPS baseline | `apt`, Docker, firewall (`ufw`) | Provision VPS in cloud console |
| 2 — DNS | `dig` to verify propagation | Create A/CNAME records at registrar |
| 3 — `.env` | `cp .env.production.example .env`, edit, `pnpm docker:env:check:prod` | Supply secret values |
| 4 — Jenkins | Install packages, `jenkins` docker group, ACL on `/home/glybette/Glybette` | Jenkins UI: credentials, pipeline job, GitHub webhook |
| 5 — Nginx | `apt install nginx`, copy `deploy/nginx/glybette.conf`, `nginx -t` | Certbot DNS-01 TXT records (unless DNS API) |
| 6 — Deploy | `git pull`, `docker compose up -d --build`, curl smoke tests | — |
| 7 — Verify | `curl` health + portfolio resolve from VPS | Browser: login, signup, upload, AI UX |
| 8 — Ops | `docker compose logs`, `certbot renew --dry-run` | Atlas backup policy, uptime SaaS |

### Recommended agent path (skip Jenkins on first pass)

Jenkins setup is UI-heavy. For an agent’s **first** run, prefer **Phase 6 Option A** only:

1. Install Docker + Node 22 + pnpm on VPS  
2. Work in existing clone: `/home/glybette/Glybette` (`git pull` for latest)  
3. Place `.env` at `/home/glybette/Glybette/.env`  
4. `pnpm docker:env:check:prod`  
5. `docker compose up -d --build`  
6. Run smoke `curl` commands from Phase 6  
7. Install Nginx + copy site config  
8. **Pause** for human: DNS-01 wildcard cert + uncomment `ssl_certificate` lines in nginx config  
9. `nginx -t && systemctl reload nginx`  
10. Human verifies HTTPS URLs in browser  
11. **Then** human or agent-with-JCasC sets up Jenkins for webhook deploys  

### Agent prompt template

Copy and fill placeholders when starting an agent session:

```text
Deploy Glybette to production on this VPS using DEPLOYMENT_HANDOFF.md (Agent execution section).

Constants:
- DOMAIN=glybette.com
- APP_DIR=/home/glybette/Glybette
- REPO_URL=git@github.com:ORG/REPO.git
- .env is at /home/glybette/Glybette/.env (already uploaded) OR paste secrets into .env from .env.production.example

Do:
1. Phases 1, 6 Option A (Docker, git pull in APP_DIR, compose up, smoke curls on localhost).
2. Phase 5 (host nginx from deploy/nginx/glybette.conf) — HTTP only until TLS is done.
3. Report docker compose ps and all smoke test results.

Do NOT:
- Commit or print .env secrets.
- Skip docker:env:check:prod before compose up.

Stop and ask me when:
- DNS does not resolve to this server's public IP.
- Certbot DNS-01 needs TXT records (show exact record name/value).
- Jenkins UI steps are required (unless I said to skip Jenkins).
- Any smoke test fails — include relevant docker compose logs.
```

### Commands the agent should run (copy-paste block)

Repo path: `/home/glybette/Glybette` (already cloned). Ensure `.env` is present:

```bash
set -euo pipefail
cd /home/glybette/Glybette
git pull origin main || true

corepack enable
pnpm docker:env:check:prod
docker compose up -d --build

# wait for health (up to ~3 min)
for i in $(seq 1 36); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 5
done

docker compose ps
curl -fsS http://127.0.0.1:13000/api/health
curl -fsS http://127.0.0.1:13007/health
curl -fsS http://127.0.0.1:13003/health
curl -fsS http://127.0.0.1:13008/health
curl -fsS -H "Host: glybette.com" http://127.0.0.1:15173/ -o /dev/null

sudo cp deploy/nginx/glybette.conf /etc/nginx/sites-available/glybette
sudo ln -sf /etc/nginx/sites-available/glybette /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
# If TLS not ready: comment out listen 443 server block in glybette.conf first
sudo nginx -t && sudo systemctl reload nginx
```

Replace `glybette.com` in the `Host` header if `DOMAIN` differs.

### Known blockers for agents

1. **Certbot DNS-01** — `certbot certonly --manual` waits for interactive Enter after you add TXT records. Agent should output the TXT record and **stop** unless you give it a DNS API (e.g. Cloudflare certbot plugin).
2. **Jenkins credentials + job** — no CLI in this repo; use Jenkins UI or add [JCasC](https://www.jenkins.io/projects/jcasc/) later.
3. **GitHub webhook** — must be created in GitHub repo settings (human or GitHub API token).
4. **`Jenkinsfile`** — set `REPO_URL` and `APP_DIR=/home/glybette/Glybette` in git before webhook deploys work.
5. **Nginx 443 with commented SSL** — current `deploy/nginx/glybette.conf` has SSL paths commented; nginx will fail on `listen 443 ssl` until certs exist. Agent should either use HTTP-only temporarily or enable cert paths after issuance.
6. **Portfolio slug smoke test** — fails if `PORTFOLIO_SMOKE_SLUG` does not exist in MongoDB.

### Success criteria for an agent run

Agent can mark the task **done** when all of these pass:

- [ ] `pnpm docker:env:check:prod` exits 0  
- [ ] `docker compose ps` shows core services up (gateway, client, portfolio, ai, etc.)  
- [ ] Localhost smoke curls in Phase 6 all succeed  
- [ ] Nginx proxies `/` → `:15173` and `/api/` → `:13000` (test with `curl -H "Host: $DOMAIN" http://127.0.0.1/`)  
- [ ] Human confirmed HTTPS + browser checks (Phase 7) — agent reports “blocked on human” until then  

Jenkins + webhook auto-deploy is **optional follow-up**, not required for “app is live.”
