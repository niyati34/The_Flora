import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * Enhanced Auto-Save Hook with advanced features
 * @param {Object} options - Configuration options
 * @param {Function} options.saveFunction - Function to save data
 * @param {Function} options.loadFunction - Function to load data
 * @param {number} options.debounceMs - Debounce delay in milliseconds
 * @param {number} options.maxRetries - Maximum retry attempts
 * @param {boolean} options.enableOffline - Enable offline support
 * @param {string} options.storageKey - Local storage key for offline data
 * @param {boolean} options.autoSave - Enable/disable auto-save
 * @param {Function} options.onSave - Callback when save is successful
 * @param {Function} options.onError - Callback when save fails
 * @param {Function} options.onConflict - Callback when conflicts are detected
 */
export function useAutoSave(options = {}) {
  const {
    saveFunction,
    loadFunction,
    debounceMs = 2000,
    maxRetries = 3,
    enableOffline = true,
    storageKey = 'autosave_data',
    autoSave = true,
    onSave,
    onError,
    onConflict
  } = options;

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error, conflict
  const [retryCount, setRetryCount] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Refs for managing timeouts and data
  const saveTimeoutRef = useRef(null);
  const lastDataRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const conflictDataRef = useRef(null);

  // Debounced save function
  const debouncedSave = useCallback((data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(data);
    }, debounceMs);
  }, [debounceMs]);

  // Perform the actual save operation
  const performSave = useCallback(async (data) => {
    if (!saveFunction || !autoSave) return;

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    setRetryCount(0);

    try {
      // Check for conflicts if we have previous data
      if (lastDataRef.current && conflictDataRef.current) {
        const hasConflict = await checkForConflicts(data, conflictDataRef.current);
        if (hasConflict) {
          setSaveStatus('conflict');
          onConflict?.(data, conflictDataRef.current);
          setIsSaving(false);
          return;
        }
      }

      // Attempt to save
      const result = await saveFunction(data);
      
      // Update state on successful save
      lastDataRef.current = data;
      setLastSaved(new Date());
      setSaveStatus('saved');
      setRetryCount(0);
      lastSaveTimeRef.current = Date.now();
      
      // Clear offline queue if online
      if (isOnline && offlineQueue.length > 0) {
        await processOfflineQueue();
      }

      onSave?.(result, data);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          performSave(data);
        }, backoffDelay);
      } else {
        // Max retries reached, handle as error
        setSaveStatus('error');
        setRetryCount(0);
        
        // Add to offline queue if offline support is enabled
        if (enableOffline && !isOnline) {
          addToOfflineQueue(data);
        }
        
        onError?.(error, data);
      }
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction, autoSave, maxRetries, retryCount, isOnline, offlineQueue, enableOffline, onSave, onError, onConflict]);

  // Check for data conflicts
  const checkForConflicts = useCallback(async (currentData, serverData) => {
    if (!serverData) return false;
    
    // Simple timestamp-based conflict detection
    // In a real app, you might use version numbers, ETags, or more sophisticated conflict detection
    const currentTimestamp = currentData.lastModified || Date.now();
    const serverTimestamp = serverData.lastModified || 0;
    
    return serverTimestamp > currentTimestamp;
  }, []);

  // Add data to offline queue
  const addToOfflineQueue = useCallback((data) => {
    const queueItem = {
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    setOfflineQueue(prev => [...prev, queueItem]);
    
    // Store in localStorage
    try {
      const existingQueue = JSON.parse(localStorage.getItem(`${storageKey}_queue`) || '[]');
      existingQueue.push(queueItem);
      localStorage.setItem(`${storageKey}_queue`, JSON.stringify(existingQueue));
    } catch (error) {
      console.error('Failed to store offline queue:', error);
    }
  }, [storageKey]);

  // Process offline queue when back online
  const processOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const item of queue) {
      try {
        await saveFunction(item.data);
        
        // Remove from localStorage
        try {
          const existingQueue = JSON.parse(localStorage.getItem(`${storageKey}_queue`) || '[]');
          const updatedQueue = existingQueue.filter(q => q.id !== item.id);
          localStorage.setItem(`${storageKey}_queue`, JSON.stringify(updatedQueue));
        } catch (error) {
          console.error('Failed to update offline queue:', error);
        }
      } catch (error) {
        console.error('Failed to process offline item:', error);
        
        // Re-add to queue if still failing
        if (item.retryCount < maxRetries) {
          item.retryCount += 1;
          setOfflineQueue(prev => [...prev, item]);
        }
      }
    }
  }, [isOnline, offlineQueue, saveFunction, maxRetries, storageKey]);

  // Manual save function
  const saveNow = useCallback(async (data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    await performSave(data);
  }, [performSave]);

  // Force save without debouncing
  const forceSave = useCallback(async (data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const result = await saveFunction(data);
      lastDataRef.current = data;
      setLastSaved(new Date());
      setSaveStatus('saved');
      onSave?.(result, data);
      return result;
    } catch (error) {
      setSaveStatus('error');
      onError?.(error, data);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction, onSave, onError]);

  // Load data function
  const loadData = useCallback(async () => {
    if (!loadFunction) return null;

    try {
      const data = await loadFunction();
      lastDataRef.current = data;
      conflictDataRef.current = data;
      return data;
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Try to load from offline storage
      if (enableOffline) {
        try {
          const offlineData = localStorage.getItem(storageKey);
          if (offlineData) {
            const parsed = JSON.parse(offlineData);
            lastDataRef.current = parsed;
            return parsed;
          }
        } catch (error) {
          console.error('Failed to load offline data:', error);
        }
      }
      
      return null;
    }
  }, [loadFunction, enableOffline, storageKey]);

  // Reset auto-save state
  const reset = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(false);
    setSaveStatus('idle');
    setRetryCount(0);
    setOfflineQueue([]);
    lastDataRef.current = null;
    lastSaveTimeRef.current = 0;
    conflictDataRef.current = null;
  }, []);

  // Get save statistics
  const getStats = useMemo(() => ({
    isSaving,
    lastSaved,
    saveStatus,
    retryCount,
    offlineQueueLength: offlineQueue.length,
    isOnline,
    timeSinceLastSave: lastSaveTimeRef.current ? Date.now() - lastSaveTimeRef.current : null
  }), [isSaving, lastSaved, saveStatus, retryCount, offlineQueue.length, isOnline]);

  // Auto-save trigger function
  const triggerAutoSave = useCallback((data) => {
    if (!autoSave) return;
    
    // Store in offline storage immediately
    if (enableOffline) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to store offline data:', error);
      }
    }
    
    debouncedSave(data);
  }, [autoSave, enableOffline, storageKey, debouncedSave]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process offline queue when back online
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processOfflineQueue]);

  // Load offline queue from localStorage on mount
  useEffect(() => {
    if (enableOffline) {
      try {
        const queue = JSON.parse(localStorage.getItem(`${storageKey}_queue`) || '[]');
        setOfflineQueue(queue);
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    }
  }, [enableOffline, storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isSaving,
    lastSaved,
    saveStatus,
    retryCount,
    offlineQueue,
    isOnline,
    
    // Functions
    triggerAutoSave,
    saveNow,
    forceSave,
    loadData,
    reset,
    
    // Statistics
    stats: getStats,
    
    // Status helpers
    hasUnsavedChanges: () => {
      if (!lastDataRef.current) return false;
      return JSON.stringify(lastDataRef.current) !== JSON.stringify(lastDataRef.current);
    },
    
    getSaveProgress: () => {
      if (saveStatus === 'saving') {
        return retryCount > 0 ? `Retrying (${retryCount}/${maxRetries})` : 'Saving...';
      }
      return saveStatus;
    }
  };
}

/**
 * Specialized auto-save hook for forms
 */
export function useFormAutoSave(formData, options = {}) {
  const autoSaveHook = useAutoSave({
    ...options,
    saveFunction: options.saveFunction || (() => Promise.resolve()),
    debounceMs: options.debounceMs || 1000
  });

  // Auto-trigger save when form data changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      autoSaveHook.triggerAutoSave(formData);
    }
  }, [formData, autoSaveHook]);

  return autoSaveHook;
}

/**
 * Specialized auto-save hook for text editors
 */
export function useTextEditorAutoSave(text, options = {}) {
  const autoSaveHook = useAutoSave({
    ...options,
    saveFunction: options.saveFunction || (() => Promise.resolve()),
    debounceMs: options.debounceMs || 3000
  });

  // Auto-trigger save when text changes
  useEffect(() => {
    if (text && text.trim().length > 0) {
      autoSaveHook.triggerAutoSave({ content: text, lastModified: Date.now() });
    }
  }, [text, autoSaveHook]);

  return autoSaveHook;
}

/**
 * Specialized auto-save hook for settings
 */
export function useSettingsAutoSave(settings, options = {}) {
  const autoSaveHook = useAutoSave({
    ...options,
    saveFunction: options.saveFunction || (() => Promise.resolve()),
    debounceMs: options.debounceMs || 5000
  });

  // Auto-trigger save when settings change
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      autoSaveHook.triggerAutoSave({ ...settings, lastModified: Date.now() });
    }
  }, [settings, autoSaveHook]);

  return autoSaveHook;
}

/**
 * Utility function to create a save function with retry logic
 */
export function createSaveFunctionWithRetry(baseSaveFunction, retryOptions = {}) {
  const { maxRetries = 3, backoffMs = 1000 } = retryOptions;
  
  return async (data) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await baseSaveFunction(data);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = backoffMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };
}

/**
 * Utility function to create a save function with conflict resolution
 */
export function createSaveFunctionWithConflictResolution(baseSaveFunction, conflictResolver) {
  return async (data, serverData) => {
    try {
      return await baseSaveFunction(data);
    } catch (error) {
      if (error.name === 'ConflictError' && conflictResolver) {
        const resolvedData = await conflictResolver(data, serverData);
        return await baseSaveFunction(resolvedData);
      }
      throw error;
    }
  };
}
