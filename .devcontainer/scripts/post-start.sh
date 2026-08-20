#!/bin/bash
set -e

echo "Executing post-start.sh script"

workspaceFolder="/workspaces/clouddesk"

chmod +x "${workspaceFolder}"/scripts/*

bash "${workspaceFolder}/scripts/create-cluster.sh"
bash "${workspaceFolder}/scripts/build-images.sh"
bash "${workspaceFolder}/scripts/load-images.sh"


echo "Exiting post-start.sh script"