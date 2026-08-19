# !/bin/bash

echo "Executing post-start.sh script"

workspaceFolder="/workspaces/clouddesk"

command "bash ${workspaceFolder}/scripts/create-cluster.sh"

echo "Exiting post-start.sh script"
exit 0