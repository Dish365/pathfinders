#!/bin/bash

echo "Starting deployment..."

# Pull latest changes
git fetch origin
git reset --hard origin/main

echo "Running backend setup..."
# Backend setup
poetry install
poetry run python manage.py migrate

echo "Running frontend setup..."
# Frontend setup
cd pathfinders-client

# Set production environment variables
echo "NEXT_PUBLIC_API_URL=https://pathfindersgifts.com" > .env.production.local

yarn install
yarn build

echo "Setting up PM2..."
# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Start/Restart Next.js with PM2
echo "Starting Next.js..."
pm2 delete pathfinders-next || true
NODE_ENV=production PORT=3000 pm2 start node --name "pathfinders-next" -- .next/standalone/server.js

# Fix permissions
echo "Fixing permissions..."
sudo chown -R ubuntu:ubuntu .next/

# Restart services
echo "Restarting services..."
cd ..
sudo systemctl restart nginx
sudo systemctl restart gunicorn

echo "Deployment complete!" 