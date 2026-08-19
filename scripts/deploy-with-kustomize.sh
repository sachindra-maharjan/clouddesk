set -euo pipefail

./scripts/render-helm.sh
kubectl apply -k apps/overlays/dev
kubectl get all -n clouddesk
kubectl get pvc -n clouddesk