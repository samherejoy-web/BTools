import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  ExternalLink, 
  Heart,
  Grid3X3,
  List,
  TrendingUp,
  Zap,
  Users,
  DollarSign,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import FAQ from '../../components/ui/FAQ';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatNumber } from '../../utils/formatters';

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPricing, setSelectedPricing] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState('grid');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, [selectedCategory, selectedPricing, sortBy, featuredOnly]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPricing) params.append('pricing', selectedPricing);
      if (sortBy) params.append('sort', sortBy);
      if (featuredOnly) params.append('featured', 'true');

      const response = await apiClient.get(`/tools?${params}`);
      setTools(response.data.tools || response.data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTools();
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/tools/search?q=${encodeURIComponent(searchTerm)}`);
      setTools(response.data.tools || response.data || []);
    } catch (error) {
      console.error('Error searching tools:', error);
      toast.error('Failed to search tools');
    } finally {
      setLoading(false);
    }
  };

  const getPricingBadgeColor = (pricingType) => {
    switch (pricingType) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'freemium': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTools = tools.filter(tool => 
    !searchTerm || 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.features?.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "What types of business tools can I find in this directory?",
      answer: "Our comprehensive business tools directory features project management software, CRM systems, marketing automation platforms, keyword research tools, productivity apps, collaboration software, design tools, development tools, HR management systems, accounting software, and more. We cover tools for startups, SMBs, and enterprise organizations across all industries with free, freemium, and paid options."
    },
    {
      question: "How do I compare business tools side-by-side on MarketMindAI?",
      answer: "MarketMindAI offers a powerful comparison feature allowing you to compare up to 5 business tools simultaneously. Simply select the tools you want to compare, and view detailed side-by-side comparisons of features, pricing plans, user ratings, pros and cons, integration capabilities, customer support options, and more. This helps you evaluate software alternatives and make informed decisions."
    },
    {
      question: "Are the tool reviews on MarketMindAI verified and trustworthy?",
      answer: "Yes! All reviews on MarketMindAI are moderated and verified. We ensure authenticity by verifying reviewers, filtering spam, and providing balanced perspectives with both pros and cons for each tool. Our rating system includes overall scores, feature ratings, ease of use, customer support quality, value for money, and likelihood to recommend."
    },
    {
      question: "Can I filter tools by pricing type (free, freemium, paid)?",
      answer: "Absolutely! Use our advanced filtering options to find tools based on pricing type. Filter by free tools, freemium options, or paid solutions. You can also filter by category, business size (startup, SMB, enterprise), ratings, features, and more to find the perfect software match for your budget and requirements."
    },
    {
      question: "How do I find the best tools for my small business or startup?",
      answer: "Use our smart filtering and search features to discover tools tailored for small businesses and startups. Filter by business size, budget (free/affordable options), category (CRM, project management, etc.), and specific features you need. Our AI-powered recommendation engine also suggests relevant tools based on your industry, team size, and business goals."
    },
    {
      question: "What makes MarketMindAI different from G2, Capterra, or ProductHunt?",
      answer: "Unlike traditional directories like G2, Capterra, or ProductHunt, MarketMindAI combines AI-powered recommendations with verified reviews, offering personalized tool suggestions based on your specific needs. We feature advanced side-by-side comparisons (up to 5 tools), real-time pricing comparisons, comprehensive feature breakdowns, alternative suggestions, and AI-generated insights to help you make data-driven decisions faster."
    }
  ];

  // Enhanced structured data
  const categoryName = categories.find(c => c.slug === selectedCategory)?.name;
  const seoTitle = selectedCategory 
    ? `${categoryName || selectedCategory} Tools Directory - Compare & Find Best ${categoryName} Software`
    : 'Business Tools Directory - Find, Compare & Review 150+ Software Tools | MarketMindAI';
  
  const seoDescription = selectedCategory
    ? `Discover the best ${(categoryName || selectedCategory).toLowerCase()} tools and software. Compare features, pricing, reviews, and alternatives. Find the perfect ${(categoryName || selectedCategory).toLowerCase()} solution for your business with verified reviews and AI-powered recommendations.`
    : 'Browse 150+ business tools and software solutions. Compare features, read verified reviews, and find the best productivity tools, SaaS platforms, and business software for startups, SMBs, and enterprises. Free comparison tool included.';

  const keywords = selectedCategory
    ? `${categoryName} tools, ${categoryName} software, best ${categoryName} tools 2024, ${categoryName} software comparison, ${categoryName} alternatives, ${categoryName} reviews, top ${categoryName} platforms`
    : 'business tools directory, software comparison platform, best business tools 2024, best business tools 2025, SaaS tools comparison, productivity tools, tool discovery platform, business software directory, compare business software, software alternatives, free business tools, enterprise software comparison, startup tools, SMB software, project management tools, CRM software, marketing tools, keyword research tools';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' }
  ];

  if (selectedCategory && categoryName) {
    breadcrumbItems.push({
      label: categoryName,
      href: `/tools?category=${selectedCategory}`
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/tools#webpage`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/tools`,
        "name": seoTitle,
        "description": seoDescription,
        "isPartOf": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`
        },
        "breadcrumb": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/tools#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/tools#breadcrumb`,
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${process.env.REACT_APP_BACKEND_URL || ''}${item.href}`
        }))
      },
      {
        "@type": "ItemList",
        "numberOfItems": filteredTools.length,
        "itemListElement": filteredTools.slice(0, 10).map((tool, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": tool.name,
            "description": tool.short_description || tool.description,
            "url": `${process.env.REACT_APP_BACKEND_URL || ''}/tools/${tool.id}`,
            "applicationCategory": "BusinessApplication",
            "aggregateRating": tool.rating ? {
              "@type": "AggregateRating",
              "ratingValue": tool.rating,
              "reviewCount": tool.review_count || 0,
              "bestRating": 5,
              "worstRating": 1
            } : undefined,
            "offers": tool.pricing_type ? {
              "@type": "Offer",
              "price": tool.pricing_type === 'free' ? '0' : undefined,
              "priceCurrency": "USD"
            } : undefined
          }
        }))
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

  if (loading && tools.length === 0) {
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

  return (
    <>
      <EnhancedSEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={keywords}
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/tools${selectedCategory ? `?category=${selectedCategory}` : ''}`}
      />
      
      <main className="min-h-screen bg-gray-50" role="main">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16" data-testid="tools-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="tools-title">
                {selectedCategory ? `${categoryName} Tools` : 'Discover Amazing Business Tools'}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90" data-testid="tools-description">
                {selectedCategory 
                  ? `Find and compare the best ${(categoryName || selectedCategory).toLowerCase()} software and tools for your business`
                  : 'Find, compare, and review the best business tools and software solutions to boost your productivity and success'}
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-xl p-2 shadow-lg">
                  <Search className="h-5 w-5 text-gray-400 ml-3" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search tools, features, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 text-gray-900 bg-transparent focus:outline-none"
                    aria-label="Search for business tools"
                    data-testid="search-input"
                  />
                  <Button 
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    data-testid="search-button"
                    aria-label="Search tools"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Filters Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 mb-8" aria-labelledby="filters-heading" data-testid="filters-section">
            <h2 id="filters-heading" className="sr-only">Filter and sort tools</h2>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center" role="group" aria-label="Filter options">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Filter by category"
                  data-testid="category-filter"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Filter by pricing"
                  data-testid="pricing-filter"
                >
                  <option value="">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Sort tools by"
                  data-testid="sort-filter"
                >
                  <option value="trending">Trending</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="most_reviewed">Most Reviewed</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-label="Show featured tools only"
                    data-testid="featured-filter"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Only</span>
                </label>
              </div>

              <div className="flex items-center gap-2" role="group" aria-label="View mode">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9 p-0"
                  aria-label="Grid view"
                  data-testid="grid-view-btn"
                >
                  <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-9 w-9 p-0"
                  aria-label="List view"
                  data-testid="list-view-btn"
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>

          {/* Results Header */}
          <section className="mb-6" aria-labelledby="results-heading">
            <h2 id="results-heading" className="text-2xl font-bold text-gray-900" data-testid="results-count">
              {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'} Found
            </h2>
            <p className="text-gray-600">
              {searchTerm && `Results for "${searchTerm}"`}
              {selectedCategory && ` in ${categoryName || selectedCategory}`}
            </p>
          </section>

          {/* Tools Grid/List */}
          {viewMode === 'grid' ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" role="list" aria-label="Business tools grid" data-testid="tools-grid">
              {filteredTools.map((tool) => (
                <article key={tool.id} className="group" role="listitem" data-testid={`tool-card-${tool.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
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
                              <span className="text-white font-bold text-lg">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {tool.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center" aria-label={`Rating: ${tool.rating} out of 5 stars`}>
                                <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {tool.rating}
                                </span>
                              </div>
                              <span className="text-gray-300" aria-hidden="true">•</span>
                              <span className="text-sm text-gray-600">
                                {tool.review_count} reviews
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getPricingBadgeColor(tool.pricing_type)} aria-label={`Pricing: ${tool.pricing_type}`}>
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
            </section>
          ) : (
            <section className="space-y-4 mb-12" role="list" aria-label="Business tools list" data-testid="tools-list">
              {filteredTools.map((tool) => (
                <article key={tool.id} role="listitem" data-testid={`tool-list-item-${tool.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          {tool.logo_url ? (
                            <img
                              src={tool.logo_url}
                              alt={`${tool.name} logo`}
                              className="w-16 h-16 rounded-lg object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                              <span className="text-white font-bold text-xl">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {tool.name}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center" aria-label={`Rating: ${tool.rating} out of 5 stars`}>
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                                  <span className="text-sm text-gray-600 ml-1">
                                    {tool.rating}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {tool.review_count} reviews
                                </span>
                                <div className="flex items-center text-sm text-gray-500" aria-label={`${formatNumber(tool.view_count)} views`}>
                                  <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                                  {formatNumber(tool.view_count)}
                                </div>
                              </div>
                            </div>
                            <Badge className={getPricingBadgeColor(tool.pricing_type)} aria-label={`Pricing: ${tool.pricing_type}`}>
                              {tool.pricing_type}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {tool.short_description}
                          </p>
                          
                          <Link to={`/tools/${tool.id}`}>
                            <Button size="sm" data-testid={`view-details-${tool.id}`} aria-label={`View details for ${tool.name}`}>
                              View Details
                              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </section>
          )}

          {filteredTools.length === 0 && !loading && (
            <section className="text-center py-16" aria-label="No results">
              <div className="max-w-md mx-auto">
                <SlidersHorizontal className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find what you&apos;re looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedPricing('');
                    setFeaturedOnly(false);
                    fetchTools();
                  }}
                  variant="outline"
                  data-testid="clear-filters-btn"
                >
                  Clear All Filters
                </Button>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="py-16 bg-gray-50 rounded-xl" aria-labelledby="faq-section" data-testid="faq-section">
            <div className="max-w-4xl mx-auto px-4">
              <header className="text-center mb-12">
                <h2 id="faq-section" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about finding and comparing business tools
                </p>
              </header>
              <FAQ faqs={faqs} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ToolsPage;
