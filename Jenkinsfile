// Glybette production deploy (shared VPS).
// - Always use COMPOSE_PROJECT=glybette so other Docker stacks are untouched.
// - Host ports are remapped in docker-compose.yml (gateway 13000, client 15173, etc.).
// - Jenkins UI/webhook: port 18080 (8080 is used by another project on this host).

pipeline {
  agent any

  parameters {
    string(name: 'PORTFOLIO_SMOKE_SLUG', defaultValue: 'demo', description: 'Existing portfolio slug for routing smoke test')
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

  triggers {
    githubPush()
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
          sh 'pnpm docker:env:check:prod'
        }
      }
    }

    stage('Deploy') {
      steps {
        dir("${APP_DIR}") {
          sh "docker compose -p ${COMPOSE_PROJECT} up -d --build"
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
