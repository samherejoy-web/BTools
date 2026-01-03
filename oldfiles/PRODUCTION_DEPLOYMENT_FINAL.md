# MarketMindAI - Production Build Deployment Guide

## 🎯 Production Build Ready for marketmindai.com

### Build Information
- **Build Date**: $(date)
- **Build Location**: `/app/frontend/build/`
- **Backend URL**: https://marketmindai.com (with /api prefix)
- **Backend Port**: localhost:8001
- **Database**: PostgreSQL (configured for generic connection)
- **Build Size**: 2.0 MB (optimized)

---

## 📦 What's Included

### Frontend Build (Optimized)
✅ **Performance Optimized**
   - Minified JavaScript and CSS
   - Code splitting for faster load times
   - Asset optimization (1.9 MB total)
   - Service Worker for PWA functionality
   - Lazy loading for images and routes

✅ **SEO Optimized**
   - Pre-rendered static pages (about, contact, privacy, terms, tools, blogs)
   - Dynamic meta tags with React Helmet
   - robots.txt properly configured
   - sitemap.xml generation ready
   - Structured data (JSON-LD) for rich snippets
   - Open Graph and Twitter Card tags

✅ **Security Features**
   - CORS properly configured
   - Content Security Policy headers
   - XSS protection
   - Secure cookie settings

### Backend Configuration
✅ **API Endpoints** (All prefixed with /api)
   - Health check: `/api/health`
   - Tools: `/api/tools`
   - Blogs: `/api/blogs`
   - SEO: `/api/sitemap.xml`
   - Admin: `/api/admin/*`
   - Superadmin: `/api/superadmin/*`

✅ **Database Setup**
   - Development: SQLite (current)
   - Production: PostgreSQL ready (generic connection configured)
   - Migration script: `/app/backend/migrate_to_postgresql.py`

---

## 🚀 Deployment Steps

### Step 1: Backup Current Site (if exists)
```bash
# On your production server
sudo mkdir -p /backup/marketmindai_$(date +%Y%m%d)
sudo cp -r /www/wwwroot/marketmindai.com/* /backup/marketmindai_$(date +%Y%m%d)/
```

### Step 2: Clear and Deploy Frontend
```bash
# Remove old files (keep uploads and backend data)
sudo rm -rf /www/wwwroot/marketmindai.com/*

# Copy the optimized build
sudo cp -r /app/frontend/build/* /www/wwwroot/marketmindai.com/

# Set correct permissions
sudo chown -R www-data:www-data /www/wwwroot/marketmindai.com/
sudo chmod -R 755 /www/wwwroot/marketmindai.com/
```

### Step 3: Verify Nginx Configuration
Your nginx config is already correct! It includes:
- ✅ SSL/HTTPS configuration
- ✅ API proxy to localhost:8001
- ✅ CORS headers for API requests
- ✅ Static asset caching
- ✅ React SPA routing (try_files)
- ✅ Upload files handling

**No changes needed to nginx config!**

Just reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Setup Backend (if not already running)
```bash
# Navigate to backend directory
cd /app/backend

# Install dependencies (if needed)
pip install -r requirements.txt

# Start backend on port 8001
# Use supervisor, systemd, or screen
uvicorn server:app --host 127.0.0.1 --port 8001 --workers 4
```

**For Production with systemd:**
Create `/etc/systemd/system/marketmind-backend.service`:
```ini
[Unit]
Description=MarketMind AI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable marketmind-backend
sudo systemctl start marketmind-backend
sudo systemctl status marketmind-backend
```

### Step 5: Database Setup (PostgreSQL)

#### Create PostgreSQL Database:
```bash
sudo -u postgres psql << EOF
CREATE DATABASE marketmind_prod;
CREATE USER marketmind WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE marketmind_prod TO marketmind;
ALTER DATABASE marketmind_prod OWNER TO marketmind;
\q
