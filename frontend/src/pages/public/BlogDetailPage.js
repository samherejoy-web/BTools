import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  Eye,
  User,
  Tag,
  Share2,
  Bookmark,
  ArrowLeft,
  Heart,
  ThumbsUp,
  MessageCircle,
  Brain,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { CommentsSection } from '../../components/ui/comments';
import SEOHead from '../../components/SEO/SEOHead';
import { useBlogSEO } from '../../hooks/useSEO';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

const BlogDetailPage = () => {
  const { blogSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Generate SEO data for the blog
  const seoData = useBlogSEO(blog);

  useEffect(() => {
    if (blogSlug) {
      fetchBlogDetails();
      fetchRelatedBlogs();
      fetchComments();
    }
  }, [blogSlug]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/blogs/by-slug/${blogSlug}`);
      setBlog(response.data);
      setLikesCount(response.data.like_count || 0);
      
      // Increment view count
      await apiClient.post(`/blogs/${blogSlug}/view`);
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast.error('Blog not found');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await apiClient.get(`/blogs?limit=3`);
      const blogs = response.data.blogs || response.data || [];
      setRelatedBlogs(blogs.filter(b => b.slug !== blogSlug));
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await apiClient.get(`/blogs/${blogSlug}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      await apiClient.post(`/blogs/${blogSlug}/comments`, commentData);
      await fetchComments(); // Refresh comments
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark articles');
      navigate('/login');
      return;
    }

    try {
      await apiClient.post(`/blogs/${blogSlug}/bookmark`);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please login to like articles');
      navigate('/login');
      return;
    }

    try {
      const response = await apiClient.post(`/blogs/${blogSlug}/like`);
      setIsLiked(!isLiked);
      // Use the actual like count from response if available
      setLikesCount(response.data?.like_count || (isLiked ? likesCount - 1 : likesCount + 1));
      toast.success(isLiked ? 'Like removed' : 'Article liked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

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

  // Process blog content to make it readable
  const formatBlogContent = (content) => {
    if (!content) return '';
    
    // Remove HTML tags for now and format as readable text
    // In a production app, you'd want a proper HTML renderer
    return content
      .replace(/<h[1-6][^>]*>/g, '\n\n**')
      .replace(/<\/h[1-6]>/g, '**\n\n')
      .replace(/<p[^>]*>/g, '\n\n')
      .replace(/<\/p>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <Link to="/blogs">
            <Button>← Back to Blogs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Article Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-gray-700">{blog.author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.published_at || blog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{blog.reading_time || 5} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(blog.view_count || 0)} views</span>
                    </div>
                    {blog.is_ai_generated && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {blog.title}
                  </h1>

                  {blog.excerpt && (
                    <p className="text-xl text-gray-600 leading-relaxed mb-6">
                      {blog.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleLike}
                      className={isLiked ? 'text-red-600 border-red-200 bg-red-50' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
                      {likesCount}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleBookmark}
                      className={isBookmarked ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>

                    <div className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>

                      {showShareMenu && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border z-10 p-2 min-w-[180px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('facebook')}
                            className="w-full justify-start"
                          >
                            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                            Facebook
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('twitter')}
                            className="w-full justify-start"
                          >
                            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                            Twitter
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('linkedin')}
                            className="w-full justify-start"
                          >
                            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                            LinkedIn
                          </Button>
                          <Separator className="my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('copy')}
                            className="w-full justify-start"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              </div>

              {/* Article Footer */}
              <div className="p-8 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {(blog.author_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{blog.author_name || 'Anonymous'}</h4>
                      <p className="text-sm text-gray-600">Content Creator</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-8 border-t border-gray-100">
                <CommentsSection
                  comments={comments}
                  onAddComment={handleAddComment}
                  loading={commentsLoading}
                  title="Discussion"
                />
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Table of Contents */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <a href="#overview" className="block text-gray-600 hover:text-purple-600 transition-colors">
                    Overview
                  </a>
                  <a href="#main-content" className="block text-gray-600 hover:text-purple-600 transition-colors">
                    Main Content
                  </a>
                  <a href="#conclusion" className="block text-gray-600 hover:text-purple-600 transition-colors">
                    Conclusion
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Related Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <div key={relatedBlog.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                        <Link to={`/blogs/${relatedBlog.slug}`}>
                          <h4 className="font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                            {relatedBlog.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(relatedBlog.published_at || relatedBlog.created_at)}</span>
                          <span>•</span>
                          <span>{relatedBlog.reading_time || 5} min read</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/blogs" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View All Articles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Newsletter Signup */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest insights delivered to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-purple-700">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Recommend Article
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discussion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default BlogDetailPage;