#!/usr/bin/env bash
set -euo pipefail
docker build -t clouddesk/backend:v1 app/backend
docker build -t clouddesk/frontend:v1 app/frontend
docker images | grep clouddesk
