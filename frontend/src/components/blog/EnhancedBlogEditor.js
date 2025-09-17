import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Heading1,
  Heading2, 
  Heading3,
  List, 
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Eye,
  EyeOff,
  FileText,
  Save,
  Upload,
  Settings,
  X,
  Plus,
  Maximize2,
  Minimize2,
  BookOpen,
  Sparkles,
  Type,
  Focus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';
import ContextualToolbar from './ContextualToolbar';
import '../../styles/medium-typography.css';

const EnhancedBlogEditor = ({ 
  initialContent = '', 
  initialTitle = '',
  initialExcerpt = '',
  initialTags = [],
  initialSeoData = {},
  initialJsonLd = null,
  blogId = null,
  onSave,
  onPublish 
}) => {
  // Core states
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  
  // SEO states
  const [seoTitle, setSeoTitle] = useState(initialSeoData.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialSeoData.seo_description || '');
  const [seoKeywords, setSeoKeywords] = useState(initialSeoData.seo_keywords || '');
  const [jsonLd, setJsonLd] = useState(JSON.stringify(initialJsonLd || {}, null, 2));
  
  // UI states
  const [showPreview, setShowPreview] = useState(true);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  // Medium-style states
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [writingStats, setWritingStats] = useState({ words: 0, characters: 0, readingTime: 0 });
  
  // TipTap editor configuration with better performance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-md p-4 font-mono text-sm my-4',
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'What\'s the title?';
          }
          return 'Tell your story...';
        },
      }),
    ],
    content: initialContent,
    onUpdate: useCallback(({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      
      // Update writing stats
      const text = newContent.replace(/<[^>]*>/g, '');
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      const readingTime = Math.ceil(words / 200);
      
      setWritingStats({ words, characters, readingTime });
    }, []),
    editorProps: {
      attributes: {
        class: `medium-article prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 ${isFocusMode ? 'p-12' : ''}`,
      },
    },
  });

  // Auto-save effect with proper cleanup
  useEffect(() => {
    if (!editor || !blogId || !title.trim() || !content.trim()) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [editor, blogId, title, content, handleAutoSave]);

  // Auto-save function with proper dependencies
  const handleAutoSave = useCallback(async () => {
    if (!blogId || !title.trim() || !content.trim()) return;
    
    try {
      const blogData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        tags,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        seo_keywords: seoKeywords,
        json_ld: jsonLd ? JSON.parse(jsonLd) : null,
      };
      
      await apiClient.put(`/user/blogs/${blogId}`, blogData);
      toast.success('Auto-saved', { duration: 1000 });
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [blogId, title, content, excerpt, tags, seoTitle, seoDescription, seoKeywords, jsonLd]);

  // Image upload handler
  const handleImageUpload = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/blogs/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (editor) {
        editor.chain().focus().setImage({ src: response.data.image_url }).run();
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  // Drag and drop handler
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  }, [handleImageUpload]);

  // Tag management
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  // Content statistics - Update to use the new writingStats
  const stats = useMemo(() => {
    return {
      wordCount: writingStats.words,
      charCount: writingStats.characters,
      readingTime: writingStats.readingTime
    };
  }, [writingStats]);

  // Convert HTML to Markdown (simplified)
  const htmlToMarkdown = (html) => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Memoized save handler for better performance
  const handleSave = useCallback(async (status = 'draft') => {
    if (!title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter blog content');
      return;
    }
    
    try {
      setSaving(true);
      
      let parsedJsonLd = null;
      if (jsonLd.trim()) {
        try {
          parsedJsonLd = JSON.parse(jsonLd);
        } catch (e) {
          toast.error('Invalid JSON-LD format');
          return;
        }
      }
      
      const blogData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        tags,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        seo_keywords: seoKeywords,
        json_ld: parsedJsonLd,
        status,
      };
      
      if (onSave) {
        await onSave(blogData);
      } else if (onPublish && status === 'published') {
        await onPublish(blogData);
      }
      
      toast.success(status === 'published' ? 'Blog published successfully!' : 'Blog saved successfully!');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  }, [title, content, excerpt, tags, seoTitle, seoDescription, seoKeywords, jsonLd, onSave, onPublish]);

  // Toolbar component
  const Toolbar = () => (
    <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`h-8 w-8 p-0 ${editor?.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex items-center gap-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          className="hidden"
          id="image-upload"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => document.getElementById('image-upload')?.click()}
          className="h-8 w-8 p-0"
          disabled={uploading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="h-8 w-8 p-0"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 px-3"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-8 px-3"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Contextual Toolbar */}
      <ContextualToolbar editor={editor} onImageUpload={handleImageUpload} />
      
      <div className={`${isFullscreen ? 'h-full p-6' : ''} space-y-6`}>
        {/* Header */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isFocusMode ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
          <div className="flex-1">
            {/* Large Title Input - Medium Style */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className={`text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 w-full mb-4 ${isFocusMode ? 'text-center' : ''}`}
              style={{ fontFamily: 'var(--font-display)' }}
            />
            
            {/* Subtitle/Excerpt */}
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a subtitle..."
              className={`text-xl text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 w-full mb-6 ${isFocusMode ? 'text-center' : ''}`}
              style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
            />
            
            <div className={`flex items-center gap-4 text-sm text-gray-500 ${isFocusMode ? 'justify-center' : ''}`}>
              <span>{stats.wordCount} words</span>
              <span>{stats.charCount} characters</span>
              <span>{stats.readingTime} min read</span>
              <span>{tags.length} tags</span>
              {blogId && <span className="text-green-600">● Auto-saving</span>}
            </div>
          </div>
          
          {!isFocusMode && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFocusMode(true)}
              >
                <Focus className="h-4 w-4 mr-2" />
                Focus
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSeoModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                SEO
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowJsonLdModal(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                JSON-LD
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                Publish
              </Button>
            </div>
          )}
        </div>

        {/* Focus Mode Controls */}
        {isFocusMode && (
          <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFocusMode(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Editor Layout */}
        <div className={`${isFocusMode ? 'flex justify-center' : `grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`} ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'min-h-[600px]'}`}>
          {/* Editor Panel */}
          <Card className={`border-0 shadow-sm flex flex-col ${isFocusMode ? 'max-w-4xl w-full' : ''}`}>
            {!isFocusMode && <Toolbar />}
            <div 
              className="flex-1 overflow-auto"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <EditorContent editor={editor} className="h-full" />
            </div>
          </Card>

          {/* Preview Panel */}
          {showPreview && !isFocusMode && (
            <Card className="border-0 shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="medium-article">
                  <h1 className="text-4xl font-bold mb-4">{title || 'Blog Title'}</h1>
                  {excerpt && (
                    <p className="lead text-gray-600 mb-8">{excerpt}</p>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: ({ node, ...props }) => (
                        <img {...props} className="rounded-lg max-w-full h-auto my-4" />
                      ),
                      a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-600 hover:text-blue-800 underline" />
                      ),
                      code: ({ node, inline, ...props }) => 
                        inline ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />
                        ) : (
                          <code className="block bg-gray-100 p-4 rounded-md font-mono text-sm my-4" {...props} />
                        ),
                    }}
                  >
                    {htmlToMarkdown(content)}
                  </ReactMarkdown>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tags Section - Hidden in focus mode */}
        {!isFocusMode && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tags..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Writing Tips - Only show in focus mode */}
        {isFocusMode && (
          <div className="fixed bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border max-w-sm">
            <h4 className="font-semibold text-gray-900 mb-2">Writing Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use clear, conversational language</li>
              <li>• Break up long paragraphs</li>
              <li>• Add subheadings for structure</li>
              <li>• Include relevant images</li>
            </ul>
          </div>
        )}
      </div>

      {/* SEO Settings Modal */}
      {showSeoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SEO Settings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSeoModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO optimized title (50-60 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {seoDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="Comma-separated keywords"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowSeoModal(false)} className="flex-1">
                  Save SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* JSON-LD Modal */}
      {showJsonLdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>JSON-LD Structured Data</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowJsonLdModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON-LD Schema
                </label>
                <textarea
                  value={jsonLd}
                  onChange={(e) => setJsonLd(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "Article", "headline": "Your Article Title"}'
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter valid JSON-LD structured data for SEO enhancement
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    try {
                      JSON.parse(jsonLd);
                      setShowJsonLdModal(false);
                      toast.success('JSON-LD validated and saved');
                    } catch (e) {
                      toast.error('Invalid JSON format');
                    }
                  }} 
                  className="flex-1"
                >
                  Save JSON-LD
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setJsonLd(JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": title || "Your Article Title",
                    "description": excerpt || "Your article description",
                    "author": {
                      "@type": "Person",
                      "name": "Author Name"
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": "Your Site Name"
                    },
                    "datePublished": new Date().toISOString(),
                    "mainEntityOfPage": {
                      "@type": "WebPage",
                      "@id": "https://yoursite.com/blog/your-article"
                    }
                  }, null, 2))}
                >
                  Generate Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedBlogEditor;