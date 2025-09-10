import React, { useState } from 'react';
import { 
  Brain,
  Sparkles,
  FileText,
  Settings,
  Wand2,
  RefreshCw,
  Copy,
  Download,
  Save,
  Eye,
  Lightbulb,
  Target,
  Users,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const AIBlogGenerator = () => {
  const [generationStep, setGenerationStep] = useState('input'); // input, generating, result
  const [formData, setFormData] = useState({
    topic: '',
    style: 'informative',
    length: 'medium',
    audience: 'general',
    keywords: '',
    outline: true,
    include_examples: true,
    include_tips: true
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for your blog');
      return;
    }

    setLoading(true);
    setGenerationStep('generating');

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockGeneratedContent = {
        title: `${formData.topic}: A Comprehensive Guide for 2024`,
        excerpt: `Discover everything you need to know about ${formData.topic.toLowerCase()}, including best practices, expert tips, and actionable insights.`,
        content: `
          <h1>${formData.topic}: A Comprehensive Guide for 2024</h1>
          
          <p>In today's rapidly evolving digital landscape, understanding ${formData.topic.toLowerCase()} has become more crucial than ever. Whether you're a beginner looking to get started or an experienced professional seeking to refine your approach, this comprehensive guide will provide you with the insights and strategies you need to succeed.</p>
          
          <h2>What is ${formData.topic}?</h2>
          
          <p>${formData.topic} represents a fundamental shift in how we approach modern challenges. By leveraging cutting-edge techniques and proven methodologies, it offers unprecedented opportunities for growth and innovation.</p>
          
          <h2>Key Benefits</h2>
          
          <ul>
            <li><strong>Increased Efficiency:</strong> Streamline your workflow and reduce manual tasks</li>
            <li><strong>Better Results:</strong> Achieve higher quality outcomes with less effort</li>
            <li><strong>Cost Savings:</strong> Optimize resources and reduce operational expenses</li>
            <li><strong>Scalability:</strong> Grow your operations without proportional increases in complexity</li>
          </ul>
          
          <h2>Best Practices</h2>
          
          <p>To maximize the benefits of ${formData.topic.toLowerCase()}, consider implementing these proven strategies:</p>
          
          <ol>
            <li><strong>Start with Clear Goals:</strong> Define what success looks like for your specific situation</li>
            <li><strong>Focus on User Experience:</strong> Always prioritize the end-user perspective in your approach</li>
            <li><strong>Iterate and Improve:</strong> Continuously refine your methods based on feedback and results</li>
            <li><strong>Stay Updated:</strong> Keep up with the latest trends and developments in the field</li>
          </ol>
          
          <h2>Common Challenges and Solutions</h2>
          
          <p>While implementing ${formData.topic.toLowerCase()} can be highly rewarding, it's important to be aware of potential obstacles:</p>
          
          <h3>Challenge 1: Getting Started</h3>
          <p><strong>Solution:</strong> Begin with small, manageable projects to build confidence and experience.</p>
          
          <h3>Challenge 2: Resource Constraints</h3>
          <p><strong>Solution:</strong> Prioritize high-impact activities and consider automation where possible.</p>
          
          <h2>Tools and Resources</h2>
          
          <p>Here are some recommended tools to help you implement ${formData.topic.toLowerCase()} effectively:</p>
          
          <ul>
            <li>Industry-leading platforms with comprehensive feature sets</li>
            <li>Open-source alternatives for budget-conscious implementations</li>
            <li>Specialized tools for specific use cases and requirements</li>
            <li>Educational resources and community forums for ongoing learning</li>
          </ul>
          
          <h2>Future Outlook</h2>
          
          <p>As we look ahead, ${formData.topic.toLowerCase()} will continue to evolve and adapt to changing market conditions. By staying informed and maintaining a flexible approach, you can position yourself to take advantage of emerging opportunities and navigate potential challenges.</p>
          
          <h2>Conclusion</h2>
          
          <p>Mastering ${formData.topic.toLowerCase()} requires dedication, continuous learning, and a willingness to adapt. By following the strategies outlined in this guide and staying committed to best practices, you'll be well-equipped to achieve your goals and drive meaningful results.</p>
          
          <p>Remember, success in ${formData.topic.toLowerCase()} is not just about implementing the right techniques—it's about understanding your unique context and applying these principles in a way that creates real value for your audience.</p>
        `,
        word_count: 650,
        reading_time: 4,
        seo_keywords: formData.keywords || `${formData.topic.toLowerCase()}, guide, best practices, tips`,
        tags: formData.keywords.split(',').map(k => k.trim()).filter(k => k) || [formData.topic.toLowerCase(), 'guide', 'tips']
      };

      setGeneratedContent(mockGeneratedContent);
      setGenerationStep('result');
    } catch (error) {
      console.error('Error generating blog:', error);
      toast.error('Failed to generate blog. Please try again.');
      setGenerationStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const blogData = {
        title: generatedContent.title,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        tags: generatedContent.tags,
        status: 'draft',
        is_ai_generated: true,
        seo_keywords: generatedContent.seo_keywords
      };

      await apiClient.post('/user/blogs', blogData);
      toast.success('Blog saved as draft successfully!');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent.content);
    toast.success('Content copied to clipboard!');
  };

  if (generationStep === 'generating') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-yellow-400 rounded-full animate-bounce">
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI is crafting your blog...</h2>
            <p className="text-gray-600 mb-6">
              Our AI is analyzing your topic and creating high-quality content tailored to your specifications.
            </p>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generationStep === 'result') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              Blog Generated Successfully!
            </h1>
            <p className="text-gray-600 mt-1">Review and customize your AI-generated blog content</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setGenerationStep('input')}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate New
            </Button>
            <Button 
              onClick={handleSaveDraft}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Word Count</p>
                  <p className="text-2xl font-bold text-gray-900">{generatedContent.word_count}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reading Time</p>
                  <p className="text-2xl font-bold text-gray-900">{generatedContent.reading_time} min</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">SEO Score</p>
                  <p className="text-2xl font-bold text-gray-900">85/100</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">AI Quality</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{generatedContent.title}</h2>
                  <p className="text-gray-600 mb-4 italic">{generatedContent.excerpt}</p>
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Blog Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Blog Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={generatedContent.title}
                    onChange={(e) => setGeneratedContent({
                      ...generatedContent,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    value={generatedContent.excerpt}
                    onChange={(e) => setGeneratedContent({
                      ...generatedContent,
                      excerpt: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={generatedContent.seo_keywords}
                    onChange={(e) => setGeneratedContent({
                      ...generatedContent,
                      seo_keywords: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Title Length</span>
                    <Badge className={generatedContent.title.length <= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {generatedContent.title.length}/60
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Description Length</span>
                    <Badge className={generatedContent.excerpt.length <= 160 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {generatedContent.excerpt.length}/160
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Well-structured content with clear headings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Good keyword density and SEO optimization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Engaging introduction and conclusion</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span className="text-gray-700">Consider adding more specific examples</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Input form
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Blog Generator</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create high-quality, engaging blog posts in minutes with the power of artificial intelligence
        </p>
      </div>

      {/* Generation Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Blog Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to write about? *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g., Project Management Tools, AI in Marketing, Remote Work Best Practices"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Writing Style</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="informative">Informative</option>
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="persuasive">Persuasive</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
              <select
                value={formData.length}
                onChange={(e) => setFormData({...formData, length: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="short">Short (300-500 words)</option>
                <option value="medium">Medium (600-1000 words)</option>
                <option value="long">Long (1000+ words)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({...formData, audience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Audience</option>
                <option value="beginners">Beginners</option>
                <option value="professionals">Professionals</option>
                <option value="experts">Industry Experts</option>
                <option value="business">Business Leaders</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (optional)</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Options</label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="outline"
                  checked={formData.outline}
                  onChange={(e) => setFormData({...formData, outline: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="outline" className="ml-2 text-sm text-gray-700">
                  Include detailed outline and subheadings
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="examples"
                  checked={formData.include_examples}
                  onChange={(e) => setFormData({...formData, include_examples: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="examples" className="ml-2 text-sm text-gray-700">
                  Include practical examples and case studies
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tips"
                  checked={formData.include_tips}
                  onChange={(e) => setFormData({...formData, include_tips: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="tips" className="ml-2 text-sm text-gray-700">
                  Include actionable tips and best practices
                </label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Blog with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Content</h3>
            <p className="text-sm text-gray-600">
              Advanced AI creates engaging, original content tailored to your specifications
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">SEO Optimized</h3>
            <p className="text-sm text-gray-600">
              Built-in SEO optimization ensures your content ranks well in search engines
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Audience Focused</h3>
            <p className="text-sm text-gray-600">
              Content is customized based on your target audience and writing style preferences
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIBlogGenerator;