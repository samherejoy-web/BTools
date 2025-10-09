import { useEffect } from 'react';

/**
 * Custom hook to handle ESC key press
 * @param {Function} onEscape - Callback function to execute when ESC is pressed
 * @param {boolean} enabled - Whether the hook is active (default: true)
 */
export const useEscapeKey = (onEscape, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onEscape, enabled]);
};

export default useEscapeKey;
