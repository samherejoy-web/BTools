import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { 
  Link, 
  Search, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Target,
  FileText,
  Folder,
  Lightbulb,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

const InternalLinkSuggestions = ({ initialContent = '', initialTitle = '', contentType = 'blog' }) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [settings, setSettings] = useState({
    maxSuggestions: 10,
    minRelevance: 0.3,
    existingLinks: []
  });
  const [showSettings, setShowSettings] = useState(false);

  const analyzeLinkSuggestions = useCallback(async () => {
    if (!content.trim() || !title.trim()) {
      setError('Please provide both title and content for analysis');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/seo/internal-links/suggestions', {
        content: content.trim(),
        title: title.trim(),
        content_type: contentType,
        existing_links: settings.existingLinks
      }, {
        params: {
          max_suggestions: settings.maxSuggestions,
          min_relevance: settings.minRelevance
        }
      });
      
      setSuggestions(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        setError('No internal link suggestions found. Try adding more content or lowering the relevance threshold.');
      }
    } catch (err) {
      console.error('Error getting link suggestions:', err);
      setError(err.response?.data?.detail || 'Failed to analyze content for link suggestions');
    } finally {
      setLoading(false);
    }
  }, [content, title, contentType, settings]);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tool':
        return <Target className="w-4 h-4" />;
      case 'blog':
        return <FileText className="w-4 h-4" />;
      case 'category':
        return <Folder className="w-4 h-4" />;
      default:
        return <Link className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'tool':
        return 'bg-blue-100 text-blue-800';
      case 'blog':
        return 'bg-green-100 text-green-800';
      case 'category':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatRelevanceScore = (score) => {
    return `${(score * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Internal Link Suggestions
          </CardTitle>
          <CardDescription>
            Analyze your content to find relevant internal linking opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your content title..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Content Body</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here to analyze for internal linking opportunities..."
              className="min-h-[200px] w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>

            <Button 
              onClick={analyzeLinkSuggestions}
              disabled={loading || !content.trim() || !title.trim()}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Analyzing...' : 'Find Link Opportunities'}
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Analysis Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Suggestions</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxSuggestions}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxSuggestions: parseInt(e.target.value) || 10
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Relevance (%)</label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    value={Math.round(settings.minRelevance * 100)}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minRelevance: (parseInt(e.target.value) || 30) / 100
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Internal Link Suggestions
              </div>
              <Badge variant="secondary">
                {suggestions.length} opportunities found
              </Badge>
            </CardTitle>
            <CardDescription>
              Click on suggestions to copy HTML link code or view in context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Link Info */}
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.target_type)}
                        <a 
                          href={suggestion.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {suggestion.target_title}
                        </a>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getTypeColor(suggestion.target_type)}
                        >
                          {suggestion.target_type}
                        </Badge>
                        <Badge variant="outline">
                          <span className={getRelevanceColor(suggestion.relevance_score)}>
                            {formatRelevanceScore(suggestion.relevance_score)} relevance
                          </span>
                        </Badge>
                      </div>

                      {/* Anchor Text */}
                      <div>
                        <span className="text-sm text-gray-600">Suggested anchor text: </span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {suggestion.anchor_text}
                        </code>
                      </div>

                      {/* Context Preview */}
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-2 border-blue-200">
                        <span className="font-medium">Context: </span>
                        <span className="font-mono">
                          {suggestion.context.substring(0, suggestion.context.indexOf(suggestion.anchor_text))}
                          <mark className="bg-yellow-200 px-1 rounded">
                            {suggestion.anchor_text}
                          </mark>
                          {suggestion.context.substring(
                            suggestion.context.indexOf(suggestion.anchor_text) + suggestion.anchor_text.length
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(
                          `<a href="${suggestion.target_url}">${suggestion.anchor_text}</a>`,
                          index
                        )}
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">Implementation Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use natural anchor text that fits the content flow</li>
                <li>• Avoid over-linking - 2-3 internal links per 500 words is ideal</li>
                <li>• Link to your most relevant and high-quality content</li>
                <li>• Consider the user journey when placing links</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Content</h3>
              <p className="text-gray-600">
                Finding relevant internal linking opportunities...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && !error && content.trim() && title.trim() && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Link Suggestions Found</h3>
              <p className="text-gray-600 mb-4">
                Try lowering the relevance threshold or adding more content to find linking opportunities.
              </p>
              <Button onClick={() => setShowSettings(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Adjust Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InternalLinkSuggestions;