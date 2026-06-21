pipeline {
  agent any

  parameters {
    string(name: 'PORTFOLIO_SMOKE_SLUG', defaultValue: 'demo', description: 'Existing portfolio slug for routing smoke test')
  }

  environment {
    APP_DIR = '/opt/glybette'
    REPO_URL = 'git@github.com:YOUR_ORG/YOUR_REPO.git'
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
          sh 'docker compose down'
          sh 'docker compose up -d --build'
        }
      }
    }

    stage('Smoke Tests') {
      steps {
        dir("${APP_DIR}") {
          sh 'curl -fsS http://127.0.0.1:3000/api/health'
          sh 'curl -fsS http://127.0.0.1:3007/health'
          sh 'curl -fsS http://127.0.0.1:3003/health'
          sh 'curl -fsS http://127.0.0.1:3008/health'
          sh 'curl -fsS -H "Host: glybette.com" http://127.0.0.1:5173/ -o /dev/null'
          sh """curl -fsS "http://127.0.0.1:3000/api/portfolio/public/resolve?slug=${params.PORTFOLIO_SMOKE_SLUG}" """
        }
      }
    }
  }

  post {
    always {
      dir("${APP_DIR}") {
        sh 'docker compose ps || true'
      }
    }
    cleanup {
      sh 'docker image prune -f || true'
    }
  }
}
