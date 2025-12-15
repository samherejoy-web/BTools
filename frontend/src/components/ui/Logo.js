import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

const Logo = ({ 
  className = "", 
  linkClassName = "", 
  showText = true, 
  textClassName = "",
  size = "default" // default, sm, lg
}) => {
  const [logoData, setLogoData] = useState({
    logoUrl: null,
    altText: "MarketMindAI",
    loading: true
  });

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "h-6 w-6",
      text: "text-lg",
      textMargin: "ml-1"
    },
    default: {
      container: "h-8 w-8", 
      text: "text-xl",
      textMargin: "ml-2"
    },
    lg: {
      container: "h-12 w-12",
      text: "text-2xl", 
      textMargin: "ml-3"
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  const fetchLogoData = async () => {
    try {
      const response = await apiClient.get('/public/site-settings');
      let logoUrl = response.data.site_logo_url;
      const altText = response.data.site_logo_alt_text || "MarketMindAI";
      
      // If logoUrl is the API endpoint, construct the full URL
      if (logoUrl && logoUrl.trim()) {
        if (logoUrl.startsWith('/api/')) {
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          logoUrl = `${backendUrl}${logoUrl}`;
        } else if (logoUrl.startsWith('/')) {
          // Handle legacy relative paths
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          logoUrl = `${backendUrl}${logoUrl}`;
        }
      }
      
      setLogoData({
        logoUrl: logoUrl && logoUrl.trim() ? logoUrl : null,
        altText,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching logo data:', error);
      setLogoData({
        logoUrl: null,
        altText: "MarketMindAI",
        loading: false
      });
    }
  };

  useEffect(() => {
    fetchLogoData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  // Loading state
  if (logoData.loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`${config.container} bg-gray-200 rounded-lg animate-pulse`}></div>
        {showText && (
          <div className={`${config.textMargin} h-6 w-32 bg-gray-200 rounded animate-pulse`}></div>
        )}
      </div>
    );
  }

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      {logoData.logoUrl ? (
        // Custom logo
        <img
          src={logoData.logoUrl}
          alt={logoData.altText}
          className={`${config.container} object-contain object-left`}
          style={{ 
            maxHeight: config.container.includes('h-6') ? '24px' : config.container.includes('h-12') ? '48px' : '32px',
            maxWidth: config.container.includes('h-6') ? '120px' : config.container.includes('h-12') ? '200px' : '150px'
          }}
          loading="eager"
          onError={(e) => {
            console.error('Logo failed to load, falling back to default');
            setLogoData(prev => ({ ...prev, logoUrl: null }));
          }}
        />
      ) : (
        // Default fallback logo
        <div className={`${config.container} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">MM</span>
        </div>
      )}
      
      {showText && (
        <span className={`${config.textMargin} ${config.text} font-bold text-gray-900 ${textClassName}`}>
          MarketMindAI
        </span>
      )}
    </div>
  );

  // If no linkClassName provided, return just the content without Link wrapper
  if (!linkClassName && !linkClassName === '') {
    return logoContent;
  }

  // Wrap in Link component
  return (
    <Link to="/" className={`flex-shrink-0 ${linkClassName}`}>
      {logoContent}
    </Link>
  );
};

export default Logo;