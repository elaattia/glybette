#!/bin/bash
set -euo pipefail

chown -R glybette:glybette /var/jenkins_home
exec gosu glybette /usr/local/bin/jenkins.sh "$@"
