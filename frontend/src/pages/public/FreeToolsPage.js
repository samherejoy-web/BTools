import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ExternalLink,
  Search,
  Globe,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import apiClient from '../../utils/apiClient';
import { toast } from 'sonner';

const FreeToolsPage = () => {
  const [freeTools, setFreeTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFreeTools();
  }, []);

  const fetchFreeTools = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/free-tools');
      setFreeTools(response.data || []);
    } catch (error) {
      console.error('Error fetching free tools:', error);
      toast.error('Failed to load free tools');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = freeTools.filter(tool =>
    !searchTerm ||
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToolClick = (tool) => {
    // Open tool in new tab
    window.open(tool.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Free Tools - MarketMindAI</title>
        <meta 
          name="description" 
          content="Discover our curated collection of free tools and resources to help grow your business. Access powerful tools without any cost." 
        />
        <meta 
          name="keywords" 
          content="free tools, business tools, productivity tools, free resources, online tools" 
        />
        <meta property="og:title" content="Free Tools - MarketMindAI" />
        <meta 
          property="og:description" 
          content="Discover our curated collection of free tools and resources to help grow your business." 
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Free Tools & Resources
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover our curated collection of free tools and resources to help grow your business. 
                Access powerful tools without any cost.
              </p>
              
              {/* Search */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search free tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : filteredTools.length > 0 ? (
            <>
              {/* Results Summary */}
              <div className="mb-8">
                <p className="text-gray-600">
                  {searchTerm ? (
                    <>Showing {filteredTools.length} tools matching "{searchTerm}"</>
                  ) : (
                    <>Showing all {filteredTools.length} free tools</>
                  )}
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Globe className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {tool.name}
                            </h3>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>

                      {tool.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {tool.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Free Tool</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="group-hover:border-blue-600 group-hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToolClick(tool);
                          }}
                        >
                          Visit Tool
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                  <p className="text-gray-600 mb-6">
                    No tools match your search for "{searchTerm}". Try different keywords.
                  </p>
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No free tools available</h3>
                  <p className="text-gray-600 mb-6">
                    We're working on curating free tools for you. Check back soon!
                  </p>
                  <Button onClick={fetchFreeTools} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Need More Business Tools?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Explore our comprehensive directory of business tools and find the perfect solutions for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/tools'}
                >
                  Browse All Tools
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/blogs'}
                >
                  Read Our Blog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreeToolsPage;