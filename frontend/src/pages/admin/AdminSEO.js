import React, { useEffect, useState } from 'react';
import { 
  Globe,
  Plus,
  Search,
  Edit3,
  Trash2,
  Target,
  Hash,
  FileText,
  Code,
  BarChart3,
  Eye,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate } from '../../utils/formatters';

const AdminSEO = () => {
  const [seoPages, setSeoPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    fetchSeoPages();
  }, []);

  const fetchSeoPages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/seo-pages');
      setSeoPages(response.data);
    } catch (error) {
      console.error('Error fetching SEO pages:', error);
      // Mock data for demo
      const mockSeoPages = [
        {
          id: '1',
          page_path: '/',
          title: 'MarketMind - Discover the Best Business Tools',
          description: 'Find, compare, and choose from thousands of business tools. Make informed decisions with AI-powered insights and community reviews.',
          keywords: 'business tools, productivity, software comparison, saas tools',
          json_ld: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MarketMind",
            "url": "https://marketmind.com"
          },
          meta_tags: {
            "og:title": "MarketMind - Discover the Best Business Tools",
            "og:description": "Find, compare, and choose from thousands of business tools",
            "og:type": "website"
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          page_path: '/tools',
          title: 'Business Tools Directory - MarketMind',
          description: 'Browse our comprehensive directory of business tools across all categories. Find the perfect software solution for your needs.',
          keywords: 'tools directory, business software, productivity tools, saas directory',
          json_ld: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Business Tools Directory",
            "description": "Comprehensive directory of business tools"
          },
          meta_tags: {
            "og:title": "Business Tools Directory - MarketMind",
            "og:description": "Browse our comprehensive directory of business tools",
            "og:type": "website"
          },
          created_at: '2024-01-12T14:30:00Z',
          updated_at: '2024-01-14T09:15:00Z'
        },
        {
          id: '3',
          page_path: '/blogs',
          title: 'Expert Guides & Tool Reviews - MarketMind Blog',
          description: 'Read expert guides, in-depth tool reviews, and comparisons to make better software decisions for your business.',
          keywords: 'tool reviews, software guides, business productivity, tech blog',
          json_ld: {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "MarketMind Blog",
            "description": "Expert guides and tool reviews"
          },
          meta_tags: {
            "og:title": "Expert Guides & Tool Reviews - MarketMind Blog",
            "og:description": "Read expert guides and in-depth tool reviews",
            "og:type": "blog"
          },
          created_at: '2024-01-10T16:45:00Z',
          updated_at: '2024-01-13T11:20:00Z'
        }
      ];
      setSeoPages(mockSeoPages);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeoPage = async (seoData) => {
    try {
      await apiClient.post('/admin/seo-pages', seoData);
      toast.success('SEO page created successfully');
      setShowCreateModal(false);
      fetchSeoPages();
    } catch (error) {
      console.error('Error creating SEO page:', error);
      toast.error('Failed to create SEO page');
    }
  };

  const handleUpdateSeoPage = async (pageId, seoData) => {
    try {
      await apiClient.put(`/admin/seo-pages/${pageId}`, seoData);
      toast.success('SEO page updated successfully');
      setShowEditModal(false);
      setSelectedPage(null);
      fetchSeoPages();
    } catch (error) {
      console.error('Error updating SEO page:', error);
      toast.error('Failed to update SEO page');
    }
  };

  const SeoForm = ({ page, onSubmit, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState({
      page_path: page?.page_path || '',
      title: page?.title || '',
      description: page?.description || '',
      keywords: page?.keywords || '',
      json_ld: page?.json_ld ? JSON.stringify(page.json_ld, null, 2) : '',
      meta_tags: page?.meta_tags ? JSON.stringify(page.meta_tags, null, 2) : ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      let jsonLd = null;
      let metaTags = null;
      
      try {
        if (formData.json_ld.trim()) {
          jsonLd = JSON.parse(formData.json_ld);
        }
      } catch (error) {
        toast.error('Invalid JSON-LD format');
        return;
      }
      
      try {
        if (formData.meta_tags.trim()) {
          metaTags = JSON.parse(formData.meta_tags);
        }
      } catch (error) {
        toast.error('Invalid Meta Tags JSON format');
        return;
      }

      const submitData = {
        ...formData,
        json_ld: jsonLd,
        meta_tags: metaTags
      };
      
      onSubmit(submitData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">
            {isEdit ? 'Edit SEO Page' : 'Create SEO Page'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic SEO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Page Path *</label>
                <input
                  type="text"
                  value={formData.page_path}
                  onChange={(e) => setFormData({...formData, page_path: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/path-to-page"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">e.g., /, /tools, /blogs/tool-name</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page title for search engines"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">50-60 characters recommended</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description that appears in search results"
              />
              <p className="text-xs text-gray-500 mt-1">150-160 characters recommended</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of relevant keywords</p>
            </div>

            {/* Advanced SEO */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Advanced SEO
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">JSON-LD Schema</label>
                  <textarea
                    value={formData.json_ld}
                    onChange={(e) => setFormData({...formData, json_ld: e.target.value})}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Name",
  "description": "Page description"
}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Structured data in JSON-LD format</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Tags (JSON)</label>
                  <textarea
                    value={formData.meta_tags}
                    onChange={(e) => setFormData({...formData, meta_tags: e.target.value})}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder={`{
  "og:title": "Page Title",
  "og:description": "Page description",
  "og:type": "website",
  "twitter:card": "summary"
}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Open Graph and Twitter meta tags</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" className="flex-1">
                {isEdit ? 'Update SEO Page' : 'Create SEO Page'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredPages = seoPages.filter(page =>
    page.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="h-8 w-8" />
            SEO Management
          </h1>
          <p className="text-gray-600 mt-1">Manage page SEO, meta tags, and structured data</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            SEO Analytics
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Plus className="h-4 w-4" />
            Add SEO Page
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900">{seoPages.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">With JSON-LD</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seoPages.filter(p => p.json_ld).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">With Meta Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seoPages.filter(p => p.meta_tags).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Hash className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Optimized</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seoPages.filter(p => p.title && p.description && p.keywords).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SEO pages by path, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Pages List */}
      <div className="space-y-4">
        {filteredPages.map((page) => (
          <Card key={page.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.title}</h3>
                      <p className="text-sm text-blue-600 font-mono">{page.page_path}</p>
                    </div>
                  </div>

                  {page.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {page.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated {formatDate(page.updated_at)}
                    </div>
                    {page.keywords && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {page.keywords.split(',').length} keywords
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {page.title && page.description && page.keywords ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Optimized
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Needs Work
                      </Badge>
                    )}
                    
                    {page.json_ld && (
                      <Badge className="bg-blue-100 text-blue-800">
                        JSON-LD
                      </Badge>
                    )}
                    
                    {page.meta_tags && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Meta Tags
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPage(page);
                      setShowEditModal(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(page.page_path, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SEO pages found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding SEO configuration for your pages.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First SEO Page
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && (
        <SeoForm
          onSubmit={handleCreateSeoPage}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedPage && (
        <SeoForm
          page={selectedPage}
          onSubmit={(seoData) => handleUpdateSeoPage(selectedPage.id, seoData)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPage(null);
          }}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default AdminSEO;