import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateArticleSchema, generateProductSchema } from '../components/SEO/StructuredData';

/**
 * Enhanced SEO Hook for Dynamic Meta Management with Advanced Features
 * Provides comprehensive SEO optimization with real-time updates and analytics
 */
const useSEO = ({
  title,
  description,
  keywords = '',
  canonical = '',
  image = '',
  type = 'website',
  data = {},
  enableAnalytics = true,
  autoOptimize = true
}) => {
  const location = useLocation();
  const [seoScore, setSeoScore] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [internalLinks, setInternalLinks] = useState([]);

  const seoData = useMemo(() => {
    // Generate optimized title with length validation
    let optimizedTitle = title 
      ? `${title} | MarketMind`
      : 'MarketMind - Discover the Best Business Tools';
    
    // Ensure title is between 30-60 characters for optimal SEO
    if (optimizedTitle.length > 60) {
      optimizedTitle = `${title} | MarketMind`.substring(0, 57) + '...';
    }

    // Generate optimized description with fallback
    let optimizedDescription = description || 
      'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.';

    // Ensure description length is optimal for SEO (120-160 chars)
    if (optimizedDescription.length > 160) {
      optimizedDescription = `${optimizedDescription.substring(0, 157)}...`;
    } else if (optimizedDescription.length < 120 && data.content) {
      // Try to extend description from content
      const additionalContent = cleanHtmlFromText(data.content).substring(0, 40);
      optimizedDescription += ` ${additionalContent}`;
      if (optimizedDescription.length > 160) {
        optimizedDescription = `${optimizedDescription.substring(0, 157)}...`;
      }
    }

    // Generate keywords from data if not provided
    const optimizedKeywords = keywords || generateKeywordsFromData(data, type);

    // Generate canonical URL
    const baseUrl = process.env.REACT_APP_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const canonicalUrl = canonical || `${baseUrl}${location.pathname}${location.search}`;

    // Generate optimized image URL
    const optimizedImage = image || `${baseUrl}/api/images/og-default.jpg`;

    return {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: optimizedKeywords, 
      canonical: canonicalUrl,
      image: optimizedImage,
      type,
      ...data
    };
  }, [title, description, keywords, canonical, image, type, data, location]);

  // Calculate SEO score
  const seoValidation = useMemo(() => {
    const issues = [];
    let score = 100;
    
    // Title validation
    if (!title) {
      issues.push({ type: 'missing_title', severity: 'high', message: 'Page title is missing' });
      score -= 25;
    } else {
      if (seoData.title.length < 30) {
        issues.push({ type: 'short_title', severity: 'medium', message: 'Title is too short (< 30 chars)' });
        score -= 10;
      }
      if (seoData.title.length > 60) {
        issues.push({ type: 'long_title', severity: 'medium', message: 'Title is too long (> 60 chars)' });
        score -= 10;
      }
    }

    // Description validation
    if (!description) {
      issues.push({ type: 'missing_description', severity: 'high', message: 'Meta description is missing' });
      score -= 20;
    } else {
      if (seoData.description.length < 120) {
        issues.push({ type: 'short_description', severity: 'medium', message: 'Description is too short (< 120 chars)' });
        score -= 8;
      }
      if (seoData.description.length > 160) {
        issues.push({ type: 'long_description', severity: 'medium', message: 'Description is too long (> 160 chars)' });
        score -= 8;
      }
    }

    // Keywords validation
    if (!keywords && !seoData.keywords) {
      issues.push({ type: 'missing_keywords', severity: 'low', message: 'SEO keywords are missing' });
      score -= 5;
    }

    // Image validation
    if (!image) {
      issues.push({ type: 'missing_image', severity: 'low', message: 'Open Graph image is missing' });
      score -= 5;
    }

    // Content validation
    if (data.content) {
      const wordCount = cleanHtmlFromText(data.content).split(' ').length;
      if (wordCount < 300) {
        issues.push({ type: 'thin_content', severity: 'medium', message: 'Content is too thin (< 300 words)' });
        score -= 12;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      isOptimized: score >= 80,
      needsImprovement: score < 60
    };
  }, [seoData, title, description, keywords, image, data]);

  // Get internal link suggestions
  const getInternalLinkSuggestions = async (content) => {
    if (!enableAnalytics || !content) return [];
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) return [];

      const response = await fetch(
        `${backendUrl}/api/seo/internal-links/suggestions?content=${encodeURIComponent(content)}&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        setInternalLinks(data.suggestions || []);
        return data.suggestions || [];
      }
    } catch (error) {
      console.warn('Failed to get internal link suggestions:', error);
    }
    return [];
  };

  // Audit current page SEO
  const auditPageSEO = async () => {
    if (!enableAnalytics) return null;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) return null;

      const response = await fetch(`${backendUrl}/api/seo/audit/page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_url: seoData.canonical,
          page_type: type
        })
      });

      if (response.ok) {
        const auditResult = await response.json();
        setSeoScore(auditResult.seo_score);
        return auditResult;
      }
    } catch (error) {
      console.warn('Failed to audit page SEO:', error);
    }
    return null;
  };

  // Track performance metrics
  useEffect(() => {
    if (!enableAnalytics || typeof window === 'undefined') return;

    const trackPerformance = () => {
      if (window.performance && window.performance.getEntriesByType) {
        const paintEntries = window.performance.getEntriesByType('paint');
        const navigationEntries = window.performance.getEntriesByType('navigation');
        
        const metrics = {
          fcp: null,
          lcp: null,
          cls: null,
          ttfb: null
        };

        // Get First Contentful Paint
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
        }

        // Get Time to First Byte
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          metrics.ttfb = navEntry.responseStart - navEntry.fetchStart;
        }

        setPerformanceMetrics(metrics);
      }
    };

    // Track after a short delay to allow page to load
    const timer = setTimeout(trackPerformance, 2000);
    return () => clearTimeout(timer);
  }, [enableAnalytics, location.pathname]);

  // Auto-generate internal links on content change
  useEffect(() => {
    if (autoOptimize && data.content && enableAnalytics) {
      getInternalLinkSuggestions(data.content);
    }
  }, [data.content, autoOptimize, enableAnalytics]);

  return {
    // Core SEO data
    ...seoData,
    
    // Validation and scoring
    validation: seoValidation,
    seoScore: seoScore || seoValidation.score,
    isOptimized: seoValidation.isOptimized,
    needsImprovement: seoValidation.needsImprovement,
    
    // Analytics data
    performanceMetrics,
    internalLinks,
    
    // Utility functions
    getInternalLinkSuggestions,
    auditPageSEO,
    
    // Computed helpers
    titleLength: seoData.title.length,
    descriptionLength: seoData.description.length,
    keywordCount: seoData.keywords ? seoData.keywords.split(',').length : 0,
    wordCount: data.content ? cleanHtmlFromText(data.content).split(' ').length : 0
  };
};

// Helper function to clean HTML from text
const cleanHtmlFromText = (text) => {
  if (!text) return text;
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
        description: cleanHtmlFromText(blog.seo_description || blog.excerpt) || 'Read this insightful blog post.',
        keywords: blog.seo_keywords || (Array.isArray(blog.tags) ? blog.tags.join(', ') : ''),
        canonical: `/blogs/${blog.slug}`,
        image: blog.featured_image || '',
        type: 'article',
        article: true,
        author: blog.author_name || 'MarketMind Team',
        publishedTime: blog.published_at || blog.created_at,
        modifiedTime: blog.updated_at,
        jsonLd: (blog.json_ld && Object.keys(blog.json_ld).length > 0) ? blog.json_ld : generateArticleSchema(blog),
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
  return useMemo(() => {
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
    
    try {
      const seoData = {
        title: tool.seo_title || `${tool.name} - Review & Pricing`,
        description: tool.seo_description || tool.short_description || tool.description || 'Discover this amazing business tool.',
        keywords: tool.seo_keywords || generateKeywordsFromData({
          categories: tool.categories,
          features: tool.features
        }, 'product'),
        canonical: `/tools/${tool.slug}`,
        image: tool.screenshot_url || tool.logo_url || '',
        type: 'product',
        product: true,
        jsonLd: (tool.json_ld && Object.keys(tool.json_ld).length > 0) ? tool.json_ld : generateProductSchema(tool),
        categories: Array.isArray(tool.categories) ? tool.categories : [],
        features: Array.isArray(tool.features) ? tool.features : [],
        rating: tool.rating,
        reviewCount: tool.review_count || 0
      };
      
      return seoData;
    } catch (error) {
      console.error('Error generating tool SEO data:', error);
      return {
        title: tool.name ? `${tool.name} - Review & Pricing | MarketMind` : 'Business Tool | MarketMind',
        description: tool.short_description || tool.description || 'Discover this amazing business tool.',
        keywords: 'business tool, software, productivity',
        canonical: `/tools/${tool.slug}`,
        image: tool.screenshot_url || tool.logo_url || '',
        type: 'product'
      };
    }
  }, [tool]);
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