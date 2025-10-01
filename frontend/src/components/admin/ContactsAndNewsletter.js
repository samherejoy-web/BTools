import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  Users, 
  MessageSquare, 
  Calendar, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Download 
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { formatDate } from '../../utils/formatters';
import { toast } from 'sonner';

const ContactsAndNewsletter = () => {
  const [contacts, setContacts] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [newsletterStats, setNewsletterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(true);
  const [showNewsletters, setShowNewsletters] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts, newsletters, and stats in parallel
      const [contactsRes, newslettersRes, statsRes] = await Promise.all([
        apiClient.get('/admin/contacts?limit=10'),
        apiClient.get('/admin/newsletter/subscriptions?limit=10'),
        apiClient.get('/admin/newsletter/stats')
      ]);

      setContacts(contactsRes.data || []);
      setNewsletters(newslettersRes.data || []);
      setNewsletterStats(statsRes.data || null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      await apiClient.put(`/admin/contacts/${contactId}/status?new_status=${newStatus}`);
      toast.success(`Contact status updated to ${newStatus}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Newsletter Statistics */}
      {newsletterStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{newsletterStats.total_subscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{newsletterStats.active_subscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contact Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subscription Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{newsletterStats.subscription_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Contact Submissions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContacts(!showContacts)}
              >
                {showContacts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showContacts && (
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No contact submissions yet</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          <Badge 
                            variant={contact.status === 'new' ? 'default' : 
                                   contact.status === 'in_progress' ? 'secondary' : 'outline'}
                          >
                            {contact.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(contact.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <p className="font-medium text-sm">{contact.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                      
                      {contact.status === 'new' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateContactStatus(contact.id, 'in_progress')}
                          >
                            Mark In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateContactStatus(contact.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Newsletter Subscriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Recent Newsletter Subscriptions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewsletters(!showNewsletters)}
              >
                {showNewsletters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showNewsletters && (
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsletters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No newsletter subscriptions yet</p>
                ) : (
                  newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{newsletter.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {newsletter.source}
                          </Badge>
                          <Badge 
                            variant={newsletter.status === 'active' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {newsletter.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(newsletter.subscribed_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Sources Breakdown */}
      {newsletterStats?.subscriptions_by_source && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(newsletterStats.subscriptions_by_source).map(([source, count]) => (
                <div key={source} className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{source}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactsAndNewsletter;