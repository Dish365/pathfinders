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

# Update system packages
sudo apt update

# Install Git
sudo apt install -y git

# Set up Git credentials
git config --global user.name "Dish365"
git config --global user.email "dishdevinfo@gmail.com"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "dishdevinfo@gmail.com"
# When prompted for file location, just press Enter to use default
# When prompted for passphrase, you can press Enter for no passphrase

# Set up SSH directory and permissions
mkdir -p ~/.ssh
mv key_ed25519 ~/.ssh/id_ed25519
mv key_ed25519.pub ~/.ssh/id_ed25519.pub
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Start SSH agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Display public key to add to GitHub
cat ~/.ssh/id_ed25519.pub
# Copy this key and add it to GitHub at https://github.com/settings/keys

# Test GitHub connection
ssh -T git@github.com
# Type 'yes' when prompted to continue connecting

# Create app directory and set permissions
sudo mkdir -p /home/ubuntu/app
sudo chown ubuntu:ubuntu /home/ubuntu/app

# Clone the repository
git clone git@github.com:Dish365/pathfinders.git /home/ubuntu/app
cd /home/ubuntu/app
```

### Environment Setup
```bash
# Create static directory
mkdir -p /home/ubuntu/app/static
mkdir -p /home/ubuntu/app/staticfiles


```

### System Dependencies
```bash
# Update system packages
sudo apt update
sudo apt install -y python3-dev python3.12-dev build-essential libpq-dev

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install -y yarn

# Verify installations
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x or higher
yarn --version  # Should show 1.22.x or higher
python3 --version  # Should show Python 3.12.x

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
export PATH="/home/ubuntu/.local/bin:$PATH"

# Add PATH to .bashrc for persistence
echo 'export PATH="/home/ubuntu/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Application Setup
```bash
# Install dependencies
cd /home/ubuntu/app

# Install Python dependencies with Poetry
poetry config virtualenvs.in-project true  # Keep virtualenv in project directory
poetry install --no-root  # Install dependencies without the project itself

# If you get any missing package errors, install them explicitly
poetry add pytz

# Build frontend
cd pathfinders-client && yarn install && yarn build && cd ..

# Database migrations and initial data
poetry run python manage.py migrate
poetry run python manage.py load_questions

# Test Django directly
poetry run python manage.py check

# Try running Django development server temporarily to see any errors
poetry run python manage.py runserver 0.0.0.0:8002

mkdir -p /home/ubuntu/app/templates
cp /home/ubuntu/app/pathfinders-client/.next/server/pages/index.html /home/ubuntu/app/templates/index.html
cp -r /home/ubuntu/app/pathfinders-client/.next/static /home/ubuntu/app/pathfinders-client/.next/
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
ExecStart=/home/ubuntu/.local/bin/poetry run gunicorn pathfinders_project.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --timeout 120 \
    --keep-alive 5

Restart=always
RestartSec=5

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
Environment="PATH=/home/ubuntu/.local/bin:$PATH"
ExecStart=/home/ubuntu/.local/bin/poetry run uvicorn fastapi_app.main:app \
    --host 127.0.0.1 \
    --port 8001 \
    --workers 2 \
    --limit-concurrency 50 \
    --backlog 2048 \
    --timeout-keep-alive 5 \
    --proxy-headers \
    --forwarded-allow-ips='*'

Restart=always
RestartSec=5
StartLimitIntervalSec=0

[Install]
WantedBy=multi-user.target
EOL
```

### EC2 Security Group Configuration
```bash
# Configure EC2 Security Group in AWS Console:
# 1. Go to EC2 > Security Groups
# 2. Select the security group attached to your EC2 instance
# 3. Edit inbound rules and add:
#    - Type: HTTP, Port: 80, Source: 0.0.0.0/0
#    - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
#    - Type: PostgreSQL, Port: 5432, Source: Your RDS security group ID
```

### Nginx Configuration
```bash
# Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Create initial Nginx configuration without SSL
sudo tee /etc/nginx/conf.d/pathfinders.conf << 'EOL'
# Upstream definitions for load balancing
upstream nextjs_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream django_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

upstream fastapi_backend {
    server 127.0.0.1:8001;
    keepalive 32;
}

# HTTP server (redirect to HTTPS)
server {
    listen 80;
    server_name pathfindersgifts.com www.pathfindersgifts.com;

    # Block WordPress probing attempts
    location ~* ^/wp-(admin|login|content|includes) {
        deny all;
        return 404;
    }

    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name pathfindersgifts.com www.pathfindersgifts.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/pathfindersgifts.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pathfindersgifts.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;        
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Block WordPress probing attempts
    location ~* ^/wp-(admin|login|content|includes) {
        deny all;
        return 404;
    }

    # Django static files
    location /static/ {
        alias /home/ubuntu/app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
        gzip_static on;
    }

    # Next.js static files
    location /_next/static/ {
        alias /home/ubuntu/app/pathfinders-client/.next/static/;       
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri $uri/ =404;
        access_log off;
        gzip_static on;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/app/media/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # FastAPI backend
    location /api/fastapi/ {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   
        proxy_set_header X-Forwarded-Proto $scheme;

        # Add CORS headers
        add_header Access-Control-Allow-Origin $http_origin always;    
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-CSRFToken" always;
        add_header Access-Control-Allow-Credentials "true" always;     
        add_header Access-Control-Max-Age "3600" always;

        # Handle OPTIONS method
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Django backend API
    location /api/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers for API
        add_header Access-Control-Allow-Origin $http_origin always;    
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-CSRFToken" always;
        add_header Access-Control-Allow-Credentials "true" always;     
        add_header Access-Control-Max-Age "3600" always;

        # Handle OPTIONS method for CORS preflight
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Django admin
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   
        proxy_set_header X-Forwarded-Proto $scheme;

        # Additional security for admin
        allow 13.61.197.147;  # Your server IP
        deny all;
    }

    # Everything else goes to Next.js
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    # Enable compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;   
}
EOL

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Verify Nginx is listening on port 80
sudo apt install -y net-tools
sudo netstat -tlpn | grep 'nginx'

# Important: Before running certbot, ensure:
# 1. DNS A records point to EC2 IP (13.61.197.147)
# 2. EC2 security group allows inbound traffic on ports 80 and 443
# 3. Nginx is running and accessible

# Get and install SSL certificate
sudo certbot --nginx -d pathfindersgifts.com -d www.pathfindersgifts.com

# Certbot will automatically modify the Nginx configuration to handle SSL
# and set up auto-renewal of certificates

# Verify Nginx configuration after SSL setup
sudo nginx -t
sudo systemctl restart nginx

# Verify SSL certificate installation
curl -vI https://pathfindersgifts.com
# Should show: SSL certificate verify ok
# And: HTTP/2 200

# Certificate will auto-renew via certbot's systemd timer
sudo systemctl status certbot.timer
```

### Final Steps
```bash
# Test Nginx configuration
sudo nginx -t

# Reload services
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
sudo systemctl restart fastapi
sudo systemctl restart nginx

# Enable services on boot
sudo systemctl enable gunicorn
sudo systemctl enable fastapi
sudo systemctl enable nginx

# Check Django/Gunicorn logs
sudo journalctl -u gunicorn -n 50

# Check FastAPI logs
sudo journalctl -u fastapi -n 50

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Django static files
curl -I https://pathfindersgifts.com/static/

# Test Next.js static files
curl -I https://pathfindersgifts.com/_next/static/

# Test Django API
curl -vI https://pathfindersgifts.com/api/

# Test FastAPI endpoint
curl -vI https://pathfindersgifts.com/api/fastapi/

curl -I http://pathfindersgifts.com

curl -I https://pathfindersgifts.com

sudo truncate -s 0 /var/log/nginx/error.log
sudo truncate -s 0 /var/log/nginx/access.log
sudo journalctl --rotate
sudo journalctl --vacuum-time=1s
```
./deploy.sh
chmod +x deploy.sh