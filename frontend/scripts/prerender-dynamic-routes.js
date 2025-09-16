const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://seo-audit-crawl.preview.emergentagent.com';
const BUILD_DIR = path.join(__dirname, '../build');

// Fetch data from backend API
async function fetchApiData(endpoint) {
  try {
    const response = await axios.get(`${BACKEND_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

// Generate meta tags for dynamic content
function generateDynamicMetaTags(type, data) {
  const baseUrl = BACKEND_URL;
  
  if (type === 'tool') {
    const title = data.seo_title || `${data.name} - Business Tool Review | MarketMind`;
    const description = data.seo_description || `${data.description.substring(0, 150)}...`;
    const keywords = data.seo_keywords || `${data.name}, business tool, ${data.category}, software review`;
    const url = `${baseUrl}/tools/${data.slug}`;
    const image = data.image || `${baseUrl}/api/images/tools/${data.slug}.jpg`;
    
    return {
      title,
      description,
      keywords,
      url,
      image,
      type: 'website',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": data.name,
        "description": description,
        "url": url,
        "image": image,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": data.pricing || "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "ratingCount": data.review_count || 1
        } : null,
        "publisher": {
          "@type": "Organization",
          "name": "MarketMind",
          "url": baseUrl
        }
      }
    };
  }
  
  if (type === 'blog') {
    const title = data.seo_title || `${data.title} | MarketMind Blog`;
    const description = data.seo_description || `${data.content.substring(0, 150)}...`;
    const keywords = data.seo_keywords || `${data.title}, business tools, productivity, software guide`;
    const url = `${baseUrl}/blogs/${data.slug}`;
    const image = data.featured_image || `${baseUrl}/api/images/blogs/${data.slug}.jpg`;
    
    return {
      title,
      description,
      keywords,
      url,
      image,
      type: 'article',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title,
        "description": description,
        "url": url,
        "image": image,
        "datePublished": data.created_at,
        "dateModified": data.updated_at,
        "author": {
          "@type": "Person",
          "name": data.author_name || "MarketMind Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "MarketMind",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/api/images/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      }
    };
  }
  
  return null;
}

// Generate HTML with meta tags
function generateHtmlWithMeta(originalHtml, metaData) {
  const metaTags = `
    <title>${metaData.title}</title>
    <meta name="description" content="${metaData.description}" />
    <meta name="keywords" content="${metaData.keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${metaData.url}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="${metaData.type}" />
    <meta property="og:title" content="${metaData.title}" />
    <meta property="og:description" content="${metaData.description}" />
    <meta property="og:url" content="${metaData.url}" />
    <meta property="og:site_name" content="MarketMind" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${metaData.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${metaData.title}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metaData.title}" />
    <meta name="twitter:description" content="${metaData.description}" />
    <meta name="twitter:image" content="${metaData.image}" />
    <meta name="twitter:image:alt" content="${metaData.title}" />
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(metaData.jsonLd, null, 2)}
    </script>
  `;
  
  // Replace the default title with our meta tags
  const titleRegex = /<title>.*?<\/title>/i;
  return originalHtml.replace(titleRegex, metaTags.trim());
}

// Main prerendering function
async function prerenderDynamicRoutes() {
  console.log('🚀 Starting dynamic route prerendering...');
  
  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ Build directory not found. Run "yarn build:base" first.');
    return;
  }
  
  const originalHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  try {
    // Fetch tools data
    console.log('📦 Fetching tools data...');
    const tools = await fetchApiData('/api/tools?limit=50');
    
    if (tools && Array.isArray(tools)) {
      for (const tool of tools) {
        const metaData = generateDynamicMetaTags('tool', tool);
        if (metaData) {
          const htmlWithMeta = generateHtmlWithMeta(originalHtml, metaData);
          
          // Create directory and file
          const toolDir = path.join(BUILD_DIR, 'tools', tool.slug);
          fs.mkdirSync(toolDir, { recursive: true });
          fs.writeFileSync(path.join(toolDir, 'index.html'), htmlWithMeta);
          
          console.log(`✅ Generated HTML for tool: ${tool.slug}`);
        }
      }
    }
    
    // Fetch blogs data
    console.log('📝 Fetching blogs data...');
    const blogs = await fetchApiData('/api/blogs?status=published&limit=50');
    
    if (blogs && Array.isArray(blogs)) {
      for (const blog of blogs) {
        const metaData = generateDynamicMetaTags('blog', blog);
        if (metaData) {
          const htmlWithMeta = generateHtmlWithMeta(originalHtml, metaData);
          
          // Create directory and file
          const blogDir = path.join(BUILD_DIR, 'blogs', blog.slug);
          fs.mkdirSync(blogDir, { recursive: true });
          fs.writeFileSync(path.join(blogDir, 'index.html'), htmlWithMeta);
          
          console.log(`✅ Generated HTML for blog: ${blog.slug}`);
        }
      }
    }
    
    console.log('🎉 Dynamic route prerendering completed!');
    
  } catch (error) {
    console.error('❌ Error during prerendering:', error.message);
  }
}

// Run prerendering if this file is executed directly
if (require.main === module) {
  prerenderDynamicRoutes();
}

module.exports = { prerenderDynamicRoutes };