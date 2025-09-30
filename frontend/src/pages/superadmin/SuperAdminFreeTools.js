import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const SuperAdminFreeTools = () => {
  const [freeTools, setFreeTools] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const categories = [
    'Analytics', 'Design', 'Development', 'Marketing', 'Productivity', 
    'Storage', 'Communication', 'CRM', 'SEO', 'Social Media'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [toolsRes, statsRes] = await Promise.all([
        apiClient.get('/superadmin/free-tools'),
        apiClient.get('/superadmin/free-tools/stats')
      ]);
      
      setFreeTools(toolsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching free tools:', error);
      toast.error('Failed to load free tools');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTool = () => {
    setEditingTool({
      name: '',
      description: '',
      url: '',
      icon_url: '',
      category: '',
      is_featured: false,
      is_active: true,
      order_index: freeTools.length + 1
    });
    setIsCreating(true);
  };

  const handleEditTool = (tool) => {
    setEditingTool({ ...tool });
    setIsEditing(true);
  };

  const handleSaveTool = async () => {
    try {
      if (!editingTool.name || !editingTool.description || !editingTool.url) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (isCreating) {
        await apiClient.post('/superadmin/free-tools', editingTool);
        toast.success('Free tool created successfully');
      } else {
        await apiClient.put(`/superadmin/free-tools/${editingTool.id}`, editingTool);
        toast.success('Free tool updated successfully');
      }

      setIsEditing(false);
      setIsCreating(false);
      setEditingTool(null);
      fetchData();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error('Failed to save tool');
    }
  };

  const handleDeleteTool = async (toolId, toolName) => {
    if (!window.confirm(`Are you sure you want to delete "${toolName}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/superadmin/free-tools/${toolId}`);
      toast.success('Free tool deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    }
  };

  const toggleToolStatus = async (tool) => {
    try {
      await apiClient.put(`/superadmin/free-tools/${tool.id}`, {
        is_active: !tool.is_active
      });

      toast.success(`Tool ${!tool.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating tool status:', error);
      toast.error('Failed to update tool status');
    }
  };

  const toggleFeatured = async (tool) => {
    try {
      await apiClient.put(`/superadmin/free-tools/${tool.id}`, {
        is_featured: !tool.is_featured
      });

      toast.success(`Tool ${!tool.is_featured ? 'featured' : 'unfeatured'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating tool featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const reorderTool = async (tool, direction) => {
    const newOrderIndex = direction === 'up' 
      ? Math.max(1, tool.order_index - 1)
      : tool.order_index + 1;

    try {
      await apiClient.put(`/superadmin/free-tools/${tool.id}/reorder`, null, {
        params: { new_order_index: newOrderIndex }
      });

      toast.success('Tool reordered successfully');
      fetchData();
    } catch (error) {
      console.error('Error reordering tool:', error);
      toast.error('Failed to reorder tool');
    }
  };

  const sortedFreeTools = [...freeTools].sort((a, b) => a.order_index - b.order_index);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Free Tools Management
          </h1>
          <p className="text-gray-600">
            Manage the free tools section that replaces the Resources section.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchData}
            data-testid="refresh-free-tools"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={handleCreateTool}
            data-testid="create-free-tool"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Free Tool
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Tools</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_tools || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Tools</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.active_tools || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Featured</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.featured_tools || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <EyeOff className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.inactive_tools || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {stats.category_breakdown && stats.category_breakdown.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tools by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.category_breakdown.map(category => (
                <Badge key={category.category} variant="secondary" className="px-3 py-1">
                  {category.category}: {category.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFreeTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
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
                      <span className="text-white font-bold text-sm">
                        {tool.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <p className="text-sm text-gray-500">{tool.category}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <Badge 
                    className={tool.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {tool.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  {tool.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Order: {tool.order_index}</span>
                <span>Updated: {new Date(tool.updated_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleEditTool(tool)}
                  data-testid={`edit-tool-${tool.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleToolStatus(tool)}
                  data-testid={`toggle-tool-${tool.id}`}
                >
                  {tool.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFeatured(tool)}
                  data-testid={`feature-tool-${tool.id}`}
                >
                  <Star className={`w-4 h-4 ${tool.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(tool.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex justify-between mt-3 pt-3 border-t">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reorderTool(tool, 'up')}
                    disabled={tool.order_index === 1}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reorderTool(tool, 'down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTool(tool.id, tool.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`delete-tool-${tool.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Tool Modal */}
      <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setIsCreating(false);
          setEditingTool(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Add New Free Tool' : 'Edit Free Tool'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTool && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    value={editingTool.name || ''}
                    onChange={(e) => setEditingTool({
                      ...editingTool,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="tool-name-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editingTool.category || ''}
                    onChange={(e) => setEditingTool({
                      ...editingTool,
                      category: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="tool-category-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={editingTool.description || ''}
                  onChange={(e) => setEditingTool({
                    ...editingTool,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="tool-description-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={editingTool.url || ''}
                  onChange={(e) => setEditingTool({
                    ...editingTool,
                    url: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  data-testid="tool-url-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL
                </label>
                <input
                  type="url"
                  value={editingTool.icon_url || ''}
                  onChange={(e) => setEditingTool({
                    ...editingTool,
                    icon_url: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/icon.png"
                  data-testid="tool-icon-input"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={editingTool.is_featured || false}
                    onChange={(e) => setEditingTool({
                      ...editingTool,
                      is_featured: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="tool-featured-checkbox"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700">
                    Featured Tool
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingTool.is_active || false}
                    onChange={(e) => setEditingTool({
                      ...editingTool,
                      is_active: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="tool-active-checkbox"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTool.order_index || 1}
                    onChange={(e) => setEditingTool({
                      ...editingTool,
                      order_index: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="tool-order-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setEditingTool(null);
                  }}
                  data-testid="cancel-tool-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSaveTool}
                  data-testid="save-tool"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? 'Create Tool' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminFreeTools;