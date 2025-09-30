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
  Mail, 
  Users, 
  TrendingUp,
  UserCheck,
  UserMinus,
  Plus,
  Search,
  Download,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const SuperAdminNewsletter = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    fetchData();
  }, [showActiveOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, statsRes] = await Promise.all([
        apiClient.get(`/superadmin/newsletter/subscriptions?active_only=${showActiveOnly}&limit=100&search=${searchTerm}`),
        apiClient.get('/superadmin/newsletter/stats')
      ]);
      
      setSubscriptions(subscriptionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
      toast.error('Failed to load newsletter data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const updateSubscriptionStatus = async (subscriptionId, isActive) => {
    try {
      await apiClient.put(`/superadmin/newsletter/subscriptions/${subscriptionId}`, {
        is_active: isActive
      });

      toast.success(`Subscription ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await apiClient.delete(`/superadmin/newsletter/subscriptions/${subscriptionId}`);
      toast.success('Subscription deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    }
  };

  const exportSubscriptions = async () => {
    try {
      const response = await apiClient.post('/superadmin/newsletter/export', {
        active_only: showActiveOnly
      });

      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `newsletter_subscriptions_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Subscriptions exported successfully');
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      toast.error('Failed to export subscriptions');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-center">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {trend && (
                <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          Newsletter Management
        </h1>
        <p className="text-gray-600">
          Manage newsletter subscriptions and view subscriber statistics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Subscriptions"
          value={stats.total_subscriptions || 0}
          icon={Mail}
          color="blue"
        />
        <StatCard
          title="Active Subscribers"
          value={stats.active_subscriptions || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Recent (30 days)"
          value={stats.recent_subscriptions || 0}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Confirmation Rate"
          value={`${stats.confirmation_rate || 0}%`}
          icon={UserCheck}
          color="orange"
        />
      </div>

      {/* Source Breakdown */}
      {stats.source_breakdown && stats.source_breakdown.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subscription Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.source_breakdown.map(source => (
                <Badge key={source.source} variant="secondary" className="px-3 py-1">
                  {source.source}: {source.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  data-testid="newsletter-search"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                data-testid="toggle-active-only"
              >
                {showActiveOnly ? 'Active Only' : 'Show All'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                data-testid="refresh-subscriptions"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportSubscriptions}
                data-testid="export-subscriptions"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subscribers ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No newsletter subscriptions yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.email}
                        </p>
                        {subscription.name && (
                          <span className="text-sm text-gray-500">
                            ({subscription.name})
                          </span>
                        )}
                        
                        <div className="flex space-x-2">
                          <Badge 
                            className={subscription.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            }
                          >
                            {subscription.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          {subscription.is_confirmed ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Unconfirmed
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-xs">
                            {subscription.source}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        Subscribed: {new Date(subscription.subscribed_at).toLocaleDateString()}
                        {subscription.confirmed_at && (
                          <span className="ml-3">
                            Confirmed: {new Date(subscription.confirmed_at).toLocaleDateString()}
                          </span>
                        )}
                        {subscription.unsubscribed_at && (
                          <span className="ml-3 text-red-600">
                            Unsubscribed: {new Date(subscription.unsubscribed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={subscription.is_active ? "outline" : "default"}
                      onClick={() => updateSubscriptionStatus(subscription.id, !subscription.is_active)}
                      data-testid={`toggle-subscription-${subscription.id}`}
                    >
                      {subscription.is_active ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSubscription(subscription.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`delete-subscription-${subscription.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Newsletter Management Tips
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Active Subscriptions:</strong> These users can receive newsletters and marketing emails.</p>
          <p>• <strong>Confirmed Subscriptions:</strong> Users who have verified their email addresses.</p>
          <p>• <strong>Export Feature:</strong> Download subscriber lists for external email marketing tools.</p>
          <p>• <strong>Search:</strong> Find subscribers by email address or name.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminNewsletter;