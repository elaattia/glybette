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
  - Nginx reverse proxy
  - Glybette services via `docker-compose.yml`
- **DNS** points:
  - `glybette.com` -> VPS IP
  - `www.glybette.com` -> VPS IP
  - `*.glybette.com` -> VPS IP
- **TLS** includes apex + wildcard cert (`glybette.com`, `*.glybette.com`).

## 3) One-time VPS setup

## 3.1 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 3.2 Install Jenkins

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-21-jre git curl

curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins

sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 3.3 Create deploy directory

```bash
sudo mkdir -p /opt/glybette
sudo chown -R jenkins:jenkins /opt/glybette
```

## 4) Production env file

Store your production `.env` in Jenkins credentials (Secret file).  
At minimum, include values required by compose + routing:

```env
NODE_ENV=production

MONGODB_URI=...
INTERNAL_SERVICE_SECRET=... # one shared strong secret

PORTFOLIO_SERVICE_URL=http://portfolio-service:3004
PORTFOLIO_PUBLIC_ROOT_DOMAIN=glybette.com

VITE_PORTFOLIO_ROOT_DOMAIN=glybette.com
VITE_API_BASE_URL=

CORS_ORIGINS=https://glybette.com,https://www.glybette.com,https://*.glybette.com
BETTER_AUTH_TRUSTED_ORIGINS=https://glybette.com,https://www.glybette.com
BETTER_AUTH_URL=https://glybette.com/api/auth
```

Note: wildcard syntax support for `CORS_ORIGINS` depends on your CORS parser. If unsupported, enumerate exact hosts you allow.

## 5) Nginx reverse proxy (critical for portfolio routing)

Use one server block that accepts apex + wildcard and forwards `/api` with forwarded host headers.

```nginx
server {
    listen 80;
    server_name glybette.com www.glybette.com *.glybette.com;

    # Redirect to HTTPS in real deployment
    # return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name glybette.com www.glybette.com *.glybette.com;

    # ssl_certificate ...;
    # ssl_certificate_key ...;

    # Frontend SPA (served by your frontend container or static host)
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Gateway API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

This matches `docs/portfolio-routing.md` and backend `resolvePublic()` expectations.

## 6) Jenkins pipeline flow

Pipeline stages:

1. Checkout `main`
2. Inject production `.env` from Jenkins credentials
3. Validate env (`pnpm docker:env:check`)
4. Deploy (`docker compose up -d --build`)
5. Smoke-test health + portfolio routing

Create `Jenkinsfile` in repo root:

```groovy
pipeline {
  agent any

  environment {
    APP_DIR = '/opt/glybette'
    REPO_URL = 'git@github.com:YOUR_ORG/YOUR_REPO.git'
    BRANCH = 'main'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        dir("${APP_DIR}") {
          checkout([$class: 'GitSCM',
            branches: [[name: "*/${BRANCH}"]],
            userRemoteConfigs: [[url: "${REPO_URL}", credentialsId: 'glybette-git']]
          ])
        }
      }
    }

    stage('Inject Env') {
      steps {
        dir("${APP_DIR}") {
          withCredentials([file(credentialsId: 'glybette-env-prod', variable: 'ENV_FILE')]) {
            sh 'cp "$ENV_FILE" .env'
          }
        }
      }
    }

    stage('Preflight') {
      steps {
        dir("${APP_DIR}") {
          sh 'corepack enable'
          sh 'pnpm --version'
          sh 'pnpm docker:env:check'
        }
      }
    }

    stage('Deploy') {
      steps {
        dir("${APP_DIR}") {
          sh 'docker compose down'
          sh 'docker compose up -d --build'
        }
      }
    }

    stage('Smoke Tests') {
      steps {
        sh 'curl -fsS http://127.0.0.1:3000/api/health'

        // Path-based portfolio URL should be reachable through apex host.
        sh 'curl -fsS -H "Host: glybette.com" http://127.0.0.1/user/demo -o /dev/null'

        // Subdomain root should serve SPA shell (PortfolioRoot decides by host).
        sh 'curl -fsS -H "Host: demo.glybette.com" http://127.0.0.1/ -o /dev/null'

        // API resolve endpoint with explicit slug (used by current client flow).
        sh 'curl -fsS -H "Host: demo.glybette.com" "http://127.0.0.1/api/portfolio/public/resolve?slug=demo"'
      }
    }
  }

  post {
    always {
      sh 'docker compose ps || true'
    }
    cleanup {
      sh 'docker image prune -f || true'
    }
  }
}
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
curl -fsS http://127.0.0.1:3007/health
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
curl -fsS http://127.0.0.1:3003/health
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
curl -fsS http://127.0.0.1:3008/health
```

- Functional check (post-login test token): upload one cover image and verify returned `publicUrl` loads.

### 11.4 Nginx and request size

For image uploads, set a request body limit in reverse proxy:

```nginx
client_max_body_size 10m;
```

Keep this aligned with `PROJECTS_UPLOAD_MAX_MB`.
