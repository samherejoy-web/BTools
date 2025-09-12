// Debug script to check SEO data generation
const fs = require('fs');
const path = require('path');

// Mock React environment
global.window = { location: { href: 'http://localhost:3000/tools/notion' } };
global.process = { env: { REACT_APP_BACKEND_URL: 'http://localhost:8001' } };

// Mock the generateArticleSchema and generateProductSchema functions
const generateArticleSchema = (blog) => {
  try {
    if (!blog) return null;
    
    const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title || "Blog Post",
      "description": blog.excerpt || blog.seo_description || "Read this insightful blog post.",
      "image": blog.featured_image || `${baseUrl}/api/images/og-default.jpg`,
      "author": {
        "@type": "Person",
        "name": blog.author_name || "MarketMind Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MarketMind",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/api/images/logo.png`
        }
      },
      "datePublished": blog.published_at || blog.created_at || new Date().toISOString(),
      "dateModified": blog.updated_at || blog.created_at || new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blogs/${blog.slug}`
      },
      "keywords": (Array.isArray(blog.tags) ? blog.tags.join(', ') : '') || blog.seo_keywords || '',
      "wordCount": blog.content ? blog.content.replace(/<[^>]*>/g, '').split(' ').length : 0,
      "timeRequired": `PT${blog.reading_time || 5}M`,
      "inLanguage": "en-US"
    };
  } catch (error) {
    console.error('Error generating article schema:', error);
    return null;
  }
};

const generateProductSchema = (tool) => {
  try {
    if (!tool) return null;
    
    const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name || "Business Tool",
      "description": tool.description || tool.short_description || "A powerful business tool",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "url": tool.url || "",
      "screenshot": tool.screenshot_url || "",
      "image": tool.logo_url || `${baseUrl}/api/images/tool-default.jpg`,
      "provider": {
        "@type": "Organization",
        "name": tool.name || "Tool Provider"
      },
      "dateCreated": tool.created_at || new Date().toISOString(),
      "dateModified": tool.updated_at || new Date().toISOString(),
      "featureList": Array.isArray(tool.features) ? tool.features.join(', ') : '',
      "softwareVersion": "Latest"
    };

    // Add pricing information if available
    if (tool.pricing_details && typeof tool.pricing_details === 'object') {
      const pricingKeys = Object.keys(tool.pricing_details);
      if (pricingKeys.length > 0) {
        const firstPrice = tool.pricing_details[pricingKeys[0]];
        if (firstPrice) {
          schema.offers = {
            "@type": "Offer",
            "price": firstPrice === 'Free' || firstPrice === '$0' ? "0" : String(firstPrice).replace(/[^0-9.]/g, '') || "0",
            "priceCurrency": "USD", 
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }
      }
    }

    // Add aggregate rating if available
    if (tool.rating && (tool.review_count || 0) > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "reviewCount": tool.review_count || 0,
        "bestRating": 5,
        "worstRating": 1
      };
    }

    return schema;
  } catch (error) {
    console.error('Error generating product schema:', error);
    return null;
  }
};

// Test data (based on actual tool from database)
const testTool = {
  name: "Notion",
  slug: "notion",
  description: "Notion is an all-in-one workspace that combines note-taking, document sharing, wikis, and project management. It's designed to be the single space where you can think, write, and plan.",
  short_description: "All-in-one workspace for notes, docs, and project management",
  url: "https://notion.so",
  seo_title: "Notion - All-in-one workspace for notes, docs, and project management",
  seo_description: "Notion is an all-in-one workspace that combines note---taking, document sharing, wikis, and project management. It has over 4 million users.",
  seo_keywords: "notion, productivity, all-in-one, workspace, notes, documents, project management, wiki, collaboration",
  json_ld: null,
  rating: 4.2,
  review_count: 5,
  categories: [
    { name: "Productivity" },
    { name: "Task Management" }
  ],
  features: [
    "Highly customizable",
    "Great for teams", 
    "Powerful database features",
    "Rich formatting options"
  ]
};

const testBlog = {
  title: "Top 10 Productivity Tools for Remote Teams in 2024",
  slug: "top-10-productivity-tools-for-remote-teams-in-2024",
  excerpt: "Remote work has become the new normal, and having the right tools is crucial for maintaining productivity and collaboration. In this comprehensive guide, we'll explore the top 10 productivity tools that are making waves in 2024.",
  content: "<h1>Top 10 Productivity Tools for Remote Teams in 2024</h1><p>Remote work has become the new normal, and having the right tools is crucial for maintaining productivity and collaboration.</p>",
  author_name: "Updated Test User Name",
  seo_title: "Top 10 Productivity Tools for Remote Teams in 2024",
  seo_description: null,
  seo_keywords: null,
  json_ld: {},
  tags: ["productivity", "remote work", "tools", "2024"],
  published_at: "2024-09-10T12:00:00Z",
  created_at: "2024-09-10T12:00:00Z",
  updated_at: "2024-09-10T12:00:00Z",
  reading_time: 5
};

console.log("=== TESTING TOOL SEO DATA GENERATION ===");

// Test useToolSEO logic
const toolSeoData = {
  title: testTool.seo_title || `${testTool.name} - Review & Pricing`,
  description: testTool.seo_description || testTool.short_description || testTool.description || 'Discover this amazing business tool.',
  keywords: testTool.seo_keywords || 'business tool, software, productivity',
  canonical: `/tools/${testTool.slug}`,
  image: testTool.screenshot_url || testTool.logo_url || '',
  type: 'product',
  product: true,
  jsonLd: testTool.json_ld || generateProductSchema(testTool),
  categories: Array.isArray(testTool.categories) ? testTool.categories : [],
  features: Array.isArray(testTool.features) ? testTool.features : [],
  rating: testTool.rating,
  reviewCount: testTool.review_count || 0
};

console.log("Tool SEO Data:");
console.log("- Title:", toolSeoData.title);
console.log("- Description:", toolSeoData.description.substring(0, 100));
console.log("- Keywords:", toolSeoData.keywords);
console.log("- JSON-LD provided:", !!toolSeoData.jsonLd);

if (toolSeoData.jsonLd) {
  console.log("Generated JSON-LD for tool:");
  console.log(JSON.stringify(toolSeoData.jsonLd, null, 2));
}

console.log("\n=== TESTING BLOG SEO DATA GENERATION ===");

// Test useBlogSEO logic
const blogSeoData = {
  title: testBlog.seo_title || testBlog.title || 'Blog Post',
  description: testBlog.seo_description || testBlog.excerpt || 'Read this insightful blog post.',
  keywords: testBlog.seo_keywords || (Array.isArray(testBlog.tags) ? testBlog.tags.join(', ') : ''),
  canonical: `/blogs/${testBlog.slug}`,
  image: testBlog.featured_image || '',
  type: 'article',
  article: true,
  author: testBlog.author_name || 'MarketMind Team',
  publishedTime: testBlog.published_at || testBlog.created_at,
  modifiedTime: testBlog.updated_at,
  jsonLd: testBlog.json_ld || generateArticleSchema(testBlog),
  tags: Array.isArray(testBlog.tags) ? testBlog.tags : []
};

console.log("Blog SEO Data:");
console.log("- Title:", blogSeoData.title);
console.log("- Description:", blogSeoData.description.substring(0, 100));
console.log("- Keywords:", blogSeoData.keywords);
console.log("- JSON-LD provided:", !!blogSeoData.jsonLd);

if (blogSeoData.jsonLd) {
  console.log("Generated JSON-LD for blog:");
  console.log(JSON.stringify(blogSeoData.jsonLd, null, 2));
}

console.log("\n=== TESTING SEOHead generateJsonLd() FUNCTION ===");

// Test the SEOHead generateJsonLd function
const generateJsonLd = (seoData) => {
  const { jsonLd, type, product, article, author, publishedTime, modifiedTime, title, description } = seoData;
  const currentUrl = seoData.canonical || 'http://localhost:3000/test';
  const defaultImage = seoData.image || 'http://localhost:8001/api/images/og-default.jpg';
  const siteName = 'MarketMind';
  
  if (jsonLd) return jsonLd;
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'BlogPosting' : (product ? 'SoftwareApplication' : 'WebPage'),
    "name": title,
    "description": description,
    "url": currentUrl,
    "image": defaultImage,
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": process.env.REACT_APP_BACKEND_URL || '',
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/api/images/logo.png`
      }
    }
  };

  // Add article-specific fields
  if (article && author) {
    baseSchema.author = {
      "@type": "Person",
      "name": author
    };
    if (publishedTime) baseSchema.datePublished = publishedTime;
    if (modifiedTime) baseSchema.dateModified = modifiedTime;
    baseSchema.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": currentUrl
    };
  }

  // Add product-specific fields
  if (product) {
    baseSchema["@type"] = "SoftwareApplication";
    baseSchema.applicationCategory = "BusinessApplication";
    baseSchema.operatingSystem = "Web Browser";
  }

  return baseSchema;
};

console.log("Testing tool JSON-LD generation:");
const toolJsonLd = generateJsonLd(toolSeoData);
console.log("Tool JSON-LD result:", !!toolJsonLd);
if (toolJsonLd) {
  console.log(JSON.stringify(toolJsonLd, null, 2));
}

console.log("\nTesting blog JSON-LD generation:");
const blogJsonLd = generateJsonLd(blogSeoData);
console.log("Blog JSON-LD result:", !!blogJsonLd);
if (blogJsonLd) {
  console.log(JSON.stringify(blogJsonLd, null, 2));
}