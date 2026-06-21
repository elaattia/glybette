# Jenkins LTS + Node 22 + pnpm for pnpm docker:env:check:prod in Jenkinsfile.
FROM jenkins/jenkins:lts

USER root

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates gnupg gosu openssh-client \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && corepack enable \
  && corepack prepare pnpm@10.17.0 --activate \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -g 987 docker 2>/dev/null || true \
  && groupadd -g 1002 glybette 2>/dev/null || true \
  && useradd -u 1002 -g 1002 -G docker -m -s /bin/bash glybette 2>/dev/null \
     || usermod -aG docker glybette \
  && mkdir -p /home/glybette/.ssh /etc/ssh \
  && chown glybette:glybette /home/glybette/.ssh \
  && chmod 700 /home/glybette/.ssh \
  && ssh-keyscan -t ed25519,rsa,ecdsa github.com >> /etc/ssh/ssh_known_hosts 2>/dev/null \
  && cp /etc/ssh/ssh_known_hosts /home/glybette/.ssh/known_hosts \
  && chown glybette:glybette /home/glybette/.ssh/known_hosts \
  && chmod 644 /home/glybette/.ssh/known_hosts

COPY entrypoint.sh /usr/local/bin/glybette-jenkins-entrypoint.sh
RUN chmod +x /usr/local/bin/glybette-jenkins-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/glybette-jenkins-entrypoint.sh"]
