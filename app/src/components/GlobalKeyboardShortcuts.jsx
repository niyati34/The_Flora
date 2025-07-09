import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function GlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, getCartCount, clearCart } = useCart();
  const { addToWishlist, getWishlistCount, clearWishlist } = useWishlist();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Keyboard shortcuts configuration
  const shortcuts = [
    {
      key: "?",
      description: "Show/Hide Keyboard Shortcuts",
      action: () => setShowShortcuts(!showShortcuts),
      category: "Navigation",
    },
    {
      key: "h",
      description: "Go to Home",
      action: () => navigate("/"),
      category: "Navigation",
    },
    {
      key: "s",
      description: "Go to Search",
      action: () => navigate("/search"),
      category: "Navigation",
    },
    {
      key: "c",
      description: "Go to Cart",
      action: () => navigate("/cart"),
      category: "Navigation",
    },
    {
      key: "w",
      description: "Go to Wishlist",
      action: () => navigate("/wishlist"),
      category: "Navigation",
    },
    {
      key: "p",
      description: "Go to Products",
      action: () => navigate("/products"),
      category: "Navigation",
    },
    {
      key: "a",
      description: "Go to About",
      action: () => navigate("/about"),
      category: "Navigation",
    },
    {
      key: "Escape",
      description: "Close modals, go back",
      action: () => {
        if (showShortcuts) setShowShortcuts(false);
        if (showHelp) setShowHelp(false);
        // Add more close actions as needed
      },
      category: "Navigation",
    },
    {
      key: "Ctrl + /",
      description: "Quick Add to Cart (from product page)",
      action: () => {
        // This would need context from the current product
        setLastAction("Quick Add to Cart");
      },
      category: "Shopping",
    },
    {
      key: "Ctrl + w",
      description: "Quick Add to Wishlist (from product page)",
      action: () => {
        setLastAction("Quick Add to Wishlist");
      },
      category: "Shopping",
    },
    {
      key: "Ctrl + c",
      description: "Clear Cart",
      action: () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
          clearCart();
          setLastAction("Cart Cleared");
        }
      },
      category: "Shopping",
    },
    {
      key: "Ctrl + W",
      description: "Clear Wishlist",
      action: () => {
        if (window.confirm("Are you sure you want to clear your wishlist?")) {
          clearWishlist();
          setLastAction("Wishlist Cleared");
        }
      },
      category: "Shopping",
    },
    {
      key: "Ctrl + s",
      description: "Save current page",
      action: () => {
        setLastAction("Page Saved");
      },
      category: "Utility",
    },
    {
      key: "Ctrl + f",
      description: "Focus search bar",
      action: () => {
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
        );
        if (searchInput) {
          searchInput.focus();
          setLastAction("Search Focused");
        }
      },
      category: "Utility",
    },
    {
      key: "Ctrl + k",
      description: "Quick search",
      action: () => {
        navigate("/search");
        setLastAction("Quick Search Opened");
      },
      category: "Utility",
    },
    {
      key: "Ctrl + h",
      description: "Go to Home",
      action: () => navigate("/"),
      category: "Utility",
    },
    {
      key: "Ctrl + b",
      description: "Toggle sidebar (if available)",
      action: () => {
        setLastAction("Sidebar Toggled");
      },
      category: "Utility",
    },
    {
      key: "Ctrl + m",
      description: "Toggle mobile menu",
      action: () => {
        setLastAction("Mobile Menu Toggled");
      },
      category: "Utility",
    },
    {
      key: "Ctrl + t",
      description: "Toggle theme (if available)",
      action: () => {
        setLastAction("Theme Toggled");
      },
      category: "Utility",
    },
    {
      key: "Ctrl + r",
      description: "Refresh page",
      action: () => {
        window.location.reload();
      },
      category: "System",
    },
    {
      key: "Ctrl + Shift + R",
      description: "Hard refresh (clear cache)",
      action: () => {
        window.location.reload(true);
      },
      category: "System",
    },
    {
      key: "Ctrl + 0",
      description: "Reset zoom",
      action: () => {
        document.body.style.zoom = "100%";
        setLastAction("Zoom Reset");
      },
      category: "System",
    },
    {
      key: "Ctrl + +",
      description: "Zoom in",
      action: () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 100;
        document.body.style.zoom = Math.min(currentZoom + 10, 200) + "%";
        setLastAction("Zoomed In");
      },
      category: "System",
    },
    {
      key: "Ctrl + -",
      description: "Zoom out",
      action: () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 100;
        document.body.style.zoom = Math.max(currentZoom - 10, 50) + "%";
        setLastAction("Zoomed Out");
      },
      category: "System",
    },
  ];

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  const handleKeyDown = useCallback(
    (event) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.contentEditable === "true"
      ) {
        return;
      }

      const key = event.key;
      const ctrl = event.ctrlKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        if (s.key.includes("Ctrl +")) {
          return ctrl && !shift && !alt && s.key.includes(key);
        } else if (s.key.includes("Ctrl + Shift +")) {
          return ctrl && shift && !alt && s.key.includes(key);
        } else if (s.key === key) {
          return !ctrl && !shift && !alt;
        }
        return false;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-hide last action after 3 seconds
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  // Close shortcuts panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShortcuts && !event.target.closest(".shortcuts-panel")) {
        setShowShortcuts(false);
      }
    };

    if (showShortcuts) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShortcuts]);

  if (!showShortcuts) return null;

  return (
    <>
      <style>
        {`
          .shortcuts-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .shortcuts-panel {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
          }
          
          .shortcuts-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f8f9fa;
          }
          
          .shortcuts-title {
            font-size: 2rem;
            font-weight: 700;
            color: #2B5943;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
          }
          
          .shortcuts-subtitle {
            color: #666;
            font-size: 1.1rem;
          }
          
          .shortcuts-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          .shortcuts-close:hover {
            background: #f8f9fa;
            color: #333;
          }
          
          .shortcuts-categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
          }
          
          .shortcut-category {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e9ecef;
          }
          
          .category-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 10px;
            border-bottom: 2px solid #6A9304;
          }
          
          .shortcut-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
          }
          
          .shortcut-item:hover {
            border-color: #6A9304;
            box-shadow: 0 2px 8px rgba(106, 147, 4, 0.1);
          }
          
          .shortcut-description {
            color: #333;
            font-size: 0.9rem;
            flex: 1;
          }
          
          .shortcut-key {
            background: #6A9304;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            min-width: 60px;
            text-align: center;
          }
          
          .shortcut-key.ctrl {
            background: #dc3545;
          }
          
          .shortcut-key.system {
            background: #6c757d;
          }
          
          .shortcuts-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f8f9fa;
            color: #666;
            font-size: 0.9rem;
          }
          
          .last-action-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6A9304;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .shortcuts-trigger {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #6A9304;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .shortcuts-trigger:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.4);
          }
          
          .shortcuts-trigger i {
            font-size: 1.2rem;
          }
          
          @media (max-width: 768px) {
            .shortcuts-panel {
              padding: 20px;
              margin: 20px;
              max-height: 90vh;
            }
            
            .shortcuts-title {
              font-size: 1.5rem;
            }
            
            .shortcuts-categories {
              grid-template-columns: 1fr;
            }
            
            .shortcut-item {
              flex-direction: column;
              gap: 8px;
              text-align: center;
            }
            
            .shortcuts-trigger {
              bottom: 15px;
              left: 15px;
              width: 45px;
              height: 45px;
            }
          }
        `}
      </style>

      <div className="shortcuts-overlay">
        <div className="shortcuts-panel">
          <button
            className="shortcuts-close"
            onClick={() => setShowShortcuts(false)}
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="shortcuts-header">
            <h2 className="shortcuts-title">
              <i className="fas fa-keyboard" style={{ color: "#6A9304" }}></i>
              Keyboard Shortcuts
              <i className="fas fa-magic" style={{ color: "#8BC34A" }}></i>
            </h2>
            <p className="shortcuts-subtitle">
              Use these keyboard shortcuts to navigate and interact with The
              Flora faster
            </p>
          </div>

          <div className="shortcuts-categories">
            {Object.entries(shortcutsByCategory).map(
              ([category, categoryShortcuts]) => (
                <div key={category} className="shortcut-category">
                  <h3 className="category-title">
                    <i
                      className={`fas fa-${getCategoryIcon(category)}`}
                      style={{ color: "#6A9304" }}
                    ></i>
                    {category}
                  </h3>
                  <div className="shortcut-list">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <span className="shortcut-description">
                          {shortcut.description}
                        </span>
                        <span
                          className={`shortcut-key ${getKeyClass(
                            shortcut.key
                          )}`}
                        >
                          {formatKeyDisplay(shortcut.key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="shortcuts-footer">
            <p>
              <i
                className="fas fa-lightbulb me-2"
                style={{ color: "#ffc107" }}
              ></i>
              Tip: Press <kbd>?</kbd> anytime to show/hide this panel
            </p>
            <p style={{ marginTop: "10px", fontSize: "0.8rem" }}>
              Shortcuts work globally across the website, except when typing in
              input fields
            </p>
          </div>
        </div>
      </div>

      {lastAction && (
        <div className="last-action-toast">
          <i className="fas fa-check-circle"></i>
          {lastAction}
        </div>
      )}

      <button
        className="shortcuts-trigger"
        onClick={() => setShowShortcuts(true)}
        title="Show Keyboard Shortcuts (?)"
      >
        <i className="fas fa-keyboard"></i>
      </button>
    </>
  );
}

// Helper functions
function getCategoryIcon(category) {
  const icons = {
    Navigation: "compass",
    Shopping: "shopping-cart",
    Utility: "tools",
    System: "cog",
  };
  return icons[category] || "star";
}

function getKeyClass(key) {
  if (key.includes("Ctrl +")) return "ctrl";
  if (
    key.includes("System") ||
    key.includes("Ctrl + r") ||
    key.includes("Ctrl + Shift")
  )
    return "system";
  return "";
}

function formatKeyDisplay(key) {
  if (key.includes("Ctrl +")) {
    return key.replace("Ctrl +", "⌘+");
  }
  if (key.includes("Shift +")) {
    return key.replace("Shift +", "⇧+");
  }
  if (key.includes("Alt +")) {
    return key.replace("Alt +", "⌥+");
  }
  return key;
}
