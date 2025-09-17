import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  BookOpen,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Brain,
  CheckCircle,
  Clock,
  Archive,
  Plus,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';

const AdminBlogs = () => {
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

      const response = await apiClient.get(`/admin/blogs?${params}`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Mock data for demo
      const mockBlogs = [
        {
          id: '1',
          title: 'Complete Guide to Project Management Tools in 2024',
          slug: 'project-management-tools-2024',
          status: 'published',
          author: 'Sarah Johnson',
          author_id: 'user1',
          view_count: 2450,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          published_at: '2024-01-15T10:00:00Z',
          is_ai_generated: false,
          tags: ['project management', 'productivity', 'tools']
        },
        {
          id: '2',
          title: 'AI-Powered Design Tools Revolution',
          slug: 'ai-design-tools-revolution',
          status: 'draft',
          author: 'Mike Chen',
          author_id: 'user2',
          view_count: 0,
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
          published_at: null,
          is_ai_generated: true,
          tags: ['ai', 'design', 'automation']
        },
        {
          id: '3',
          title: 'Marketing Automation: Best Practices and Tools',
          slug: 'marketing-automation-best-practices',
          status: 'published',
          author: 'Emma Davis',
          author_id: 'user3',
          view_count: 1890,
          created_at: '2024-01-08T16:45:00Z',
          updated_at: '2024-01-08T16:45:00Z',
          published_at: '2024-01-08T16:45:00Z',
          is_ai_generated: false,
          tags: ['marketing', 'automation', 'growth']
        }
      ];
      setBlogs(mockBlogs);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      // Mock authors for demo
      const mockAuthors = [
        { id: 'user1', username: 'Sarah Johnson' },
        { id: 'user2', username: 'Mike Chen' },
        { id: 'user3', username: 'Emma Davis' }
      ];
      setAuthors(mockAuthors);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleUpdateBlog = async (blogId, updateData) => {
    try {
      await apiClient.put(`/admin/blogs/${blogId}`, updateData);
      toast.success('Blog updated successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
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
          <p className="text-gray-600 mt-1">Review, moderate, and manage all blog content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
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

      {/* Blogs Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Blogs ({filteredBlogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Blog</th>
                  <th className="text-left p-4 font-medium text-gray-900">Author</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Views</th>
                  <th className="text-left p-4 font-medium text-gray-900">Updated</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {blog.is_ai_generated && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              AI
                            </Badge>
                          )}
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {blog.author.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{blog.author}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`flex items-center gap-1 w-fit ${getStatusBadge(blog.status)}`}>
                        {getStatusIcon(blog.status)}
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        {formatNumber(blog.view_count)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(blog.updated_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {blog.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(blog.id, 'published')}
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                          >
                            Publish
                          </Button>
                        )}
                        {blog.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(blog.id, 'draft')}
                            className="h-8 text-xs"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                : 'No blogs available to manage.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBlogs;