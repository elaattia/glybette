# Jenkins LTS + Node 22 + pnpm for pnpm docker:env:check:prod in Jenkinsfile.
FROM jenkins/jenkins:lts

USER root

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && corepack enable \
  && corepack prepare pnpm@10.17.0 --activate \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER jenkins
