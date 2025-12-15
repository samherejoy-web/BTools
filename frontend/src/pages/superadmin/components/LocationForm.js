import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';

const LocationForm = ({ location, onSubmit, onClose, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    type: location?.type || 'city',
    country_code: location?.country_code || '',
    seo_title_template: location?.seo_title_template || '',
    seo_description_template: location?.seo_description_template || '',
    is_active: location?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">
          {isEdit ? 'Edit Location' : 'Create New Location'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., New York, USA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="city">City</option>
                <option value="country">Country</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country Code</label>
              <input
                type="text"
                value={formData.country_code}
                onChange={(e) => setFormData({...formData, country_code: e.target.value})}
                placeholder="e.g., US, UK"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active Location</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SEO Title Template</label>
            <input
              type="text"
              value={formData.seo_title_template}
              onChange={(e) => setFormData({...formData, seo_title_template: e.target.value})}
              placeholder="Best {tool_name} for {location_name} | MarketMindAI"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use {'{'} tool_name{'}'} and {'{'} location_name {'}'} as placeholders</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SEO Description Template</label>
            <textarea
              value={formData.seo_description_template}
              onChange={(e) => setFormData({...formData, seo_description_template: e.target.value})}
              rows={3}
              placeholder="Discover the top {tool_name} tools for {location_name}. Compare features, pricing, and reviews."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1">
              {isEdit ? 'Update Location' : 'Create Location'}
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

export default LocationForm;
