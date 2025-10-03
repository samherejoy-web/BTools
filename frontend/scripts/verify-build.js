const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');

/**
 * Verify that the production build is complete and optimized
 */
function verifyBuild() {
  console.log('🔍 Starting build verification...');
  
  const checks = {
    buildDirectory: false,
    indexHtml: false,
    serviceWorker: false,
    staticAssets: false,
    seoFiles: false,
    prerenderedPages: false,
    manifest: false
  };
  
  const issues = [];
  const warnings = [];
  
  try {
    // 1. Check build directory exists
    if (fs.existsSync(BUILD_DIR)) {
      checks.buildDirectory = true;
      console.log('✅ Build directory exists');
    } else {
      issues.push('Build directory not found');
    }
    
    // 2. Check index.html
    const indexPath = path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      checks.indexHtml = true;
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Verify SEO meta tags
      if (indexContent.includes('og:title') && indexContent.includes('og:description')) {
        console.log('✅ Index.html has SEO meta tags');
      } else {
        warnings.push('Index.html missing some SEO meta tags');
      }
      
      // Check for service worker registration
      if (indexContent.includes('sw.js')) {
        console.log('✅ Service Worker registration found');
      } else {
        warnings.push('Service Worker registration not found in HTML');
      }
    } else {
      issues.push('index.html not found');
    }
    
    // 3. Check Service Worker
    const swPath = path.join(BUILD_DIR, 'sw.js');
    if (fs.existsSync(swPath)) {
      checks.serviceWorker = true;
      console.log('✅ Service Worker exists');
    } else {
      issues.push('Service Worker (sw.js) not found');
    }
    
    // 4. Check static assets
    const staticDir = path.join(BUILD_DIR, 'static');
    if (fs.existsSync(staticDir)) {
      const cssDir = path.join(staticDir, 'css');
      const jsDir = path.join(staticDir, 'js');
      
      let cssFiles = 0, jsFiles = 0;
      
      if (fs.existsSync(cssDir)) {
        cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).length;
      }
      
      if (fs.existsSync(jsDir)) {
        jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).length;
      }
      
      if (cssFiles > 0 && jsFiles > 0) {
        checks.staticAssets = true;
        console.log(`✅ Static assets found (${cssFiles} CSS, ${jsFiles} JS files)`);
      } else {
        issues.push('Static assets missing or incomplete');
      }
    } else {
      issues.push('Static directory not found');
    }
    
    // 5. Check SEO files
    const robotsPath = path.join(BUILD_DIR, 'robots.txt');
    const manifestPath = path.join(BUILD_DIR, 'manifest.json');
    
    let seoFilesCount = 0;
    
    if (fs.existsSync(robotsPath)) {
      seoFilesCount++;
      console.log('✅ robots.txt exists');
    } else {
      warnings.push('robots.txt not found');
    }
    
    if (fs.existsSync(manifestPath)) {
      checks.manifest = true;
      seoFilesCount++;
      console.log('✅ manifest.json exists');
    } else {
      warnings.push('manifest.json not found');
    }
    
    checks.seoFiles = seoFilesCount >= 1;
    
    // 6. Check prerendered pages
    const toolsDir = path.join(BUILD_DIR, 'tools');
    const blogsDir = path.join(BUILD_DIR, 'blogs');
    
    let prerenderedCount = 0;
    
    if (fs.existsSync(toolsDir)) {
      const toolPages = fs.readdirSync(toolsDir).length;
      prerenderedCount += toolPages;
      console.log(`✅ ${toolPages} tool pages prerendered`);
    }
    
    if (fs.existsSync(blogsDir)) {
      const blogPages = fs.readdirSync(blogsDir).length;
      prerenderedCount += blogPages;
      console.log(`✅ ${blogPages} blog pages prerendered`);
    }
    
    checks.prerenderedPages = prerenderedCount > 0;
    
    if (prerenderedCount === 0) {
      warnings.push('No prerendered pages found - SEO may be limited');
    }
    
    // 7. Check for prerender status
    const prerenderStatusPath = path.join(BUILD_DIR, 'prerender-status.json');
    if (fs.existsSync(prerenderStatusPath)) {
      const status = JSON.parse(fs.readFileSync(prerenderStatusPath, 'utf8'));
      console.log(`📊 Prerender status: ${status.total_pages} total pages generated`);
    }
    
    // Generate verification report
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const successRate = Math.round((passedChecks / totalChecks) * 100);
    
    console.log('\n📋 Build Verification Report');
    console.log('================================');
    console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks (${successRate}%)`);
    
    if (issues.length > 0) {
      console.log('\n❌ Critical Issues:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    // Check build size
    const buildStats = getBuildStats();
    console.log('\n📊 Build Statistics:');
    console.log(`   • Total size: ${buildStats.totalSize}`);
    console.log(`   • Files: ${buildStats.fileCount}`);
    console.log(`   • Directories: ${buildStats.dirCount}`);
    
    // Performance recommendations
    console.log('\n🚀 Performance Recommendations:');
    if (buildStats.totalSizeBytes > 10 * 1024 * 1024) { // 10MB
      console.log('   ⚠️ Build size is large (>10MB) - consider code splitting');
    } else {
      console.log('   ✅ Build size is acceptable');
    }
    
    if (prerenderedCount > 50) {
      console.log('   ✅ Good number of prerendered pages for SEO');
    } else if (prerenderedCount > 0) {
      console.log('   ⚠️ Consider prerendering more pages for better SEO');
    }
    
    // Final verdict
    const isSuccessful = issues.length === 0 && successRate >= 80;
    
    if (isSuccessful) {
      console.log('\n🎉 Build verification PASSED!');
      console.log('🚀 Your production build is ready for deployment to https://marketmindai.com');
    } else {
      console.log('\n❌ Build verification FAILED!');
      console.log('🔧 Please fix the issues above before deploying');
    }
    
    // Save verification report
    const report = {
      timestamp: new Date().toISOString(),
      checks: checks,
      issues: issues,
      warnings: warnings,
      successRate: successRate,
      buildStats: buildStats,
      isSuccessful: isSuccessful
    };
    
    fs.writeFileSync(path.join(BUILD_DIR, 'verification-report.json'), JSON.stringify(report, null, 2));
    console.log('📄 Verification report saved to verification-report.json');
    
    return isSuccessful;
    
  } catch (error) {
    console.error('❌ Build verification failed:', error);
    return false;
  }
}

function getBuildStats() {
  let totalSize = 0;
  let fileCount = 0;
  let dirCount = 0;
  
  function calculateSize(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          dirCount++;
          calculateSize(fullPath);
        } else {
          fileCount++;
          totalSize += stat.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
  }
  
  if (fs.existsSync(BUILD_DIR)) {
    calculateSize(BUILD_DIR);
  }
  
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    totalSize: formatSize(totalSize),
    totalSizeBytes: totalSize,
    fileCount: fileCount,
    dirCount: dirCount
  };
}

// Run verification if this file is executed directly
if (require.main === module) {
  const success = verifyBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyBuild };