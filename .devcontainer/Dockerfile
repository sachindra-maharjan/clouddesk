# Use an official Ubuntu as a parent image
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    sudo \
    gnupg \
    lsb-release \
    ca-certificates \
    build-essential \
    python3 \
    python3-pip \
    golang-go \
    && rm -rf /var/lib/apt/lists/*
