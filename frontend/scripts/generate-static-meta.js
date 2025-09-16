const fs = require('fs');
const path = require('path');

// Static routes configuration with their meta data
const STATIC_ROUTES = {
  '/': {
    title: 'MarketMind - Discover the Best Business Tools',
    description: 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews from 10,000+ users.',
    keywords: 'business tools, productivity software, SaaS tools, tool comparison, software reviews, business productivity',
    ogType: 'website'
  },
  '/tools': {
    title: 'Business Tools Directory - MarketMind',
    description: 'Browse our comprehensive directory of business tools. Filter by category, pricing, and features to find the perfect software for your needs.',
    keywords: 'business tools directory, software catalog, SaaS tools, productivity software, tool comparison',
    ogType: 'website'
  },
  '/blogs': {
    title: 'Business Tool Reviews & Guides - MarketMind Blog',
    description: 'Read in-depth reviews, guides, and insights about the latest business tools and productivity software. Stay updated with industry trends.',
    keywords: 'tool reviews, software guides, business productivity, tech blog, AI content, software insights',
    ogType: 'website'
  },
  '/compare': {
    title: 'Compare Business Tools - MarketMind',
    description: 'Compare up to 5 business tools side-by-side. Make informed decisions with detailed feature comparisons and user reviews.',
    keywords: 'tool comparison, software comparison, business tools, feature comparison, tool evaluation',
    ogType: 'website'
  }
};

// Generate meta tags HTML
function generateMetaTags(route, routeData) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://sync-codebase-8.preview.emergentagent.com';
  const currentUrl = `${backendUrl}${route === '/' ? '' : route}`;
  const imageUrl = `${backendUrl}/api/images/og-default.jpg`;
  
  return `
    <!-- Dynamic Meta Tags for ${route} -->
    <title>${routeData.title}</title>
    <meta name="description" content="${routeData.description}" />
    <meta name="keywords" content="${routeData.keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${currentUrl}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="${routeData.ogType}" />
    <meta property="og:title" content="${routeData.title}" />
    <meta property="og:description" content="${routeData.description}" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:site_name" content="MarketMind" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${routeData.title}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${routeData.title}" />
    <meta name="twitter:description" content="${routeData.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${routeData.title}" />
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "${routeData.ogType === 'website' ? 'WebSite' : 'WebPage'}",
      "name": "${routeData.title}",
      "description": "${routeData.description}",
      "url": "${currentUrl}",
      "image": "${imageUrl}",
      "publisher": {
        "@type": "Organization",
        "name": "MarketMind",
        "url": "${backendUrl}",
        "logo": {
          "@type": "ImageObject",
          "url": "${backendUrl}/api/images/logo.png"
        }
      }
    }
    </script>
  `;
}

// Function to inject meta tags into HTML
function injectMetaTags(htmlContent, route, routeData) {
  const metaTags = generateMetaTags(route, routeData);
  
  // Replace the default title with our meta tags
  const titleRegex = /<title>.*?<\/title>/i;
  const updatedHtml = htmlContent.replace(titleRegex, metaTags.trim());
  
  return updatedHtml;
}

// Main function to generate static HTML files
function generateStaticHtmlFiles() {
  const buildDir = path.join(__dirname, '../build');
  const indexHtmlPath = path.join(buildDir, 'index.html');
  
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Please run "yarn build" first.');
    process.exit(1);
  }
  
  // Read the original index.html
  const originalHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Generate HTML files for each route
  Object.entries(STATIC_ROUTES).forEach(([route, routeData]) => {
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
    console.log(`✅ Generated static HTML for route: ${route}`);
  });
  
  console.log('\n🎉 Static HTML generation completed!');
  console.log('📝 Generated files with proper meta tags for SEO');
}

// Run the generation
if (require.main === module) {
  generateStaticHtmlFiles();
}

module.exports = { generateStaticHtmlFiles, STATIC_ROUTES };