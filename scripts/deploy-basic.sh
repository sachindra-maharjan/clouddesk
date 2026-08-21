#!/usr/bin/env bash
set -euo pipefail

./scripts/build-images.sh
./scripts/load-images.sh
./scripts/deploy-with-kustomize.sh

kubectl wait --for=condition=available deployment/clouddesk-backend -n clouddesk --timeout=180s
kubectl wait --for=condition=available deployment/clouddesk-frontend -n clouddesk --timeout=180s

kubectl get all -n clouddesk
kubectl get pvc -n clouddesk

