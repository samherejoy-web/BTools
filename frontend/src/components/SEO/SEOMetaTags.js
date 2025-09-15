import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Enhanced SEO Meta Tags component optimized for production
 * This component works alongside static meta generation for better SEO
 */
const SEOMetaTags = React.memo(({
  title = 'MarketMind - Discover the Best Business Tools',
  description = 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.',
  keywords = '',
  canonical = '',
  image = '',
  article = false,
  product = false,
  jsonLd = null,
  author = '',
  publishedTime = '',
  modifiedTime = '',
  type = 'website',
  siteName = 'MarketMind',
  locale = 'en_US',
  noindex = false
}) => {
  // Get current URL for canonical and og:url
  const getCurrentUrl = () => {
    if (canonical) return canonical;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return process.env.REACT_APP_BACKEND_URL || '';
  };
  
  const currentUrl = getCurrentUrl();
  
  // Default image fallback
  const getImageUrl = () => {
    if (image) return image;
    const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
    return `${baseUrl}/api/images/og-default.jpg`;
  };
  
  const defaultImage = getImageUrl();
  
  // Generate structured data
  const generateJsonLd = () => {
    // Use provided JSON-LD if available and valid
    if (jsonLd && typeof jsonLd === 'object' && Object.keys(jsonLd).length > 0) {
      return jsonLd;
    }
    
    // Generate default schema based on content type
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": getSchemaType(),
      "name": title,
      "description": description,
      "url": currentUrl,
      "image": {
        "@type": "ImageObject",
        "url": defaultImage,
        "width": 1200,
        "height": 630
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "url": process.env.REACT_APP_BACKEND_URL || '',
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.REACT_APP_BACKEND_URL || ''}/api/images/logo.png`,
          "width": 180,
          "height": 180
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
      // Add article section for better categorization
      baseSchema.articleSection = "Business Tools";
    }

    // Add product-specific fields
    if (product) {
      baseSchema.applicationCategory = "BusinessApplication";
      baseSchema.operatingSystem = "Web Browser";
      baseSchema.offers = {
        "@type": "Offer",
        "availability": "https://schema.org/InStock"
      };
    }

    return baseSchema;
  };
  
  // Determine schema type
  const getSchemaType = () => {
    if (article) return 'BlogPosting';
    if (product) return 'SoftwareApplication';
    if (type === 'article') return 'Article';
    return 'WebPage';
  };
  
  // Generate robots content
  const getRobotsContent = () => {
    if (noindex) return 'noindex, nofollow';
    return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  };
  
  const structuredData = generateJsonLd();

  return (
    <Helmet 
      prioritizeSeoTags={true}
      encodeSpecialCharacters={false}
    >
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={getRobotsContent()} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Article-specific Open Graph */}
      {article && author && <meta property="article:author" content={author} />}
      {article && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {article && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {article && <meta property="article:section" content="Business Tools" />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@MarketMind" />
      <meta name="twitter:creator" content="@MarketMind" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Language and Locale */}
      <html lang={locale.split('_')[0]} />
      <meta httpEquiv="content-language" content={locale.split('_')[0]} />
      
      {/* Structured Data - JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Preload critical resources */}
      <link rel="preload" href={defaultImage} as="image" />
      <link rel="dns-prefetch" href={process.env.REACT_APP_BACKEND_URL} />
    </Helmet>
  );
});

SEOMetaTags.displayName = 'SEOMetaTags';

export default SEOMetaTags;