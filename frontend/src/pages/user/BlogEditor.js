import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save,
  Eye,
  Upload,
  Settings,
  ArrowLeft,
  FileText,
  Globe,
  Calendar,
  Tag,
  Image,
  Link2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Brain,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import { formatDate } from '../../utils/formatters';

// Rich Text Editor Component
const RichTextEditor = ({ content, onChange, placeholder = "Start writing your blog..." }) => {
  const [editorContent, setEditorContent] = useState(content || '');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    setEditorContent(content || '');
  }, [content]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    onChange(newContent);
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/blogs/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Insert image markdown with size controls
      const textarea = document.getElementById('blog-editor');
      const start = textarea.selectionStart;
      const imageMarkdown = `\n<div class="image-container" style="text-align: center; margin: 20px 0;">
  <img src="${response.data.image_url}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-size: 0.9em; color: #666; margin-top: 8px; font-style: italic;">${file.name}</p>
</div>\n`;
      
      const newContent = 
        editorContent.substring(0, start) + 
        imageMarkdown + 
        editorContent.substring(start);
      
      setEditorContent(newContent);
      onChange(newContent);
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const insertFormatting = (format) => {
    const textarea = document.getElementById('blog-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText || 'Heading 1'}\n\n`;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText || 'Heading 2'}\n\n`;
        break;
      case 'h3':
        formattedText = `\n### ${selectedText || 'Heading 3'}\n\n`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || 'Quote text'}\n\n`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'list item'}\n`;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText || 'list item'}\n`;
        break;
      case 'image':
        formattedText = `![${selectedText || 'Image description'}](image_url)`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = 
      editorContent.substring(0, start) + 
      formattedText + 
      editorContent.substring(end);
    
    setEditorContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('h1')}
            className="h-8 w-8 p-0"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('h2')}
            className="h-8 w-8 p-0"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('h3')}
            className="h-8 w-8 p-0"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('list')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('ordered-list')}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('quote')}
            className="h-8 w-8 p-0"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('code')}
            className="h-8 w-8 p-0"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertFormatting('link')}
            className="h-8 w-8 p-0"
            title="Link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleImageButtonClick}
            className="h-8 w-8 p-0"
            title="Upload Image"
            disabled={uploading}
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Editor */}
      <textarea
        id="blog-editor"
        value={editorContent}
        onChange={handleContentChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        placeholder={placeholder}
        className="w-full h-96 p-4 resize-none focus:outline-none text-gray-800 leading-relaxed"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      />
    </div>
  );
};

const BlogEditor = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    featured_image: null,
    is_ai_generated: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showSEOSettings, setShowSEOSettings] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (blogId && blogId !== 'new') {
      fetchBlogData();
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

  const handleSave = async (status = blog.status) => {
    if (!blog.title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }

    if (!blog.content.trim()) {
      toast.error('Please enter blog content');
      return;
    }

    try {
      setSaving(true);
      const blogData = {
        ...blog,
        status,
        excerpt: blog.excerpt || blog.content.substring(0, 200) + '...',
      };

      let response;
      if (blogId && blogId !== 'new') {
        response = await apiClient.put(`/user/blogs/${blogId}`, blogData);
      } else {
        response = await apiClient.post('/user/blogs', blogData);
      }

      toast.success(status === 'published' ? 'Blog published successfully!' : 'Blog saved as draft');
      
      if (blogId === 'new') {
        navigate(`/dashboard/blogs/edit/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !blog.tags.includes(tagInput.trim())) {
      setBlog({
        ...blog,
        tags: [...blog.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setBlog({
      ...blog,
      tags: blog.tags.filter(tag => tag !== tagToRemove)
    });
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

  // Process content for preview
  const formatContentForPreview = (content) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">$1</blockquote>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/^1\. (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
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

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          
          <Button
            onClick={() => handleSave('draft')}
            disabled={saving}
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Globe className="h-4 w-4 mr-2" />
            {blog.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          {!previewMode ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* AI Content Generation */}
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

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title
                  </label>
                  <input
                    type="text"
                    value={blog.title}
                    onChange={(e) => setBlog({...blog, title: e.target.value})}
                    placeholder="Enter an engaging blog title..."
                    className="w-full px-3 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt (Optional)
                  </label>
                  <textarea
                    value={blog.excerpt}
                    onChange={(e) => setBlog({...blog, excerpt: e.target.value})}
                    placeholder="Brief description of your blog post..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <RichTextEditor
                    content={blog.content}
                    onChange={(content) => setBlog({...blog, content})}
                    placeholder="Start writing your blog post..."
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Preview Mode */
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{blog.title || 'Blog Title'}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(new Date())}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{Math.ceil(blog.content.length / 200)} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {blog.excerpt && (
                  <div className="text-xl text-gray-600 mb-6 italic">
                    {blog.excerpt}
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: `<p class="mb-4">${formatContentForPreview(blog.content)}</p>`
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={blog.status}
                  onChange={(e) => setBlog({...blog, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <Button
                onClick={() => setShowSEOSettings(!showSEOSettings)}
                variant="outline"
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                SEO Settings
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tags..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload featured image</p>
                <Button size="sm" variant="outline">
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Words</span>
                <span className="font-medium">{blog.content.split(' ').filter(word => word.length > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Characters</span>
                <span className="font-medium">{blog.content.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reading Time</span>
                <span className="font-medium">{Math.ceil(blog.content.length / 200)} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tags</span>
                <span className="font-medium">{blog.tags.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO Settings Modal */}
      {showSEOSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={blog.seo_title}
                  onChange={(e) => setBlog({...blog, seo_title: e.target.value})}
                  placeholder="SEO optimized title (50-60 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {blog.seo_title.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={blog.seo_description}
                  onChange={(e) => setBlog({...blog, seo_description: e.target.value})}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {blog.seo_description.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={blog.seo_keywords}
                  onChange={(e) => setBlog({...blog, seo_keywords: e.target.value})}
                  placeholder="Comma-separated keywords"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowSEOSettings(false)}
                  className="flex-1"
                >
                  Save SEO Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSEOSettings(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;