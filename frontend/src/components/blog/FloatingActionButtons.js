import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  ArrowUp 
} from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const FloatingActionButtons = ({ 
  blog,
  isLiked,
  isBookmarked,
  likesCount,
  commentsCount,
  onToggleLike,
  onToggleBookmark,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 300);
      setShowBackToTop(scrolled > 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || '';
    const text = blog?.excerpt || '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikeWithAnimation = () => {
    // Create floating hearts animation
    const button = document.querySelector('.floating-like-btn');
    if (button) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.innerHTML = '❤️';
          heart.className = 'absolute text-red-500 text-lg pointer-events-none animate-ping';
          heart.style.left = Math.random() * 20 + 'px';
          heart.style.top = -Math.random() * 20 + 'px';
          button.appendChild(heart);
          
          setTimeout(() => heart.remove(), 1000);
        }, i * 100);
      }
    }
    
    onToggleLike?.();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Floating Actions - Left Side */}
      <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
        <div className="flex flex-col gap-3">
          {/* Like Button */}
          <div className="relative">
            <Button
              onClick={handleLikeWithAnimation}
              className={`floating-like-btn relative w-12 h-12 rounded-full shadow-lg border transition-all duration-300 hover:scale-110 ${
                isLiked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-600' : ''}`} />
            </Button>
            {likesCount > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                {likesCount > 99 ? '99+' : likesCount}
              </div>
            )}
          </div>

          {/* Bookmark Button */}
          <Button
            onClick={onToggleBookmark}
            className={`w-12 h-12 rounded-full shadow-lg border transition-all duration-300 hover:scale-110 ${
              isBookmarked 
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
          </Button>

          {/* Share Button */}
          <div className="relative">
            <Button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-12 h-12 rounded-full shadow-lg border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute left-16 top-0 bg-white rounded-lg shadow-xl border p-2 min-w-[180px] z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="w-full justify-start hover:bg-blue-50"
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="w-full justify-start hover:bg-blue-50"
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="w-full justify-start hover:bg-blue-50"
                >
                  <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                  LinkedIn
                </Button>
                <hr className="my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="w-full justify-start hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            )}
          </div>

          {/* Comments Indicator */}
          {commentsCount > 0 && (
            <Button
              onClick={() => {
                const commentsSection = document.querySelector('#comments-section');
                commentsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-12 h-12 rounded-full shadow-lg border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300 hover:scale-110 relative"
            >
              <MessageCircle className="h-5 w-5" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                {commentsCount > 99 ? '99+' : commentsCount}
              </div>
            </Button>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300 hover:scale-110 z-40"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </>
  );
};

export default FloatingActionButtons;