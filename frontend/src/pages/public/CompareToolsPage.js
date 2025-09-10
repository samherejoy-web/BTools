import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Plus,
  X,
  Star,
  Eye,
  ExternalLink,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Zap,
  Brain,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

const CompareToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [comparedTools, setComparedTools] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiComparisonLoading, setAiComparisonLoading] = useState(false);
  const [aiComparison, setAiComparison] = useState(null);
  const [showToolSelector, setShowToolSelector] = useState(false);

  useEffect(() => {
    fetchAvailableTools();
    
    // Load tools from URL params
    const toolsParam = searchParams.get('tools');
    if (toolsParam) {
      const toolIds = toolsParam.split(',');
      loadToolsFromIds(toolIds);
    }
  }, []);

  const fetchAvailableTools = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/tools?limit=100');
      setAvailableTools(response.data.tools || response.data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const loadToolsFromIds = async (toolIds) => {
    try {
      const tools = [];
      for (const toolId of toolIds.slice(0, 5)) { // Limit to 5 tools
        try {
          const response = await apiClient.get(`/api/tools/${toolId}`);
          tools.push(response.data);
        } catch (error) {
          console.warn(`Failed to load tool ${toolId}:`, error);
        }
      }
      setComparedTools(tools);
    } catch (error) {
      console.error('Error loading tools from IDs:', error);
    }
  };

  const addToolToComparison = (tool) => {
    if (comparedTools.length >= 5) {
      toast.error('You can compare up to 5 tools only');
      return;
    }

    if (comparedTools.find(t => t.id === tool.id)) {
      toast.error('Tool is already in comparison');
      return;
    }

    const newTools = [...comparedTools, tool];
    setComparedTools(newTools);
    updateUrlParams(newTools);
    setShowToolSelector(false);
    toast.success(`${tool.name} added to comparison`);
  };

  const removeToolFromComparison = (toolId) => {
    const newTools = comparedTools.filter(t => t.id !== toolId);
    setComparedTools(newTools);
    updateUrlParams(newTools);
    toast.success('Tool removed from comparison');
  };

  const updateUrlParams = (tools) => {
    if (tools.length > 0) {
      const toolIds = tools.map(t => t.id).join(',');
      setSearchParams({ tools: toolIds });
    } else {
      setSearchParams({});
    }
  };

  const generateAiComparison = async () => {
    if (comparedTools.length < 2) {
      toast.error('Add at least 2 tools to generate AI comparison');
      return;
    }

    try {
      setAiComparisonLoading(true);
      const toolIds = comparedTools.map(t => t.id);
      const response = await apiClient.post('/api/ai/compare-tools', {
        tool_ids: toolIds
      });
      setAiComparison(response.data);
      toast.success('AI comparison generated successfully!');
    } catch (error) {
      console.error('Error generating AI comparison:', error);
      toast.error('Failed to generate AI comparison');
    } finally {
      setAiComparisonLoading(false);
    }
  };

  const saveComparisonAsBlog = async () => {
    if (!user) {
      toast.error('Please login to save comparison as blog');
      return;
    }

    if (!aiComparison) {
      toast.error('Generate AI comparison first');
      return;
    }

    try {
      const blogData = {
        title: aiComparison.title || `${comparedTools.map(t => t.name).join(' vs ')} - Comparison`,
        content: aiComparison.detailed_comparison || aiComparison.content,
        excerpt: aiComparison.summary || aiComparison.excerpt,
        tags: ['comparison', 'tools', ...comparedTools.map(t => t.name.toLowerCase())],
        is_ai_generated: true,
        status: 'draft'
      };

      await apiClient.post('/api/user/blogs', blogData);
      toast.success('Comparison saved as blog draft!');
    } catch (error) {
      console.error('Error saving comparison as blog:', error);
      toast.error('Failed to save comparison as blog');
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

  const renderComparisonTable = () => {
    if (comparedTools.length === 0) return null;

    const features = [...new Set(comparedTools.flatMap(tool => tool.features || []))];
    const pros = [...new Set(comparedTools.flatMap(tool => tool.pros || []))];
    const cons = [...new Set(comparedTools.flatMap(tool => tool.cons || []))];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-900 bg-gray-50">Criteria</th>
              {comparedTools.map((tool) => (
                <th key={tool.id} className="text-center p-4 min-w-[200px] bg-gray-50">
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                    <Badge className={`${getPricingColor(tool.pricing_type)} text-xs`}>
                      {tool.pricing_type}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Rating */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700">Rating</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tool.rating}</span>
                    <span className="text-sm text-gray-500">({formatNumber(tool.review_count)})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Views */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700">Popularity</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{formatNumber(tool.view_count)} views</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Pricing */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700">Pricing</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 text-center">
                  <div className="space-y-1">
                    {tool.pricing_details && typeof tool.pricing_details === 'object' ? (
                      Object.entries(tool.pricing_details).map(([tier, price]) => (
                        <div key={tier} className="text-sm">
                          <span className="font-medium capitalize">{tier}:</span> {price}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">Not available</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Key Features */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700 align-top">Key Features</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 align-top">
                  <div className="space-y-1">
                    {(tool.features || []).slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {tool.features && tool.features.length > 5 && (
                      <div className="text-xs text-gray-500">
                        +{tool.features.length - 5} more features
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Pros */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700 align-top">Pros</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 align-top">
                  <div className="space-y-1">
                    {(tool.pros || []).slice(0, 3).map((pro, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Cons */}
            <tr className="border-b border-gray-100">
              <td className="p-4 font-medium text-gray-700 align-top">Cons</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 align-top">
                  <div className="space-y-1">
                    {(tool.cons || []).slice(0, 3).map((con, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                        <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="p-4 font-medium text-gray-700">Actions</td>
              {comparedTools.map((tool) => (
                <td key={tool.id} className="p-4 text-center">
                  <div className="space-y-2">
                    <Link to={`/tools/${tool.slug}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(tool.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Site
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => removeToolFromComparison(tool.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const filteredTools = availableTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Compare Tools
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Compare up to 5 tools side by side to make the best choice for your needs
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tool Selection */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {comparedTools.length === 0 ? 'Select Tools to Compare' : 'Comparison'}
            </h2>
            <div className="flex items-center gap-3">
              {comparedTools.length > 0 && (
                <>
                  <Button
                    onClick={generateAiComparison}
                    disabled={aiComparisonLoading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    {aiComparisonLoading ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setComparedTools([])}
                  >
                    Clear All
                  </Button>
                </>
              )}
              {comparedTools.length < 5 && (
                <Button onClick={() => setShowToolSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              )}
            </div>
          </div>

          {/* Selected Tools Preview */}
          {comparedTools.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {comparedTools.map((tool) => (
                <Badge
                  key={tool.id}
                  variant="secondary"
                  className="px-3 py-2 text-sm flex items-center gap-2"
                >
                  {tool.name}
                  <button
                    onClick={() => removeToolFromComparison(tool.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {comparedTools.length > 0 && (
          <Card className="border-0 shadow-sm mb-8">
            <CardContent className="p-0">
              {renderComparisonTable()}
            </CardContent>
          </Card>
        )}

        {/* AI Comparison Results */}
        {aiComparison && (
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Analysis & Recommendations
                </CardTitle>
                <div className="flex items-center gap-2">
                  {user && (
                    <Button size="sm" onClick={saveComparisonAsBlog}>
                      <Download className="h-4 w-4 mr-2" />
                      Save as Blog
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiComparison.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{aiComparison.summary}</p>
                  </div>
                )}

                {aiComparison.recommendations && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                    <div className="space-y-3">
                      {aiComparison.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">{rec.title}</h4>
                          <p className="text-blue-700 text-sm">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiComparison.best_for && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Best For</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(aiComparison.best_for).map(([tool, useCase]) => (
                        <div key={tool} className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-1">{tool}</h4>
                          <p className="text-green-700 text-sm">{useCase}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {comparedTools.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Your Comparison
              </h3>
              <p className="text-gray-600 mb-6">
                Select tools to compare their features, pricing, and performance side by side
              </p>
              <Button onClick={() => setShowToolSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tool
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tool Selector Modal */}
        {showToolSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add Tool to Comparison</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToolSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[70vh]">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTools.slice(0, 20).map((tool) => (
                    <div
                      key={tool.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:shadow-md ${
                        comparedTools.find(t => t.id === tool.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => addToolToComparison(tool)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                        <Badge className={getPricingColor(tool.pricing_type)}>
                          {tool.pricing_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tool.short_description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{tool.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(tool.view_count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareToolsPage;