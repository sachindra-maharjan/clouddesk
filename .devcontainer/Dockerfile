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
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && sudo ./aws/install

# Install AWS SDK extras
RUN python3 -m pip install aws-sam-cli

# Clean up
RUN rm -rf awscliv2.zip aws
