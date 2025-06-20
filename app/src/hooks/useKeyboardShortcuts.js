import { useEffect, useCallback } from "react";

export default function useKeyboardShortcuts(shortcuts) {
  const handleKeyPress = useCallback((event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    
    // Create a key combination string
    const combination = [
      ctrl && 'ctrl',
      shift && 'shift', 
      alt && 'alt',
      key
    ].filter(Boolean).join('+');

    // Also check for single key
    const singleKey = key;

    // Check if any shortcut matches
    Object.entries(shortcuts).forEach(([shortcut, callback]) => {
      if (shortcut === combination || shortcut === singleKey) {
        event.preventDefault();
        callback(event);
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

// Global keyboard shortcuts component
// Component moved to components/GlobalKeyboardShortcuts.jsx to avoid JSX in .js files
