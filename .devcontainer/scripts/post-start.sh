#!/bin/bash
set -e

echo "Executing post-start.sh script"

workspaceFolder="/workspaces/clouddesk"

chmod +x "${workspaceFolder}"/scripts/*

# Docker restarts can leave stale iptables-legacy FORWARD DROP rules that
# block kind node-to-node traffic (kubelet logs/exec, pod DNS, pod routing).
for chain_cmd in "iptables" "iptables-legacy"; do
    sudo ${chain_cmd} -C FORWARD -s 172.18.0.0/16 -d 172.18.0.0/16 -j ACCEPT 2>/dev/null || \
        sudo ${chain_cmd} -I FORWARD -s 172.18.0.0/16 -d 172.18.0.0/16 -j ACCEPT
    for cidr in 10.244.0.0/16 10.96.0.0/12; do
        sudo ${chain_cmd} -C FORWARD -s ${cidr} -d ${cidr} -j ACCEPT 2>/dev/null || \
            sudo ${chain_cmd} -I FORWARD -s ${cidr} -d ${cidr} -j ACCEPT
        sudo ${chain_cmd} -C FORWARD -s ${cidr} -d 172.18.0.0/16 -j ACCEPT 2>/dev/null || \
            sudo ${chain_cmd} -I FORWARD -s ${cidr} -d 172.18.0.0/16 -j ACCEPT
        sudo ${chain_cmd} -C FORWARD -s 172.18.0.0/16 -d ${cidr} -j ACCEPT 2>/dev/null || \
            sudo ${chain_cmd} -I FORWARD -s 172.18.0.0/16 -d ${cidr} -j ACCEPT
    done
done

if ! kind get clusters 2>/dev/null | grep -q '^clouddesk$'; then
    bash "${workspaceFolder}/scripts/create-cluster.sh"
fi
bash "${workspaceFolder}/scripts/build-images.sh"
bash "${workspaceFolder}/scripts/load-images.sh"


echo "Exiting post-start.sh script"