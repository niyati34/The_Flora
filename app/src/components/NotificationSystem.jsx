import { useState, useEffect, useCallback, useRef } from "react";
import { createContext, useContext } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// Notification Context
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enablePush: true,
    enableEmail: false,
    enableSMS: false,
    quietHours: { start: 22, end: 8 },
    categories: {
      cart: true,
      wishlist: true,
      orders: true,
      promotions: true,
      system: true
    }
  });

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100));
    
    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }
    
    // Show toast notification
    showToast(newNotification);
    
    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('flora_notification_settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flora_notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('flora_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flora_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const value = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Toast Notification Component
function ToastNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    if (notification.duration && notification.duration !== 0) {
      const startTime = Date.now();
      const duration = notification.duration;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining > 0) {
          progressRef.current = requestAnimationFrame(updateProgress);
        }
      };
      
      progressRef.current = requestAnimationFrame(updateProgress);
    }
    
    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [notification.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      case 'info': return 'toast-info';
      default: return 'toast-default';
    }
  };

  return (
    <div className={`toast-notification ${getTypeClass(notification.type)} ${isVisible ? 'show' : ''}`}>
      <div className="toast-header">
        <span className="toast-icon">{getIcon(notification.type)}</span>
        <span className="toast-title">{notification.title}</span>
        <button className="toast-close" onClick={handleClose}>×</button>
      </div>
      
      {notification.message && (
        <div className="toast-body">
          {notification.message}
        </div>
      )}
      
      {notification.duration && notification.duration !== 0 && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {notification.actions && (
        <div className="toast-actions">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              className={`btn btn-sm ${action.variant || 'btn-outline-secondary'}`}
              onClick={() => {
                action.onClick();
                handleClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Toast Container
function ToastContainer() {
  const { notifications } = useNotifications();
  const toastNotifications = notifications.filter(n => n.showAsToast !== false);

  return (
    <div className="toast-container">
      {toastNotifications.slice(0, 3).map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => {}}
        />
      ))}
    </div>
  );
}

// Notification Bell Component
function NotificationBell() {
  const { notifications, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-success';
      case 'error': return 'fas fa-exclamation-circle text-danger';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'info': return 'fas fa-info-circle text-info';
      default: return 'fas fa-bell text-secondary';
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className="btn btn-outline-secondary position-relative"
        onClick={handleToggle}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h6 className="mb-0">Notifications</h6>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <i className="fas fa-bell-slash fa-2x mb-2"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <i className={getNotificationIcon(notification.type)}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    {notification.message && (
                      <div className="notification-message">{notification.message}</div>
                    )}
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 10 && (
            <div className="notification-footer">
              <button className="btn btn-link btn-sm">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const { settings, updateSettings } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (category) => {
    updateSettings({
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category]
      }
    });
  };

  const handleQuietHoursChange = (type, value) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        [type]: parseInt(value)
      }
    });
  };

  return (
    <div className="notification-settings">
      <button 
        className="btn btn-outline-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-cog"></i> Settings
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <div className="settings-header">
            <h6>Notification Settings</h6>
            <button 
              className="btn-close"
              onClick={() => setIsOpen(false)}
            ></button>
          </div>
          
          <div className="settings-body">
            <div className="setting-group">
              <label className="form-label">Notification Methods</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enablePush"
                  checked={settings.enablePush}
                  onChange={(e) => updateSettings({ enablePush: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="enablePush">
                  Push Notifications
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enableEmail"
                  checked={settings.enableEmail}
                  onChange={(e) => updateSettings({ enableEmail: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="enableEmail">
                  Email Notifications
                </label>
              </div>
            </div>
            
            <div className="setting-group">
              <label className="form-label">Notification Categories</label>
              {Object.entries(settings.categories).map(([category, enabled]) => (
                <div key={category} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`category-${category}`}
                    checked={enabled}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <label className="form-check-label" htmlFor={`category-${category}`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="setting-group">
              <label className="form-label">Quiet Hours</label>
              <div className="row">
                <div className="col-6">
                  <label className="form-label">Start Time</label>
                  <select
                    className="form-select"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">End Time</label>
                  <select
                    className="form-select"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Notification System Component
export default function NotificationSystem() {
  return (
    <>
      <ToastContainer />
      <div className="notification-controls">
        <NotificationBell />
        <NotificationSettings />
      </div>
    </>
  );
}

// Utility function to show toast notifications
export function showToast(notification) {
  // This would integrate with the notification context
  console.log('Toast notification:', notification);
}

// Utility function to create notification types
export const createNotification = {
  success: (title, message, options = {}) => ({
    type: 'success',
    title,
    message,
    duration: 5000,
    ...options
  }),
  
  error: (title, message, options = {}) => ({
    type: 'error',
    title,
    message,
    duration: 8000,
    ...options
  }),
  
  warning: (title, message, options = {}) => ({
    type: 'warning',
    title,
    message,
    duration: 6000,
    ...options
  }),
  
  info: (title, message, options = {}) => ({
    type: 'info',
    title,
    message,
    duration: 4000,
    ...options
  }),
  
  cart: (title, message, options = {}) => ({
    type: 'success',
    title,
    message,
    duration: 4000,
    category: 'cart',
    ...options
  }),
  
  wishlist: (title, message, options = {}) => ({
    type: 'info',
    title,
    message,
    duration: 4000,
    category: 'wishlist',
    ...options
  })
};

// Styles
const styles = `
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .toast-notification {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 300px;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow: hidden;
  }
  
  .toast-notification.show {
    transform: translateX(0);
  }
  
  .toast-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
  }
  
  .toast-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  .toast-title {
    flex: 1;
    font-weight: 600;
    font-size: 14px;
  }
  
  .toast-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toast-close:hover {
    color: #333;
  }
  
  .toast-body {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
  }
  
  .toast-progress {
    height: 3px;
    background: #eee;
  }
  
  .toast-progress-bar {
    height: 100%;
    background: #007bff;
    transition: width 0.1s linear;
  }
  
  .toast-actions {
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .toast-success .toast-header {
    background: #d4edda;
    color: #155724;
  }
  
  .toast-error .toast-header {
    background: #f8d7da;
    color: #721c24;
  }
  
  .toast-warning .toast-header {
    background: #fff3cd;
    color: #856404;
  }
  
  .toast-info .toast-header {
    background: #d1ecf1;
    color: #0c5460;
  }
  
  .notification-controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .notification-bell {
    position: relative;
  }
  
  .notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 350px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    margin-top: 8px;
  }
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .notification-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .notification-item {
    display: flex;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s;
  }
  
  .notification-item:hover {
    background-color: #f8f9fa;
  }
  
  .notification-item.unread {
    background-color: #f0f8ff;
  }
  
  .notification-icon {
    margin-right: 12px;
    font-size: 18px;
    width: 20px;
    text-align: center;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .notification-message {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .notification-time {
    font-size: 12px;
    color: #999;
  }
  
  .notification-footer {
    padding: 12px 16px;
    text-align: center;
    border-top: 1px solid #eee;
  }
  
  .notification-settings {
    position: relative;
  }
  
  .settings-panel {
    position: absolute;
    top: 100%;
    right: 0;
    width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    margin-top: 8px;
  }
  
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .settings-body {
    padding: 16px;
  }
  
  .setting-group {
    margin-bottom: 20px;
  }
  
  .setting-group:last-child {
    margin-bottom: 0;
  }
  
  .form-check {
    margin-bottom: 8px;
  }
  
  .form-check:last-child {
    margin-bottom: 0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
