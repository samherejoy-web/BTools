import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Production SEO Fix Component
 * This component ensures SEO meta tags are immediately applied to the DOM
 * without waiting for React Helmet's async operations in production
 */
const ProductionSEOFix = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  siteName = 'MarketMind',
  locale = 'en_US',
  jsonLd
}) => {
  // Immediately update document head in production
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isProduction = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const currentUrl = canonical || window.location.href;
    const imageUrl = image || `${backendUrl}/api/images/og-default.jpg`;
    
    // Function to update or create meta tag
    const updateMetaTag = (selector, attribute, value) => {
      if (!value) return;
      
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('property=')) {
          meta.setAttribute('property', selector.match(/property="([^"]*)"/)[1]);
        } else if (selector.includes('name=')) {
          meta.setAttribute('name', selector.match(/name="([^"]*)"/)[1]);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute(attribute, value);
    };
    
    // Function to update title
    const updateTitle = (newTitle) => {
      if (newTitle && document.title !== newTitle) {
        document.title = newTitle;
      }
    };
    
    // Function to update canonical link
    const updateCanonical = (url) => {
      if (!url) return;
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    };
    
    // Function to update JSON-LD
    const updateJsonLd = (data) => {
      if (!data) return;
      
      // Remove existing JSON-LD
      const existing = document.querySelector('script[type="application/ld+json"][data-react-helmet="true"]');
      if (existing) {
        existing.remove();
      }
      
      // Add new JSON-LD
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-react-helmet', 'true');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };
    
    // Apply meta tags immediately (especially important in production)
    if (isProduction || !window.location.pathname.includes('localhost')) {
      // Basic meta tags
      if (title) updateTitle(title);
      updateMetaTag('meta[name="description"]', 'content', description);
      if (keywords) updateMetaTag('meta[name="keywords"]', 'content', keywords);
      updateCanonical(currentUrl);
      
      // Open Graph tags
      updateMetaTag('meta[property="og:type"]', 'content', type);
      updateMetaTag('meta[property="og:title"]', 'content', title);
      updateMetaTag('meta[property="og:description"]', 'content', description);
      updateMetaTag('meta[property="og:url"]', 'content', currentUrl);
      updateMetaTag('meta[property="og:site_name"]', 'content', siteName);
      updateMetaTag('meta[property="og:locale"]', 'content', locale);
      if (imageUrl) {
        updateMetaTag('meta[property="og:image"]', 'content', imageUrl);
        updateMetaTag('meta[property="og:image:width"]', 'content', '1200');
        updateMetaTag('meta[property="og:image:height"]', 'content', '630');
        updateMetaTag('meta[property="og:image:alt"]', 'content', title);
      }
      
      // Twitter Cards
      updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
      updateMetaTag('meta[name="twitter:title"]', 'content', title);
      updateMetaTag('meta[name="twitter:description"]', 'content', description);
      if (imageUrl) {
        updateMetaTag('meta[name="twitter:image"]', 'content', imageUrl);
        updateMetaTag('meta[name="twitter:image:alt"]', 'content', title);
      }
      
      // JSON-LD
      if (jsonLd) {
        updateJsonLd(jsonLd);
      }
      
      console.log('🚀 Production SEO meta tags applied immediately');
    }
  }, [title, description, keywords, canonical, image, type, siteName, locale, jsonLd]);
  
  // Still use React Helmet for development and as backup
  return (
    <Helmet prioritizeSeoTags={true}>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonical || (typeof window !== 'undefined' ? window.location.href : '')} />
      
      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical || (typeof window !== 'undefined' ? window.location.href : '')} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      {image && <meta property="og:image:alt" content={title} />}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={title} />}
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default ProductionSEOFix;