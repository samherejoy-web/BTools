import React from 'react';
import { Helmet } from 'react-helmet-async';

// Separate component for structured data to improve performance
const StructuredData = React.memo(({ data }) => {
  if (!data) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
});

StructuredData.displayName = 'StructuredData';

// Pre-built structured data generators for common use cases
export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateArticleSchema = (blog) => {
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

export const generateProductSchema = (tool) => {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description || tool.short_description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "url": tool.url,
    "screenshot": tool.screenshot_url,
    "image": tool.logo_url || `${baseUrl}/api/images/tool-default.jpg`,
    "provider": {
      "@type": "Organization",
      "name": tool.name
    },
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at,
    "featureList": tool.features?.join(', '),
    "softwareVersion": "Latest"
  };

  // Add pricing information if available
  if (tool.pricing_details && typeof tool.pricing_details === 'object') {
    const pricingKeys = Object.keys(tool.pricing_details);
    if (pricingKeys.length > 0) {
      const firstPrice = tool.pricing_details[pricingKeys[0]];
      schema.offers = {
        "@type": "Offer",
        "price": firstPrice === 'Free' || firstPrice === '$0' ? "0" : firstPrice.replace(/[^0-9.]/g, ''),
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }
  }

  // Add aggregate rating if available
  if (tool.rating && tool.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "reviewCount": tool.review_count,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return schema;
};

export const generateOrganizationSchema = () => {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MarketMind",
    "url": baseUrl,
    "logo": `${baseUrl}/api/images/logo.png`,
    "description": "Discover and compare the best business tools with AI-powered insights and community reviews.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/marketmind",
      "https://linkedin.com/company/marketmind"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@marketmind.com"
    }
  };
};

export const generateWebSiteSchema = () => {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MarketMind",
    "url": baseUrl,
    "description": "Discover and compare the best business tools",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/tools?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MarketMind",
      "logo": `${baseUrl}/api/images/logo.png`
    }
  };
};

export default StructuredData;