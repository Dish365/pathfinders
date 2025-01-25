#!/bin/bash

# Pull latest changes
git fetch origin
git reset --hard origin/main

# Backend setup
poetry install
poetry run python manage.py migrate

# Frontend setup
cd pathfinders-client
yarn install
yarn build

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Start/Restart Next.js with PM2
pm2 restart pathfinders-next || pm2 start yarn --name "pathfinders-next" -- start
cd ..

# Fix permissions
sudo chown -R ubuntu:ubuntu pathfinders-client/.next/

# Restart services
sudo systemctl restart nginx
sudo systemctl restart gunicorn 