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
export function GlobalKeyboardShortcuts({ onOpenSearch, onToggleCart, onGoHome }) {
  const shortcuts = {
    'ctrl+k': onOpenSearch,
    'ctrl+shift+c': onToggleCart,
    'ctrl+h': onGoHome,
    'escape': () => {
      // Close any open modals or dropdowns
      const activeElement = document.activeElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }
  };

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="keyboard-shortcuts-help position-fixed bottom-0 end-0 p-2" style={{ zIndex: 1000 }}>
      <button 
        className="btn btn-sm btn-outline-secondary"
        data-bs-toggle="tooltip"
        title="Keyboard Shortcuts: Ctrl+K (Search), Ctrl+Shift+C (Cart), Ctrl+H (Home)"
      >
        <i className="fas fa-keyboard"></i>
      </button>
    </div>
  );
}
