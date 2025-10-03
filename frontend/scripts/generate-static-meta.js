const fs = require('fs');
const path = require('path');

// Static routes configuration with enhanced meta data for production
const STATIC_ROUTES = {
  '/': {
    title: 'MarketMindAI - Discover the Best Business Tools & Software Reviews',
    description: 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews from 10,000+ users. Free tool directory.',
    keywords: 'business tools, productivity software, SaaS tools, tool comparison, software reviews, business productivity, free tools, AI tools, marketing tools',
    ogType: 'website',
    priority: '1.0',
    changefreq: 'daily'
  },
  '/tools': {
    title: 'Business Tools Directory - 1000+ Verified Software Reviews | MarketMindAI',
    description: 'Browse our comprehensive directory of 1000+ business tools. Filter by category, pricing, and features to find the perfect software for your needs. All tools verified.',
    keywords: 'business tools directory, software catalog, SaaS tools, productivity software, tool comparison, verified reviews, free tools, business software',
    ogType: 'website',
    priority: '0.9',
    changefreq: 'daily'
  },
  '/blogs': {
    title: 'Business Tool Reviews & Software Guides - MarketMindAI Blog',
    description: 'Read in-depth reviews, guides, and insights about the latest business tools and productivity software. Stay updated with industry trends and expert recommendations.',
    keywords: 'tool reviews, software guides, business productivity, tech blog, AI content, software insights, productivity tips, business guides',
    ogType: 'website',
    priority: '0.9',
    changefreq: 'daily'
  },
  '/compare': {
    title: 'Compare Business Tools Side-by-Side - MarketMindAI Comparison Tool',
    description: 'Compare up to 5 business tools side-by-side. Make informed decisions with detailed feature comparisons, pricing analysis, and user reviews.',
    keywords: 'tool comparison, software comparison, business tools, feature comparison, tool evaluation, pricing comparison, side by side comparison',
    ogType: 'website',
    priority: '0.8',
    changefreq: 'weekly'
  },
  '/about': {
    title: 'About MarketMindAI - Your Trusted Business Tools Guide',
    description: 'Learn about MarketMindAI mission to help businesses discover the perfect tools. Our expert team reviews and curates the best business software.',
    keywords: 'about MarketMindAI, business tools guide, software reviews, company information, team',
    ogType: 'website',
    priority: '0.6',
    changefreq: 'monthly'
  },
  '/contact': {
    title: 'Contact MarketMindAI - Get Support & Submit Tool Recommendations',
    description: 'Contact MarketMindAI for support, partnerships, or to submit your business tool for review. We help businesses find the right software solutions.',
    keywords: 'contact MarketMindAI, support, submit tool, partnerships, business tools',
    ogType: 'website',
    priority: '0.5',
    changefreq: 'monthly'
  },
  '/privacy': {
    title: 'Privacy Policy - MarketMindAI',
    description: 'Read MarketMindAI privacy policy to understand how we protect your personal information and data when using our business tools directory.',
    keywords: 'privacy policy, data protection, MarketMindAI privacy, user data',
    ogType: 'website',
    priority: '0.4',
    changefreq: 'monthly'
  },
  '/terms': {
    title: 'Terms of Service - MarketMindAI',
    description: 'Read MarketMindAI terms of service and user agreement for using our business tools directory and review platform.',
    keywords: 'terms of service, user agreement, MarketMindAI terms, legal',
    ogType: 'website',
    priority: '0.4',
    changefreq: 'monthly'
  }
};

// Generate comprehensive meta tags HTML with enhanced SEO
function generateMetaTags(route, routeData) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://marketmindai.com';
  const currentUrl = `${backendUrl}${route === '/' ? '' : route}`;
  const imageUrl = `${backendUrl}/api/images/og-default.jpg`;
  const siteName = 'MarketMindAI';
  
  return `
    <!-- Enhanced Meta Tags for ${route} -->
    <title>${routeData.title}</title>
    <meta name="description" content="${routeData.description}" />
    <meta name="keywords" content="${routeData.keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${currentUrl}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="${routeData.ogType}" />
    <meta property="og:title" content="${routeData.title}" />
    <meta property="og:description" content="${routeData.description}" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${routeData.title}" />
    <meta property="og:image:type" content="image/jpeg" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${routeData.title}" />
    <meta name="twitter:description" content="${routeData.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${routeData.title}" />
    <meta name="twitter:site" content="@MarketMindAI" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="author" content="${siteName}" />
    <meta name="publisher" content="${siteName}" />
    <meta name="application-name" content="${siteName}" />
    <meta name="apple-mobile-web-app-title" content="${siteName}" />
    <meta name="theme-color" content="#3B82F6" />
    <meta name="msapplication-TileColor" content="#3B82F6" />
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "${routeData.ogType === 'website' ? 'WebSite' : 'WebPage'}",
      "name": "${routeData.title}",
      "description": "${routeData.description}",
      "url": "${currentUrl}",
      "image": {
        "@type": "ImageObject",
        "url": "${imageUrl}",
        "width": 1200,
        "height": 630
      },
      "publisher": {
        "@type": "Organization",
        "name": "${siteName}",
        "url": "${backendUrl}",
        "logo": {
          "@type": "ImageObject",
          "url": "${backendUrl}/logo.png",
          "width": 200,
          "height": 50
        },
        "sameAs": [
          "https://twitter.com/MarketMindAI"
        ]
      },
      ${route === '/' ? `
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${backendUrl}/tools?search={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Business Tools Directory",
        "description": "Comprehensive directory of business tools and software"
      }` : ''}
    }
    </script>
    
    <!-- Page-specific Performance Hints -->
    ${route === '/tools' ? '<link rel="prefetch" href="/api/categories" />' : ''}
    ${route === '/blogs' ? '<link rel="prefetch" href="/api/blogs?status=published&limit=10" />' : ''}
  `;
}

// Function to inject meta tags into HTML with enhanced replacement
function injectMetaTags(htmlContent, route, routeData) {
  const metaTags = generateMetaTags(route, routeData);
  
  // Replace existing meta tags in head section
  let updatedHtml = htmlContent;
  
  // Replace title
  updatedHtml = updatedHtml.replace(
    /<title>.*?<\/title>/i, 
    `<title>${routeData.title}</title>`
  );
  
  // Replace or add description
  if (updatedHtml.includes('name="description"')) {
    updatedHtml = updatedHtml.replace(
      /<meta name="description" content="[^"]*" \/>/i,
      `<meta name="description" content="${routeData.description}" />`
    );
  }
  
  // Insert all enhanced meta tags after the theme-color meta tag
  updatedHtml = updatedHtml.replace(
    /<meta name="theme-color" content="#3B82F6" \/>/,
    `<meta name="theme-color" content="#3B82F6" />\n        ${metaTags.trim()}`
  );
  
  return updatedHtml;
}

// Enhanced function to generate static HTML files with better error handling
function generateStaticHtmlFiles() {
  const buildDir = path.join(__dirname, '../build');
  const indexHtmlPath = path.join(buildDir, 'index.html');
  
  console.log('🚀 Starting static HTML generation for SEO optimization...');
  
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Please run "yarn build:base" first.');
    process.exit(1);
  }
  
  // Check if index.html exists
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ index.html not found in build directory.');
    process.exit(1);
  }
  
  // Read the original index.html
  const originalHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Generate HTML files for each route
  Object.entries(STATIC_ROUTES).forEach(([route, routeData]) => {
    try {
      const htmlWithMeta = injectMetaTags(originalHtml, route, routeData);
      
      // Determine output path
      let outputPath;
      if (route === '/') {
        outputPath = indexHtmlPath; // Overwrite the main index.html
      } else {
        const routeDir = path.join(buildDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        outputPath = path.join(routeDir, 'index.html');
      }
      
      // Write the file
      fs.writeFileSync(outputPath, htmlWithMeta);
      console.log(`✅ Generated static HTML for route: ${route} (${routeData.title.substring(0, 50)}...)`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to generate HTML for route ${route}:`, error.message);
      errorCount++;
    }
  });
  
  console.log('\n🎉 Static HTML generation completed!');
  console.log(`📊 Results: ${successCount} successful, ${errorCount} failed`);
  console.log('📝 Generated files with enhanced meta tags for SEO');
  console.log('🔍 All routes now crawlable by search engines');
  
  // Generate sitemap reference file
  generateSitemapReference();
  
  return { success: successCount, errors: errorCount };
}

// Generate a reference sitemap for static routes
function generateSitemapReference() {
  const buildDir = path.join(__dirname, '../build');
  const sitemapPath = path.join(buildDir, 'static-sitemap.xml');
  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://marketmindai.com';
  
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  Object.entries(STATIC_ROUTES).forEach(([route, routeData]) => {
    const url = `${baseUrl}${route === '/' ? '' : route}`;
    sitemapContent += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${routeData.changefreq}</changefreq>
    <priority>${routeData.priority}</priority>
  </url>`;
  });

  sitemapContent += `
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('✅ Generated static sitemap reference');
}

// Run the generation
if (require.main === module) {
  try {
    generateStaticHtmlFiles();
  } catch (error) {
    console.error('❌ Fatal error during static HTML generation:', error);
    process.exit(1);
  }
}

module.exports = { generateStaticHtmlFiles, STATIC_ROUTES, generateMetaTags };