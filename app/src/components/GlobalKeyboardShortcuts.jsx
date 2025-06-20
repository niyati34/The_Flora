import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

export default function GlobalKeyboardShortcuts({
  onOpenSearch,
  onToggleCart,
  onGoHome,
}) {
  const shortcuts = {
    "ctrl+k": onOpenSearch,
    "ctrl+shift+c": onToggleCart,
    "ctrl+h": onGoHome,
    escape: () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    },
  };

  useKeyboardShortcuts(shortcuts);

  return (
    <div
      className="keyboard-shortcuts-help position-fixed bottom-0 end-0 p-2"
      style={{ zIndex: 1000 }}
    >
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
