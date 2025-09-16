# MarketMind Production Deployment Guide - marketmindai.com

## 🎯 DEPLOYMENT OVERVIEW

This guide provides step-by-step instructions to deploy your MarketMind application to **marketmindai.com** using aaPanel hosting with secure production configuration.

**Architecture:**
- **Domain**: marketmindai.com
- **Frontend**: React production build (Static files)
- **Backend**: FastAPI Python application
- **Database**: PostgreSQL (recommended) or MySQL
- **Hosting**: aaPanel (Linux server management)
- **SSL**: Let's Encrypt SSL certificate
- **Process Management**: PM2 or Supervisor

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Required Access & Information**
- [ ] aaPanel admin access
- [ ] SSH access to server
- [ ] Domain DNS access (to point marketmindai.com to server)
- [ ] Server with Python 3.11+, Node.js 18+
- [ ] Email SMTP credentials (for production emails)

### ✅ **Current Configuration Analysis**
Your current setup:
```
Frontend URL: https://sync-codebase-8.preview.emergentagent.com
Database: SQLite (needs upgrade for production)
Secret Key: Placeholder (needs secure generation)
CORS: Wildcard (*) - needs restriction
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

## PHASE 1: SERVER PREPARATION

### Step 1: aaPanel Server Setup

#### 1.1 Access aaPanel Dashboard
```bash
# SSH into your server
ssh root@your-server-ip

# If aaPanel not installed, install it:
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && bash install.sh
```

#### 1.2 Install Required Software
In aaPanel dashboard, install:
- **Python 3.11+** 
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** (recommended) or **MySQL 8.0+**
- **Nginx** (for reverse proxy)
- **PM2** (for process management)

#### 1.3 Create Website in aaPanel
1. Go to **Website** → **Add Site**
2. Domain: `marketmindai.com`
3. Document root: `/www/wwwroot/marketmindai.com`
4. Enable SSL (Let's Encrypt)

### Step 2: Database Setup

#### 2.1 Create Production Database
```sql
-- Option A: PostgreSQL (Recommended)
CREATE DATABASE marketmind_prod;
CREATE USER marketmind_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE marketmind_prod TO marketmind_user;

-- Option B: MySQL
CREATE DATABASE marketmind_prod;
CREATE USER 'marketmind_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON marketmind_prod.* TO 'marketmind_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2.2 Database Connection Testing
```bash
# Test PostgreSQL connection
psql -h localhost -U marketmind_user -d marketmind_prod

# Test MySQL connection  
mysql -u marketmind_user -p marketmind_prod
```

---

## PHASE 2: BACKEND DEPLOYMENT

### Step 3: Backend Application Setup

#### 3.1 Create Application Directory
```bash
# Create application directory
mkdir -p /www/wwwroot/marketmindai.com/backend
cd /www/wwwroot/marketmindai.com/backend

# Set proper ownership
chown -R www:www /www/wwwroot/marketmindai.com
```

#### 3.2 Upload Backend Files
Upload your entire backend directory to `/www/wwwroot/marketmindai.com/backend/`:
```
backend/
├── server.py
├── models.py
├── database.py
├── requirements.txt
├── .env (production version)
└── [all other backend files]
```

#### 3.3 Create Production Environment File
```bash
# Create production .env file
cat > /www/wwwroot/marketmindai.com/backend/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://marketmind_user:your-secure-password@localhost/marketmind_prod"
# Alternative MySQL: DATABASE_URL="mysql+pymysql://marketmind_user:your-secure-password@localhost/marketmind_prod"

# Security
SECRET_KEY="$(openssl rand -hex 32)"
JWT_SECRET_KEY="$(openssl rand -hex 32)"

# CORS Configuration
CORS_ORIGINS=["https://marketmindai.com", "https://www.marketmindai.com"]

# Email Configuration (Production SMTP)
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="your-app-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FROM_EMAIL="noreply@marketmindai.com"

# AI API Keys (Your existing keys)
GROQ_API_KEY="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"

# Production Settings
ENVIRONMENT="production"
DEBUG=False

# File Upload Settings
MAX_UPLOAD_SIZE=10485760
UPLOAD_PATH="/www/wwwroot/marketmindai.com/backend/uploads"

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379/0"
EOF
```

#### 3.4 Install Python Dependencies
```bash
cd /www/wwwroot/marketmindai.com/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install additional production dependencies
pip install psycopg2-binary  # For PostgreSQL
# pip install PyMySQL  # For MySQL (alternative)
pip install gunicorn  # Production WSGI server
pip install redis  # For caching (optional)
```

#### 3.5 Database Migration
```bash
# Run database migrations
cd /www/wwwroot/marketmindai.com/backend
source venv/bin/activate

# Create tables and migrate data
python -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

# If migrating from SQLite, export and import data
# python migrate_sqlite_to_postgres.py  # You'll need to create this script
```

#### 3.6 Test Backend
```bash
# Test backend locally
cd /www/wwwroot/marketmindai.com/backend
source venv/bin/activate
python server.py

# Should see: "Application startup complete"
```

### Step 4: Backend Process Management

#### 4.1 Create Gunicorn Configuration
```bash
cat > /www/wwwroot/marketmindai.com/backend/gunicorn.conf.py << 'EOF'
import multiprocessing

# Server socket
bind = "127.0.0.1:8001"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 5

# Restart workers after this many requests, to control memory leaks
max_requests = 1000
max_requests_jitter = 100

# Logging
accesslog = "/www/wwwroot/marketmindai.com/logs/access.log"
errorlog = "/www/wwwroot/marketmindai.com/logs/error.log"
loglevel = "info"

# Process naming
proc_name = "marketmind_backend"

# Server mechanics
daemon = False
pidfile = "/www/wwwroot/marketmindai.com/backend/gunicorn.pid"
user = "www"
group = "www"
tmp_upload_dir = None

# SSL (handled by Nginx)
forwarded_allow_ips = "127.0.0.1"
secure_scheme_headers = {
    'X-FORWARDED-PROTOCOL': 'ssl',
    'X-FORWARDED-PROTO': 'https',
    'X-FORWARDED-SSL': 'on'
}
EOF
```

#### 4.2 Create Systemd Service
```bash
cat > /etc/systemd/system/marketmind-backend.service << 'EOF'
[Unit]
Description=MarketMind FastAPI Backend
After=network.target

[Service]
Type=exec
User=www
Group=www
WorkingDirectory=/www/wwwroot/marketmindai.com/backend
Environment=PATH=/www/wwwroot/marketmindai.com/backend/venv/bin
ExecStart=/www/wwwroot/marketmindai.com/backend/venv/bin/gunicorn server:app -c gunicorn.conf.py
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable marketmind-backend
systemctl start marketmind-backend
systemctl status marketmind-backend
```

---

## PHASE 3: FRONTEND DEPLOYMENT

### Step 5: Frontend Build & Deployment

#### 5.1 Update Frontend Environment
```bash
# Create production .env file for frontend
cat > /tmp/frontend_production.env << 'EOF'
REACT_APP_BACKEND_URL=https://marketmindai.com
GENERATE_SOURCEMAP=false
EOF
```

#### 5.2 Build Frontend Locally (Then Upload)
On your development machine:
```bash
# Update frontend/.env with production URL
echo "REACT_APP_BACKEND_URL=https://marketmindai.com" > frontend/.env

# Build production version
cd frontend
yarn install
yarn build

# The build/ folder will contain optimized static files
```

#### 5.3 Upload Frontend Build
Upload the contents of `frontend/build/` to `/www/wwwroot/marketmindai.com/public/`:
```bash
# On server
mkdir -p /www/wwwroot/marketmindai.com/public
# Upload all files from frontend/build/ to this directory

# Set proper permissions
chown -R www:www /www/wwwroot/marketmindai.com/public
chmod -R 755 /www/wwwroot/marketmindai.com/public
```

---

## PHASE 4: NGINX CONFIGURATION

### Step 6: Nginx Setup

#### 6.1 Create Nginx Configuration
```bash
cat > /www/server/panel/vhost/nginx/marketmindai.com.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name marketmindai.com www.marketmindai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name marketmindai.com www.marketmindai.com;
    
    # SSL Configuration (Let's Encrypt - managed by aaPanel)
    ssl_certificate /www/server/panel/vhost/cert/marketmindai.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/marketmindai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Document Root
    root /www/wwwroot/marketmindai.com/public;
    index index.html index.htm;
    
    # API Routes (Backend)
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Static Assets with Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # React App - SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache HTML files for shorter period
        location ~* \.html$ {
            expires 5m;
            add_header Cache-Control "public";
        }
    }
    
    # Sitemap and Robots
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8001/api/sitemap.xml;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location = /robots.txt {
        proxy_pass http://127.0.0.1:8001/api/robots.txt;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.env {
        deny all;
    }
    
    # Error Pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /www/wwwroot/marketmindai.com/public;
    }
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }
}
EOF

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## PHASE 5: SSL & SECURITY

### Step 7: SSL Certificate Setup

#### 7.1 SSL via aaPanel (Recommended)
1. Go to **Website** → **SSL**
2. Select **Let's Encrypt**
3. Add domains: `marketmindai.com`, `www.marketmindai.com`
4. Click **Apply**

#### 7.2 Manual SSL Setup (Alternative)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d marketmindai.com -d www.marketmindai.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 8: Security Hardening

#### 8.1 Firewall Configuration
```bash
# Configure UFW firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

#### 8.2 Fail2Ban Setup
```bash
# Install Fail2Ban
apt install fail2ban

# Configure Fail2Ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-botsearch]
enabled = true
EOF

systemctl restart fail2ban
```

---

## PHASE 6: MONITORING & LOGS

### Step 9: Logging Setup

#### 9.1 Create Log Directories
```bash
mkdir -p /www/wwwroot/marketmindai.com/logs
chown -R www:www /www/wwwroot/marketmindai.com/logs
```

#### 9.2 Log Rotation
```bash
cat > /etc/logrotate.d/marketmind << 'EOF'
/www/wwwroot/marketmindai.com/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www www
    postrotate
        systemctl reload marketmind-backend
    endscript
}
EOF
```

### Step 10: Monitoring Setup

#### 10.1 Health Check Script
```bash
cat > /www/wwwroot/marketmindai.com/scripts/health_check.sh << 'EOF'
#!/bin/bash

# Check backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/api/health)

if [ "$BACKEND_STATUS" != "200" ]; then
    echo "Backend unhealthy (Status: $BACKEND_STATUS)"
    systemctl restart marketmind-backend
    # Send alert email
    echo "MarketMind backend restarted at $(date)" | mail -s "MarketMind Alert" admin@marketmindai.com
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "Disk usage critical: ${DISK_USAGE}%" | mail -s "Disk Space Alert" admin@marketmindai.com
fi
EOF

chmod +x /www/wwwroot/marketmindai.com/scripts/health_check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /www/wwwroot/marketmindai.com/scripts/health_check.sh
```

---

## PHASE 7: FINAL TESTING & GO-LIVE

### Step 11: Pre-Launch Testing

#### 11.1 Backend API Testing
```bash
# Test backend endpoints
curl -X GET https://marketmindai.com/api/health
curl -X GET https://marketmindai.com/api/tools
curl -X GET https://marketmindai.com/api/blogs
curl -X GET https://marketmindai.com/api/sitemap.xml
curl -X GET https://marketmindai.com/api/robots.txt
```

#### 11.2 Frontend Testing
- Visit https://marketmindai.com
- Test navigation (Home, Tools, Blogs, Compare)
- Test individual tool pages
- Test blog pages
- Test search functionality
- Test responsive design on mobile

#### 11.3 SEO Testing
```bash
# Test meta tags
curl -s https://marketmindai.com | grep -E "(title>|meta name=\"description\"|og:title)"

# Test structured data
curl -s https://marketmindai.com/tools/notion | grep -A 10 "application/ld+json"
```

### Step 12: DNS Configuration

#### 12.1 Update DNS Records
Point your domain to the server:
```
A Record: marketmindai.com → Your-Server-IP
A Record: www.marketmindai.com → Your-Server-IP
```

#### 12.2 Verify DNS Propagation
```bash
# Check DNS propagation
nslookup marketmindai.com
dig marketmindai.com
```

---

## 🔧 POST-DEPLOYMENT TASKS

### Step 13: Performance Optimization

#### 13.1 Enable Redis Caching (Optional)
```bash
# Install Redis
apt install redis-server

# Configure Redis for caching
# Update backend/.env to include Redis URL
echo "REDIS_URL=redis://localhost:6379/0" >> /www/wwwroot/marketmindai.com/backend/.env
```

#### 13.2 CDN Setup (Optional)
Consider using Cloudflare or similar CDN for:
- Static asset caching
- DDoS protection
- Global performance

### Step 14: Backup Strategy

#### 14.1 Database Backup
```bash
cat > /www/wwwroot/marketmindai.com/scripts/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/www/backup/marketmind"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U marketmind_user -h localhost marketmind_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: $DATE"
EOF

chmod +x /www/wwwroot/marketmindai.com/scripts/backup_db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /www/wwwroot/marketmindai.com/scripts/backup_db.sh
```

#### 14.2 File System Backup
```bash
cat > /www/wwwroot/marketmindai.com/scripts/backup_files.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/www/backup/marketmind"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup application files
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz \
  /www/wwwroot/marketmindai.com/backend \
  /www/wwwroot/marketmindai.com/public \
  --exclude='*.log' \
  --exclude='__pycache__' \
  --exclude='node_modules'

# Keep only last 7 days
find $BACKUP_DIR -name "files_backup_*.tar.gz" -mtime +7 -delete

echo "Files backup completed: $DATE"
EOF

chmod +x /www/wwwroot/marketmindai.com/scripts/backup_files.sh
```

---

## 📊 MONITORING & MAINTENANCE

### Step 15: Ongoing Monitoring

#### 15.1 Key Metrics to Monitor
- **Server Resources**: CPU, Memory, Disk usage
- **Application Performance**: Response times, error rates
- **Database Performance**: Query performance, connections
- **SSL Certificate**: Expiration dates
- **Security**: Failed login attempts, suspicious traffic

#### 15.2 Log Monitoring
```bash
# Monitor application logs
tail -f /www/wwwroot/marketmindai.com/logs/error.log

# Monitor Nginx access logs
tail -f /www/server/nginx/logs/access.log

# Monitor system logs
tail -f /var/log/syslog
```

### Step 16: Update Procedures

#### 16.1 Application Updates
```bash
# Backend updates
cd /www/wwwroot/marketmindai.com/backend
source venv/bin/activate
git pull origin main  # If using Git
pip install -r requirements.txt
systemctl restart marketmind-backend

# Frontend updates
# Build new version locally, then upload to /www/wwwroot/marketmindai.com/public/
```

#### 16.2 Security Updates
```bash
# System updates
apt update && apt upgrade -y

# Python package updates
pip list --outdated
pip install --upgrade package-name
```

---

## 🚨 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Backend Not Starting
```bash
# Check service status
systemctl status marketmind-backend

# Check logs
journalctl -u marketmind-backend -f

# Common fixes:
# 1. Check database connection
# 2. Verify environment variables
# 3. Check file permissions
# 4. Verify Python dependencies
```

#### Frontend Not Loading
```bash
# Check Nginx configuration
nginx -t

# Check Nginx logs
tail -f /www/server/nginx/logs/error.log

# Common fixes:
# 1. Check file permissions
# 2. Verify Nginx configuration
# 3. Clear browser cache
# 4. Check DNS propagation
```

#### Database Connection Issues
```bash
# Test database connection
psql -U marketmind_user -h localhost -d marketmind_prod

# Check database logs
tail -f /var/log/postgresql/postgresql-*.log

# Common fixes:
# 1. Verify credentials in .env
# 2. Check database service status
# 3. Verify network connectivity
# 4. Review database permissions
```

#### SSL Certificate Issues
```bash
# Check certificate status
openssl x509 -in /www/server/panel/vhost/cert/marketmindai.com/fullchain.pem -text -noout

# Renew certificate
certbot renew --dry-run

# Common fixes:
# 1. Check domain DNS
# 2. Verify certificate paths
# 3. Restart Nginx after renewal
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment Checklist
- [ ] Server access confirmed (SSH, aaPanel)
- [ ] Domain DNS configured
- [ ] SSL certificate ready
- [ ] Database created and configured
- [ ] Environment variables configured
- [ ] SMTP email settings configured

### Deployment Checklist
- [ ] Backend files uploaded
- [ ] Python dependencies installed
- [ ] Database tables created
- [ ] Backend service configured and running
- [ ] Frontend build uploaded
- [ ] Nginx configuration applied
- [ ] SSL certificate installed
- [ ] Firewall configured

### Post-Deployment Checklist
- [ ] All API endpoints tested
- [ ] Frontend functionality verified
- [ ] SEO meta tags working
- [ ] Sitemap and robots.txt accessible
- [ ] Email functionality tested
- [ ] Monitoring configured
- [ ] Backup scripts configured
- [ ] Performance optimized

---

## 🎯 FINAL NOTES

### Security Best Practices
1. **Regular Updates**: Keep system and dependencies updated
2. **Strong Passwords**: Use complex passwords for all accounts
3. **Limited Access**: Restrict SSH and database access
4. **Monitoring**: Set up alerts for suspicious activity
5. **Backups**: Regular automated backups
6. **SSL**: Always use HTTPS for all traffic

### Performance Optimization
1. **Database Indexing**: Optimize database queries
2. **Caching**: Implement Redis caching
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable Gzip compression
5. **Monitoring**: Monitor performance metrics

### Support & Maintenance
- **Documentation**: Keep deployment documentation updated
- **Monitoring**: Regular health checks and monitoring
- **Backups**: Automated daily backups
- **Updates**: Regular security and feature updates
- **Support**: Have emergency contact procedures

---

**🚀 Your MarketMind application is now ready for production deployment at marketmindai.com!**

*Last updated: January 15, 2025*  
*Version: Production Deployment Guide v1.0*