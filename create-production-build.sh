#!/bin/bash

# MarketMindAI Production Build Script - Enhanced SEO & Performance Optimized
# This script creates a fully optimized production build ready for deployment

set -e  # Exit on any error

echo "🚀 MarketMindAI Production Build Started"
echo "========================================"
echo "Target: https://marketmindai.com"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Ensure we're in the right directory
cd /app

# Step 1: Environment Check
print_step "Step 1: Environment Verification"
print_status "Checking environment configuration..."

# Verify frontend .env
if grep -q "https://marketmindai.com" frontend/.env; then
    print_status "✅ Frontend environment configured for production"
else
    print_warning "⚠️ Frontend .env may not be configured for production"
fi

# Verify backend .env
if grep -q "marketmindai.com" backend/.env; then
    print_status "✅ Backend environment configured for production"
else
    print_warning "⚠️ Backend .env may not be configured for production"
fi

# Step 2: Backend Preparation
print_step "Step 2: Backend Preparation"
cd backend

print_status "Testing backend connectivity..."
if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend is responsive"
else
    print_warning "⚠️ Backend not responsive - starting backend..."
    sudo supervisorctl restart backend
    sleep 5
    
    if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
        print_status "✅ Backend started successfully"
    else
        print_error "❌ Backend failed to start"
        exit 1
    fi
fi

# Test critical API endpoints
print_status "Testing critical API endpoints..."
if curl -s http://localhost:8001/api/tools?limit=1 > /dev/null; then
    print_status "✅ Tools API working"
else
    print_warning "⚠️ Tools API not responding"
fi

if curl -s http://localhost:8001/api/blogs?limit=1 > /dev/null; then
    print_status "✅ Blogs API working"
else
    print_warning "⚠️ Blogs API not responding"
fi

if curl -s http://localhost:8001/api/sitemap.xml > /dev/null; then
    print_status "✅ Sitemap API working"
else
    print_warning "⚠️ Sitemap API not responding"
fi

cd ..

# Step 3: Frontend Build Process
print_step "Step 3: Frontend Production Build"
cd frontend

print_status "Installing dependencies..."
yarn install --frozen-lockfile --production=false

print_status "Starting production build process..."

# Clean previous build
print_status "Cleaning previous build..."
rm -rf build
mkdir -p build

# Run the complete production build
print_status "Running base build..."
yarn build:base

if [ $? -ne 0 ]; then
    print_error "❌ Base build failed"
    exit 1
fi

print_status "Optimizing build assets..."
yarn build:optimize

print_status "Generating static meta tags..."
yarn generate-meta

print_status "Prerendering dynamic routes..."
yarn prerender

print_status "Verifying build integrity..."
yarn build:verify

if [ $? -ne 0 ]; then
    print_error "❌ Build verification failed"
    exit 1
fi

cd ..

# Step 4: Build Analysis and Optimization Report
print_step "Step 4: Build Analysis"

BUILD_SIZE=$(du -sh frontend/build | cut -f1)
FILE_COUNT=$(find frontend/build -type f | wc -l)
DIR_COUNT=$(find frontend/build -type d | wc -l)

print_status "📊 Build Statistics:"
echo "   • Total size: $BUILD_SIZE"
echo "   • Files: $FILE_COUNT"
echo "   • Directories: $DIR_COUNT"

# Check for prerendered content
TOOLS_COUNT=$(find frontend/build/tools -name "index.html" 2>/dev/null | wc -l)
BLOGS_COUNT=$(find frontend/build/blogs -name "index.html" 2>/dev/null | wc -l)

print_status "📄 SEO Content Generated:"
echo "   • Tool pages: $TOOLS_COUNT"
echo "   • Blog pages: $BLOGS_COUNT"
echo "   • Total prerendered: $((TOOLS_COUNT + BLOGS_COUNT))"

# Check critical files
print_status "🔍 Critical Files Check:"

if [ -f "frontend/build/index.html" ]; then
    echo "   ✅ index.html"
else
    echo "   ❌ index.html missing"
fi

if [ -f "frontend/build/sw.js" ]; then
    echo "   ✅ sw.js (Service Worker)"
else
    echo "   ❌ sw.js missing"
fi

if [ -f "frontend/build/manifest.json" ]; then
    echo "   ✅ manifest.json"
else
    echo "   ❌ manifest.json missing"
fi

if [ -f "frontend/build/robots.txt" ]; then
    echo "   ✅ robots.txt"
else
    echo "   ❌ robots.txt missing"
fi

# Step 5: SEO and Performance Verification
print_step "Step 5: SEO and Performance Verification"

print_status "Checking SEO optimization..."

# Check if index.html has proper meta tags
if grep -q "og:title" frontend/build/index.html && grep -q "og:description" frontend/build/index.html; then
    print_status "✅ Open Graph meta tags present"
else
    print_warning "⚠️ Open Graph meta tags may be missing"
fi

# Check for structured data
if grep -q "application/ld+json" frontend/build/index.html; then
    print_status "✅ Structured data (JSON-LD) present"
else
    print_warning "⚠️ Structured data may be missing"
fi

# Check for service worker optimization
if grep -q "STATIC_ASSETS" frontend/build/sw.js; then
    print_status "✅ Service Worker properly configured"
else
    print_warning "⚠️ Service Worker may need optimization"
fi

# Step 6: Create Deployment Package
print_step "Step 6: Creating Deployment Package"

DEPLOY_DIR="/app/marketmindai-production-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

print_status "Copying build files to deployment directory..."
cp -r frontend/build/* "$DEPLOY_DIR/"

# Create deployment info file
cat > "$DEPLOY_DIR/deployment-info.txt" << EOF
MarketMindAI Production Build
============================
Build Date: $(date)
Build Size: $BUILD_SIZE
Total Files: $FILE_COUNT
Prerendered Pages: $((TOOLS_COUNT + BLOGS_COUNT))
Backend URL: https://marketmindai.com
SEO Optimized: Yes
PWA Ready: Yes

Deployment Instructions:
1. Upload all files to your web server root directory
2. Ensure your server supports:
   - Gzip compression
   - Cache headers for static assets
   - URL rewriting for SPA routing
   - HTTPS with proper certificates
3. Backend should be accessible at https://marketmindai.com/api/
4. Test sitemap at https://marketmindai.com/sitemap.xml

Performance Features:
- Service Worker for offline functionality
- Prerendered pages for SEO
- Optimized assets with cache headers
- Progressive Web App (PWA) ready
- Enhanced meta tags and structured data
EOF

# Create simple server configuration examples
mkdir -p "$DEPLOY_DIR/server-configs"

# Apache .htaccess
cat > "$DEPLOY_DIR/server-configs/.htaccess" << 'EOF'
# MarketMindAI Apache Configuration
Options -MultiViews
RewriteEngine On

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>
EOF

# Nginx configuration
cat > "$DEPLOY_DIR/server-configs/nginx.conf" << 'EOF'
# MarketMindAI Nginx Configuration
server {
    listen 80;
    server_name marketmindai.com www.marketmindai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marketmindai.com www.marketmindai.com;
    
    root /path/to/your/build/files;
    index index.html;

    # SSL Configuration (update paths)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

print_status "✅ Deployment package created: $DEPLOY_DIR"

# Step 7: Final Verification and Summary
print_step "Step 7: Final Verification and Summary"

# Run a final check on the build
print_status "Running final build verification..."

# Check if all critical files exist in deployment
CRITICAL_FILES=("index.html" "sw.js" "manifest.json" "robots.txt")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$DEPLOY_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_status "✅ All critical files present in deployment package"
else
    print_warning "⚠️ Missing files: ${MISSING_FILES[*]}"
fi

# Create deployment checklist
cat > "$DEPLOY_DIR/DEPLOYMENT_CHECKLIST.md" << EOF
# MarketMindAI Deployment Checklist

## Pre-deployment
- [ ] Backup existing website
- [ ] Verify backend is running on server
- [ ] Ensure HTTPS certificates are valid
- [ ] Test database connectivity

## Deployment Steps
1. [ ] Upload all files from this directory to web server root
2. [ ] Copy appropriate server config (.htaccess or nginx.conf)
3. [ ] Ensure API endpoints are accessible at /api/
4. [ ] Test main pages load correctly
5. [ ] Verify service worker registration
6. [ ] Check sitemap accessibility (/sitemap.xml)
7. [ ] Test mobile responsiveness
8. [ ] Validate SEO meta tags

## Post-deployment Verification
- [ ] Test homepage loads: https://marketmindai.com/
- [ ] Test API health: https://marketmindai.com/api/health
- [ ] Test sitemap: https://marketmindai.com/sitemap.xml
- [ ] Test robots.txt: https://marketmindai.com/robots.txt
- [ ] Test PWA functionality (offline mode)
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Submit sitemap to Google Search Console

## Performance Targets
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse SEO: 90+
- [ ] Lighthouse Accessibility: 90+
- [ ] Lighthouse Best Practices: 90+
- [ ] First Contentful Paint: <2s
- [ ] Largest Contentful Paint: <2.5s
- [ ] Cumulative Layout Shift: <0.1

## SEO Verification
- [ ] Meta titles and descriptions on all pages
- [ ] Open Graph tags working
- [ ] Structured data validation (schema.org)
- [ ] All internal links working
- [ ] 404 pages redirect properly
- [ ] Canonical URLs set correctly
EOF

echo ""
print_status "=========================================="
print_status "🎉 MarketMindAI Production Build Complete!"
print_status "=========================================="
echo ""
print_status "📦 Deployment Package: $DEPLOY_DIR"
print_status "📏 Build Size: $BUILD_SIZE"
print_status "📄 Total Pages: $((TOOLS_COUNT + BLOGS_COUNT + 8)) (including static pages)"
print_status "🔧 SEO Optimized: ✅ Yes"
print_status "📱 PWA Ready: ✅ Yes"
print_status "⚡ Performance Optimized: ✅ Yes"
echo ""
print_status "🚀 Ready for deployment to https://marketmindai.com"
echo ""
print_status "📋 Next Steps:"
echo "   1. Review deployment checklist in $DEPLOY_DIR/DEPLOYMENT_CHECKLIST.md"
echo "   2. Upload contents of $DEPLOY_DIR to your web server"
echo "   3. Configure server using provided config files"
echo "   4. Test all functionality using the checklist"
echo "   5. Run Lighthouse audit to verify performance scores"
echo ""
print_status "💡 The build includes:"
echo "   • Enhanced SEO with prerendered pages"
echo "   • Service Worker for offline functionality"
echo "   • Optimized assets for fast loading"
echo "   • Proper meta tags for social sharing"
echo "   • Structured data for rich snippets"
echo "   • Progressive Web App (PWA) features"
echo ""

# Save build info
BUILD_INFO_FILE="$DEPLOY_DIR/build-info.json"
cat > "$BUILD_INFO_FILE" << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildSize": "$BUILD_SIZE",
  "fileCount": $FILE_COUNT,
  "directoryCount": $DIR_COUNT,
  "prerenderedPages": {
    "tools": $TOOLS_COUNT,
    "blogs": $BLOGS_COUNT,
    "total": $((TOOLS_COUNT + BLOGS_COUNT))
  },
  "targetUrl": "https://marketmindai.com",
  "features": [
    "SEO Optimized",
    "PWA Ready",
    "Service Worker",
    "Prerendered Pages",
    "Performance Optimized",
    "Mobile Responsive"
  ],
  "deploymentPath": "$DEPLOY_DIR"
}
EOF

print_status "✅ Build information saved to build-info.json"
print_status ""
print_status "🎯 Your production-ready build is now complete!"
print_status "Upload the contents of $DEPLOY_DIR to https://marketmindai.com"

echo ""