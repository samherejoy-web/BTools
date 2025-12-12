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
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import FAQ from '../../components/ui/FAQ';
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

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "What is MarketMindAI?",
      answer: "MarketMindAI is a comprehensive business tools discovery platform that helps you find, compare, and choose the best software tools for your business needs. We provide AI-powered insights, community reviews, and detailed comparisons across thousands of business tools."
    },
    {
      question: "How does MarketMindAI compare to other tool directories?",
      answer: "Unlike traditional directories like Crozdesk or ProductHunt, MarketMindAI combines AI-powered recommendations with community reviews, offering personalized tool suggestions based on your specific business requirements. Our platform features advanced comparison tools, real-time user feedback, and comprehensive feature breakdowns."
    },
    {
      question: "Is MarketMindAI free to use?",
      answer: "Yes! MarketMindAI is completely free for users to browse tools, read reviews, and compare options. We offer both free and premium features, with advanced analytics and personalized recommendations available for registered users."
    },
    {
      question: "How are tools reviewed on MarketMindAI?",
      answer: "Tools are reviewed through a combination of verified user reviews, expert analysis, and AI-powered evaluation. We ensure authenticity by verifying reviewers and providing both pros and cons for each tool, helping you make informed decisions."
    },
    {
      question: "Can I submit my own tool to MarketMindAI?",
      answer: "Yes! Tool vendors and developers can submit their products for listing on MarketMindAI. We review each submission to ensure quality and relevance for our community. Contact us through our submission form to get started."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Enhanced structured data for homepage with comprehensive schemas
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`,
        "url": process.env.REACT_APP_BACKEND_URL || '',
        "name": "MarketMindAI - Business Tools Comparison Platform",
        "alternateName": "MarketMind AI",
        "description": "Discover, compare, and choose the best business tools with AI-powered insights. Compare software, read reviews, and find the perfect tools for your business needs.",
        "inLanguage": "en-US",
        "publisher": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${process.env.REACT_APP_BACKEND_URL || ''}/tools?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#organization`,
        "name": "MarketMindAI",
        "url": process.env.REACT_APP_BACKEND_URL || '',
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.REACT_APP_BACKEND_URL || ''}/logo.png`,
          "width": 250,
          "height": 60
        },
        "description": "Leading B2B software comparison and discovery platform helping businesses find the best tools and software solutions",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/marketmindai",
          "https://linkedin.com/company/marketmind",
          "https://github.com/marketmind"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "availableLanguage": "English"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.REACT_APP_BACKEND_URL || ''
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <EnhancedSEOHead 
        title="MarketMindAI - Business Tools Comparison & Discovery Platform | Find Best Software 2025"
        description="Discover, compare & choose from 150+ business tools and software. AI-powered recommendations, verified reviews, pricing comparison. Find the best business software for startups, SMBs & enterprises. Compare SaaS tools, features, pricing & alternatives."
        keywords="business tools comparison, software comparison platform, best business tools 2024, best business tools 2025, business software directory, tool discovery platform, SaaS tools comparison, software directory, productivity tools, tool comparison, compare business software, best tools for small business, enterprise software comparison, affordable business tools, business tools for startups, B2B software directory, business productivity tools, software alternatives, marketing automation tools, project management software comparison, CRM tools comparison, keyword research tools"
        structuredData={structuredData}
        ogType="website"
        canonical={process.env.REACT_APP_BACKEND_URL || ''}
      />
      <main className="min-h-screen" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-24 lg:py-32" aria-labelledby="hero-heading" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="px-4 py-2 bg-blue-100 text-blue-800 border-0" data-testid="ai-badge">
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                Powered by AI
              </Badge>
            </div>
            
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="hero-title">
              Discover the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Tools
              </span>
              {' '}for Your Business
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
              Compare, review, and choose from thousands of business tools and software solutions. 
              Make informed decisions with AI-powered insights, verified reviews, and comprehensive feature comparisons.
            </p>
            
            <nav className="flex flex-col sm:flex-row gap-4 justify-center mb-12" aria-label="Primary actions">
              <Link to="/tools">
                <Button size="lg" className="btn-primary text-lg px-8 py-3" data-testid="explore-tools-btn" aria-label="Explore all business tools">
                  Explore Tools
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3" data-testid="compare-tools-btn" aria-label="Compare business tools side by side">
                  Compare Tools
                </Button>
              </Link>
            </nav>

            {/* Stats */}
            <aside className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto" aria-label="Platform statistics" data-testid="platform-stats">
              <article className="text-center" data-testid="stat-tools">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" aria-label={`${formatNumber(stats.totalTools)} tools listed`}>
                  {formatNumber(stats.totalTools)}+
                </div>
                <p className="text-gray-600">Tools Listed</p>
              </article>
              <article className="text-center" data-testid="stat-reviews">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" aria-label={`${formatNumber(stats.totalBlogs)} expert reviews`}>
                  {formatNumber(stats.totalBlogs)}+
                </div>
                <p className="text-gray-600">Expert Reviews</p>
              </article>
              <article className="text-center" data-testid="stat-users">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" aria-label={`${formatNumber(stats.totalUsers)} happy users`}>
                  {formatNumber(stats.totalUsers)}+
                </div>
                <p className="text-gray-600">Happy Users</p>
              </article>
            </aside>
          </header>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="features-heading" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-testid="features-title">
              Why Choose MarketMindAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="features-description">
              We make it easy to find, compare, and choose the right business tools and software solutions for your needs.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list" aria-label="Platform features">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white rounded-xl p-6" role="listitem" data-testid={`feature-card-${index}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-16 sm:py-20 bg-gray-50" aria-labelledby="featured-tools-heading" data-testid="featured-tools-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h2 id="featured-tools-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-testid="featured-tools-title">
                Featured Tools
              </h2>
              <p className="text-xl text-gray-600" data-testid="featured-tools-description">
                Top-rated business tools and software trusted by thousands of businesses worldwide
              </p>
            </div>
            <Link to="/tools?featured=true">
              <Button variant="outline" className="hidden sm:flex" data-testid="view-all-featured-btn" aria-label="View all featured tools">
                View All
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Featured business tools">
            {featuredTools.map((tool) => (
              <article key={tool.id} role="listitem" data-testid={`featured-tool-${tool.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {tool.logo_url ? (
                          <img
                            src={tool.logo_url}
                            alt={`${tool.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
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
                            <div className="flex items-center" aria-label={`Rating: ${formatRating(tool.rating)} out of 5 stars`}>
                              <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                              <span className="text-sm text-gray-600 ml-1">
                                {formatRating(tool.rating)}
                              </span>
                            </div>
                            <span className="text-gray-300" aria-hidden="true">•</span>
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
                      `} aria-label={`Pricing: ${tool.pricing_type}`}>
                        {tool.pricing_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tool.short_description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500" aria-label={`${formatNumber(tool.view_count)} views`}>
                        <TrendingUp className="h-4 w-4 mr-1" aria-hidden="true" />
                        {formatNumber(tool.view_count)} views
                      </div>
                      <Link to={`/tools/${tool.id}`}>
                        <Button size="sm" variant="outline" data-testid={`view-details-${tool.id}`} aria-label={`View details for ${tool.name}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </article>
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

      {/* FAQ Section for AEO */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="faq-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQ faqs={faqs} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-purple-700" aria-labelledby="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-section" className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Tools?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust MarketMindAI to make better tool decisions.
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
      </main>
    </>
  );
};

export default HomePage;