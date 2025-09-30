import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { 
  Edit, 
  Eye, 
  EyeOff, 
  Plus,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const SuperAdminStaticPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/superadmin/static-pages');
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (page) => {
    setEditingPage({ ...page });
    setIsEditing(true);
  };

  const handleSavePage = async () => {
    try {
      if (!editingPage.page_key || !editingPage.title || !editingPage.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      await apiClient.put(`/superadmin/static-pages/${editingPage.page_key}`, {
        title: editingPage.title,
        content: editingPage.content,
        meta_description: editingPage.meta_description,
        is_published: editingPage.is_published
      });

      toast.success('Page updated successfully');
      setIsEditing(false);
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  };

  const togglePageStatus = async (page) => {
    try {
      await apiClient.put(`/superadmin/static-pages/${page.page_key}`, {
        is_published: !page.is_published
      });

      toast.success(`Page ${!page.is_published ? 'published' : 'unpublished'} successfully`);
      fetchPages();
    } catch (error) {
      console.error('Error updating page status:', error);
      toast.error('Failed to update page status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Static Pages Management
        </h1>
        <p className="text-gray-600">
          Manage your website's static pages like About, Contact, Privacy Policy, etc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {page.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    /{page.page_key}
                  </p>
                </div>
                <Badge 
                  className={page.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }
                >
                  {page.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {page.meta_description || 'No description available'}
              </p>
              
              <div className="text-xs text-gray-500 mb-4">
                Updated: {new Date(page.updated_at).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditPage(page)}
                  className="flex-1"
                  data-testid={`edit-page-${page.page_key}`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePageStatus(page)}
                  data-testid={`toggle-page-${page.page_key}`}
                >
                  {page.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/${page.page_key}`, '_blank')}
                  disabled={!page.is_published}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Page Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Page: {editingPage?.title}
            </DialogTitle>
          </DialogHeader>
          
          {editingPage && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="page-title-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={editingPage.meta_description || ''}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    meta_description: e.target.value
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO meta description for this page"
                  data-testid="page-meta-description-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content *
                </label>
                <textarea
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    content: e.target.value
                  })}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="HTML content for the page"
                  data-testid="page-content-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={editingPage.is_published || false}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    is_published: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="page-published-checkbox"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Published (visible to public)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingPage(null);
                  }}
                  data-testid="cancel-edit-page"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSavePage}
                  data-testid="save-page-changes"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminStaticPages;