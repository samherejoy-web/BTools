import React, { useEffect, useState } from 'react';
import { 
  Shield,
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Globe,
  Target,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import apiClient from '../../utils/apiClient';
import { formatNumber, formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for demo
      setDashboardData({
        stats: {
          total_users: 8432,
          total_tools: 543,
          active_tools: 512,
          featured_tools: 45,
          total_blogs: 1876,
          published_blogs: 1654,
          pending_reviews: 23
        },
        recent_activity: {
          recent_blogs: [
            {
              id: '1',
              title: 'Top Productivity Tools for 2024',
              author: 'John Doe',
              status: 'published',
              created_at: '2024-01-15T10:00:00Z'
            },
            {
              id: '2',
              title: 'AI Revolution in Design',
              author: 'Jane Smith',
              status: 'draft',
              created_at: '2024-01-14T15:30:00Z'
            }
          ],
          recent_users: [
            {
              id: '1',
              username: 'newuser1',
              email: 'user1@example.com',
              role: 'user',
              created_at: '2024-01-15T12:00:00Z'
            },
            {
              id: '2',
              username: 'newuser2',
              email: 'user2@example.com',
              role: 'user',
              created_at: '2024-01-15T11:30:00Z'
            }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recent_activity } = dashboardData;

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.total_users),
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Published Blogs',
      value: formatNumber(stats.published_blogs),
      icon: BookOpen,
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Tools',
      value: formatNumber(stats.active_tools),
      icon: Settings,
      color: 'purple',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Pending Reviews',
      value: formatNumber(stats.pending_reviews),
      icon: MessageSquare,
      color: 'orange',
      change: '-15%',
      trend: 'down'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Blogs',
      description: 'Review and moderate blogs',
      href: '/admin/blogs',
      icon: BookOpen,
      color: 'bg-blue-500 hover:bg-blue-600',
      count: stats.total_blogs - stats.published_blogs
    },
    {
      title: 'Review Content',
      description: 'Moderate pending reviews',
      href: '/admin/reviews',
      icon: MessageSquare,
      color: 'bg-orange-500 hover:bg-orange-600',
      count: stats.pending_reviews
    },
    {
      title: 'SEO Management',
      description: 'Optimize page SEO',
      href: '/admin/seo',
      icon: Globe,
      color: 'bg-green-500 hover:bg-green-600',
      count: null
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      count: null
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage content, users, and platform moderation</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">this month</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Content Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Published Blogs</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-lg font-bold">
                  {stats.published_blogs}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Draft Blogs</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 text-lg font-bold">
                  {stats.total_blogs - stats.published_blogs}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Featured Tools</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-lg font-bold">
                  {stats.featured_tools}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Pending Reviews</span>
                </div>
                <Badge className="bg-red-100 text-red-800 text-lg font-bold">
                  {stats.pending_reviews}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div key={index} className="relative">
                    <div className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer">
                      <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      {action.count !== null && action.count > 0 && (
                        <Badge className="bg-red-500 text-white ml-2">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Blogs
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_activity.recent_blogs.map((blog) => (
                <div key={blog.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1 mb-1">
                      {blog.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>By {blog.author}</span>
                      <Badge className={
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {blog.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(blog.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_activity.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Healthy</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">API Services</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Storage</p>
              <p className="text-sm text-green-600">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;