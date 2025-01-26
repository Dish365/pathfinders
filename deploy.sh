#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/home/ubuntu/app"
FRONTEND_DIR="$APP_DIR/pathfinders-client"
LOG_FILE="$APP_DIR/deploy.log"
POETRY_PATH="$HOME/.local/bin/poetry"
PYTHON_VERSION="3.11"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "Error occurred in deployment at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Start deployment
log "Starting deployment..."

# Navigate to app directory
cd $APP_DIR

# Backup current state
log "Creating backup of current state..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
git bundle create "../backup_$BACKUP_DATE.bundle" HEAD

# Pull latest changes
log "Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Backend setup
log "Setting up backend..."
if ! command -v $POETRY_PATH &> /dev/null; then
    log "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Update Python dependencies
log "Installing Python dependencies..."
$POETRY_PATH install --only main

# Run migrations
log "Running database migrations..."
$POETRY_PATH run python manage.py migrate --noinput

# Collect static files if needed
log "Collecting static files..."
$POETRY_PATH run python manage.py collectstatic --noinput

# Frontend setup
log "Setting up frontend..."
cd $FRONTEND_DIR

# Ensure correct Node version is active
if ! command -v nvm &> /dev/null; then
    log "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Use Node.js LTS
nvm install --lts
nvm use --lts

# Install Yarn globally if not present
if ! command -v yarn &> /dev/null; then
    log "Installing Yarn..."
    npm install -g yarn
fi

# Set production environment variables
log "Setting up environment variables..."
cat > .env.production.local << EOF
NEXT_PUBLIC_API_URL=https://pathfindersgifts.com
NODE_ENV=production
EOF

# Install and build frontend
log "Installing frontend dependencies..."
yarn install

log "Building frontend..."
yarn build

# PM2 setup
log "Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    log "Installing PM2..."
    yarn global add pm2
fi

# Update PM2 process
log "Updating PM2 process..."
pm2 delete pathfinders-next 2>/dev/null || true
NODE_ENV=production PORT=3000 pm2 start node --name "pathfinders-next" -- .next/standalone/server.js

# Save PM2 process list
pm2 save

# Fix permissions
log "Fixing permissions..."
sudo chown -R ubuntu:ubuntu .next/
sudo chown -R ubuntu:ubuntu node_modules/

# Restart services
log "Restarting services..."
cd $APP_DIR

# Check and restart Gunicorn
log "Restarting Gunicorn..."
if sudo systemctl is-active --quiet gunicorn; then
    sudo systemctl restart gunicorn
else
    log "Warning: Gunicorn service not running"
    sudo systemctl start gunicorn
fi

# Check and restart Nginx
log "Restarting Nginx..."
if sudo nginx -t; then
    sudo systemctl restart nginx
else
    log "Error: Nginx configuration test failed"
    exit 1
fi

# Verify services
log "Verifying services..."
services=("nginx" "gunicorn" "pm2-ubuntu")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        log "$service is running"
    else
        log "Warning: $service is not running"
    fi
done

# Clean up old deployments
log "Cleaning up..."
find $APP_DIR/../backup_*.bundle -mtime +7 -delete

# Final status check
log "Checking application status..."
curl -s -o /dev/null -w "%{http_code}" https://pathfindersgifts.com/health || log "Warning: Health check failed"

log "Deployment completed successfully!" 