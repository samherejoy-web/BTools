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
  Save, 
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const SuperAdminSiteSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/superadmin/site-settings');
      setSettings(response.data);
      
      // Initialize edited settings
      const initialSettings = {};
      response.data.forEach(setting => {
        initialSettings[setting.setting_key] = setting.setting_value || '';
      });
      setEditedSettings(initialSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      await apiClient.put('/superadmin/site-settings/bulk', {
        settings: editedSettings
      });

      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getSettingIcon = (settingKey) => {
    const iconMap = {
      contact_email: Mail,
      support_email: Mail,
      business_email: Mail,
      phone_number: Phone,
      contact_address: MapPin,
      company_name: Building,
      github_url: ExternalLink,
      linkedin_url: Users,
      twitter_url: MessageSquare,
      discord_url: MessageSquare
    };
    
    return iconMap[settingKey] || Building;
  };

  const getSettingCategory = (settingKey) => {
    if (settingKey.includes('email')) return 'Contact';
    if (settingKey.includes('url') || settingKey.includes('github') || settingKey.includes('linkedin') || settingKey.includes('twitter') || settingKey.includes('discord')) return 'Social Media';
    if (settingKey === 'company_name') return 'Company Info';
    if (settingKey === 'phone_number' || settingKey === 'contact_address') return 'Contact';
    return 'General';
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = getSettingCategory(setting.setting_key);
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {});

  const hasChanges = () => {
    return settings.some(setting => 
      editedSettings[setting.setting_key] !== setting.setting_value
    );
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Site Settings
          </h1>
          <p className="text-gray-600">
            Manage your website's configuration and contact information.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={loading}
            data-testid="refresh-settings"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges()}
            data-testid="save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges() && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You have unsaved changes. Don't forget to save your modifications.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                {category} Settings
                <Badge className="ml-2" variant="secondary">
                  {categorySettings.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categorySettings.map((setting) => {
                  const Icon = getSettingIcon(setting.setting_key);
                  
                  return (
                    <div key={setting.id} className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Icon className="w-4 h-4 mr-2 text-gray-500" />
                        {setting.description || setting.setting_key}
                        {!setting.is_public && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Private
                          </Badge>
                        )}
                      </label>
                      
                      {setting.setting_type === 'email' ? (
                        <input
                          type="email"
                          value={editedSettings[setting.setting_key] || ''}
                          onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${setting.description?.toLowerCase() || setting.setting_key}`}
                          data-testid={`setting-${setting.setting_key}`}
                        />
                      ) : setting.setting_type === 'url' ? (
                        <div className="flex">
                          <input
                            type="url"
                            value={editedSettings[setting.setting_key] || ''}
                            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter ${setting.description?.toLowerCase() || setting.setting_key}`}
                            data-testid={`setting-${setting.setting_key}`}
                          />
                          {editedSettings[setting.setting_key] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(editedSettings[setting.setting_key], '_blank')}
                              className="rounded-l-none border-l-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={editedSettings[setting.setting_key] || ''}
                          onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${setting.description?.toLowerCase() || setting.setting_key}`}
                          data-testid={`setting-${setting.setting_key}`}
                        />
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Key: {setting.setting_key}
                        {setting.updated_at && (
                          <span className="ml-2">
                            • Updated: {new Date(setting.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          How Site Settings Work
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Public Settings:</strong> These settings are visible to website visitors and can be displayed on your site.</p>
          <p>• <strong>Private Settings:</strong> These are internal settings that are only visible to admins.</p>
          <p>• <strong>URL Settings:</strong> Make sure to include the full URL including http:// or https://</p>
          <p>• <strong>Email Settings:</strong> These will be used for contact forms and site communications.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSiteSettings;