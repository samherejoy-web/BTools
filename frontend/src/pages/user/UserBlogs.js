import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  Brain,
  CheckCircle,
  Archive,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';

const UserBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchUserBlogs();
  }, [selectedStatus]);

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await apiClient.get(`/user/blogs?${params}`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      // Mock data for demo
      const mockBlogs = [
        {
          id: '1',
          title: 'My Experience with Project Management Tools',
          slug: 'experience-project-management-tools',
          status: 'published',
          view_count: 245,
          reading_time: 8,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          published_at: '2024-01-15T10:00:00Z',
          is_ai_generated: false,
          tags: ['project management', 'productivity', 'review'],
          excerpt: 'After trying multiple project management tools over the years, I want to share my insights on what works and what doesn\'t for different team sizes and project types.',
          featured_image: null
        },
        {
          id: '2',
          title: 'AI Tools That Changed My Workflow',
          slug: 'ai-tools-changed-workflow',
          status: 'draft',
          view_count: 0,
          reading_time: 12,
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
          published_at: null,
          is_ai_generated: true,
          tags: ['ai', 'workflow', 'automation'],
          excerpt: 'Exploring how various AI tools have transformed my daily work routine and boosted productivity in unexpected ways.',
          featured_image: null
        },
        {
          id: '3',
          title: 'Design Tools Comparison: A Designer\'s Perspective',
          slug: 'design-tools-comparison-designer-perspective',
          status: 'published',
          view_count: 189,
          reading_time: 15,
          created_at: '2024-01-08T16:45:00Z',
          updated_at: '2024-01-08T16:45:00Z',
          published_at: '2024-01-08T16:45:00Z',
          is_ai_generated: false,
          tags: ['design', 'tools', 'comparison'],
          excerpt: 'A detailed comparison of popular design tools from someone who has used them all in real client projects.',
          featured_image: null
        }
      ];
      setBlogs(mockBlogs);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await apiClient.delete(`/user/blogs/${blogId}`);
      toast.success('Blog deleted successfully');
      fetchUserBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
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
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || blog.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

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
            <BookOpen className="h-8 w-8" />
            My Blogs
          </h1>
          <p className="text-gray-600 mt-1">Create, manage, and publish your blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/ai-blog">
            <Button variant="outline" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Generator
            </Button>
          </Link>
          <Link to="/dashboard/blogs/new">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="h-4 w-4" />
              Write Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
                <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
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
                  {blogs.filter(b => b.status === 'published').length}
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
                  {blogs.filter(b => b.status === 'draft').length}
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
                placeholder="Search your blogs by title or tags..."
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
          </div>
        </CardContent>
      </Card>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBlogs.map((blog) => (
          <Card key={blog.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`flex items-center gap-1 ${getStatusBadge(blog.status)}`}>
                      {getStatusIcon(blog.status)}
                      {blog.status}
                    </Badge>
                    {blog.is_ai_generated && (
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(blog.updated_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.reading_time} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(blog.view_count)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {blog.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{blog.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Link to={`/dashboard/blogs/edit/${blog.id}`}>
                    <Button size="sm" variant="outline" className="h-8">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  {blog.status === 'published' && (
                    <Link to={`/blogs/${blog.slug}`} target="_blank">
                      <Button size="sm" variant="outline" className="h-8">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteBlog(blog.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'No blogs found' : 'No blogs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start sharing your expertise with the community by writing your first blog post.'
              }
            </p>
            {(!searchTerm && selectedStatus === 'all') && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard/blogs/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Write Your First Blog
                  </Button>
                </Link>
                <Link to="/dashboard/ai-blog">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Try AI Generator
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      {blogs.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Boost Your Blog Performance</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Want to reach more readers? Here are some tips to improve your blog visibility and engagement.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use relevant tags to help readers discover your content</li>
                  <li>• Add compelling excerpts to increase click-through rates</li>
                  <li>• Share your published blogs on social media</li>
                  <li>• Engage with comments and build a community</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserBlogs;