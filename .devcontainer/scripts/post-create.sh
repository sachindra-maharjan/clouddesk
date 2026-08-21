# !/bin/bash

echo "Executing post-create.sh script"

#!/bin/bash

set -e

cleanup_tmp() {
    rm -f /tmp/kind /tmp/helm.tar.gz /tmp/install_kustomize.sh
    rm -rf /tmp/linux-amd64 /tmp/linux-arm64
}

trap cleanup_tmp EXIT

echo "Executing post-create.sh script"

install_kubectl() {
    echo "Installing kubectl"
    KUBE_OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    KUBE_ARCH="$(uname -m)"

    case "$KUBE_ARCH" in
        x86_64|amd64) KUBE_ARCH="amd64" ;;
        aarch64|arm64) KUBE_ARCH="arm64" ;;
        *)
            echo "Unsupported architecture: $KUBE_ARCH"
            exit 1
            ;;
    esac

    curl -fsSL -o kubectl "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/${KUBE_OS}/${KUBE_ARCH}/kubectl"
    chmod +x ./kubectl
    sudo mv ./kubectl /usr/local/bin/kubectl
    kubectl version --client
    echo "kubectl successfully installed."
}

install_kind() {
    if command -v kind >/dev/null 2>&1; then
        echo "kind already installed."
        kind version
        return
    fi

    echo "Installing kind"
    KIND_ARCH="$(uname -m)"
    case "$KIND_ARCH" in
        x86_64|amd64) KIND_ARCH="amd64" ;;
        aarch64|arm64) KIND_ARCH="arm64" ;;
        *)
            echo "Unsupported architecture: $KIND_ARCH"
            exit 1
            ;;
    esac

    curl -fsSL -o /tmp/kind "https://kind.sigs.k8s.io/dl/v0.24.0/kind-linux-${KIND_ARCH}"
    sudo install -o root -g root -m 0755 /tmp/kind /usr/local/bin/kind
    kind version
    echo "kind successfully installed."
}

install_helm() {
    if command -v helm >/dev/null 2>&1; then
        echo "helm already installed."
        helm version --short
        return
    fi

    echo "Installing helm"
    HELM_ARCH="$(uname -m)"
    case "$HELM_ARCH" in
        x86_64|amd64) HELM_ARCH="amd64" ;;
        aarch64|arm64) HELM_ARCH="arm64" ;;
        *)
            echo "Unsupported architecture: $HELM_ARCH"
            exit 1
            ;;
    esac

    curl -fsSL -o /tmp/helm.tar.gz "https://get.helm.sh/helm-v3.15.4-linux-${HELM_ARCH}.tar.gz"
    tar -xzf /tmp/helm.tar.gz -C /tmp
    sudo install -o root -g root -m 0755 /tmp/linux-${HELM_ARCH}/helm /usr/local/bin/helm
    helm version --short
    echo "helm successfully installed."
}

install_kustomize() {
    if command -v kustomize >/dev/null 2>&1; then
        echo "kustomize already installed."
        kustomize version
        return
    fi

    echo "Installing kustomize"
    KUSTOMIZE_ARCH="$(uname -m)"
    case "$KUSTOMIZE_ARCH" in
        x86_64|amd64) KUSTOMIZE_ARCH="amd64" ;;
        aarch64|arm64) KUSTOMIZE_ARCH="arm64" ;;
        *)
            echo "Unsupported architecture: $KUSTOMIZE_ARCH"
            exit 1
            ;;
    esac

    curl -fsSL "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/kustomize/v5.4.3/hack/install_kustomize.sh" -o /tmp/install_kustomize.sh
    chmod +x /tmp/install_kustomize.sh
    sudo /tmp/install_kustomize.sh /usr/local/bin
    kustomize version
    echo "kustomize successfully installed."
}

install_opencode(){
    curl -fsSL https://opencode.ai/install | bash
}

install_kubectl
install_kind
install_helm
install_kustomize
install_opencode

echo "Exiting post-create.sh script"
exit 0