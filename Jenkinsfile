// Glybette production deploy (shared VPS).
// - Always use COMPOSE_PROJECT=glybette so other Docker stacks are untouched.
// - Host ports are remapped in docker-compose.yml (gateway 13000, client 15173, etc.).
// - Jenkins UI: port 18080 (8080 is used by another project on this host).
//
// Deploy triggers (current): manual "Build Now" or Poll SCM on the job (e.g. H/5 * * * *).
// GitHub webhooks are intentionally disabled for now — see block below to enable later.

pipeline {
  agent any

  parameters {
    string(name: 'PORTFOLIO_SMOKE_SLUG', defaultValue: 'demo', description: 'Existing portfolio slug for routing smoke test')
    string(name: 'COMPOSE_PARALLEL_LIMIT', defaultValue: '1', description: 'Max concurrent image builds during FORCE_REBUILD (1 safest on this 7.6GB VPS)')
    booleanParam(name: 'FORCE_REBUILD', defaultValue: false, description: 'Rebuild all images (slow, high RAM). Off = restart containers with new .env only.')
  }

  environment {
    APP_DIR = '/home/glybette/Glybette'
    COMPOSE_PROJECT = 'glybette'
    REPO_URL = 'git@github.com:boussaidamine/Glybette.git'
    BRANCH = 'main'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  // --- Optional: poll GitHub every ~5 min instead of manual builds ---
  // triggers { pollSCM('H/5 * * * *') }
  //
  // --- Later: auto-deploy on push via GitHub webhook ---
  // 1. Uncomment the triggers block below (and remove pollSCM if you use both).
  // 2. Repo admin: Settings → Webhooks → Add webhook
  //    - Payload URL: http://51.210.178.46:18080/github-webhook/
  //    - Content type: application/json
  //    - Events: Just the push event
  // 3. Ensure port 18080 is reachable from GitHub (firewall / security group).
  // 4. Job: enable "GitHub hook trigger for GITScm polling" OR rely on pipeline trigger only.
  // triggers { githubPush() }

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
          sh 'pnpm docker:env:check:prod'
        }
      }
    }

    stage('Deploy') {
      steps {
        dir("${APP_DIR}") {
          script {
            def parallel = params.COMPOSE_PARALLEL_LIMIT
            if (params.FORCE_REBUILD) {
              sh """
                docker compose --parallel ${parallel} -p ${COMPOSE_PROJECT} build
                docker compose -p ${COMPOSE_PROJECT} up -d
              """
            } else {
              sh "docker compose -p ${COMPOSE_PROJECT} up -d"
            }
          }
        }
      }
    }

    stage('Smoke Tests') {
      steps {
        dir("${APP_DIR}") {
          sh 'curl -fsS http://127.0.0.1:13000/api/health'
          sh 'curl -fsS http://127.0.0.1:13007/health'
          sh 'curl -fsS http://127.0.0.1:13003/health'
          sh 'curl -fsS http://127.0.0.1:13008/health'
          sh 'curl -fsS -H "Host: glybette.com" http://127.0.0.1:15173/ -o /dev/null'
          sh """curl -fsS "http://127.0.0.1:13000/api/portfolio/public/resolve?slug=${params.PORTFOLIO_SMOKE_SLUG}" """
        }
      }
    }
  }

  post {
    always {
      dir("${APP_DIR}") {
        sh "docker compose -p ${COMPOSE_PROJECT} ps || true"
      }
    }
    cleanup {
      sh 'docker image prune -f || true'
    }
  }
}
