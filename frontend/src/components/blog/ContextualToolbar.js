import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Link2,
  Quote,
  Code,
  Type,
  Plus,
  Image as ImageIcon,
  Heading1,
  Heading2
} from 'lucide-react';
import { Button } from '../ui/button';

const ContextualToolbar = ({ editor, onImageUpload }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      const { state, view } = editor;
      const { selection } = state;
      const { from, to, empty } = selection;

      if (empty) {
        setIsVisible(false);
        return;
      }

      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const rect = {
        left: Math.min(start.left, end.left),
        top: Math.min(start.top, end.top),
        right: Math.max(start.right, end.right),
        bottom: Math.max(start.bottom, end.bottom),
      };

      setPosition({
        top: rect.top - 60,
        left: rect.left + (rect.right - rect.left) / 2,
      });

      setIsVisible(true);
    };

    const handleSelectionUpdate = () => {
      setTimeout(updateToolbar, 0);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
    };
  }, [editor]);

  const handleLinkClick = () => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file && onImageUpload) {
        onImageUpload(file);
      }
    };
    input.click();
  };

  if (!isVisible || !editor) return null;

  return (
    <>
      {/* Main Floating Toolbar */}
      <div
        ref={toolbarRef}
        className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl p-2 flex items-center gap-1 transform -translate-x-1/2 transition-all duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 text-white hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-700' : ''
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 text-white hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-700' : ''
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className={`h-8 w-8 p-0 text-white hover:bg-gray-700 ${
            editor.isActive('link') ? 'bg-gray-700' : ''
          }`}
        >
          <Link2 className="h-4 w-4" />
        </Button>

        {/* Quote */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 text-white hover:bg-gray-700 ${
            editor.isActive('blockquote') ? 'bg-gray-700' : ''
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Code */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`h-8 w-8 p-0 text-white hover:bg-gray-700 ${
            editor.isActive('code') ? 'bg-gray-700' : ''
          }`}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Add Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="h-8 w-8 p-0 text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Menu */}
      {showAddMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border p-2 min-w-[160px]"
          style={{
            top: `${position.top + 50}px`,
            left: `${position.left - 80}px`,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              setShowAddMenu(false);
            }}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Large Heading
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              setShowAddMenu(false);
            }}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <Heading2 className="h-4 w-4 mr-2" />
            Medium Heading
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleImageClick();
              setShowAddMenu(false);
            }}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add Image
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              setShowAddMenu(false);
            }}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <Code className="h-4 w-4 mr-2" />
            Code Block
          </Button>
        </div>
      )}

      {/* Click outside to close menu */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </>
  );
};

export default ContextualToolbar;