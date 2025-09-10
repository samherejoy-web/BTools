import React, { useEffect, useState } from 'react';
import { 
  MessageSquare,
  Search,
  Filter,
  Star,
  CheckCircle,
  X,
  Eye,
  Calendar,
  User,
  Settings,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatRating } from '../../utils/formatters';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [selectedStatus, selectedRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedStatus === 'verified') {
        params.append('verified', 'true');
      } else if (selectedStatus === 'pending') {
        params.append('verified', 'false');
      }

      const response = await apiClient.get(`/admin/reviews?${params}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Mock data for demo
      const mockReviews = [
        {
          id: '1',
          user: 'John Doe',
          tool: 'Notion',
          rating: 5,
          title: 'Excellent productivity tool',
          content: 'I have been using Notion for over a year now and it has completely transformed how I organize my work and personal life. The flexibility and customization options are unmatched.',
          is_verified: false,
          created_at: '2024-01-15T10:00:00Z',
          pros: ['Very flexible', 'Great templates', 'Good collaboration features'],
          cons: ['Can be slow with large databases']
        },
        {
          id: '2',
          user: 'Sarah Johnson',
          tool: 'Figma',
          rating: 4,
          title: 'Great for design collaboration',
          content: 'Figma has revolutionized our design process. The real-time collaboration features are incredible and the web-based approach means everyone can access designs easily.',
          is_verified: true,
          created_at: '2024-01-12T14:30:00Z',
          pros: ['Real-time collaboration', 'Web-based', 'Great prototyping'],
          cons: ['Can be slow with complex files', 'Limited offline features']
        },
        {
          id: '3',
          user: 'Mike Chen',
          tool: 'Slack',
          rating: 3,
          title: 'Good but can be overwhelming',
          content: 'Slack is useful for team communication but sometimes it feels like information gets lost in all the channels. The search functionality helps but it is not perfect.',
          is_verified: true,
          created_at: '2024-01-10T16:45:00Z',
          pros: ['Good integrations', 'Easy to use', 'Mobile apps work well'],
          cons: ['Can be distracting', 'Information overload', 'Expensive for large teams']
        },
        {
          id: '4',
          user: 'Emma Davis',
          tool: 'ChatGPT',
          rating: 5,
          title: 'Game-changing AI assistant',
          content: 'ChatGPT has become an essential part of my daily workflow. From writing assistance to brainstorming ideas, it is incredibly versatile and helpful.',
          is_verified: false,
          created_at: '2024-01-08T09:20:00Z',
          pros: ['Very intelligent responses', 'Versatile', 'Great for brainstorming'],
          cons: ['Sometimes provides inaccurate information', 'Usage limits on free tier']
        }
      ];
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReview = async (reviewId, verified) => {
    try {
      await apiClient.put(`/admin/reviews/${reviewId}/verify`, null, {
        params: { verified }
      });
      toast.success(`Review ${verified ? 'verified' : 'unverified'} successfully`);
      fetchReviews();
    } catch (error) {
      console.error('Error verifying review:', error);
      toast.error('Failed to update review status');
    }
  };

  const getStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'verified' && review.is_verified) ||
                         (selectedStatus === 'pending' && !review.is_verified);
    
    const matchesRating = selectedRating === 'all' || 
                         review.rating.toString() === selectedRating;
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
            <MessageSquare className="h-8 w-8" />
            Review Management
          </h1>
          <p className="text-gray-600 mt-1">Moderate and verify user reviews for tools</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
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
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Verified</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => !r.is_verified).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRating(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
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
                placeholder="Search reviews by user, tool, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {review.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.title}</h3>
                      <Badge className={review.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {review.is_verified ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {review.user}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        {review.tool}
                      </div>
                      <div className="flex items-center gap-1">
                        {getStarRating(review.rating)}
                        <span className="ml-1 font-medium">{review.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {review.content}
                    </p>
                    
                    {(review.pros?.length > 0 || review.cons?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              Pros
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                              <ThumbsDown className="h-4 w-4" />
                              Cons
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!review.is_verified ? (
                    <Button
                      size="sm"
                      onClick={() => handleVerifyReview(review.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyReview(review.id, false)}
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Unverify
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedRating !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No reviews available to moderate.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReviews;