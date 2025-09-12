import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  Settings,
  TrendingUp,
  BarChart3,
  Globe,
  Star,
  BookOpen,
  MessageSquare,
  Activity,
  DollarSign,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import apiClient from '../../utils/apiClient';
import { formatNumber, formatDate } from '../../utils/formatters';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      // Mock comprehensive dashboard data for now
      const mockData = {
        overview: {
          total_users: 12543,
          total_tools: 867,
          total_blogs: 2341,
          total_reviews: 8921,
          monthly_growth: {
            users: 12.5,
            tools: 8.3,
            blogs: 15.2,
            reviews: 23.1
          }
        },
        recent_activity: {
          new_users_today: 45,
          new_tools_today: 3,
          new_blogs_today: 12,
          new_reviews_today: 89,
          top_categories: [
            { name: 'Productivity', tools: 234, growth: 12.5 },
            { name: 'Design', tools: 187, growth: 8.3 },
            { name: 'Marketing', tools: 156, growth: 15.2 },
            { name: 'AI & ML', tools: 134, growth: 23.1 }
          ]
        },
        performance: {
          total_views: 584923,
          avg_rating: 4.3,
          featured_tools: 45,
          published_blogs: 1876,
          pending_reviews: 234
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const { overview, recent_activity, performance } = dashboardData;

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(overview.total_users),
      change: overview.monthly_growth.users,
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Total Tools',
      value: formatNumber(overview.total_tools),
      change: overview.monthly_growth.tools,
      icon: Settings,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Total Blogs',
      value: formatNumber(overview.total_blogs),
      change: overview.monthly_growth.blogs,
      icon: BookOpen,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Total Reviews',
      value: formatNumber(overview.total_reviews),
      change: overview.monthly_growth.reviews,
      icon: MessageSquare,
      color: 'orange',
      trend: 'up'
    }
  ];

  const performanceCards = [
    {
      title: 'Total Views',
      value: formatNumber(performance.total_views),
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Rating',
      value: performance.avg_rating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      title: 'Featured Tools',
      value: formatNumber(performance.featured_tools),
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Published Blogs',
      value: formatNumber(performance.published_blogs),
      icon: Globe,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform overview and management</p>
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
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
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
                        {stat.change}%
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`h-10 w-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_activity.top_categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.tools} tools</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{category.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Users</p>
                    <p className="text-sm text-gray-600">Registered today</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1">
                  {recent_activity.new_users_today}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Tools</p>
                    <p className="text-sm text-gray-600">Added today</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 text-lg font-bold px-3 py-1">
                  {recent_activity.new_tools_today}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Blogs</p>
                    <p className="text-sm text-gray-600">Published today</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-lg font-bold px-3 py-1">
                  {recent_activity.new_blogs_today}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Reviews</p>
                    <p className="text-sm text-gray-600">Submitted today</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800 text-lg font-bold px-3 py-1">
                  {recent_activity.new_reviews_today}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Users className="h-5 w-5" />
              Manage Users
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <Settings className="h-5 w-5" />
              Manage Tools
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              <BookOpen className="h-5 w-5" />
              Manage Blogs
            </Button>
            <Button 
              className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              onClick={() => navigate('/superadmin/seo')}
            >
              <Globe className="h-5 w-5" />
              SEO Management
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
              <BarChart3 className="h-5 w-5" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;