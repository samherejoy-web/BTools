#!/bin/bash

# MarketMind AI Production Build Script
# This script builds the application for production deployment with PostgreSQL

set -e  # Exit on any error

echo "🚀 MarketMind AI Production Build Started"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Make sure this is intended for production deployment."
fi

# Step 1: Environment Setup
print_status "Step 1: Setting up production environment..."

# Create production directories
mkdir -p /var/www/marketmind/{backend,frontend,logs,backups}
mkdir -p /var/log/marketmind

# Copy environment files
if [ ! -f "/app/backend/.env" ]; then
    print_status "Creating production .env file for backend..."
    cp /app/backend/.env.production /app/backend/.env
    print_warning "Please update database credentials in /app/backend/.env"
fi

if [ ! -f "/app/frontend/.env" ]; then
    print_status "Creating production .env file for frontend..."
    cp /app/frontend/.env.production /app/frontend/.env
    print_warning "Please update REACT_APP_BACKEND_URL in /app/frontend/.env"
fi

# Step 2: Database Setup
print_status "Step 2: PostgreSQL Database Setup..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL first."
    print_status "To install PostgreSQL on Ubuntu/Debian:"
    print_status "sudo apt update && sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Check if database exists and credentials are configured
print_status "Checking database configuration..."
if grep -q "your_secure_password_here" /app/backend/.env; then
    print_error "Please update the database credentials in /app/backend/.env"
    print_status "Edit the file and replace 'your_secure_password_here' with a secure password"
    exit 1
fi

# Step 3: Backend Setup
print_status "Step 3: Backend Production Setup..."

cd /app/backend

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Test database connection
print_status "Testing database connection..."
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
from production_database import get_database_info
info = get_database_info()
print(f'Database Type: {info[\"database_type\"]}')
print(f'Environment: {info[\"environment\"]}')
" || {
    print_error "Database connection test failed"
    print_status "Please check your database configuration and credentials"
    exit 1
}

# Create database tables
print_status "Creating database tables..."
python3 -c "
from production_database import Base, engine
from models import *
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

# Migrate data from SQLite to PostgreSQL (if SQLite database exists)
if [ -f "/app/backend/marketmind.db" ]; then
    print_status "Migrating data from SQLite to PostgreSQL..."
    python3 migrate_to_postgresql.py
    
    if [ $? -eq 0 ]; then
        print_status "Data migration completed successfully"
    else
        print_error "Data migration failed"
        exit 1
    fi
else
    print_warning "No SQLite database found. Skipping data migration."
fi

# Step 4: Frontend Production Build
print_status "Step 4: Frontend Production Build..."

cd /app/frontend

# Install dependencies
print_status "Installing frontend dependencies..."
yarn install --production=false

# Build for production
print_status "Building frontend for production..."
yarn build

if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Step 5: Production Deployment Setup
print_status "Step 5: Production Deployment Setup..."

# Copy backend files
print_status "Copying backend files to production directory..."
cp -r /app/backend/* /var/www/marketmind/backend/
chmod +x /var/www/marketmind/backend/*.py

# Copy frontend build
print_status "Copying frontend build to production directory..."
cp -r /app/frontend/build/* /var/www/marketmind/frontend/

# Set proper permissions
chown -R www-data:www-data /var/www/marketmind/ 2>/dev/null || true
chmod -R 755 /var/www/marketmind/

# Step 6: Create SystemD Service
print_status "Step 6: Creating SystemD service..."

cat > /etc/systemd/system/marketmind.service << 'EOF'
[Unit]
Description=MarketMind AI Backend Service
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/marketmind/backend
Environment=PATH=/usr/bin:/usr/local/bin
Environment=PYTHONPATH=/var/www/marketmind/backend
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=append:/var/log/marketmind/app.log
StandardError=append:/var/log/marketmind/error.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable marketmind.service

# Step 7: Nginx Configuration
print_status "Step 7: Nginx Configuration..."

cat > /etc/nginx/sites-available/marketmind << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (update with your certificate paths)
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React App)
    root /var/www/marketmind/frontend;
    index index.html;

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
    }

    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React App SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SEO Routes
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8001/api/sitemap.xml;
    }

    location = /robots.txt {
        proxy_pass http://127.0.0.1:8001/api/robots.txt;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/marketmind /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Step 8: Final Tests
print_status "Step 8: Running production tests..."

# Start the service
systemctl start marketmind.service

# Wait for service to start
sleep 5

# Test backend health
if curl -s http://localhost:8001/api/health > /dev/null; then
    print_status "✅ Backend health check passed"
else
    print_error "❌ Backend health check failed"
fi

# Test database connectivity
python3 -c "
import sys
sys.path.append('/var/www/marketmind/backend')
from production_database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM users'))
        count = result.fetchone()[0]
        print(f'✅ Database connectivity test passed. Users: {count}')
except Exception as e:
    print(f'❌ Database connectivity test failed: {e}')
    sys.exit(1)
" || {
    print_error "Database connectivity test failed"
    exit 1
}

# Step 9: Create Backup Script
print_status "Step 9: Creating backup script..."

cat > /var/www/marketmind/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script for MarketMind AI

BACKUP_DIR="/var/www/marketmind/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U marketmind -h localhost marketmind_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz \
    /var/www/marketmind/backend \
    /var/www/marketmind/frontend \
    --exclude='*.log' \
    --exclude='__pycache__' \
    --exclude='*.pyc'

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*_backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/marketmind/backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/marketmind/backup.sh") | crontab -

print_status "=========================================="
print_status "🎉 MarketMind AI Production Build Complete!"
print_status "=========================================="
echo ""
print_status "📋 POST-DEPLOYMENT CHECKLIST:"
echo "   1. Update domain names in Nginx configuration"
echo "   2. Configure SSL certificates"
echo "   3. Update CORS origins in backend .env"
echo "   4. Configure email SMTP settings"
echo "   5. Set up monitoring and alerts"
echo "   6. Test all functionality manually"
echo ""
print_status "🔧 Service Management:"
echo "   Start:   sudo systemctl start marketmind"
echo "   Stop:    sudo systemctl stop marketmind"
echo "   Restart: sudo systemctl restart marketmind"
echo "   Status:  sudo systemctl status marketmind"
echo "   Logs:    sudo journalctl -u marketmind -f"
echo ""
print_status "📊 Health Checks:"
echo "   Backend:  curl http://localhost:8001/api/health"
echo "   Database: Check logs at /var/log/marketmind/"
echo ""
print_status "🚀 Your MarketMind AI application is ready for production!"