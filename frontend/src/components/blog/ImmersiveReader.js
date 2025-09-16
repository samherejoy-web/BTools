import React, { useState, useEffect } from 'react';
import { X, Settings, Type, Moon, Sun, Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';

const ImmersiveReader = ({ children, isActive, onToggle }) => {
  const [fontSize, setFontSize] = useState(21); // Medium's default
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontFamily, setFontFamily] = useState('Charter');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load user preferences from localStorage
    const savedFontSize = localStorage.getItem('reader-font-size');
    const savedDarkMode = localStorage.getItem('reader-dark-mode');
    const savedFontFamily = localStorage.getItem('reader-font-family');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedFontFamily) setFontFamily(savedFontFamily);
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem('reader-font-size', fontSize.toString());
    localStorage.setItem('reader-dark-mode', JSON.stringify(isDarkMode));
    localStorage.setItem('reader-font-family', fontFamily);
  }, [fontSize, isDarkMode, fontFamily]);

  const fontOptions = [
    { name: 'Charter', label: 'Charter (Default)' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Times New Roman', label: 'Times' },
    { name: 'Inter', label: 'Inter (Sans)' },
    { name: 'SF Pro Display', label: 'System' }
  ];

  const adjustFontSize = (delta) => {
    setFontSize(prev => Math.max(14, Math.min(32, prev + delta)));
  };

  if (!isActive) return children;

  const readerStyles = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily === 'Charter' ? '"Charter", "Times New Roman", serif' :
                fontFamily === 'Georgia' ? 'Georgia, serif' :
                fontFamily === 'Times New Roman' ? '"Times New Roman", serif' :
                fontFamily === 'Inter' ? '"Inter", sans-serif' :
                fontFamily === 'SF Pro Display' ? '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' :
                fontFamily,
    lineHeight: '1.58',
    color: isDarkMode ? '#e5e7eb' : '#1a1a1a',
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header with Controls */}
      <div className={`sticky top-0 z-10 border-b ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={onToggle}
              variant="ghost"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Immersive Reader
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                onClick={() => adjustFontSize(-2)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className={`text-sm px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {fontSize}px
              </span>
              <Button
                onClick={() => adjustFontSize(2)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Settings */}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Extended Settings Panel */}
        {showSettings && (
          <div className={`border-t p-4 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Font Family */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`w-full p-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {fontOptions.map(font => (
                      <option key={font.name} value={font.name}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Reading Width */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reading Width
                  </label>
                  <select className={`w-full p-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    <option value="narrow">Narrow (680px)</option>
                    <option value="medium">Medium (800px)</option>
                    <option value="wide">Wide (1000px)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div 
        className="max-w-4xl mx-auto p-6 md:p-8"
        style={readerStyles}
      >
        <div className="medium-article">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ImmersiveReader;