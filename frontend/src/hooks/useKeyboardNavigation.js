import { useEffect } from 'react';

/**
 * Custom hook to enable arrow key scrolling globally
 * without interfering with input fields, textareas, and other interactive elements
 */
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Get the active element
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName?.toLowerCase();
      
      // Check if user is typing in an input field, textarea, or contenteditable
      const isTyping = 
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        activeElement?.isContentEditable ||
        activeElement?.hasAttribute('contenteditable');
      
      // If user is typing, don't handle arrow keys
      if (isTyping) {
        return;
      }
      
      // Arrow key scrolling
      const scrollAmount = 100; // pixels to scroll
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          window.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
          });
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
          break;
          
        case 'ArrowLeft':
          // Optional: Add horizontal scrolling if needed
          // e.preventDefault();
          // window.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          break;
          
        case 'ArrowRight':
          // Optional: Add horizontal scrolling if needed
          // e.preventDefault();
          // window.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          break;
          
        case 'Home':
          if (!isTyping) {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
          break;
          
        case 'End':
          if (!isTyping) {
            e.preventDefault();
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          }
          break;
          
        case 'PageUp':
          e.preventDefault();
          window.scrollBy({
            top: -window.innerHeight * 0.9,
            behavior: 'smooth'
          });
          break;
          
        case 'PageDown':
          e.preventDefault();
          window.scrollBy({
            top: window.innerHeight * 0.9,
            behavior: 'smooth'
          });
          break;
          
        default:
          break;
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export default useKeyboardNavigation;
