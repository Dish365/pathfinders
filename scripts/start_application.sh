#!/bin/bash
cd /var/www/pathfinders

# Install required packages if not present
sudo apt-get install -y python3-dev

# Start FastAPI
pm2 start "poetry run uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8001" --name fastapi

# Start Django
pm2 start "poetry run gunicorn pathfinders_project.asgi:application -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000" --name django

# Start Next.js
cd pathfinders-client
pm2 start "yarn start" --name nextjs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 