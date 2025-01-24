#!/bin/bash
cd /var/www/pathfinders

# Install system dependencies
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev libpq-dev nginx

# Install dependencies
sudo pip3 install poetry
poetry config virtualenvs.create false
poetry install

cd pathfinders-client
yarn install

# Build frontend
yarn build

# Collect static files
cd ..
poetry run python manage.py collectstatic --noinput

# Run migrations
poetry run python manage.py migrate --noinput

# Set correct permissions
sudo chown -R ubuntu:ubuntu /var/www/pathfinders 