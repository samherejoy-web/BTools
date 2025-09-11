import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star,
  Eye,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewReviewModal, setShowNewReviewModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: ''
  });

  useEffect(() => {
    fetchUserReviews();
    fetchAvailableTools();
  }, [selectedRating, selectedStatus]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedRating) params.append('rating', selectedRating);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await apiClient.get(`/user/reviews?${params}`);
      setReviews(response.data.reviews || response.data || []);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      setToolsLoading(true);
      const response = await apiClient.get('/tools?limit=100');
      setTools(response.data.tools || response.data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setToolsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedTool) {
      toast.error('Please select a tool to review');
      return;
    }

    try {
      const reviewData = {
        tool_id: selectedTool, // Backend requires tool_id in request body
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        pros: newReview.pros.split(',').map(p => p.trim()).filter(p => p),
        cons: newReview.cons.split(',').map(c => c.trim()).filter(c => c)
      };

      await apiClient.post(`/tools/${selectedTool}/reviews`, reviewData);
      toast.success('Review submitted successfully!');
      
      setNewReview({ rating: 5, title: '', content: '', pros: '', cons: '' });
      setSelectedTool('');
      setShowNewReviewModal(false);
      fetchUserReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await apiClient.delete(`/user/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchUserReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => 
    !searchTerm || 
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8" />
            My Reviews
          </h1>
          <p className="text-gray-600 mt-1">Share your experience with tools and help others</p>
        </div>
        <Button 
          onClick={() => setShowNewReviewModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="h-4 w-4" />
          Write Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Verified Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.is_verified).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.reduce((sum, review) => sum + (review.helpful_count || 0), 0)}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your reviews by title, tool name, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reviews</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      to={`/tools/${review.tool_slug || review.tool_id}`}
                      className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {review.tool_name}
                    </Link>
                    {review.is_verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Edit functionality would go here
                      toast.info('Edit functionality coming soon');
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
              <p className="text-gray-700 mb-4">{review.content}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {review.pros && review.pros.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-green-700 mb-2">Pros:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ThumbsUp className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {review.cons && review.cons.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-red-700 mb-2">Cons:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ThumbsDown className="h-3 w-3 text-red-500 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful_count || 0} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(review.view_count || 0)} views</span>
                  </div>
                </div>
                
                <Link to={`/tools/${review.tool_slug || review.tool_id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedRating || selectedStatus !== 'all' ? 'No reviews found' : 'No reviews yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedRating || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start sharing your experience with tools by writing your first review.'
              }
            </p>
            {(!searchTerm && !selectedRating && selectedStatus === 'all') && (
              <Button onClick={() => setShowNewReviewModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Review Modal */}
      {showNewReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tool
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a tool to review...</option>
                    {tools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview({...newReview, rating})
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief summary of your experience"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Content
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your detailed experience with this tool"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pros (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newReview.pros}
                      onChange={(e) => setNewReview({...newReview, pros: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Easy to use, Great features"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cons (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newReview.cons}
                      onChange={(e) => setNewReview({...newReview, cons: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Expensive, Limited features"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Review
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowNewReviewModal(false);
                      setNewReview({ rating: 5, title: '', content: '', pros: '', cons: '' });
                      setSelectedTool('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips Card */}
      {reviews.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Review Writing Tips</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Be specific about features and use cases</li>
                  <li>• Mention your experience level and context</li>
                  <li>• Include both pros and cons for balanced feedback</li>
                  <li>• Update reviews if your opinion changes over time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserReviews;