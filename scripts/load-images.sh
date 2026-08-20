#!/usr/bin/env bash
set -euo pipefail

postgres_image="clouddesk/postgres:16-alpine-kind"
container_id=$(docker create postgres:16-alpine)
docker commit "$container_id" "$postgres_image" >/dev/null
docker rm "$container_id" >/dev/null

kind load docker-image "$postgres_image" --name clouddesk
kind load docker-image clouddesk/backend:v1 --name clouddesk
kind load docker-image clouddesk/frontend:v1 --name clouddesk
