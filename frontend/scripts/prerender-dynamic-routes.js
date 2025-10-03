const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://marketmindai.com';
const BUILD_DIR = path.join(__dirname, '../build');

// Enhanced timeout and retry configuration
const REQUEST_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'User-Agent': 'MarketMindAI-Prerenderer/1.0',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
};

// Fetch data from backend API with retry logic
async function fetchApiData(endpoint, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Fetching ${endpoint} (attempt ${attempt}/${retries})...`);
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, REQUEST_CONFIG);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Fetched ${response.data.length} items from ${endpoint}`);
        return response.data;
      } else if (response.data) {
        console.log(`✅ Fetched data from ${endpoint}`);
        return response.data;
      }
      
      console.log(`⚠️ Empty response from ${endpoint}`);
      return [];
      
    } catch (error) {
      console.warn(`❌ Attempt ${attempt} failed for ${endpoint}:`, error.message);
      if (attempt === retries) {
        console.error(`❌ All attempts failed for ${endpoint}, using empty data`);
        return [];
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return [];
}

// Generate enhanced meta tags for dynamic content
function generateDynamicMetaTags(type, data) {
  const baseUrl = BACKEND_URL;
  
  if (type === 'tool') {
    const name = data.name || 'Business Tool';
    const description = data.description || data.short_description || 'Discover this amazing business tool';
    const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 150);
    
    const title = data.seo_title || `${name} Review - Features, Pricing & Alternatives | MarketMindAI`;
    const metaDescription = data.seo_description || `${cleanDescription}... Read our comprehensive review of ${name} including features, pricing, pros, cons and alternatives.`;
    const keywords = data.seo_keywords || `${name}, ${data.category || 'business tool'}, software review, features, pricing, alternatives`;
    const url = `${baseUrl}/tools/${data.slug}`;
    const image = data.logo_url || data.screenshot_url || `${baseUrl}/api/images/tools/${data.slug}.jpg`;
    
    return {
      title,
      description: metaDescription,
      keywords,
      url,
      image,
      type: 'article',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "description": cleanDescription,
        "url": url,
        "image": image,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "author": {
          "@type": "Organization",
          "name": "MarketMindAI"
        },
        "offers": data.pricing ? {
          "@type": "Offer",
          "price": data.pricing === 'Free' ? "0" : data.pricing,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        } : null,
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "ratingCount": data.review_count || 1,
          "bestRating": 5,
          "worstRating": 1
        } : null,
        "publisher": {
          "@type": "Organization",
          "name": "MarketMindAI",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        },
        "mainEntity": {
          "@type": "Review",
          "reviewBody": cleanDescription,
          "author": {
            "@type": "Organization",
            "name": "MarketMindAI Team"
          }
        }
      }
    };
  }
  
  if (type === 'blog') {
    const title = data.title || 'Blog Post';
    const content = data.content || data.excerpt || 'Read this informative blog post';
    const cleanContent = content.replace(/<[^>]*>/g, '').substring(0, 150);
    
    const seoTitle = data.seo_title || `${title} | MarketMindAI Blog`;
    const metaDescription = data.seo_description || `${cleanContent}... Read more insights about business tools and productivity.`;
    const keywords = data.seo_keywords || `${title}, business tools, productivity, software guide, MarketMindAI`;
    const url = `${baseUrl}/blogs/${data.slug}`;
    const image = data.featured_image || `${baseUrl}/api/images/blogs/${data.slug}.jpg`;
    
    return {
      title: seoTitle,
      description: metaDescription,
      keywords,
      url,
      image,
      type: 'article',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": cleanContent,
        "url": url,
        "image": {
          "@type": "ImageObject",
          "url": image,
          "width": 1200,
          "height": 630
        },
        "datePublished": data.created_at,
        "dateModified": data.updated_at || data.created_at,
        "author": {
          "@type": "Person",
          "name": data.author_name || "MarketMindAI Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "MarketMindAI",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "articleSection": "Business Tools",
        "wordCount": (content.match(/\w+/g) || []).length,
        "keywords": keywords.split(', ')
      }
    };
  }
  
  return null;
}

// Generate HTML with enhanced meta tags and performance optimizations
function generateHtmlWithMeta(originalHtml, metaData) {
  const metaTags = `
    <title>${metaData.title}</title>
    <meta name="description" content="${metaData.description}" />
    <meta name="keywords" content="${metaData.keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${metaData.url}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="${metaData.type}" />
    <meta property="og:title" content="${metaData.title}" />
    <meta property="og:description" content="${metaData.description}" />
    <meta property="og:url" content="${metaData.url}" />
    <meta property="og:site_name" content="MarketMindAI" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${metaData.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${metaData.title}" />
    <meta property="og:image:type" content="image/jpeg" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metaData.title}" />
    <meta name="twitter:description" content="${metaData.description}" />
    <meta name="twitter:image" content="${metaData.image}" />
    <meta name="twitter:image:alt" content="${metaData.title}" />
    <meta name="twitter:site" content="@MarketMindAI" />
    
    <!-- Performance and SEO Meta Tags -->
    <meta name="author" content="MarketMindAI" />
    <meta name="publisher" content="MarketMindAI" />
    <link rel="preconnect" href="${BACKEND_URL}" />
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(metaData.jsonLd, null, 2)}
    </script>
  `;
  
  // Replace the default title and inject meta tags
  let updatedHtml = originalHtml.replace(
    /<title>.*?<\/title>/i, 
    metaTags.trim()
  );
  
  // Add page-specific performance hints
  const performanceHints = `
    <!-- Page-specific performance optimization -->
    <link rel="prefetch" href="${BACKEND_URL}/api/blogs" />
    <link rel="prefetch" href="${BACKEND_URL}/api/tools" />
  `;
  
  updatedHtml = updatedHtml.replace(
    '</head>',
    `${performanceHints}</head>`
  );
  
  return updatedHtml;
}

// Main prerendering function with enhanced error handling and progress tracking
async function prerenderDynamicRoutes() {
  console.log('🚀 Starting enhanced dynamic route prerendering...');
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  
  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ Build directory or index.html not found. Run "yarn build:base" first.');
    process.exit(1);
  }
  
  const originalHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  let stats = {
    tools: { success: 0, failed: 0 },
    blogs: { success: 0, failed: 0 }
  };
  
  try {
    // Fetch and prerender tools
    console.log('\n📦 Processing tools...');
    const tools = await fetchApiData('/api/tools?limit=100');
    
    if (tools && tools.length > 0) {
      console.log(`📊 Processing ${tools.length} tools...`);
      
      for (const tool of tools) {
        try {
          if (!tool.slug) {
            console.warn(`⚠️ Skipping tool without slug: ${tool.name || 'Unknown'}`);
            continue;
          }
          
          const metaData = generateDynamicMetaTags('tool', tool);
          if (metaData) {
            const htmlWithMeta = generateHtmlWithMeta(originalHtml, metaData);
            
            // Create directory and file
            const toolDir = path.join(BUILD_DIR, 'tools', tool.slug);
            fs.mkdirSync(toolDir, { recursive: true });
            fs.writeFileSync(path.join(toolDir, 'index.html'), htmlWithMeta);
            
            console.log(`✅ Generated: /tools/${tool.slug} (${tool.name})`);
            stats.tools.success++;
          }
        } catch (error) {
          console.error(`❌ Failed to process tool ${tool.slug}:`, error.message);
          stats.tools.failed++;
        }
      }
    }
    
    // Fetch and prerender blogs
    console.log('\n📝 Processing blogs...');
    const blogs = await fetchApiData('/api/blogs?status=published&limit=100');
    
    if (blogs && blogs.length > 0) {
      console.log(`📊 Processing ${blogs.length} blogs...`);
      
      for (const blog of blogs) {
        try {
          if (!blog.slug) {
            console.warn(`⚠️ Skipping blog without slug: ${blog.title || 'Unknown'}`);
            continue;
          }
          
          const metaData = generateDynamicMetaTags('blog', blog);
          if (metaData) {
            const htmlWithMeta = generateHtmlWithMeta(originalHtml, metaData);
            
            // Create directory and file
            const blogDir = path.join(BUILD_DIR, 'blogs', blog.slug);
            fs.mkdirSync(blogDir, { recursive: true });
            fs.writeFileSync(path.join(blogDir, 'index.html'), htmlWithMeta);
            
            console.log(`✅ Generated: /blogs/${blog.slug} (${blog.title})`);
            stats.blogs.success++;
          }
        } catch (error) {
          console.error(`❌ Failed to process blog ${blog.slug}:`, error.message);
          stats.blogs.failed++;
        }
      }
    }
    
    // Generate summary
    console.log('\n🎉 Dynamic route prerendering completed!');
    console.log('📊 Summary:');
    console.log(`   Tools: ${stats.tools.success} successful, ${stats.tools.failed} failed`);
    console.log(`   Blogs: ${stats.blogs.success} successful, ${stats.blogs.failed} failed`);
    console.log(`   Total: ${stats.tools.success + stats.blogs.success} pages generated`);
    
    // Create a status file
    const statusFile = path.join(BUILD_DIR, 'prerender-status.json');
    fs.writeFileSync(statusFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: stats,
      backend_url: BACKEND_URL,
      total_pages: stats.tools.success + stats.blogs.success
    }, null, 2));
    
    console.log('✅ Prerender status saved to prerender-status.json');
    
  } catch (error) {
    console.error('❌ Fatal error during prerendering:', error);
    process.exit(1);
  }
}

// Run prerendering if this file is executed directly
if (require.main === module) {
  prerenderDynamicRoutes()
    .then(() => {
      console.log('🏁 Prerendering process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Prerendering process failed:', error);
      process.exit(1);
    });
}

module.exports = { prerenderDynamicRoutes, generateDynamicMetaTags };