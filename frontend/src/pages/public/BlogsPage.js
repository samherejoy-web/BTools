import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Eye,
  User,
  Tag,
  Heart,
  BookOpen,
  TrendingUp,
  Brain,
  Grid3X3,
  List,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';
import NewsletterForm from '../../components/Newsletter/NewsletterForm';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [aiGeneratedOnly, setAiGeneratedOnly] = useState(false);

  // Memoized fetch functions to prevent infinite loops
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      if (aiGeneratedOnly) params.append('featured', 'true');

      const response = await apiClient.get(`/blogs?${params}`);
      setBlogs(response.data.blogs || response.data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, aiGeneratedOnly]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Memoized search handler
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      fetchBlogs();
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/blogs/search?q=${encodeURIComponent(searchTerm)}`);
      setBlogs(response.data.blogs || response.data || []);
    } catch (error) {
      console.error('Error searching blogs:', error);
      toast.error('Failed to search blogs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchBlogs]);

  // Memoized filtered blogs to improve performance
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => 
      !searchTerm || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [blogs, searchTerm]);

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FAQ data for AEO optimization
  const blogFaqs = [
    {
      question: "What types of articles and guides can I find on MarketMindAI Blog?",
      answer: "MarketMindAI Blog features comprehensive tool reviews, software comparisons, how-to guides, productivity tips, industry insights, and expert analysis on business tools and software. We cover project management, CRM, marketing automation, design tools, development platforms, and more. Our content includes both AI-generated articles and expert-written guides to help you make informed software decisions."
    },
    {
      question: "Are the blog articles on MarketMindAI written by AI or humans?",
      answer: "We offer both AI-generated and human-written content. AI-generated articles are clearly labeled with an 'AI Generated' badge. Our AI content is carefully curated and reviewed for accuracy, while our expert-written guides provide in-depth human insights and real-world experience. You can filter by content type using the 'AI Generated' filter option."
    },
    {
      question: "How often is new content published on MarketMindAI Blog?",
      answer: "We publish new articles, guides, and tool reviews regularly, typically multiple times per week. Subscribe to our newsletter to get the latest insights delivered directly to your inbox and never miss important updates about new tools, features, and industry trends."
    },
    {
      question: "Can I search for specific topics or tools in the blog?",
      answer: "Yes! Use our search bar at the top of the page to find articles about specific tools, topics, or keywords. You can also filter by category, sort by date or popularity, and use our tags to discover related content. Our smart search helps you quickly find exactly what you're looking for."
    },
    {
      question: "How do I stay updated with new blog posts and tool reviews?",
      answer: "Subscribe to our newsletter at the bottom of this page to receive the latest articles, tool reviews, and productivity tips delivered to your inbox. You can also follow us on social media for real-time updates and engage with our community."
    },
    {
      question: "Are the tool reviews and comparisons unbiased?",
      answer: "Yes! All our tool reviews and comparisons are unbiased and based on thorough research, user feedback, and actual testing when possible. We present both pros and cons for each tool and provide transparent information to help you make informed decisions. Our goal is to provide honest, helpful content that serves our community."
    }
  ];

  // Generate SEO data
  const categoryName = categories.find(c => c.slug === selectedCategory)?.name;
  const seoTitle = selectedCategory 
    ? `${categoryName || selectedCategory} Articles & Guides - Expert ${categoryName} Insights | MarketMindAI Blog`
    : 'Expert Guides, Tool Reviews & Comparisons - MarketMindAI Blog | Software Insights 2024';
  
  const seoDescription = selectedCategory
    ? `Read expert ${(categoryName || selectedCategory).toLowerCase()} guides, tutorials, and articles. Get insights from industry experts, learn best practices, and make better tool decisions. In-depth ${(categoryName || selectedCategory).toLowerCase()} content with AI-powered recommendations.`
    : 'Read 300+ expert guides, in-depth tool reviews, software comparisons, and productivity tips. AI-generated content and community insights to help you choose the best business tools and software for 2024. Free guides for startups, SMBs, and enterprises.';

  const seoKeywords = selectedCategory
    ? `${categoryName} guides, ${categoryName} tutorials, ${categoryName} articles, ${categoryName} tips, ${categoryName} best practices, ${categoryName} blog`
    : 'tool reviews, software guides, business productivity, tech blog, AI content, software comparison guides, tool comparison articles, best business tools 2024, productivity tips, software tutorials, how to choose business tools, tool alternatives, software decision guides, SaaS reviews, business tool blog';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blogs' }
  ];

  if (selectedCategory && categoryName) {
    breadcrumbItems.push({
      label: categoryName,
      href: `/blogs?category=${selectedCategory}`
    });
  }

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/blogs#blog`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/blogs`,
        "name": "MarketMindAI Blog",
        "description": seoDescription,
        "publisher": {
          "@type": "Organization",
          "name": "MarketMindAI",
          "logo": {
            "@type": "ImageObject",
            "url": `${process.env.REACT_APP_BACKEND_URL || ''}/logo.png`
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${process.env.REACT_APP_BACKEND_URL || ''}${item.href}`
        }))
      },
      {
        "@type": "ItemList",
        "numberOfItems": filteredBlogs.length,
        "itemListElement": filteredBlogs.slice(0, 10).map((blog, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.excerpt,
            "url": `${process.env.REACT_APP_BACKEND_URL || ''}/blogs/${blog.slug}`,
            "datePublished": blog.published_at || blog.created_at,
            "author": {
              "@type": "Person",
              "name": blog.author_name || "MarketMindAI Team"
            }
          }
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": blogFaqs.map(faq => ({
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
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/blogs${selectedCategory ? `?category=${selectedCategory}` : ''}`}
      />
      <main className="min-h-screen bg-gray-50" role="main">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 text-white py-16">
          <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Insights & Stories
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover expert insights, tutorials, and stories from the world of productivity tools
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-xl p-2 shadow-lg">
                <Search className="h-5 w-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 text-gray-900 bg-transparent focus:outline-none"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8" aria-labelledby="filters-heading">
          <h2 id="filters-heading" className="sr-only">Filter and sort blogs</h2>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="trending">Trending</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiGeneratedOnly}
                  onChange={(e) => setAiGeneratedOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">AI Generated</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-9 w-9 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-9 w-9 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <section className="flex items-center justify-between mb-6" aria-labelledby="results-heading">
          <div>
            <h2 id="results-heading" className="text-2xl font-bold text-gray-900">
              {filteredBlogs.length} Articles Found
            </h2>
            <p className="text-gray-600">
              {searchTerm && `Results for "${searchTerm}"`}
              {selectedCategory && ` in ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`}
            </p>
          </div>
        </section>

        {/* Featured Blog */}
        {!searchTerm && !selectedCategory && filteredBlogs.length > 0 && (
          <section className="mb-12" aria-labelledby="featured-article-heading">
            <h3 id="featured-article-heading" className="text-xl font-bold text-gray-900 mb-6">Featured Article</h3>
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{filteredBlogs[0].author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(filteredBlogs[0].published_at || filteredBlogs[0].created_at)}</span>
                    </div>
                    {filteredBlogs[0].is_ai_generated && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  
                  <Link to={`/blogs/${filteredBlogs[0].slug}`}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-purple-600 transition-colors">
                      {filteredBlogs[0].title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {filteredBlogs[0].excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {filteredBlogs[0].tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{filteredBlogs[0].reading_time || 5} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{formatNumber(filteredBlogs[0].view_count || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{formatNumber(filteredBlogs[0].like_count || 0)}</span>
                        </div>
                      </div>
                  </div>
                  
                  <Link to={`/blogs/${filteredBlogs[0].slug}`} className="mt-6 inline-block">
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="md:w-1/2 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-8">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-700 font-medium">Featured Content</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blogs Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.slice(searchTerm || selectedCategory ? 0 : 1).map((blog) => (
              <Card key={blog.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{blog.author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(blog.published_at || blog.created_at)}</span>
                    </div>
                    {blog.is_ai_generated && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  <Link to={`/blogs/${blog.slug}`}>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2 mb-3">
                      {blog.title}
                    </CardTitle>
                  </Link>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.excerpt}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{blog.reading_time || 5}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(blog.view_count || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(blog.like_count || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/blogs/${blog.slug}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlogs.slice(searchTerm || selectedCategory ? 0 : 1).map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{blog.author_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(blog.published_at || blog.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{blog.reading_time || 5} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(blog.view_count || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{formatNumber(blog.like_count || 0)}</span>
                        </div>
                        {blog.is_ai_generated && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <Link to={`/blogs/${blog.slug}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {blog.tags?.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags?.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{blog.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <Link to={`/blogs/${blog.slug}`}>
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBlogs.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <SlidersHorizontal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setAiGeneratedOnly(false);
                  fetchBlogs();
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-purple-100 mb-6">
                Get the latest insights and tool reviews delivered to your inbox
              </p>
              <div className="max-w-md mx-auto">
                <NewsletterForm 
                  source="blog"
                  placeholder="Enter your email"
                  buttonText="Subscribe"
                  className="flex gap-3"
                  inputClassName="flex-1 px-4 py-2 rounded-lg text-gray-900 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50"
                  buttonClassName="!bg-white !text-purple-600 hover:!bg-purple-50 font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default BlogsPage;