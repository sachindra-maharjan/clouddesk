#!/usr/bin/env bash
set -euo pipefail
kind load docker-image clouddesk/backend:v1 --name clouddesk
kind load docker-image clouddesk/frontend:v1 --name clouddesk
