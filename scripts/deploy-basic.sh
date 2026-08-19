#!/usr/bin/env bash
set -euo pipefail

./scripts/deploy-with-kustomize.sh

kubectl wait --for=condition=available deployment/backend -n clouddesk --timeout=180s
kubectl wait --for=condition=available deployment/frontend -n clouddesk --timeout=180s

kubectl get all -n clouddesk
kubectl get pvc -n clouddesk

