import React, { useEffect, useState } from 'react';
import { 
  Settings,
  Save,
  RefreshCw,
  ExternalLink,
  Globe,
  Twitter,
  Linkedin,
  Github,
  MessageSquare,
  Facebook,
  Link2,
  Upload,
  Image,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import Logo from '../../components/ui/Logo';
import apiClient from '../../utils/apiClient';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    social_twitter_url: '',
    social_linkedin_url: '',
    social_github_url: '',
    social_discord_url: '',
    social_facebook_url: ''
  });
  const [logoData, setLogoData] = useState({
    site_logo_url: '',
    site_logo_alt_text: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/superadmin/settings');
      const settingsData = {};
      
      response.data.forEach(setting => {
        settingsData[setting.key] = setting.value;
      });
      
      setSettings(settingsData);
      setFormData({
        social_twitter_url: settingsData.social_twitter_url || '',
        social_linkedin_url: settingsData.social_linkedin_url || '',
        social_github_url: settingsData.social_github_url || '',
        social_discord_url: settingsData.social_discord_url || '',
        social_facebook_url: settingsData.social_facebook_url || ''
      });
      setLogoData({
        site_logo_url: settingsData.site_logo_url || '',
        site_logo_alt_text: settingsData.site_logo_alt_text || 'MarketMindAI'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setSaving(true);
      await apiClient.post('/superadmin/settings/initialize-social-urls');
      toast.success('Default social media URLs initialized');
      fetchSettings();
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast.error('Failed to initialize default settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Update each setting
      for (const [key, value] of Object.entries(formData)) {
        await apiClient.put(`/superadmin/settings/${key}`, {
          value: value,
          description: getFieldDescription(key)
        });
      }

      // Update logo alt text if changed
      if (logoData.site_logo_alt_text !== settings.site_logo_alt_text) {
        await apiClient.put('/superadmin/settings/site_logo_alt_text', {
          value: logoData.site_logo_alt_text,
          description: 'Alt text for site logo (SEO and accessibility)'
        });
      }
      
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, SVG, WebP)');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is 2MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB`);
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', logoData.site_logo_alt_text || 'MarketMindAI Logo');

      const response = await apiClient.post('/superadmin/settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Logo uploaded successfully!');
      fetchSettings(); // Refresh settings to get new logo URL
      
      // Clear the preview
      setLogoPreview(null);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm('Are you sure you want to delete the current logo? This will revert to the default MarketMindAI logo.')) {
      return;
    }

    try {
      setSaving(true);
      await apiClient.delete('/superadmin/settings/delete-logo');
      toast.success('Logo deleted successfully');
      fetchSettings(); // Refresh settings
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast.error('Failed to delete logo');
    } finally {
      setSaving(false);
    }
  };

  const handleFilePreview = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFieldDescription = (key) => {
    const descriptions = {
      social_twitter_url: 'X (Twitter) profile URL',
      social_linkedin_url: 'LinkedIn company page URL', 
      social_github_url: 'GitHub organization URL',
      social_discord_url: 'Discord community server URL',
      social_facebook_url: 'Facebook page URL'
    };
    return descriptions[key] || '';
  };

  const getFieldIcon = (key) => {
    const icons = {
      social_twitter_url: Twitter,
      social_linkedin_url: Linkedin,
      social_github_url: Github,
      social_discord_url: MessageSquare,
      social_facebook_url: Facebook
    };
    return icons[key] || Link2;
  };

  const getFieldLabel = (key) => {
    const labels = {
      social_twitter_url: 'X (Twitter) URL',
      social_linkedin_url: 'LinkedIn URL',
      social_github_url: 'GitHub URL',
      social_discord_url: 'Discord URL',
      social_facebook_url: 'Facebook URL'
    };
    return labels[key] || key;
  };

  const testUrl = (url) => {
    if (url && url.trim()) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Site Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage social media URLs and site configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Initialize Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Logo Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Site Logo Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload and manage your site logo. Supports PNG, JPG, JPEG, SVG, and WebP formats. Max size: 2MB.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Current Logo</h4>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Logo size="lg" showText={true} className="border border-gray-200 bg-white p-2 rounded-lg" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {logoData.site_logo_url ? 'Custom logo is active' : 'Using default MarketMind logo'}
                </p>
                {logoData.site_logo_url && (
                  <p className="text-xs text-gray-500">
                    Logo URL: {logoData.site_logo_url}
                  </p>
                )}
              </div>
              {logoData.site_logo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteLogo}
                  disabled={saving}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Logo
                </Button>
              )}
            </div>
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Logo Alt Text (SEO & Accessibility)
            </label>
            <input
              type="text"
              value={logoData.site_logo_alt_text}
              onChange={(e) => setLogoData({...logoData, site_logo_alt_text: e.target.value})}
              placeholder="Enter alt text for the logo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              This text is used for screen readers and when the logo fails to load.
            </p>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Upload New Logo</h4>
            
            {/* File Input */}
            <div className="space-y-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                onChange={(e) => {
                  handleFilePreview(e);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white file:hover:bg-blue-700"
                id="logo-upload"
              />
              
              {/* Upload Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Upload Requirements:</p>
                  <ul className="text-xs space-y-0.5">
                    <li>• Supported formats: PNG, JPG, JPEG, SVG, WebP</li>
                    <li>• Maximum file size: 2MB</li>
                    <li>• Recommended dimensions: 200×60px or similar ratio</li>
                    <li>• Transparent background recommended for PNG files</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {logoPreview && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Preview</h5>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-12 max-w-48 object-contain"
                    style={{ maxHeight: '48px' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Preview of your new logo</p>
                  </div>
                  <Button
                    onClick={(e) => {
                      const fileInput = document.getElementById('logo-upload');
                      handleLogoUpload({ target: fileInput });
                    }}
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* URL Method */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-gray-700">Or Use Logo URL</h4>
            <div className="space-y-2">
              <input
                type="url"
                value={logoData.site_logo_url}
                onChange={(e) => setLogoData({...logoData, site_logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Enter a direct URL to your logo image. This will override any uploaded logo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media URLs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media URLs
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure social media profile URLs that appear in the footer and throughout the site
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(formData).map(([key, value]) => {
            const Icon = getFieldIcon(key);
            const label = getFieldLabel(key);
            
            return (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testUrl(value)}
                    disabled={!value?.trim()}
                    className="px-3"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {getFieldDescription(key)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Current Settings Preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Current Settings Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Preview how these URLs will appear to users
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(formData).map(([key, value]) => {
              const Icon = getFieldIcon(key);
              const label = getFieldLabel(key);
              
              return (
                <div key={key} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{label}</span>
                  {value ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not set</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• URLs should include the full protocol (https://)</li>
            <li>• Changes will be reflected immediately in the footer and other site components</li>
            <li>• Use the "Test" button to verify URLs open correctly</li>
            <li>• Leave fields empty to hide those social links from the site</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSettings;