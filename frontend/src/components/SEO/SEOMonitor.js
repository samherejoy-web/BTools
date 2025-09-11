import { useEffect } from 'react';

// Performance monitoring for SEO components
const SEOMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals for SEO impact
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP (SEO Impact):', entry.startTime, 'ms');
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            console.log('FID (SEO Impact):', entry.processingStart - entry.startTime, 'ms');
          }
        });
      });

      if ('PerformanceObserver' in window) {
        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.log('FID monitoring not supported');
        }
      }

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS (SEO Impact):', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('CLS monitoring not supported');
      }

      // Monitor SEO-related resource timing
      const checkSEOResources = () => {
        const resources = performance.getEntriesByType('resource');
        const criticalResources = resources.filter(resource => 
          resource.name.includes('helmet') || 
          resource.name.includes('seo') ||
          resource.name.includes('structured-data')
        );

        if (criticalResources.length > 0) {
          console.log('SEO Resource Performance:', criticalResources.map(r => ({
            name: r.name.split('/').pop(),
            duration: r.duration,
            size: r.transferSize
          })));
        }
      };

      // Check after initial load
      setTimeout(checkSEOResources, 2000);

      return () => {
        observer.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default SEOMonitor;