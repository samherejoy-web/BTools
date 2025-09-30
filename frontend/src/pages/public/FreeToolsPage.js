import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ExternalLink, 
  Star, 
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

const FreeToolsPage = () => {
  const [freeTools, setFreeTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [toolsRes, categoriesRes] = await Promise.all([
        apiClient.get('/free-tools'),
        apiClient.get('/free-tools/categories')
      ]);
      
      setFreeTools(toolsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching free tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = freeTools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const featuredTools = filteredTools.filter(tool => tool.is_featured);
  const regularTools = filteredTools.filter(tool => !tool.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Free Tools - MarketMind AI</title>
        <meta 
          name="description" 
          content="Discover the best free tools for your business. Curated collection of productivity, design, development, and marketing tools." 
        />
        <meta 
          name="keywords" 
          content="free tools, business tools, productivity, design tools, development tools, marketing tools" 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Free Tools for Your Business
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover powerful free tools to boost your productivity, enhance your designs, 
                streamline development, and supercharge your marketing efforts.
              </p>
              
              <div className="flex justify-center">
                <Badge className="px-4 py-2 bg-green-100 text-green-800 border-0">
                  {freeTools.length} Free Tools Available
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Active filters */}
              {(selectedCategory || searchTerm) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory && (
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedCategory('')}
                    >
                      {selectedCategory} ✕
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSearchTerm('')}
                    >
                      "{searchTerm}" ✕
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Tools Section */}
          {featuredTools.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                Featured Free Tools
              </h2>
              
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {featuredTools.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {tool.icon_url ? (
                            <img
                              src={tool.icon_url}
                              alt={tool.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                            <p className="text-sm text-gray-500">{tool.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        {tool.description}
                      </p>
                      
                      <Button 
                        className="w-full"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        Open Tool
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Tools Section */}
          {regularTools.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Free Tools
                <span className="ml-2 text-lg text-gray-500">({regularTools.length})</span>
              </h2>
              
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {regularTools.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow duration-300">
                    {viewMode === 'grid' ? (
                      <>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {tool.icon_url ? (
                                <img
                                  src={tool.icon_url}
                                  alt={tool.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {tool.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-base">{tool.name}</CardTitle>
                                <p className="text-xs text-gray-500">{tool.category}</p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {tool.description}
                          </p>
                          
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(tool.url, '_blank')}
                          >
                            Open Tool
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {tool.icon_url ? (
                              <img
                                src={tool.icon_url}
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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {tool.category}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => window.open(tool.url, '_blank')}
                          >
                            Open Tool
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tools found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No free tools are available at the moment.'
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FreeToolsPage;