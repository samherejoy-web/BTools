import React, { useState, useEffect } from 'react';

const ReadingProgressBar = ({ target = 'article', className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const element = document.querySelector(target) || document.body;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      
      // Calculate how much of the article has been scrolled
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = documentHeight - windowHeight;
      const progressPercent = Math.min(100, Math.max(0, (scrolled / maxScroll) * 100));
      
      setProgress(progressPercent);
      setIsVisible(scrolled > 100); // Show after scrolling 100px
    };

    // Initial calculation
    updateProgress();

    // Throttled scroll listener for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, [target]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Reading Time Indicator */}
      <div className="absolute top-2 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
          <span className="font-medium">{Math.round(progress)}% read</span>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressBar;