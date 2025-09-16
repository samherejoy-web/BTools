import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Heart, 
  Eye,
  ExternalLink,
  Twitter,
  Linkedin,
  Globe
} from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/formatters';

const EnhancedAuthorCard = ({ 
  author, 
  blog, 
  authorStats, 
  className = '',
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  // Default author data structure for backward compatibility
  const authorData = {
    name: author?.full_name || author?.name || blog?.author_name || 'Anonymous',
    username: author?.username || 'user',
    email: author?.email || '',
    bio: author?.bio || 'Content creator and thought leader sharing insights on productivity and technology.',
    avatar: author?.avatar || null,
    location: author?.location || null,
    website: author?.website || null,
    twitter: author?.twitter || null,
    linkedin: author?.linkedin || null,
    joinedDate: author?.created_at || author?.joined_date || '2024-01-01',
    ...author
  };

  // Default stats for backward compatibility
  const stats = {
    totalBlogs: authorStats?.totalBlogs || 1,
    totalViews: authorStats?.totalViews || blog?.view_count || 0,
    totalLikes: authorStats?.totalLikes || blog?.like_count || 0,
    followers: authorStats?.followers || 0,
    ...authorStats
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSocialClick = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          {authorData.avatar ? (
            <img
              src={authorData.avatar}
              alt={authorData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200">
              {getInitials(authorData.name)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors cursor-pointer">
            {authorData.name}
          </h4>
          <p className="text-sm text-gray-600">
            {stats.totalBlogs} {stats.totalBlogs === 1 ? 'article' : 'articles'} • {formatNumber(stats.totalViews)} views
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`border-0 shadow-sm ${className}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              {authorData.avatar ? (
                <img
                  src={authorData.avatar}
                  alt={authorData.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl border-2 border-gray-200">
                  {getInitials(authorData.name)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{authorData.name}</h3>
              <p className="text-gray-600 mb-2">@{authorData.username}</p>
              
              {/* Bio */}
              {authorData.bio && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {authorData.bio}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                {authorData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{authorData.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(authorData.joinedDate, 'MMM yyyy')}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 mb-4">
                {authorData.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialClick(authorData.website)}
                    className="h-8 w-8 p-0"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                )}
                {authorData.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialClick(`https://twitter.com/${authorData.twitter.replace('@', '')}`)}
                    className="h-8 w-8 p-0"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                )}
                {authorData.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialClick(authorData.linkedin)}
                    className="h-8 w-8 p-0"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BookOpen className="w-4 h-4 text-blue-600 mr-1" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.totalBlogs}</p>
              <p className="text-xs text-gray-600">Articles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Eye className="w-4 h-4 text-green-600 mr-1" />
              </div>
              <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
              <p className="text-xs text-gray-600">Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-red-600 mr-1" />
              </div>
              <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalLikes)}</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <User className="w-4 h-4 text-purple-600 mr-1" />
              </div>
              <p className="text-lg font-bold text-gray-900">{formatNumber(stats.followers)}</p>
              <p className="text-xs text-gray-600">Followers</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" size="sm">
              Follow
            </Button>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {authorData.avatar ? (
              <img
                src={authorData.avatar}
                alt={authorData.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200">
                {getInitials(authorData.name)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{authorData.name}</h4>
            <p className="text-sm text-gray-600 mb-2">
              {authorData.bio || 'Content Creator'}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{stats.totalBlogs} articles</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(stats.totalViews)} views</span>
              </div>
              {stats.followers > 0 && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{formatNumber(stats.followers)} followers</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" className="text-xs">
              Follow
            </Button>
            {(authorData.website || authorData.twitter || authorData.linkedin) && (
              <div className="flex gap-1">
                {authorData.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialClick(authorData.website)}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                {authorData.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialClick(`https://twitter.com/${authorData.twitter.replace('@', '')}`)}
                    className="h-6 w-6 p-0"
                  >
                    <Twitter className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAuthorCard;