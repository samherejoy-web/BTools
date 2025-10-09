import React, { useEffect, useState } from 'react';
import { 
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCw,
  Settings,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate } from '../../utils/formatters';

const SuperAdminFreeTools = () => {
  const [freeTools, setFreeTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    description: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFreeTools();
  }, []);

  const fetchFreeTools = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/superadmin/free-tools');
      setFreeTools(response.data.tools || []);
    } catch (error) {
      console.error('Error fetching free tools:', error);
      toast.error('Failed to load free tools');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.link.trim()) {
      toast.error('Name and link are required');
      return;
    }

    try {
      setSubmitLoading(true);
      
      if (editingTool) {
        await apiClient.put(`/superadmin/free-tools/${editingTool.id}`, formData);
        toast.success('Free tool updated successfully');
      } else {
        await apiClient.post('/superadmin/free-tools', formData);
        toast.success('Free tool created successfully');
      }
      
      await fetchFreeTools();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving free tool:', error);
      toast.error(error.response?.data?.detail || 'Failed to save free tool');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      link: tool.link,
      description: tool.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (toolId) => {
    try {
      await apiClient.delete(`/superadmin/free-tools/${toolId}`);
      toast.success('Free tool deleted successfully');
      await fetchFreeTools();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting free tool:', error);
      toast.error('Failed to delete free tool');
    }
  };

  const handleToggleActive = async (tool) => {
    try {
      await apiClient.put(`/superadmin/free-tools/${tool.id}`, {
        is_active: !tool.is_active
      });
      toast.success(`Tool ${tool.is_active ? 'deactivated' : 'activated'} successfully`);
      await fetchFreeTools();
    } catch (error) {
      console.error('Error toggling tool status:', error);
      toast.error('Failed to update tool status');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTool(null);
    setFormData({ name: '', link: '', description: '' });
  };

  const filteredTools = freeTools.filter(tool =>
    !searchTerm ||
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
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
            <Settings className="h-8 w-8" />
            Free Tools Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage free tools displayed in the footer and free tools page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchFreeTools}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Free Tool
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Tools</p>
                <p className="text-3xl font-bold text-gray-900">{freeTools.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Tools</p>
                <p className="text-3xl font-bold text-gray-900">
                  {freeTools.filter(tool => tool.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Inactive Tools</p>
                <p className="text-3xl font-bold text-gray-900">
                  {freeTools.filter(tool => !tool.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <EyeOff className="h-6 w-6 text-red-600" />
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
              placeholder="Search tools by name, link, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tools List */}
      <div className="space-y-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <Card key={tool.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        tool.is_active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Globe className={`h-5 w-5 ${
                          tool.is_active ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {tool.name}
                          <Badge className={`${
                            tool.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          } border`}>
                            {tool.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </h3>
                        <a 
                          href={tool.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1"
                        >
                          {tool.link}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {tool.description && (
                      <p className="text-gray-600 mb-3">{tool.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {formatDate(tool.created_at)}</span>
                      {tool.updated_at !== tool.created_at && (
                        <span>Updated: {formatDate(tool.updated_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(tool)}
                    >
                      {tool.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tool)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteConfirm(tool)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Free Tools Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'No tools match your search criteria.' : 'Get started by adding your first free tool.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Free Tool
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingTool ? 'Edit Free Tool' : 'Add New Free Tool'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tool Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tool name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tool Link *</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the tool (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : (editingTool ? 'Update Tool' : 'Add Tool')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Free Tool</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminFreeTools;