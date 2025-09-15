import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Target,
  FileText,
  Hash,
  Link,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

const SEOScoreCalculator = ({ contentType, contentId, contentData }) => {
  const [seoScore, setSeoScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (contentType && contentId) {
      fetchSEOScore();
    }
  }, [contentType, contentId]);

  const fetchSEOScore = async () => {
    if (!contentType || !contentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/seo/score/${contentType}/${contentId}`);
      setSeoScore(response.data);
    } catch (err) {
      console.error('Error fetching SEO score:', err);
      setError(err.response?.data?.detail || 'Failed to fetch SEO score');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const ScoreBar = ({ label, score, icon: Icon, description }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getScoreColor(score)}`}>
            {score.toFixed(0)}%
          </span>
          {score >= 80 && <CheckCircle className="w-4 h-4 text-green-500" />}
          {score < 60 && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      <Progress 
        value={score} 
        className="h-2"
        indicatorClassName={getScoreColorClass(score)}
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            SEO Score Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2">Analyzing SEO performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            SEO Score Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={fetchSEOScore} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!seoScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            SEO Score Calculator
          </CardTitle>
          <CardDescription>
            Analyze the SEO performance of this {contentType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSEOScore} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Analyze SEO Performance
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { overall_score, title_score, description_score, keywords_score, content_score, internal_links_score, recommendations } = seoScore;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              SEO Score Calculator
            </div>
            <Button 
              onClick={fetchSEOScore} 
              variant="ghost" 
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive SEO analysis for this {contentType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className={`text-6xl font-bold ${getScoreColor(overall_score)} mb-2`}>
              {overall_score.toFixed(0)}
            </div>
            <div className="text-2xl font-semibold text-gray-600 mb-1">
              {getScoreLabel(overall_score)}
            </div>
            <Badge 
              variant={overall_score >= 80 ? "default" : overall_score >= 60 ? "secondary" : "destructive"}
              className="text-sm"
            >
              {overall_score >= 80 ? "Search Engine Ready" : 
               overall_score >= 60 ? "Needs Minor Improvements" : 
               "Requires Optimization"}
            </Badge>
          </div>

          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
            >
              {showDetails ? 'Hide Details' : 'Show Detailed Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detailed SEO Breakdown
            </CardTitle>
            <CardDescription>
              Individual component scores and analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreBar
              label="Title Optimization"
              score={title_score}
              icon={FileText}
              description="SEO title length, keyword usage, and optimization"
            />
            
            <ScoreBar
              label="Meta Description"
              score={description_score}
              icon={FileText}
              description="Description length, keyword inclusion, and call-to-action"
            />
            
            <ScoreBar
              label="Keywords Strategy"
              score={keywords_score}
              icon={Hash}
              description="Keyword relevance, count, and optimization"
            />
            
            <ScoreBar
              label="Content Quality"
              score={content_score}
              icon={FileText}
              description={contentType === 'tool' ? 
                "Description, features, pros/cons completeness" : 
                "Content length, structure, and multimedia"
              }
            />
            
            <ScoreBar
              label="Internal Linking"
              score={internal_links_score}
              icon={Link}
              description="Internal link structure and cross-references"
            />
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              SEO Recommendations
            </CardTitle>
            <CardDescription>
              Actionable suggestions to improve your SEO score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      {recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick SEO Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overall_score < 80 && (
              <Button variant="outline" className="justify-start">
                <Search className="w-4 h-4 mr-2" />
                Generate SEO Template
              </Button>
            )}
            
            <Button variant="outline" className="justify-start">
              <Link className="w-4 h-4 mr-2" />
              Get Link Suggestions
            </Button>
            
            {contentType === 'blog' && (
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Optimize Content Structure
              </Button>
            )}
            
            <Button variant="outline" className="justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Track SEO Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOScoreCalculator;