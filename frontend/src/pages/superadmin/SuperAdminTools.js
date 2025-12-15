import React, { useEffect, useState } from 'react';
import { 
  Settings,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Star,
  Eye,
  TrendingUp,
  Globe,
  Upload,
  Download,
  Image,
  Link,
  Tag,
  Calendar,
  BarChart3,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber, formatRating } from '../../utils/formatters';

// Extract ToolForm component to prevent recreation on each render
const ToolForm = ({ tool, onSubmit, onClose, isEdit = false, categories = [] }) => {
const [formData, setFormData] = useState({
  name: tool?.name || '',
  description: tool?.description || '',
  short_description: tool?.short_description || '',
  url: tool?.url || '',
  logo_url: tool?.logo_url || '',
  screenshot_url: tool?.screenshot_url || '',
  pricing_type: tool?.pricing_type || 'free',
  pricing_details: tool?.pricing_details ? JSON.stringify(tool.pricing_details, null, 2) : '',
  features: tool?.features?.join(', ') || '',
  pros: tool?.pros?.join(', ') || '',
  cons: tool?.cons?.join(', ') || '',
  category_ids: tool?.categories?.map(c => c.id) || [],
  is_featured: tool?.is_featured || false,
  is_active: tool?.is_active !== false,
  seo_title: tool?.seo_title || '',
  seo_description: tool?.seo_description || '',
  seo_keywords: tool?.seo_keywords || '',
  // New company-related fields
  linkedin_url: tool?.linkedin_url || '',
  company_funding: tool?.company_funding ? JSON.stringify(tool.company_funding, null, 2) : '',
  company_news: tool?.company_news || '',
  company_location: tool?.company_location || '',
  company_founders: tool?.company_founders ? JSON.stringify(tool.company_founders, null, 2) : '',
  about: tool?.about || '',
  started_on: tool?.started_on || '',
  logo_thumbnail_url: tool?.logo_thumbnail_url || ''
});

const [validationErrors, setValidationErrors] = useState({});
const [jsonValidation, setJsonValidation] = useState({
  pricing_details: null,
  company_funding: null,
  company_founders: null
});

// Validate JSON field in real-time
const validateJsonField = (fieldName, value) => {
  if (!value || value.trim() === '') {
    setJsonValidation(prev => ({ ...prev, [fieldName]: 'valid' }));
    return true;
  }
  try {
    JSON.parse(value);
    setJsonValidation(prev => ({ ...prev, [fieldName]: 'valid' }));
    return true;
  } catch (e) {
    setJsonValidation(prev => ({ ...prev, [fieldName]: e.message }));
    return false;
  }
};

// Validate URL format
const validateUrl = (url) => {
  if (!url || url.trim() === '') return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate date format (YYYY-MM-DD or YYYY)
const validateDate = (date) => {
  if (!date || date.trim() === '') return true;
  const yearPattern = /^\d{4}$/;
  const fullDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  return yearPattern.test(date) || fullDatePattern.test(date);
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  const errors = {};

  // Validate required fields
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Tool name is required';
  }

  // Validate URLs
  if (formData.url && !validateUrl(formData.url)) {
    errors.url = 'Invalid URL format. Must start with http:// or https://';
  }
  if (formData.logo_url && !validateUrl(formData.logo_url)) {
    errors.logo_url = 'Invalid URL format';
  }
  if (formData.screenshot_url && !validateUrl(formData.screenshot_url)) {
    errors.screenshot_url = 'Invalid URL format';
  }
  if (formData.linkedin_url && !validateUrl(formData.linkedin_url)) {
    errors.linkedin_url = 'Invalid URL format';
  }
  if (formData.logo_thumbnail_url && !validateUrl(formData.logo_thumbnail_url)) {
    errors.logo_thumbnail_url = 'Invalid URL format';
  }

  // Validate date
  if (formData.started_on && !validateDate(formData.started_on)) {
    errors.started_on = 'Invalid date format. Use YYYY or YYYY-MM-DD (e.g., 2020 or 2020-01-15)';
  }

  // Helper function to parse JSON fields safely
  const parseJsonField = (field, fieldName) => {
    if (!field || field.trim() === '') return null;
    try {
      const parsed = JSON.parse(field);
      return parsed;
    } catch (e) {
      errors[fieldName] = `Invalid JSON format: ${e.message}`;
      return null;
    }
  };
  
  // Parse and validate JSON fields
  const pricingDetails = parseJsonField(formData.pricing_details, 'pricing_details');
  const companyFunding = parseJsonField(formData.company_funding, 'company_funding');
  const companyFounders = parseJsonField(formData.company_founders, 'company_founders');

  // Validate company_funding structure if provided
  if (companyFunding && typeof companyFunding !== 'object') {
    errors.company_funding = 'Must be a valid JSON object with keys like "amount", "round", "date"';
  }

  // Validate company_founders structure if provided
  if (companyFounders && !Array.isArray(companyFounders)) {
    errors.company_founders = 'Must be a valid JSON array of objects with "name" and "role" keys';
  }

  // If there are validation errors, show them and prevent submission
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    toast.error('Please fix validation errors before submitting');
    return;
  }

  setValidationErrors({});
  
  const submitData = {
    ...formData,
    features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
    pros: formData.pros ? formData.pros.split(',').map(p => p.trim()).filter(p => p) : [],
    cons: formData.cons ? formData.cons.split(',').map(c => c.trim()).filter(c => c) : [],
    // Parse JSON fields
    pricing_details: pricingDetails,
    company_funding: companyFunding,
    company_founders: companyFounders
  };
  onSubmit(submitData);
};

return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">
        {isEdit ? 'Edit Tool' : 'Create New Tool'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tool Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.name && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({...formData, short_description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.url ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {validationErrors.url && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
              placeholder="https://example.com/logo.png"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.logo_url ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {validationErrors.logo_url && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.logo_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Screenshot URL</label>
            <input
              type="url"
              value={formData.screenshot_url}
              onChange={(e) => setFormData({...formData, screenshot_url: e.target.value})}
              placeholder="https://example.com/screenshot.png"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.screenshot_url ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {validationErrors.screenshot_url && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.screenshot_url}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pricing Type</label>
            <select
              value={formData.pricing_type}
              onChange={(e) => setFormData({...formData, pricing_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Pricing Details (JSON)</label>
              <button
                type="button"
                onClick={() => validateJsonField('pricing_details', formData.pricing_details)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Validate JSON
              </button>
            </div>
            <textarea
              value={formData.pricing_details}
              onChange={(e) => {
                setFormData({...formData, pricing_details: e.target.value});
                validateJsonField('pricing_details', e.target.value);
              }}
              rows={4}
              placeholder='{"free": "Free tier", "basic": "$9/month", "pro": "$29/month"}'
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                validationErrors.pricing_details ? 'border-red-500 bg-red-50' : 
                jsonValidation.pricing_details === 'valid' ? 'border-green-500 bg-green-50' :
                jsonValidation.pricing_details ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {validationErrors.pricing_details && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.pricing_details}</p>
            )}
            {jsonValidation.pricing_details && jsonValidation.pricing_details !== 'valid' && (
              <p className="text-red-600 text-xs mt-1">JSON Error: {jsonValidation.pricing_details}</p>
            )}
            {jsonValidation.pricing_details === 'valid' && formData.pricing_details && (
              <p className="text-green-600 text-xs mt-1">✓ Valid JSON format</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Example: {`{"free": "Free tier", "basic": "$9/month", "pro": "$29/month"}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <select
              multiple
              value={formData.category_ids}
              onChange={(e) => setFormData({
                ...formData, 
                category_ids: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
              rows={3}
              placeholder="Feature 1, Feature 2, Feature 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate features with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pros (comma-separated)</label>
            <textarea
              value={formData.pros}
              onChange={(e) => setFormData({...formData, pros: e.target.value})}
              rows={2}
              placeholder="Easy to use, Great UI, Fast performance"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate pros with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cons (comma-separated)</label>
            <textarea
              value={formData.cons}
              onChange={(e) => setFormData({...formData, cons: e.target.value})}
              rows={2}
              placeholder="Expensive, Limited features, Learning curve"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate cons with commas</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="is_featured" className="text-sm font-medium">Featured Tool</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active Tool</label>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="lg:col-span-2 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Keywords</label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="lg:col-span-2 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Location</label>
              <input
                type="text"
                value={formData.company_location}
                onChange={(e) => setFormData({...formData, company_location: e.target.value})}
                placeholder="e.g., San Francisco, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Founded Date</label>
              <input
                type="text"
                value={formData.started_on}
                onChange={(e) => setFormData({...formData, started_on: e.target.value})}
                placeholder="2020 or 2020-01-15"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.started_on ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.started_on && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.started_on}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Format: YYYY or YYYY-MM-DD</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/company/..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.linkedin_url ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.linkedin_url && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.linkedin_url}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo Thumbnail URL</label>
              <input
                type="url"
                value={formData.logo_thumbnail_url}
                onChange={(e) => setFormData({...formData, logo_thumbnail_url: e.target.value})}
                placeholder="https://example.com/thumbnail.png"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.logo_thumbnail_url ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.logo_thumbnail_url && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.logo_thumbnail_url}</p>
              )}
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">About Company</label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({...formData, about: e.target.value})}
                rows={3}
                placeholder="Detailed company description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">Company News</label>
              <textarea
                value={formData.company_news}
                onChange={(e) => setFormData({...formData, company_news: e.target.value})}
                rows={2}
                placeholder="Recent news about the company..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Company Funding (JSON)</label>
                <button
                  type="button"
                  onClick={() => validateJsonField('company_funding', formData.company_funding)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Validate JSON
                </button>
              </div>
              <textarea
                value={formData.company_funding}
                onChange={(e) => {
                  setFormData({...formData, company_funding: e.target.value});
                  validateJsonField('company_funding', e.target.value);
                }}
                rows={3}
                placeholder='{"amount": "10M", "round": "Series A", "date": "2023-01-01"}'
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                  validationErrors.company_funding ? 'border-red-500 bg-red-50' : 
                  jsonValidation.company_funding === 'valid' ? 'border-green-500 bg-green-50' :
                  jsonValidation.company_funding ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.company_funding && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.company_funding}</p>
              )}
              {jsonValidation.company_funding && jsonValidation.company_funding !== 'valid' && (
                <p className="text-red-600 text-xs mt-1">JSON Error: {jsonValidation.company_funding}</p>
              )}
              {jsonValidation.company_funding === 'valid' && formData.company_funding && (
                <p className="text-green-600 text-xs mt-1">✓ Valid JSON format</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Example: {`{"amount": "10M", "round": "Series A", "date": "2023-01-01"}`}
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Company Founders (JSON)</label>
                <button
                  type="button"
                  onClick={() => validateJsonField('company_founders', formData.company_founders)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Validate JSON
                </button>
              </div>
              <textarea
                value={formData.company_founders}
                onChange={(e) => {
                  setFormData({...formData, company_founders: e.target.value});
                  validateJsonField('company_founders', e.target.value);
                }}
                rows={3}
                placeholder='[{"name": "John Doe", "role": "CEO"}, {"name": "Jane Smith", "role": "CTO"}]'
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                  validationErrors.company_founders ? 'border-red-500 bg-red-50' : 
                  jsonValidation.company_founders === 'valid' ? 'border-green-500 bg-green-50' :
                  jsonValidation.company_founders ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.company_founders && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.company_founders}</p>
              )}
              {jsonValidation.company_founders && jsonValidation.company_founders !== 'valid' && (
                <p className="text-red-600 text-xs mt-1">JSON Error: {jsonValidation.company_founders}</p>
              )}
              {jsonValidation.company_founders === 'valid' && formData.company_founders && (
                <p className="text-green-600 text-xs mt-1">✓ Valid JSON array format</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Example: {`[{"name": "John Doe", "role": "CEO"}, {"name": "Jane Smith", "role": "CTO"}]`}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="lg:col-span-2 flex gap-3 pt-6 border-t">
          <Button type="submit" className="flex-1">
            {isEdit ? 'Update Tool' : 'Create Tool'}
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


const BulkUploadModal = ({ onClose, onUpload, downloadTemplate }) => {
const [file, setFile] = useState(null);

const handleSubmit = (e) => {
  e.preventDefault();
  if (file) {
    onUpload(file);
  }
};

return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Bulk Upload Tools</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Upload a CSV file with tool data</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={downloadTemplate} className="flex-1">
            Download Template
          </Button>
          <Button type="submit" className="flex-1">
            Upload Tools
          </Button>
        </div>
        <Button type="button" variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </form>
    </div>
  </div>
);
};

const SuperAdminTools = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    fetchTools();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiClient.get(`/superadmin/tools?${params}`);
      setTools(response.data);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateTool = async (toolData) => {
    try {
      await apiClient.post('/superadmin/tools', toolData);
      toast.success('Tool created successfully');
      setShowCreateModal(false);
      fetchTools();
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error('Failed to create tool');
    }
  };

  const handleUpdateTool = async (toolId, toolData) => {
    try {
      await apiClient.put(`/superadmin/tools/${toolId}`, toolData);
      toast.success('Tool updated successfully');
      setShowEditModal(false);
      setSelectedTool(null);
      fetchTools();
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error('Failed to update tool');
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    try {
      await apiClient.delete(`/superadmin/tools/${toolId}`);
      toast.success('Tool deleted successfully');
      fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    }
  };

  const handleBulkUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await apiClient.post('/superadmin/tools/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Bulk upload completed successfully');
      setShowBulkUpload(false);
      fetchTools();
    } catch (error) {
      console.error('Error with bulk upload:', error);
      toast.error('Failed to upload tools');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get('/superadmin/tools/csv-template');
      const { template, headers } = response.data;
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...template.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tools-template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const getPricingBadge = (pricingType) => {
    const variants = {
      free: 'bg-green-100 text-green-800',
      freemium: 'bg-blue-100 text-blue-800',
      paid: 'bg-orange-100 text-orange-800'
    };
    return variants[pricingType] || variants.free;
  };




  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
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
            Tools Management
          </h1>
          <p className="text-gray-600 mt-1">Manage platform tools, features, and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Plus className="h-4 w-4" />
            Add Tool
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
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
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{tool.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPricingBadge(tool.pricing_type)}>
                        {tool.pricing_type}
                      </Badge>
                      {tool.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTool(tool);
                      setShowEditModal(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTool(tool.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tool.short_description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{formatRating(tool.rating)}</span>
                  <span>({tool.review_count})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(tool.view_count)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={tool.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {tool.is_active ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                {tool.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(tool.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                  {tool.categories?.slice(0, 2).map((category) => (
                    <Badge key={category.id} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                  {tool.categories?.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tool.categories.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tools.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first tool to the platform.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Tool
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ToolForm
          onSubmit={handleCreateTool}
          onClose={() => setShowCreateModal(false)}
          categories={categories}
        />
      )}

      {showEditModal && selectedTool && (
        <ToolForm
          tool={selectedTool}
          onSubmit={(toolData) => handleUpdateTool(selectedTool.id, toolData)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTool(null);
          }}
          isEdit={true}
          categories={categories}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
          downloadTemplate={downloadTemplate}
        />
      )}
    </div>
  );
};

