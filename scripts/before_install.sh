#!/bin/bash

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Install Python dependencies if not present
if ! command -v poetry &> /dev/null; then
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Stop existing processes
pm2 stop all || true

# Clean installation directory
sudo mkdir -p /var/www/pathfinders
sudo rm -rf /var/www/pathfinders/* 