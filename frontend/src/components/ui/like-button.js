import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LikeButton = ({ 
  itemId, 
  itemSlug, 
  initialLiked = false, 
  initialCount = 0, 
  onLike, 
  type = 'blog', // 'blog' or 'tool'
  size = 'default',
  variant = 'outline',
  className = '' 
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this item');
      navigate('/login');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      let response;
      
      if (onLike) {
        // Use custom onLike handler if provided
        response = await onLike();
      } else {
        // Default API call based on type
        const apiClient = (await import('../../utils/apiClient')).default;
        const endpoint = type === 'blog' 
          ? `/blogs/${itemSlug}/like`
          : `/tools/${itemSlug}/like`;
        response = await apiClient.post(endpoint);
      }

      if (response?.data) {
        setLiked(response.data.liked);
        setLikeCount(response.data.like_count);
        
        toast.success(
          response.data.liked 
            ? `${type === 'blog' ? 'Article' : 'Tool'} liked!`
            : 'Like removed',
          { duration: 1500 }
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'default';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={handleLike}
      disabled={loading}
      className={`
        ${liked ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : ''} 
        ${className}
        transition-all duration-200 hover:scale-105
      `}
    >
      <Heart 
        className={`${getIconSize()} mr-2 transition-all duration-200 ${
          liked ? 'fill-red-600 text-red-600' : ''
        } ${loading ? 'animate-pulse' : ''}`} 
      />
      <span className="font-medium">
        {likeCount > 0 ? likeCount : (liked ? 1 : 'Like')}
      </span>
    </Button>
  );
};

export default LikeButton;