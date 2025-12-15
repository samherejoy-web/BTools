import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Eye, 
  ExternalLink, 
  Heart,
  Share2,
  Bookmark,
  DollarSign,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  ArrowLeft,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CommentsSection } from '../../components/ui/comments';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';
import { useToolSEO } from '../../hooks/useSEO';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

const ToolDetailPage = () => {
  const { toolSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedTools, setRelatedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState({ title: '', content: '', pros: '', cons: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Generate SEO data for the tool - only when tool data is loaded
  const seoData = useToolSEO(tool);

  // FAQ data for tool page AEO optimization
  const toolFaqs = tool ? [
    {
      question: `What is ${tool.name}?`,
      answer: tool.about || tool.description || `${tool.name} is a ${tool.categories?.[0]?.name || 'business'} tool that helps teams and businesses improve productivity and achieve their goals. ${tool.short_description || ''}`
    },
    {
      question: `How much does ${tool.name} cost?`,
      answer: tool.pricing_type === 'free' 
        ? `${tool.name} is completely free to use with no hidden costs.`
        : tool.pricing_type === 'freemium'
        ? `${tool.name} offers a freemium pricing model with both free and paid plans. ${tool.pricing_details ? 'View pricing details above for specific plan information.' : 'Visit their website for detailed pricing information.'}`
        : `${tool.name} is a paid tool. ${tool.pricing_details ? 'View pricing details above for specific plan information.' : 'Visit their website for detailed pricing information.'}`
    },
    {
      question: `What are the key features of ${tool.name}?`,
      answer: tool.features && tool.features.length > 0
        ? `${tool.name} offers several key features including: ${tool.features.slice(0, 5).join(', ')}${tool.features.length > 5 ? ', and more' : ''}.`
        : `${tool.name} provides comprehensive features designed for ${tool.categories?.[0]?.name || 'business'} needs. Check the Features tab above for detailed information.`
    },
    {
      question: `Is ${tool.name} good for small businesses and startups?`,
      answer: tool.pricing_type === 'free' || tool.pricing_type === 'freemium'
        ? `Yes! ${tool.name} is great for small businesses and startups with its ${tool.pricing_type} pricing model, making it accessible for teams of all sizes. ${tool.review_count > 0 ? `With ${tool.review_count} reviews and a ${tool.rating}-star rating, it's trusted by many businesses.` : ''}`
        : `${tool.name} offers solutions for businesses of all sizes. ${tool.review_count > 0 ? `With ${tool.review_count} reviews and a ${tool.rating}-star rating, many businesses trust this tool.` : 'Check reviews and pricing to see if it fits your needs.'}`
    },
    {
      question: `What are the pros and cons of ${tool.name}?`,
      answer: `${tool.pros && tool.pros.length > 0 ? `Pros: ${tool.pros.slice(0, 3).join(', ')}.` : ''} ${tool.cons && tool.cons.length > 0 ? ` Cons: ${tool.cons.slice(0, 3).join(', ')}.` : ''} Read detailed reviews above for more insights from actual users.`
    },
    {
      question: `What are the best alternatives to ${tool.name}?`,
      answer: `Looking for ${tool.name} alternatives? Check our related tools section for similar ${tool.categories?.[0]?.name || 'business'} solutions. You can also use our comparison feature to compare ${tool.name} side-by-side with other tools to find the best fit for your needs.`
    }
  ] : [];


  useEffect(() => {
    if (toolSlug) {
      fetchToolDetails();
      fetchToolReviews();
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolSlug]);

  const fetchToolDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tools/by-slug/${toolSlug}`);
      setTool(response.data);
      setLikesCount(response.data.like_count || 0);
      
      // Fetch related tools from the same category
      if (response.data.categories?.length > 0) {
        fetchRelatedTools(response.data.categories[0].id);
      }
    } catch (error) {
      console.error('Error fetching tool details:', error);
      toast.error('Tool not found');
      navigate('/tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchToolReviews = async () => {
    try {
      const response = await apiClient.get(`/tools/${tool?.id || toolSlug}/reviews`);
      setReviews(response.data.reviews || response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedTools = async (categoryId) => {
    try {
      const response = await apiClient.get(`/tools?category=${categoryId}&limit=4`);
      const tools = response.data.tools || response.data || [];
      setRelatedTools(tools.filter(t => t.id !== tool?.id));
    } catch (error) {
      console.error('Error fetching related tools:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await apiClient.get(`/tools/${toolSlug}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      await apiClient.post(`/tools/${toolSlug}/comments`, commentData);
      await fetchComments(); // Refresh comments
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please login to like tools');
      navigate('/login');
      return;
    }

    try {
      const response = await apiClient.post(`/tools/${toolSlug}/like`);
      setIsLiked(!isLiked);
      // Use the actual like count from response if available
      setLikesCount(response.data?.like_count || (isLiked ? likesCount - 1 : likesCount + 1));
      toast.success(isLiked ? 'Like removed' : 'Tool liked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    try {
      setReviewLoading(true);
      const reviewData = {
        tool_id: tool?.id || toolSlug, // Backend requires tool_id in request body
        rating: newRating,
        title: newReview.title,
        content: newReview.content,
        pros: newReview.pros.split(',').map(p => p.trim()).filter(p => p),
        cons: newReview.cons.split(',').map(c => c.trim()).filter(c => c)
      };

      await apiClient.post(`/tools/${tool?.id || toolSlug}/reviews`, reviewData);
      toast.success('Review submitted successfully!');
      
      setNewReview({ title: '', content: '', pros: '', cons: '' });
      setNewRating(5);
      setShowReviewForm(false);
      fetchToolReviews();
      fetchToolDetails(); // Refresh to update ratings
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      await apiClient.post(`/tools/${tool?.id || toolSlug}/favorite`);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const getPricingColor = (pricingType) => {
    switch (pricingType) {
      case 'free': return 'text-green-600 bg-green-50';
      case 'freemium': return 'text-blue-600 bg-blue-50';
      case 'paid': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-gray-200 rounded-xl"></div>
                <div className="h-40 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tool not found</h1>
          <Link to="/tools">
            <Button>← Back to Tools</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced structured data for tool detail page
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    ...(tool?.categories?.[0] ? [{ label: tool.categories[0].name, href: `/tools?category=${tool.categories[0].slug}` }] : []),
    { label: tool?.name || 'Tool', href: `/tools/${toolSlug}` }
  ];

  const enhancedStructuredData = tool ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.about || tool.description,
        "url": tool.url,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": tool.pricing_details ? {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "lowPrice": tool.pricing_type === 'free' ? "0" : undefined,
          "highPrice": tool.pricing_type === 'free' ? "0" : undefined
        } : undefined,
        "aggregateRating": tool.rating ? {
          "@type": "AggregateRating",
          "ratingValue": tool.rating,
          "reviewCount": tool.review_count || 0,
          "bestRating": 5,
          "worstRating": 1
        } : undefined,
        "review": reviews.slice(0, 5).map(review => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": review.user_name || "Anonymous"
          },
          "datePublished": review.created_at,
          "reviewBody": review.content,
          "name": review.title,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating,
            "bestRating": 5,
            "worstRating": 1
          }
        }))
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
        "@type": "FAQPage",
        "mainEntity": toolFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  } : {};

  const seoTitle = tool ? `${tool.name} Review - Features, Pricing & Alternatives | MarketMindAI` : 'Tool Details';
  const seoDescription = tool ? `${tool.short_description || tool.description} Read verified reviews, compare features, pricing plans, and find the best ${tool.name} alternatives. ${tool.rating}-star rating with ${tool.review_count} reviews.` : '';
  const seoKeywords = tool ? `${tool.name} review, ${tool.name} pricing, ${tool.name} features, ${tool.name} alternatives, best ${tool.categories?.[0]?.name || 'business'} tools, ${tool.name} vs competitors, ${tool.categories?.[0]?.name || 'software'} comparison` : '';

  return (
    <>
      {/* Always render SEO data, even if tool is null */}
      <EnhancedSEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        structuredData={enhancedStructuredData}
        ogType="product"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/tools/${toolSlug}`}
        ogImage={tool?.logo_url}
      />
      <main className="min-h-screen bg-gray-50" role="main">
        {/* Hero Section */}
        <header className="bg-white border-b" data-testid="tool-header">
          <div className="container mx-auto px-4 py-8">
            <nav className="mb-6" aria-label="Navigation">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4" data-testid="back-button" aria-label="Go back">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back
              </Button>
              {tool && <Breadcrumb items={breadcrumbItems} />}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Company Logo Thumbnail */}
                      {tool.logo_thumbnail_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={tool.logo_thumbnail_url} 
                            alt={`${tool.name} logo`}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                        <p className="text-xl text-gray-600 mb-2">{tool.short_description}</p>
                        
                        {/* Company Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                          {tool.company_location && (
                            <span className="flex items-center gap-1">
                              📍 {tool.company_location}
                            </span>
                          )}
                          {tool.started_on && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Founded {tool.started_on}
                            </span>
                          )}
                          {tool.linkedin_url && (
                            <a 
                              href={tool.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              💼 LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(tool.rating)}
                        <span className="font-semibold text-gray-900">{tool.rating}</span>
                        <span className="text-gray-500">({formatNumber(tool.review_count)} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(tool.view_count)} views</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(likesCount)} likes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <Badge className={`${getPricingColor(tool.pricing_type)} px-3 py-1 font-medium`}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        {tool.pricing_type}
                      </Badge>
                      {tool.is_featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                          ⭐ Featured
                        </Badge>
                      )}
                      {tool.categories?.map((category) => (
                        <Badge key={category.id} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => window.open(tool.url, '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button variant="outline" onClick={handleToggleLike}>
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'} ({formatNumber(likesCount)})
                  </Button>
                  <Button variant="outline" onClick={handleToggleFavorite}>
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Link to={`/compare?tools=${tool.id}`}>
                    <Button variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Compare
                    </Button>
                  </Link>
                </div>
              </div>

              <aside>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tool.pricing_details && typeof tool.pricing_details === 'object' && Object.keys(tool.pricing_details).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(tool.pricing_details).map(([tier, price]) => (
                          <div key={tier} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 border-b border-gray-100 last:border-0">
                            <span className="font-medium capitalize text-gray-700 text-sm">{tier}</span>
                            <span className="text-gray-900 font-semibold text-sm break-words">{price}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">Pricing information not available</p>
                    )}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </header>

      <article className="container mx-auto px-4 py-8" data-testid="tool-detail-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="discussion">Discussion ({comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>About {tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {tool.about || tool.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Company Information */}
                {(
                  (Array.isArray(tool.company_founders) && tool.company_founders.length > 0) || 
                  (tool.company_funding && typeof tool.company_funding === 'object') || 
                  (tool.company_news && typeof tool.company_news === 'string')
                ) && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.isArray(tool.company_founders) && tool.company_founders.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Founders</h4>
                          <div className="flex flex-wrap gap-3">
                            {tool.company_founders.map((founder, index) => (
                              founder && typeof founder === 'object' && founder.name ? (
                                <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg">
                                  <div className="font-medium text-gray-900">{founder.name}</div>
                                  {founder.role && (
                                    <div className="text-sm text-gray-600">{founder.role}</div>
                                  )}
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {tool.company_funding && typeof tool.company_funding === 'object' && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Funding</h4>
                          <div className="bg-blue-50 px-4 py-3 rounded-lg">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {tool.company_funding.amount && (
                                <span><strong>Amount:</strong> {tool.company_funding.amount}</span>
                              )}
                              {tool.company_funding.round && (
                                <span><strong>Round:</strong> {tool.company_funding.round}</span>
                              )}
                              {tool.company_funding.date && (
                                <span><strong>Date:</strong> {tool.company_funding.date}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {tool.company_news && typeof tool.company_news === 'string' && tool.company_news.trim() && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Recent News</h4>
                          <p className="text-gray-700 bg-yellow-50 px-4 py-3 rounded-lg">
                            {tool.company_news}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {Array.isArray(tool.pros) && tool.pros.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-green-700">Pros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.pros.filter(pro => pro && typeof pro === 'string').map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {Array.isArray(tool.cons) && tool.cons.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-red-700">Cons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.cons.filter(con => con && typeof con === 'string').map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(tool.features) && tool.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tool.features.filter(f => f && typeof f === 'string').map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-800 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No features listed yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Reviews & Ratings</h3>
                  {user && (
                    <Button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                  )}
                </div>

                {showReviewForm && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          {renderStars(newRating, true, setNewRating)}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title
                          </label>
                          <input
                            type="text"
                            value={newReview.title}
                            onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief summary of your experience"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Content
                          </label>
                          <textarea
                            value={newReview.content}
                            onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share your detailed experience with this tool"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pros (comma separated)
                            </label>
                            <input
                              type="text"
                              value={newReview.pros}
                              onChange={(e) => setNewReview({...newReview, pros: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Easy to use, Great features"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cons (comma separated)
                            </label>
                            <input
                              type="text"
                              value={newReview.cons}
                              onChange={(e) => setNewReview({...newReview, cons: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Expensive, Limited features"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button type="submit" disabled={reviewLoading}>
                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowReviewForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {review.user_name?.[0] || 'U'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.user_name || 'Anonymous'}</h4>
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {review.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-700 mb-4">{review.content}</p>

                        {review.pros?.length > 0 && (
                          <div className="mb-3">
                            <h6 className="font-medium text-sm text-green-700 mb-1">Pros:</h6>
                            <ul className="text-sm text-gray-600">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3 text-green-500" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons?.length > 0 && (
                          <div className="mb-3">
                            <h6 className="font-medium text-sm text-red-700 mb-1">Cons:</h6>
                            <ul className="text-sm text-gray-600">
                              {review.cons.map((con, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <ThumbsDown className="h-3 w-3 text-red-500" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {reviews.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to share your experience with {tool.name}</p>
                        {user && (
                          <Button onClick={() => setShowReviewForm(true)}>
                            Write First Review
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Pricing Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tool.pricing_details && typeof tool.pricing_details === 'object' && Object.keys(tool.pricing_details).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(tool.pricing_details).map(([tier, price]) => (
                          <div key={tier} className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col">
                            <h4 className="font-bold text-lg text-gray-900 capitalize mb-3">{tier}</h4>
                            <p className="text-xl font-semibold text-blue-600 mb-4 break-words flex-grow">{price}</p>
                            <Button 
                              className="w-full mt-auto" 
                              variant={tier.toLowerCase() === 'free' ? 'outline' : 'default'}
                              onClick={() => window.open(tool.url, '_blank')}
                            >
                              {tier.toLowerCase() === 'free' ? 'Get Started Free' : 'Choose Plan'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                          <p className="text-gray-600 mb-4">Pricing information not available</p>
                          <Button onClick={() => window.open(tool.url, '_blank')}>
                            Visit Website for Pricing
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-6">
                <CommentsSection
                  comments={comments}
                  onAddComment={handleAddComment}
                  loading={commentsLoading}
                  title="Community Discussion"
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {relatedTools.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Related Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedTools.slice(0, 3).map((relatedTool) => (
                      <div key={relatedTool.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                        <div className="flex-1">
                          <Link to={`/tools/${relatedTool.slug}`}>
                            <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {relatedTool.name}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600 line-clamp-2">{relatedTool.short_description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{relatedTool.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/tools" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View All Tools
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Add to Collection
                </Button>
                <Link to={`/compare?tools=${tool.id}`} className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compare Tools
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Tool
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section for AEO */}
        {tool && toolFaqs.length > 0 && (
          <section className="container mx-auto px-4 py-16" aria-labelledby="tool-faq-section" data-testid="tool-faq-section">
            <div className="max-w-4xl mx-auto">
              <header className="text-center mb-12">
                <h2 id="tool-faq-section" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions About {tool.name}
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about {tool.name}
                </p>
              </header>
              <FAQ faqs={toolFaqs} />
            </div>
          </section>
        )}
      </article>
      </main>
    </>
  );
};

export default ToolDetailPage;