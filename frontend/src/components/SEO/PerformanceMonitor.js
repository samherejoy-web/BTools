import React, { useEffect, useRef, useState } from 'react';

/**
 * Advanced Performance Monitor for SEO and User Experience
 * Monitors Core Web Vitals and provides real-time performance insights
 */
const PerformanceMonitor = ({ 
  enableReporting = true, 
  reportingInterval = 30000, // 30 seconds
  onMetricsUpdate = null 
}) => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    performance_score: null,
    loading_time: null
  });
  
  const metricsRef = useRef(metrics);
  const observersRef = useRef([]);

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Setup periodic reporting
    let reportingTimer;
    if (enableReporting && reportingInterval > 0) {
      reportingTimer = setInterval(() => {
        reportMetrics();
      }, reportingInterval);
    }

    return () => {
      // Cleanup observers
      observersRef.current.forEach(observer => {
        if (observer && observer.disconnect) {
          observer.disconnect();
        }
      });
      
      if (reportingTimer) {
        clearInterval(reportingTimer);
      }
    };
  }, [enableReporting, reportingInterval]);

  const initializePerformanceMonitoring = () => {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            const lcpValue = lastEntry.startTime;
            updateMetric('lcp', lcpValue);
            
            // Log for debugging
            console.log(`LCP: ${lcpValue.toFixed(2)}ms`, {
              rating: getLCPRating(lcpValue),
              element: lastEntry.element,
              url: lastEntry.url
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Monitor First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            const fidValue = entry.processingStart - entry.startTime;
            updateMetric('fid', fidValue);
            
            console.log(`FID: ${fidValue.toFixed(2)}ms`, {
              rating: getFIDRating(fidValue),
              eventType: entry.name
            });
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        observersRef.current.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Monitor Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          updateMetric('cls', clsValue);
          
          console.log(`CLS: ${clsValue.toFixed(4)}`, {
            rating: getCLSRating(clsValue)
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // Monitor First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              const fcpValue = entry.startTime;
              updateMetric('fcp', fcpValue);
              
              console.log(`FCP: ${fcpValue.toFixed(2)}ms`, {
                rating: getFCPRating(fcpValue)
              });
            }
          });
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        observersRef.current.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }
    }

    // Monitor Time to First Byte (TTFB)
    if (window.performance && window.performance.timing) {
      const navigationTiming = window.performance.timing;
      const ttfbValue = navigationTiming.responseStart - navigationTiming.navigationStart;
      updateMetric('ttfb', ttfbValue);
      
      // Calculate page load time
      const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
      updateMetric('loading_time', loadTime);
      
      console.log(`TTFB: ${ttfbValue.toFixed(2)}ms`, {
        rating: getTTFBRating(ttfbValue)
      });
      
      console.log(`Page Load Time: ${loadTime.toFixed(2)}ms`);
    }

    // Monitor resource loading performance
    monitorResourcePerformance();
    
    // Calculate overall performance score
    setTimeout(() => {
      calculatePerformanceScore();
    }, 3000); // Wait for metrics to stabilize
  };

  const monitorResourcePerformance = () => {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      
      // Analyze critical resources
      const criticalResources = resources.filter(resource => 
        resource.name.includes('.css') || 
        resource.name.includes('.js') ||
        resource.name.includes('.woff') ||
        resource.name.includes('.jpg') ||
        resource.name.includes('.png')
      );

      const slowResources = criticalResources.filter(resource => 
        resource.duration > 1000 // Slower than 1 second
      );

      if (slowResources.length > 0) {
        console.warn('Slow loading resources detected:', 
          slowResources.map(r => ({
            url: r.name,
            duration: `${r.duration.toFixed(2)}ms`,
            size: r.transferSize || 'unknown'
          }))
        );
      }

      // Log largest resources
      const largestResources = criticalResources
        .filter(r => r.transferSize > 100000) // Larger than 100KB
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 5);

      if (largestResources.length > 0) {
        console.log('Largest resources:', 
          largestResources.map(r => ({
            url: r.name.split('/').pop(),
            size: `${(r.transferSize / 1024).toFixed(2)}KB`,
            duration: `${r.duration.toFixed(2)}ms`
          }))
        );
      }
    }
  };

  const updateMetric = (metricName, value) => {
    const newMetrics = { ...metricsRef.current, [metricName]: value };
    metricsRef.current = newMetrics;
    setMetrics(newMetrics);

    // Call external handler if provided
    if (onMetricsUpdate) {
      onMetricsUpdate(metricName, value, newMetrics);
    }
  };

  const calculatePerformanceScore = () => {
    const currentMetrics = metricsRef.current;
    let score = 100;
    
    // LCP scoring (25 points)
    if (currentMetrics.lcp !== null) {
      if (currentMetrics.lcp > 4000) score -= 25;
      else if (currentMetrics.lcp > 2500) score -= 15;
      else if (currentMetrics.lcp > 1200) score -= 5;
    }
    
    // FID scoring (25 points)
    if (currentMetrics.fid !== null) {
      if (currentMetrics.fid > 300) score -= 25;
      else if (currentMetrics.fid > 100) score -= 15;
      else if (currentMetrics.fid > 50) score -= 5;
    }
    
    // CLS scoring (25 points)
    if (currentMetrics.cls !== null) {
      if (currentMetrics.cls > 0.25) score -= 25;
      else if (currentMetrics.cls > 0.1) score -= 15;
      else if (currentMetrics.cls > 0.05) score -= 5;
    }
    
    // FCP scoring (15 points)
    if (currentMetrics.fcp !== null) {
      if (currentMetrics.fcp > 3000) score -= 15;
      else if (currentMetrics.fcp > 1800) score -= 10;
      else if (currentMetrics.fcp > 1000) score -= 3;
    }
    
    // TTFB scoring (10 points)
    if (currentMetrics.ttfb !== null) {
      if (currentMetrics.ttfb > 800) score -= 10;
      else if (currentMetrics.ttfb > 600) score -= 6;
      else if (currentMetrics.ttfb > 300) score -= 2;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    updateMetric('performance_score', finalScore);
    
    console.log(`Performance Score: ${finalScore}/100`, {
      lcp: currentMetrics.lcp ? `${currentMetrics.lcp.toFixed(2)}ms` : 'N/A',
      fid: currentMetrics.fid ? `${currentMetrics.fid.toFixed(2)}ms` : 'N/A',
      cls: currentMetrics.cls ? currentMetrics.cls.toFixed(4) : 'N/A',
      fcp: currentMetrics.fcp ? `${currentMetrics.fcp.toFixed(2)}ms` : 'N/A',
      ttfb: currentMetrics.ttfb ? `${currentMetrics.ttfb.toFixed(2)}ms` : 'N/A'
    });
  };

  const reportMetrics = async () => {
    const currentMetrics = metricsRef.current;
    
    // Only report if we have meaningful data
    if (!currentMetrics.lcp && !currentMetrics.fcp && !currentMetrics.performance_score) {
      return;
    }

    const reportData = {
      ...currentMetrics,
      url: window.location.href,
      user_agent: navigator.userAgent,
      connection: navigator.connection ? {
        effective_type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    try {
      // Send to backend analytics endpoint
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      if (backendUrl) {
        await fetch(`${backendUrl}/api/analytics/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        }).catch(error => {
          console.warn('Failed to report performance metrics:', error);
        });
      }
      
      console.log('Performance metrics reported:', reportData);
    } catch (error) {
      console.warn('Performance reporting failed:', error);
    }
  };

  // Rating functions
  const getLCPRating = (value) => {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  };

  const getFIDRating = (value) => {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  };

  const getCLSRating = (value) => {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  };

  const getFCPRating = (value) => {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  };

  const getTTFBRating = (value) => {
    if (value <= 600) return 'good';
    if (value <= 1000) return 'needs-improvement';
    return 'poor';
  };

  // Component doesn't render anything visible
  return null;
};

export default PerformanceMonitor;

// Export utilities for external use
export const getPerformanceMetrics = () => {
  return new Promise((resolve) => {
    if (!window.performance) {
      resolve(null);
      return;
    }

    const metrics = {};
    
    // Get navigation timing
    if (window.performance.timing) {
      const timing = window.performance.timing;
      metrics.dom_loading = timing.domLoading - timing.navigationStart;
      metrics.dom_interactive = timing.domInteractive - timing.navigationStart;
      metrics.dom_complete = timing.domComplete - timing.navigationStart;
      metrics.load_event = timing.loadEventEnd - timing.navigationStart;
    }

    // Get paint metrics
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
        if (entry.name === 'first-paint') {
          metrics.fp = entry.startTime;
        }
      });
    }

    resolve(metrics);
  });
};

export const startPerformanceMonitoring = (options = {}) => {
  const monitor = React.createElement(PerformanceMonitor, options);
  return monitor;
};