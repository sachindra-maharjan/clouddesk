#!/usr/bin/env bash
set -euo pipefail

mkdir -p apps/overlays/dev/rendered

helm template backend charts/backend \
  -n clouddesk \
  -f charts/backend/values-dev.yaml \
  > apps/overlays/dev/rendered/backend.yaml

helm template frontend charts/frontend \
  -n clouddesk \
  -f charts/frontend/values-dev.yaml \
  > apps/overlays/dev/rendered/frontend.yaml

helm template postgres charts/postgres \
  -n clouddesk \
  -f charts/postgres/values-dev.yaml \
  > apps/overlays/dev/rendered/postgres.yaml

echo "Helm charts rendered into apps/overlays/dev/rendered/"