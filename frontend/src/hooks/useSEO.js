import { useMemo } from 'react';
import { generateArticleSchema, generateProductSchema } from '../components/SEO/StructuredData';

// Custom hook for generating SEO data with performance optimizations
const useSEO = ({
  title,
  description,
  keywords = '',
  canonical = '',
  image = '',
  type = 'website',
  data = {}
}) => {
  const seoData = useMemo(() => {
    // Generate optimized title
    const optimizedTitle = title 
      ? `${title} | MarketMind`
      : 'MarketMind - Discover the Best Business Tools';

    // Generate optimized description with fallback
    const optimizedDescription = description || 
      'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.';

    // Ensure description length is optimal for SEO (150-160 chars)
    const truncatedDescription = optimizedDescription.length > 160 
      ? `${optimizedDescription.substring(0, 157)}...`
      : optimizedDescription;

    // Generate keywords from data if not provided
    const optimizedKeywords = keywords || generateKeywordsFromData(data, type);

    // Generate canonical URL
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

    return {
      title: optimizedTitle,
      description: truncatedDescription,
      keywords: optimizedKeywords,
      canonical: canonicalUrl,
      image,
      type,
      ...data
    };
  }, [title, description, keywords, canonical, image, type, data]);

  return seoData;
};

// Helper function to generate keywords from data
const generateKeywordsFromData = (data, type) => {
  const keywords = [];
  
  if (type === 'article' && data.tags && Array.isArray(data.tags)) {
    keywords.push(...data.tags);
  }
  
  if (type === 'product' && data.categories && Array.isArray(data.categories)) {
    keywords.push(...data.categories.map(cat => cat.name));
  }
  
  if (data.features && Array.isArray(data.features)) {
    keywords.push(...data.features.slice(0, 3)); // Limit to 3 features
  }
  
  // Add base keywords
  keywords.push('business tools', 'productivity', 'software comparison');
  
  return keywords.join(', ');
};

// Hook for blog-specific SEO
export const useBlogSEO = (blog) => {
  return useMemo(() => {
    if (!blog) {
      return {
        title: 'MarketMind - Discover the Best Business Tools',
        description: 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.',
        keywords: 'business tools, productivity, software comparison',
        canonical: '',
        image: '',
        type: 'website'
      };
    }
    
    try {
      const seoData = {
        title: blog.seo_title || blog.title || 'Blog Post',
        description: blog.seo_description || blog.excerpt || 'Read this insightful blog post.',
        keywords: blog.seo_keywords || (Array.isArray(blog.tags) ? blog.tags.join(', ') : ''),
        canonical: `/blogs/${blog.slug}`,
        image: blog.featured_image || '',
        type: 'article',
        article: true,
        author: blog.author_name || 'MarketMind Team',
        publishedTime: blog.published_at || blog.created_at,
        modifiedTime: blog.updated_at,
        jsonLd: blog.json_ld || generateArticleSchema(blog),
        tags: Array.isArray(blog.tags) ? blog.tags : []
      };
      
      return seoData;
    } catch (error) {
      console.error('Error generating blog SEO data:', error);
      return {
        title: blog.title ? `${blog.title} | MarketMind` : 'Blog Post | MarketMind',
        description: blog.excerpt || 'Read this insightful blog post.',
        keywords: 'blog, article, MarketMind',
        canonical: `/blogs/${blog.slug}`,
        image: blog.featured_image || '',
        type: 'article'
      };
    }
  }, [blog]);
};

// Hook for tool-specific SEO
export const useToolSEO = (tool) => {
  if (!tool) {
    return {
      title: 'MarketMind - Discover the Best Business Tools',
      description: 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.',
      keywords: 'business tools, productivity, software comparison',
      canonical: '',
      image: '',
      type: 'website'
    };
  }
  
  return useSEO({
    title: tool.seo_title || `${tool.name} - Review & Pricing`,
    description: tool.seo_description || tool.short_description,
    keywords: tool.seo_keywords || '',
    canonical: `/tools/${tool.slug}`,
    image: tool.screenshot_url || tool.logo_url,
    type: 'product',
    data: {
      product: true,
      jsonLd: tool.json_ld || (tool ? generateProductSchema(tool) : null),
      categories: tool.categories || [],
      features: tool.features || [],
      rating: tool.rating,
      reviewCount: tool.review_count
    }
  });
};

// Generate JSON-LD for tools
const generateToolJsonLd = (tool) => {
  if (!tool) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description || tool.short_description,
    "url": tool.url,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": tool.pricing_details ? {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    } : undefined,
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "reviewCount": tool.review_count || 0,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "screenshot": tool.screenshot_url,
    "image": tool.logo_url
  };
};

export default useSEO;