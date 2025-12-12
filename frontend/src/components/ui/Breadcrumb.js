import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

/**
 * Breadcrumb component with schema markup for enhanced SEO
 */
const Breadcrumb = ({ items = [], className = "" }) => {
  if (items.length === 0) return null;

  const siteUrl = process.env.REACT_APP_FRONTEND_URL || process.env.REACT_APP_BACKEND_URL || '';

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${siteUrl}${item.href}`
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm ${className}`}
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center"
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" aria-hidden="true" />
            )}
            {index === items.length - 1 ? (
              <span 
                className="text-gray-900 font-medium flex items-center"
                itemProp="name"
                aria-current="page"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" aria-hidden="true" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                itemProp="item"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" aria-hidden="true" />}
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={index + 1} />
          </div>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumb;
