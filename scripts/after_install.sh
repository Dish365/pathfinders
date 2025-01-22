#!/bin/bash
cd /var/www/pathfinders

# Install dependencies
pip install poetry
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