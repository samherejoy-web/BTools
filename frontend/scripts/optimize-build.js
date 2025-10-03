const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');

/**
 * Optimize build files for production performance
 */
function optimizeBuild() {
  console.log('🚀 Starting build optimization...');
  
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found');
    return false;
  }

  let optimizations = {
    serviceWorker: false,
    htmlOptimization: false,
    manifestOptimization: false,
    staticAssets: false
  };

  try {
    // 1. Optimize Service Worker with actual asset names
    optimizations.serviceWorker = optimizeServiceWorker();
    
    // 2. Optimize HTML files for better performance
    optimizations.htmlOptimization = optimizeHtmlFiles();
    
    // 3. Create/optimize manifest.json
    optimizations.manifestOptimization = optimizeManifest();
    
    // 4. Optimize static assets
    optimizations.staticAssets = optimizeStaticAssets();
    
    console.log('\n✅ Build optimization completed!');
    console.log('📊 Optimization results:', optimizations);
    
    return true;
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    return false;
  }
}

function optimizeServiceWorker() {
  try {
    const swPath = path.join(BUILD_DIR, 'sw.js');
    
    if (!fs.existsSync(swPath)) {
      console.log('⚠️ Service Worker not found, copying from public...');
      const publicSwPath = path.join(__dirname, '../public/sw.js');
      if (fs.existsSync(publicSwPath)) {
        fs.copyFileSync(publicSwPath, swPath);
      }
    }
    
    // Get actual built asset names
    const staticDir = path.join(BUILD_DIR, 'static');
    const actualAssets = [];
    
    if (fs.existsSync(staticDir)) {
      // Find CSS files
      const cssDir = path.join(staticDir, 'css');
      if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
        cssFiles.forEach(file => {
          actualAssets.push(`/static/css/${file}`);
        });
      }
      
      // Find JS files
      const jsDir = path.join(staticDir, 'js');
      if (fs.existsSync(jsDir)) {
        const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
        jsFiles.forEach(file => {
          actualAssets.push(`/static/js/${file}`);
        });
      }
    }
    
    if (fs.existsSync(swPath)) {
      let swContent = fs.readFileSync(swPath, 'utf8');
      
      // Update STATIC_ASSETS with actual file names
      const updatedAssets = [
        '/',
        '/manifest.json',
        '/favicon.ico',
        ...actualAssets
      ];
      
      swContent = swContent.replace(
        /const STATIC_ASSETS = \[[\s\S]*?\];/,
        `const STATIC_ASSETS = ${JSON.stringify(updatedAssets, null, 2)};`
      );
      
      fs.writeFileSync(swPath, swContent);
      console.log(`✅ Service Worker optimized with ${actualAssets.length} static assets`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Service Worker optimization failed:', error);
    return false;
  }
}

function optimizeHtmlFiles() {
  try {
    let optimizedCount = 0;
    
    // Find all HTML files in build directory
    function findHtmlFiles(dir) {
      const files = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...findHtmlFiles(fullPath));
        } else if (item === 'index.html') {
          files.push(fullPath);
        }
      }
      
      return files;
    }
    
    const htmlFiles = findHtmlFiles(BUILD_DIR);
    
    for (const htmlFile of htmlFiles) {
      let content = fs.readFileSync(htmlFile, 'utf8');
      
      // Add performance optimizations
      const optimizations = `
        <!-- Performance optimizations added by build script -->
        <link rel="dns-prefetch" href="//fonts.googleapis.com">
        <link rel="dns-prefetch" href="//fonts.gstatic.com">
        <link rel="preconnect" href="https://marketmindai.com">
        
        <!-- Critical resource hints -->
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        
        <!-- Performance monitoring -->
        <script>
          window.addEventListener('load', function() {
            if ('performance' in window) {
              setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                  const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
                  console.log('⚡ Page load time:', loadTime + 'ms');
                }
              }, 100);
            }
          });
        </script>
      `;
      
      // Insert optimizations before closing head tag
      content = content.replace('</head>', `${optimizations}</head>`);
      
      // Optimize whitespace (basic minification)
      content = content
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
      
      fs.writeFileSync(htmlFile, content);
      optimizedCount++;
    }
    
    console.log(`✅ Optimized ${optimizedCount} HTML files`);
    return true;
    
  } catch (error) {
    console.error('❌ HTML optimization failed:', error);
    return false;
  }
}

function optimizeManifest() {
  try {
    const manifestPath = path.join(BUILD_DIR, 'manifest.json');
    
    const manifest = {
      "short_name": "MarketMindAI",
      "name": "MarketMindAI - Business Tools Directory",
      "description": "Find, compare, and choose from thousands of business tools with AI-powered insights",
      "icons": [
        {
          "src": "favicon.ico",
          "sizes": "64x64 32x32 24x24 16x16",
          "type": "image/x-icon"
        },
        {
          "src": "logo192.png",
          "type": "image/png",
          "sizes": "192x192"
        },
        {
          "src": "logo512.png",
          "type": "image/png",
          "sizes": "512x512"
        }
      ],
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#3B82F6",
      "background_color": "#ffffff",
      "orientation": "portrait-primary",
      "categories": ["business", "productivity", "tools"],
      "lang": "en-US",
      "scope": "/"
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Web App Manifest optimized');
    return true;
    
  } catch (error) {
    console.error('❌ Manifest optimization failed:', error);
    return false;
  }
}

function optimizeStaticAssets() {
  try {
    // Create robots.txt if it doesn't exist
    const robotsPath = path.join(BUILD_DIR, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      const robotsContent = `User-agent: *
Allow: /

# Disallow admin and dashboard areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /superadmin/
Disallow: /api/

# Allow specific API endpoints that should be crawled
Allow: /api/blogs/
Allow: /api/tools/
Allow: /api/sitemap.xml
Allow: /api/robots.txt

# Sitemap location
Sitemap: https://marketmindai.com/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1
`;
      fs.writeFileSync(robotsPath, robotsContent);
    }
    
    // Create htaccess for better caching (if needed)
    const htaccessPath = path.join(BUILD_DIR, '.htaccess');
    const htaccessContent = `
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

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# React Router support
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
`;
    fs.writeFileSync(htaccessPath, htaccessContent.trim());
    
    console.log('✅ Static assets optimized (robots.txt, .htaccess)');
    return true;
    
  } catch (error) {
    console.error('❌ Static assets optimization failed:', error);
    return false;
  }
}

// Run optimization if this file is executed directly
if (require.main === module) {
  const success = optimizeBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { optimizeBuild };