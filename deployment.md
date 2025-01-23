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

# Create deployment package
zip -r deployment.zip . \
    -x "*.git*" \
    -x "*.pytest_cache*" \
    -x "*__pycache__*" \
    -x "*.env*" \
    -x "pathfinders-client/node_modules/*" \
    -x "pathfinders-client/.next/*" \
    -x "pathfinders.pem"
```

## 2. EC2 Deployment

### Transfer Files
```bash
# Set key permissions
chmod 400 pathfinders.pem

# Transfer files to EC2
scp -i pathfinders.pem deployment.zip ec2-user@13.61.197.147:/home/ec2-user/
scp -i pathfinders.pem appspec.yml ec2-user@13.61.197.147:/home/ec2-user/
scp -r -i pathfinders.pem scripts ec2-user@13.61.197.147:/home/ec2-user/
```

### SSH and Initial Setup
```bash
# Connect to EC2
ssh -i pathfinders.pem ec2-user@13.61.197.147

# Create environment file
cat > /home/ec2-user/app/.env << EOL
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

# Extract deployment package
unzip deployment.zip -d /home/ec2-user/app
cd /home/ec2-user/app
```

### System Dependencies
```bash
# Update system packages
sudo yum update -y
sudo yum install -y python3.11-devel gcc postgresql-devel
sudo yum groupinstall -y "Development Tools"

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
export PATH="/home/ec2-user/.local/bin:$PATH"
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
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/app
ExecStart=/home/ec2-user/.local/bin/poetry run gunicorn pathfinders_project.wsgi:application --bind 127.0.0.1:8000

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
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/app
ExecStart=/home/ec2-user/.local/bin/poetry run uvicorn fastapi_app.main:app --host 127.0.0.1 --port 8001

[Install]
WantedBy=multi-user.target
EOL
```

### Nginx Configuration
```bash
# Install certbot for SSL
sudo yum install -y certbot python3-certbot-nginx

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
        alias /home/ec2-user/app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias /home/ec2-user/app/media/;
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

### Static Files Setup
```bash
# Create required directories
sudo mkdir -p /home/ec2-user/app/staticfiles
sudo mkdir -p /home/ec2-user/app/media

# Set correct permissions
sudo chown -R ec2-user:ec2-user /home/ec2-user/app/staticfiles
sudo chown -R ec2-user:ec2-user /home/ec2-user/app/media
sudo chmod -R 755 /home/ec2-user/app/staticfiles
sudo chmod -R 755 /home/ec2-user/app/media

# Collect static files
cd /home/ec2-user/app
poetry run python manage.py collectstatic --noinput --clear

# Verify static files
ls -la /home/ec2-user/app/staticfiles/
```

### SSL Certificate Auto-renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cronjob for certificate renewal
sudo crontab -e
# Add this line:
0 0 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 4. Start Services
```bash
# Start and enable services
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl start fastapi
sudo systemctl enable fastapi
sudo systemctl restart nginx
```

## 5. Verification and Troubleshooting

### Check Service Status
```bash
# Check all services
sudo systemctl status gunicorn
sudo systemctl status fastapi
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u gunicorn -f
sudo journalctl -u fastapi -f
sudo tail -f /var/log/nginx/error.log
```

### Common Issues

#### Permission Issues
```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /home/ec2-user/app
```

#### Service Issues
```bash
# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart fastapi
sudo systemctl restart nginx
```

#### SELinux Issues
```bash
# If encountering SELinux-related issues
sudo setsebool -P httpd_can_network_connect 1
```

### SSL Certificate Verification
```bash
# Check SSL certificate status
sudo certbot certificates

# Test SSL configuration
curl -vI https://pathfindersgifts.com

# Verify Nginx SSL configuration
sudo nginx -t
```

### Static Files Verification
```bash
# Check static files are being served
curl -I https://pathfindersgifts.com/static/admin/css/base.css
curl -I https://pathfindersgifts.com/static/rest_framework/css/bootstrap.min.css
```

## 6. Security Reminders
- Update the database password after initial deployment
- Configure SSL/TLS certificates
- Regularly update system packages
- Monitor application logs
- Back up your database regularly

## 7. Post-Deployment
- Verify the application at http://pathfindersgifts.com
- Test all major functionality
- Monitor error logs for any issues
- Set up monitoring and alerts

