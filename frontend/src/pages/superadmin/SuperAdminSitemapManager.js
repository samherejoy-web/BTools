import React, { useEffect, useState } from 'react';
import { 
  Map,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Globe,
  MapPin,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate, formatNumber } from '../../utils/formatters';
import LocationForm from './components/LocationForm';
import BulkLocationsModal from './components/BulkLocationsModal';

const SuperAdminSitemapManager = () => {
  const [locations, setLocations] = useState([]);
  const [sitemapEntries, setSitemapEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);
  const [showBulkLocationsModal, setShowBulkLocationsModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLocations(),
        fetchSitemapEntries()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('location_type', selectedType);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/locations?${params}`);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchSitemapEntries = async () => {
    try {
      const response = await apiClient.get('/admin/sitemap-entries');
      setSitemapEntries(response.data);
    } catch (error) {
      console.error('Error fetching sitemap entries:', error);
    }
  };

  const handleCreateLocation = async (locationData) => {
    try {
      await apiClient.post('/admin/locations', locationData);
      toast.success('Location created successfully');
      setShowCreateLocationModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error('Failed to create location');
    }
  };

  const handleUpdateLocation = async (locationId, locationData) => {
    try {
      await apiClient.put(`/admin/locations/${locationId}`, locationData);
      toast.success('Location updated successfully');
      setSelectedLocation(null);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      await apiClient.delete(`/admin/locations/${locationId}`);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const handleGenerateSitemap = async (regenerate = false) => {
    try {
      setGenerating(true);
      const response = await apiClient.post(`/admin/sitemap/generate?regenerate=${regenerate}`);
      toast.success(response.data.message);
      fetchSitemapEntries();
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast.error('Failed to generate sitemap entries');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkCreateLocations = async (locationsData) => {
    try {
      const response = await apiClient.post('/admin/locations/bulk-create', locationsData);
      toast.success(response.data.message);
      if (response.data.errors.length > 0) {
        console.warn('Bulk create errors:', response.data.errors);
      }
      setShowBulkLocationsModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Error bulk creating locations:', error);
      toast.error('Failed to bulk create locations');
    }
  };

  const getLocationTypeBadge = (type) => {
    const variants = {
      city: 'bg-blue-100 text-blue-800',
      country: 'bg-green-100 text-green-800'
    };
    return variants[type] || variants.city;
  };

  const getPageTypeBadge = (pageType) => {
    const variants = {
      tool_location: 'bg-purple-100 text-purple-800',
      category_location: 'bg-indigo-100 text-indigo-800',
      static: 'bg-gray-100 text-gray-800'
    };
    return variants[pageType] || variants.static;
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
            <Map className="h-8 w-8" />
            Sitemap & Locations Manager
          </h1>
          <p className="text-gray-600 mt-1">Manage locations and generate SEO-optimized sitemaps</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => handleGenerateSitemap(false)}
            disabled={generating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Sitemap'}
          </Button>
          <Button 
            onClick={() => handleGenerateSitemap(true)}
            disabled={generating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Regenerate All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sitemap'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sitemap Entries ({sitemapEntries.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search locations or entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        
        {activeTab === 'locations' && (
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="city">Cities</option>
            <option value="country">Countries</option>
          </select>
        )}

        {activeTab === 'locations' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateLocationModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
            <Button 
              onClick={() => setShowBulkLocationsModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Add
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(location => (
            <Card key={location.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {location.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getLocationTypeBadge(location.type)}>
                        {location.type}
                      </Badge>
                      {location.country_code && (
                        <Badge variant="outline">{location.country_code}</Badge>
                      )}
                      <Badge className={location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {location.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Slug: <code className="bg-gray-100 px-1 rounded">{location.slug}</code></div>
                  <div>Created: {formatDate(location.created_at)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          {sitemapEntries.map(entry => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {entry.url_path}
                      </code>
                      <Badge className={getPageTypeBadge(entry.page_type)}>
                        {entry.page_type}
                      </Badge>
                      <Badge className={entry.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      {entry.tool_name && <span>Tool: {entry.tool_name}</span>}
                      {entry.location_name && <span>Location: {entry.location_name}</span>}
                      <span>Priority: {entry.priority}</span>
                      <span>Frequency: {entry.change_frequency}</span>
                      <span>Modified: {formatDate(entry.last_modified)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateLocationModal && (
        <LocationForm
          onSubmit={handleCreateLocation}
          onClose={() => setShowCreateLocationModal(false)}
        />
      )}

      {selectedLocation && (
        <LocationForm
          location={selectedLocation}
          onSubmit={(data) => handleUpdateLocation(selectedLocation.id, data)}
          onClose={() => setSelectedLocation(null)}
          isEdit={true}
        />
      )}

      {showBulkLocationsModal && (
        <BulkLocationsModal
          onSubmit={handleBulkCreateLocations}
          onClose={() => setShowBulkLocationsModal(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminSitemapManager;