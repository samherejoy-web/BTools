#!/bin/bash
# MarketMindAI Frontend - Quick Deployment Script
# Run this script on your production server after uploading the tar.gz package

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/marketmindai"
PACKAGE_NAME="marketmindai-frontend-production.tar.gz"
WEB_USER="www-data"  # Change if needed (nginx: nginx, apache: www-data)
BACKUP_DIR="/var/www/backups"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MarketMindAI Frontend Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root or sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
    echo "Please run with: sudo ./deploy-frontend.sh"
    exit 1
fi

# Check if package exists
if [ ! -f "$PACKAGE_NAME" ]; then
    echo -e "${RED}❌ Error: $PACKAGE_NAME not found in current directory${NC}"
    echo "Please ensure the package is in the same directory as this script"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup existing deployment
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="marketmindai-$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}📦 Creating backup: $BACKUP_NAME${NC}"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME"
    echo -e "${GREEN}✅ Backup created at: $BACKUP_DIR/$BACKUP_NAME${NC}\n"
fi

# Create deployment directory
echo -e "${BLUE}📁 Preparing deployment directory...${NC}"
mkdir -p "$DEPLOY_DIR"

# Clear existing files (keep backups)
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}🗑️  Clearing existing files...${NC}"
    rm -rf "$DEPLOY_DIR"/*
fi

# Extract package
echo -e "${BLUE}📦 Extracting production build...${NC}"
tar -xzf "$PACKAGE_NAME" -C "$DEPLOY_DIR"
echo -e "${GREEN}✅ Files extracted${NC}\n"

# Set permissions
echo -e "${BLUE}🔒 Setting permissions...${NC}"
chown -R "$WEB_USER:$WEB_USER" "$DEPLOY_DIR"
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
echo -e "${GREEN}✅ Permissions set${NC}\n"

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

# Check critical files
CRITICAL_FILES=("index.html" "static/css/main.740466d8.css" "static/js/main.17412436.js" "sw.js" "manifest.json")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$DEPLOY_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All critical files present${NC}"
else
    echo -e "${RED}❌ Missing files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "   - $file"
    done
    echo -e "\n${YELLOW}Deployment may be incomplete${NC}"
fi

# Count files
FILE_COUNT=$(find "$DEPLOY_DIR" -type f | wc -l)
DIR_COUNT=$(find "$DEPLOY_DIR" -type d | wc -l)
echo -e "${BLUE}📊 Deployment contains: $FILE_COUNT files in $DIR_COUNT directories${NC}\n"

# Check web server
echo -e "${BLUE}🔄 Checking web server...${NC}"

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    echo -e "${YELLOW}Testing nginx configuration...${NC}"
    if nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
        echo -e "${BLUE}🔄 Reloading nginx...${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx reloaded${NC}"
    else
        echo -e "${RED}❌ Nginx configuration has errors${NC}"
        nginx -t
    fi
elif systemctl is-active --quiet apache2; then
    echo -e "${GREEN}✅ Apache is running${NC}"
    echo -e "${YELLOW}Testing apache configuration...${NC}"
    if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
        echo -e "${GREEN}✅ Apache configuration is valid${NC}"
        echo -e "${BLUE}🔄 Reloading apache...${NC}"
        systemctl reload apache2
        echo -e "${GREEN}✅ Apache reloaded${NC}"
    else
        echo -e "${RED}❌ Apache configuration has errors${NC}"
        apache2ctl configtest
    fi
else
    echo -e "${YELLOW}⚠️  No web server detected (nginx/apache)${NC}"
    echo -e "Please configure your web server manually"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   Deploy directory: $DEPLOY_DIR"
echo -e "   Files deployed: $FILE_COUNT"
echo -e "   Backup location: $BACKUP_DIR"
echo -e ""

echo -e "${BLUE}🔍 Next Steps:${NC}"
echo -e "1. Test website: ${GREEN}https://marketmindai.com${NC}"
echo -e "2. Check API health: ${GREEN}https://marketmindai.com/api/health${NC}"
echo -e "3. Verify SEO tags in page source"
echo -e "4. Test on mobile devices"
echo -e "5. Submit sitemap to Google Search Console"
echo -e ""

echo -e "${BLUE}📝 Verification Commands:${NC}"
echo -e "# Test homepage"
echo -e "curl -I https://marketmindai.com"
echo -e ""
echo -e "# Test API"
echo -e "curl https://marketmindai.com/api/health"
echo -e ""
echo -e "# Check logs"
echo -e "tail -f /var/log/nginx/error.log  # for Nginx"
echo -e "tail -f /var/log/apache2/error.log  # for Apache"
echo -e ""

echo -e "${YELLOW}⚠️  If you encounter issues:${NC}"
echo -e "1. Check web server error logs"
echo -e "2. Verify backend is running: systemctl status backend"
echo -e "3. Test API proxy configuration"
echo -e "4. Restore from backup: cp -r $BACKUP_DIR/marketmindai-* $DEPLOY_DIR/"
echo -e ""

echo -e "${GREEN}🎉 Happy Deploying!${NC}"
