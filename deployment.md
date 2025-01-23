# Pathfinders Deployment Guide (AWS EC2)

## 1. Local Environment Setup

### Frontend Build
```bash
# Build Next.js frontend
cd pathfinders-client
yarn install
yarn build
cd ..
```

### Backend Setup
```bash
# Install Python dependencies
poetry install

# Collect static files
poetry run python manage.py collectstatic --noinput
```

## 2. EC2 Deployment

### Initial Server Setup
```bash
# Connect to EC2
ssh -i pathfinders.pem ubuntu@13.61.197.147

# Install Git
sudo apt update
sudo apt install -y git

# Set up Git credentials (replace with your details)
git config --global user.name "Dish365"
git config --global user.email "dishdevinfo@gmail.com"

# Create SSH key for GitHub (if needed)
ssh-keygen -t ed25519 -C "dishdevinfo@gmail.com"
cat ~/.ssh/id_ed25519.pub
# Add this key to your GitHub account at https://github.com/settings/keys

# Clone the repository
git clone git@github.com:Dish365/pathfinders.git /home/ubuntu/app
cd /home/ubuntu/app

# Create and configure environment file
cat > .env << EOL
DB_USER=pathfinders_db
DB_PASSWORD=vYqzB@MiguJR8k6
DB_HOST=pathfinders.c3oqsqcmizjz.eu-north-1.rds.amazonaws.com
DB_NAME=pathfinders
DB_PORT=5432
DEBUG=False
ALLOWED_HOSTS=pathfindersgifts.com,www.pathfindersgifts.com,13.61.197.147
FASTAPI_URL=http://localhost:8001
DJANGO_API_URL=http://localhost:8000
EOL
```

### System Dependencies
```bash
# Update system packages
sudo apt update
sudo apt install -y python3.11-dev build-essential libpq-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
export PATH="/home/ubuntu/.local/bin:$PATH"
```

### Application Setup
```bash
# Install dependencies
poetry install
cd pathfinders-client && yarn install && yarn build && cd ..

# Database migrations and initial data
poetry run python manage.py migrate
poetry run python manage.py load_questions
```

## 3. Service Configuration

### Gunicorn Setup
```bash
sudo tee /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=Gunicorn daemon for Pathfinders
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/home/ubuntu/.local/bin/poetry run gunicorn pathfinders_project.wsgi:application --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
EOL
```

### FastAPI Setup
```bash
sudo tee /etc/systemd/system/fastapi.service << EOL
[Unit]
Description=FastAPI service for Pathfinders
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/home/ubuntu/.local/bin/poetry run uvicorn fastapi_app.main:app --host 127.0.0.1 --port 8001

[Install]
WantedBy=multi-user.target
EOL
```

### Nginx Configuration
```bash
# Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d pathfindersgifts.com -d www.pathfindersgifts.com

# Configure Nginx with SSL and static files
sudo tee /etc/nginx/conf.d/pathfinders.conf << EOL
server {
    listen 80;
    server_name pathfindersgifts.com www.pathfindersgifts.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name pathfindersgifts.com www.pathfindersgifts.com;

    ssl_certificate /etc/letsencrypt/live/pathfindersgifts.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pathfindersgifts.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Static files configuration
    location /static/ {
        alias /home/ubuntu/app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias /home/ubuntu/app/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/fastapi/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Additional security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOL
```