import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Star, 
  TrendingUp, 
  Users, 
  Zap,
  Brain,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOMetaTags from '../../components/SEO/SEOMetaTags';
import apiClient from '../../utils/apiClient';
import { formatNumber, formatRating } from '../../utils/formatters';

const HomePage = () => {
  const [featuredTools, setFeaturedTools] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalTools: 0,
    totalBlogs: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [toolsRes, blogsRes] = await Promise.all([
        apiClient.get('/tools?featured=true&limit=6'),
        apiClient.get('/blogs?status=published&limit=3')
      ]);

      setFeaturedTools(toolsRes.data);
      setRecentBlogs(blogsRes.data);
      
      // Mock stats for now - in production, you'd have a dedicated endpoint
      setStats({
        totalTools: 150,
        totalBlogs: 300,
        totalUsers: 10000
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Discover Tools',
      description: 'Find the perfect tools for your needs with our advanced search and filtering system.'
    },
    {
      icon: BarChart3,
      title: 'Compare & Review',
      description: 'Compare up to 5 tools side-by-side with detailed reviews and ratings from the community.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations and AI-generated content to make informed decisions.'
    },
    {
      icon: Shield,
      title: 'Trusted Reviews',
      description: 'Read authentic reviews from verified users and industry experts.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEOMetaTags 
        title="MarketMind - Discover the Best Business Tools"
        description="Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews from 10,000+ users."
        keywords="business tools, productivity software, SaaS tools, tool comparison, software reviews, business productivity"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MarketMind",
          "url": process.env.REACT_APP_BACKEND_URL || '',
          "description": "Discover and compare the best business tools",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${process.env.REACT_APP_BACKEND_URL || ''}/tools?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="px-4 py-2 bg-blue-100 text-blue-800 border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by AI
              </Badge>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Tools
              </span>
              {' '}for Your Business
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Compare, review, and choose from thousands of business tools. 
              Make informed decisions with AI-powered insights and community reviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/tools">
                <Button size="lg" className="btn-primary text-lg px-8 py-3">
                  Explore Tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Compare Tools
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalTools)}+
                </div>
                <p className="text-gray-600">Tools Listed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalBlogs)}+
                </div>
                <p className="text-gray-600">Expert Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalUsers)}+
                </div>
                <p className="text-gray-600">Happy Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MarketMind?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find, compare, and choose the right tools for your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Featured Tools
              </h2>
              <p className="text-xl text-gray-600">
                Top-rated tools trusted by thousands of businesses
              </p>
            </div>
            <Link to="/tools?featured=true">
              <Button variant="outline" className="hidden sm:flex">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {tool.logo_url ? (
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">
                            {tool.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {tool.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {formatRating(tool.rating)}
                            </span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            {tool.review_count} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`
                      ${tool.pricing_type === 'free' ? 'bg-green-100 text-green-800' : 
                        tool.pricing_type === 'freemium' ? 'bg-blue-100 text-blue-800' : 
                        'bg-orange-100 text-orange-800'}
                    `}>
                      {tool.pricing_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.short_description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {formatNumber(tool.view_count)} views
                    </div>
                    <Link to={`/tools/${tool.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/tools?featured=true">
              <Button variant="outline">
                View All Featured Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Latest Insights
              </h2>
              <p className="text-xl text-gray-600">
                Expert guides and comparisons to help you choose better tools
              </p>
            </div>
            <Link to="/blogs">
              <Button variant="outline" className="hidden sm:flex">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  {blog.featured_image && (
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      {blog.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.is_ai_generated && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>By {blog.author_name}</span>
                      <span>{blog.reading_time} min read</span>
                    </div>
                    
                    <Link to={`/blogs/${blog.slug}`} className="mt-4 block">
                      <Button size="sm" variant="outline" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/blogs">
              <Button variant="outline">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Tools?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust MarketMind to make better tool decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link to="/tools">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                Browse Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default HomePage;