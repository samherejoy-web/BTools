import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHeadDebug = React.memo(({
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
  locale = 'en_US'
}) => {
  // Get current URL for canonical and og:url
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Default image fallback
  const defaultImage = image || `${process.env.REACT_APP_BACKEND_URL || ''}/api/images/og-default.jpg`;
  
  // Debug logging
  console.log('SEOHeadDebug - Props received:', {
    title,
    description: description.substring(0, 50) + '...',
    jsonLd: jsonLd ? 'Present' : 'Null',
    jsonLdType: typeof jsonLd,
    jsonLdKeys: jsonLd && typeof jsonLd === 'object' ? Object.keys(jsonLd) : 'N/A',
    product,
    article,
    type
  });
  
  // Generate structured data
  const generateJsonLd = () => {
    console.log('generateJsonLd called - jsonLd input:', jsonLd);
    
    if (jsonLd && typeof jsonLd === 'object' && Object.keys(jsonLd).length > 0) {
      console.log('Using provided jsonLd:', jsonLd);
      return jsonLd;
    }
    
    console.log('Generating fallback schema...');
    
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

    console.log('Generated fallback schema:', baseSchema);
    return baseSchema;
  };

  const finalJsonLd = generateJsonLd();
  console.log('Final JSON-LD to render:', finalJsonLd ? 'Present' : 'Null');

  return (
    <Helmet>
      {/* Basic Meta Tags - These will override static HTML meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags - These will override static HTML meta tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {image && <meta property="og:image" content={defaultImage} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      {image && <meta property="og:image:alt" content={title} />}
      
      {/* Article-specific Open Graph */}
      {article && author && <meta property="article:author" content={author} />}
      {article && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {article && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Twitter Card Meta Tags - These will override static HTML meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={defaultImage} />}
      {image && <meta name="twitter:image:alt" content={title} />}
      
      {/* Additional Performance Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Structured Data */}
      {finalJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(finalJsonLd)}
        </script>
      )}
    </Helmet>
  );
});

SEOHeadDebug.displayName = 'SEOHeadDebug';

export default SEOHeadDebug;