import React, { useEffect, useState } from 'react';
import { 
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Brain,
  Globe,
  Target,
  Hash,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';

const SuperAdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetchBlogs();
    fetchAuthors();
  }, [searchTerm, selectedStatus, selectedAuthor]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (selectedAuthor && selectedAuthor !== 'all') {
        params.append('author_id', selectedAuthor);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Mock data for now - replace with actual API call
      const mockBlogs = [
        {
          id: '1',
          title: 'Top 10 Productivity Tools for Remote Teams in 2024',
          slug: 'top-10-productivity-tools-remote-teams-2024',
          status: 'published',
          author: 'John Doe',
          author_id: 'user1',
          view_count: 1250,
          reading_time: 8,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          published_at: '2024-01-15T10:00:00Z',
          is_ai_generated: false,
          tags: ['productivity', 'remote work', 'tools'],
          excerpt: 'Discover the best productivity tools that are revolutionizing remote work in 2024...',
          seo_title: 'Best Productivity Tools for Remote Teams - 2024 Guide',
          featured_image: null
        },
        {
          id: '2',
          title: 'AI Revolution in Content Creation: A Complete Guide',
          slug: 'ai-revolution-content-creation-guide',
          status: 'draft',
          author: 'Jane Smith',
          author_id: 'user2',
          view_count: 0,
          reading_time: 12,
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
          published_at: null,
          is_ai_generated: true,
          tags: ['ai', 'content creation', 'automation'],
          excerpt: 'Explore how artificial intelligence is transforming the way we create content...',
          seo_title: null,
          featured_image: null
        },
        {
          id: '3',
          title: 'Design Tools Comparison: Figma vs Adobe XD vs Sketch',
          slug: 'design-tools-comparison-figma-adobe-xd-sketch',
          status: 'published',
          author: 'Mike Johnson',
          author_id: 'user3',
          view_count: 2890,
          reading_time: 15,
          created_at: '2024-01-08T16:45:00Z',
          updated_at: '2024-01-08T16:45:00Z',
          published_at: '2024-01-08T16:45:00Z',
          is_ai_generated: false,
          tags: ['design', 'tools', 'comparison'],
          excerpt: 'An in-depth comparison of the three leading design tools in the market...',
          seo_title: 'Figma vs Adobe XD vs Sketch - Complete Comparison 2024',
          featured_image: null
        }
      ];

      setBlogs(mockBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      // Mock authors data
      const mockAuthors = [
        { id: 'user1', username: 'John Doe' },
        { id: 'user2', username: 'Jane Smith' },
        { id: 'user3', username: 'Mike Johnson' }
      ];
      setAuthors(mockAuthors);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await apiClient.delete(`/admin/blogs/${blogId}`);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      await apiClient.put(`/admin/blogs/${blogId}`, { status: newStatus });
      toast.success(`Blog ${newStatus} successfully`);
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return variants[status] || variants.draft;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'archived': return <Archive className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || blog.status === selectedStatus;
    const matchesAuthor = selectedAuthor === 'all' || blog.author_id === selectedAuthor;
    
    return matchesSearch && matchesStatus && matchesAuthor;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
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
            <BookOpen className="h-8 w-8" />
            Blog Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all blogs, reviews, and content across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="h-4 w-4" />
            New Blog
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(blogs.length)}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(blogs.filter(b => b.status === 'published').length)}
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
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(blogs.filter(b => b.status === 'draft').length)}
                </p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(blogs.reduce((sum, blog) => sum + blog.view_count, 0))}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
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
                placeholder="Search blogs by title, author, or tags..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Authors</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.username}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Blogs List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Blogs ({filteredBlogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {blog.title}
                      </h3>
                      <Badge className={`flex items-center gap-1 ${getStatusBadge(blog.status)}`}>
                        {getStatusIcon(blog.status)}
                        {blog.status}
                      </Badge>
                      {blog.is_ai_generated && (
                        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI Generated
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(blog.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatNumber(blog.view_count)} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blog.reading_time} min read
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{blog.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    {blog.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(blog.id, 'published')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Publish
                      </Button>
                    )}
                    {blog.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(blog.id, 'draft')}
                      >
                        Unpublish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {blog.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredBlogs.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedAuthor !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first blog post.'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedAuthor === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Blog
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperAdminBlogs;