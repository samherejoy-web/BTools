import React, { useEffect, useState } from 'react';
import { 
  Globe,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Target,
  BarChart3,
  Zap,
  FileText,
  Layout,
  Filter,
  Download,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';

const SuperAdminSEO = () => {
  const [seoOverview, setSeoOverview] = useState(null);
  const [seoIssues, setSeoIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  useEffect(() => {
    fetchSeoOverview();
    fetchSeoIssues();
  }, [selectedIssueType, selectedSeverity]);

  const fetchSeoOverview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/superadmin/seo/overview');
      setSeoOverview(response.data);
    } catch (error) {
      console.error('Error fetching SEO overview:', error);
      toast.error('Failed to load SEO overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeoIssues = async () => {
    try {
      setIssuesLoading(true);
      const params = new URLSearchParams();
      if (selectedIssueType !== 'all') params.append('page_type', selectedIssueType);
      if (selectedSeverity) params.append('severity', selectedSeverity);

      const response = await apiClient.get(`/superadmin/seo/issues?${params}`);
      setSeoIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching SEO issues:', error);
      toast.error('Failed to load SEO issues');
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleGenerateTemplates = async (pageType, count = 10) => {
    try {
      setBulkUpdateLoading(true);
      const response = await apiClient.post('/superadmin/seo/generate-templates', null, {
        params: { page_type: pageType, count }
      });
      toast.success(response.data.message);
      fetchSeoOverview();
      fetchSeoIssues();
    } catch (error) {
      console.error('Error generating templates:', error);
      toast.error('Failed to generate SEO templates');
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleGenerateJsonLD = async (contentType, limit = 100) => {
    try {
      setBulkUpdateLoading(true);
      const response = await apiClient.post('/superadmin/seo/generate-json-ld', null, {
        params: { content_type: contentType, limit }
      });
      
      const { results } = response.data;
      const totalUpdated = results.total_updated;
      
      if (totalUpdated > 0) {
        toast.success(`Generated JSON-LD for ${totalUpdated} items (${results.tools_updated} tools, ${results.blogs_updated} blogs)`);
      } else {
        toast.info('All items already have JSON-LD data');
      }
      
      if (results.errors && results.errors.length > 0) {
        console.warn('JSON-LD generation errors:', results.errors);
        toast.warning(`${results.errors.length} items had errors during generation`);
      }
      
      fetchSeoOverview();
      fetchSeoIssues();
    } catch (error) {
      console.error('Error generating JSON-LD:', error);
      toast.error('Failed to generate JSON-LD structured data');
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to update');
      return;
    }

    try {
      setBulkUpdateLoading(true);
      const targetType = selectedItems[0].page_type === 'tool' ? 'tools' : 'blogs';
      const targetIds = selectedItems.map(item => item.page_id);

      await apiClient.post('/superadmin/seo/bulk-update', {
        target_type: targetType,
        target_ids: targetIds,
        seo_data: bulkUpdateData
      });

      toast.success(`Updated ${selectedItems.length} items successfully`);
      setShowBulkUpdateModal(false);
      setSelectedItems([]);
      setBulkUpdateData({ seo_title: '', seo_description: '', seo_keywords: '' });
      fetchSeoOverview();
      fetchSeoIssues();
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast.error('Failed to update items');
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredIssues = seoIssues.filter(issue =>
    !searchTerm ||
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.issues.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
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
            Super Admin SEO Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor, analyze, and optimize SEO across all content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchSeoOverview();
              fetchSeoIssues();
            }}
            disabled={loading || issuesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || issuesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* SEO Overview Stats */}
      {seoOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">SEO Health Score</p>
                  <p className="text-3xl font-bold text-gray-900">{seoOverview.overview.seo_health_score}%</p>
                  <p className="text-xs text-gray-500">
                    {seoOverview.overview.seo_optimized} of {seoOverview.overview.total_pages} pages
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  seoOverview.overview.seo_health_score >= 80 ? 'bg-green-100' :
                  seoOverview.overview.seo_health_score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Target className={`h-6 w-6 ${
                    seoOverview.overview.seo_health_score >= 80 ? 'text-green-600' :
                    seoOverview.overview.seo_health_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tools SEO</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoOverview.tools.completion_rate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {seoOverview.tools.with_seo} of {seoOverview.tools.total} optimized
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Blogs SEO</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoOverview.blogs.completion_rate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {seoOverview.blogs.with_seo} of {seoOverview.blogs.total} optimized
                  </p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Critical Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoOverview.overview.critical_issues}
                  </p>
                  <p className="text-xs text-gray-500">Require immediate attention</p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">SEO Issues</TabsTrigger>
          <TabsTrigger value="tools">Tools Management</TabsTrigger>
          <TabsTrigger value="blogs">Blogs Management</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-6">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search issues by title, path, or issue type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedIssueType}
                  onChange={(e) => setSelectedIssueType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="tools">Tools</option>
                  <option value="blogs">Blogs</option>
                </select>

                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {selectedItems.length > 0 && (
                  <Button onClick={() => setShowBulkUpdateModal(true)}>
                    Bulk Update ({selectedItems.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <div className="space-y-4">
            {issuesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <Card key={issue.page_id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.some(item => item.page_id === issue.page_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, issue]);
                            } else {
                              setSelectedItems(selectedItems.filter(item => item.page_id !== issue.page_id));
                            }
                          }}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              issue.page_type === 'tool' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {issue.page_type === 'tool' ? 
                                <Settings className="h-5 w-5 text-blue-600" /> : 
                                <FileText className="h-5 w-5 text-purple-600" />
                              }
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                              <p className="text-sm text-blue-600 font-mono">{issue.page_path}</p>
                            </div>
                            <Badge className={`${getSeverityColor(issue.severity)} border flex items-center gap-1`}>
                              {getSeverityIcon(issue.severity)}
                              {issue.severity}
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-red-700 mb-2">Issues Found:</h4>
                            <ul className="space-y-1">
                              {issue.issues.map((issueText, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                  <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                  {issueText}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Recommendations:</h4>
                            <ul className="space-y-1">
                              {issue.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Lightbulb className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Navigate to edit page for the specific item
                            const editPath = issue.page_type === 'tool' 
                              ? `/superadmin/tools?edit=${issue.page_id}`
                              : `/superadmin/blogs?edit=${issue.page_id}`;
                            window.open(editPath, '_blank');
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(issue.page_path, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">
                    No SEO issues found matching your current filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SEO Automation Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Generate SEO Templates</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically generate SEO titles, descriptions, and keywords for items missing SEO data.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateTemplates('tools')}
                      disabled={bulkUpdateLoading}
                    >
                      Generate for Tools
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateTemplates('blogs')}
                      disabled={bulkUpdateLoading}
                    >
                      Generate for Blogs
                    </Button>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Bulk SEO Validation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Validate SEO compliance across all content and generate improvement reports.
                  </p>
                  <Button size="sm" variant="outline" disabled>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Run Full Audit (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-6">
              Bulk Update SEO ({selectedItems.length} items)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <input
                  type="text"
                  value={bulkUpdateData.seo_title}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, seo_title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to skip this field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <textarea
                  value={bulkUpdateData.seo_description}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, seo_description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to skip this field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SEO Keywords</label>
                <input
                  type="text"
                  value={bulkUpdateData.seo_keywords}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, seo_keywords: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleBulkUpdate} disabled={bulkUpdateLoading}>
                  {bulkUpdateLoading ? 'Updating...' : 'Update Selected Items'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBulkUpdateModal(false);
                    setSelectedItems([]);
                    setBulkUpdateData({ seo_title: '', seo_description: '', seo_keywords: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bulkUpdateLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Processing SEO updates...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSEO;