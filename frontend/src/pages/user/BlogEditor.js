import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import EnhancedBlogEditor from '../../components/blog/EnhancedBlogEditor';

const BlogEditor = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (blogId && blogId !== 'new') {
      fetchBlogData();
    } else {
      // Initialize empty blog for new posts
      setBlog({
        id: null,
        title: '',
        content: '',
        excerpt: '',
        tags: [],
        status: 'draft',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        json_ld: null,
        is_ai_generated: false
      });
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/user/blogs/${blogId}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast.error('Failed to load blog');
      navigate('/dashboard/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (blogData) => {
    try {
      let response;
      if (blogId && blogId !== 'new') {
        response = await apiClient.put(`/user/blogs/${blogId}`, blogData);
      } else {
        response = await apiClient.post('/user/blogs', blogData);
        // Navigate to the edit page for the newly created blog
        navigate(`/dashboard/blogs/edit/${response.data.id}`, { replace: true });
      }
      
      setBlog(response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving blog:', error);
      throw error;
    }
  };

  const handlePublish = async (blogData) => {
    try {
      let response;
      if (blogId && blogId !== 'new') {
        // Update blog first, then publish
        await apiClient.put(`/user/blogs/${blogId}`, blogData);
        await apiClient.post(`/user/blogs/${blogId}/publish`);
        response = await apiClient.get(`/user/blogs/${blogId}`);
      } else {
        // Create and publish in one step
        blogData.status = 'published';
        response = await apiClient.post('/user/blogs', blogData);
        navigate(`/dashboard/blogs/edit/${response.data.id}`, { replace: true });
      }
      
      setBlog(response.data);
      return response.data;
    } catch (error) {
      console.error('Error publishing blog:', error);
      throw error;
    }
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic or prompt for AI generation');
      return;
    }

    try {
      setAiGenerating(true);
      const response = await apiClient.post('/ai/generate-blog', {
        topic: aiPrompt,
        style: 'professional',
        length: 'medium'
      });

      setBlog({
        ...blog,
        title: response.data.title,
        content: response.data.content,
        excerpt: response.data.excerpt,
        tags: response.data.tags || [],
        seo_title: response.data.seo_title,
        seo_description: response.data.seo_description,
        seo_keywords: response.data.seo_keywords,
        is_ai_generated: true
      });

      setAiPrompt('');
      toast.success('AI content generated successfully!');
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading blog editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/blogs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {blogId === 'new' ? 'Create New Blog' : 'Edit Blog'}
            </h1>
            {blog.status && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                  {blog.status}
                </Badge>
                {blog.is_ai_generated && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Content Generation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Content Generator</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter a topic or idea for AI to generate content..."
                className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                onClick={generateAIContent}
                disabled={aiGenerating}
                className="bg-gradient-to-r from-purple-600 to-purple-700"
              >
                {aiGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Blog Editor */}
      <EnhancedBlogEditor
        initialTitle={blog.title}
        initialContent={blog.content}
        initialExcerpt={blog.excerpt}
        initialTags={blog.tags || []}
        initialSeoData={{
          seo_title: blog.seo_title,
          seo_description: blog.seo_description,
          seo_keywords: blog.seo_keywords
        }}
        initialJsonLd={blog.json_ld}
        blogId={blog.id}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default BlogEditor;