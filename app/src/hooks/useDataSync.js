import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * Advanced Data Synchronization Hook
 * Manages data consistency across multiple sources with real-time updates
 */
export function useDataSync(options = {}) {
  const {
    primarySource,
    secondarySources = [],
    syncInterval = 5000,
    enableRealTimeSync = true,
    enableConflictResolution = true,
    enableOfflineQueue = true,
    maxRetries = 3,
    retryDelay = 1000,
    onSyncStart,
    onSyncComplete,
    onSyncError,
    onConflictDetected,
    onDataChanged
  } = options;

  // State management
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error, conflict
  const [dataSources, setDataSources] = useState(new Map());
  const [conflicts, setConflicts] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for managing sync operations
  const syncIntervalRef = useRef(null);
  const lastDataRef = useRef(new Map());
  const syncInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Initialize data sources
  useEffect(() => {
    const sources = new Map();
    
    if (primarySource) {
      sources.set('primary', {
        id: 'primary',
        source: primarySource,
        priority: 1,
        lastUpdate: null,
        data: null
      });
    }

    secondarySources.forEach((source, index) => {
      sources.set(`secondary_${index}`, {
        id: `secondary_${index}`,
        source,
        priority: 2 + index,
        lastUpdate: null,
        data: null
      });
    });

    setDataSources(sources);
  }, [primarySource, secondarySources]);

  // Start real-time synchronization
  useEffect(() => {
    if (enableRealTimeSync && dataSources.size > 0) {
      startRealTimeSync();
    }

    return () => {
      stopRealTimeSync();
    };
  }, [enableRealTimeSync, dataSources]);

  // Start real-time sync
  const startRealTimeSync = useCallback(() => {
    if (syncIntervalRef.current) return;

    syncIntervalRef.current = setInterval(() => {
      if (!syncInProgressRef.current) {
        performSync();
      }
    }, syncInterval);
  }, [syncInterval]);

  // Stop real-time sync
  const stopRealTimeSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Perform synchronization
  const performSync = useCallback(async () => {
    if (syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setSyncStatus('syncing');
    onSyncStart?.();

    try {
      // Create abort controller for this sync operation
      abortControllerRef.current = new AbortController();

      // Fetch data from all sources
      const syncPromises = Array.from(dataSources.values()).map(async (sourceInfo) => {
        try {
          const data = await sourceInfo.source.fetch({
            signal: abortControllerRef.current.signal
          });

          return {
            ...sourceInfo,
            data,
            lastUpdate: new Date(),
            error: null
          };
        } catch (error) {
          if (error.name === 'AbortError') {
            throw error;
          }

          return {
            ...sourceInfo,
            data: null,
            error: error.message,
            lastUpdate: new Date()
          };
        }
      });

      const results = await Promise.allSettled(syncPromises);
      
      // Process results and detect conflicts
      const updatedSources = new Map();
      const newConflicts = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const sourceInfo = result.value;
          updatedSources.set(sourceInfo.id, sourceInfo);

          // Check for conflicts with primary source
          if (sourceInfo.id !== 'primary' && sourceInfo.data && dataSources.get('primary')?.data) {
            const primaryData = dataSources.get('primary').data;
            const conflict = detectConflict(primaryData, sourceInfo.data, sourceInfo.id);
            
            if (conflict) {
              newConflicts.push(conflict);
            }
          }
        }
      });

      // Update data sources
      setDataSources(updatedSources);

      // Handle conflicts
      if (newConflicts.length > 0 && enableConflictResolution) {
        setConflicts(prev => [...prev, ...newConflicts]);
        onConflictDetected?.(newConflicts);
        setSyncStatus('conflict');
      } else {
        setSyncStatus('success');
        setConflicts([]);
      }

      // Update last sync time
      setLastSyncTime(new Date());
      setRetryCount(0);

      // Process offline queue
      if (enableOfflineQueue && offlineQueue.length > 0) {
        await processOfflineQueue();
      }

      onSyncComplete?.(updatedSources);

    } catch (error) {
      console.error('Sync failed:', error);
      
      if (error.name === 'AbortError') {
        setSyncStatus('idle');
      } else {
        setSyncStatus('error');
        
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            performSync();
          }, retryDelay * Math.pow(2, retryCount));
        } else {
          setRetryCount(0);
        }
      }

      onSyncError?.(error);
    } finally {
      syncInProgressRef.current = false;
      setIsSyncing(false);
    }
  }, [dataSources, enableConflictResolution, enableOfflineQueue, offlineQueue, maxRetries, retryDelay, onSyncStart, onSyncComplete, onSyncError, onConflictDetected]);

  // Detect data conflicts
  const detectConflict = useCallback((primaryData, secondaryData, sourceId) => {
    if (!primaryData || !secondaryData) return null;

    // Simple timestamp-based conflict detection
    // In a real app, you might use more sophisticated conflict detection
    const primaryTimestamp = primaryData.lastModified || primaryData.updatedAt || 0;
    const secondaryTimestamp = secondaryData.lastModified || secondaryData.updatedAt || 0;

    if (Math.abs(primaryTimestamp - secondaryTimestamp) > 60000) { // 1 minute threshold
      return {
        id: `${sourceId}_${Date.now()}`,
        sourceId,
        primaryData,
        secondaryData,
        primaryTimestamp,
        secondaryTimestamp,
        detectedAt: new Date(),
        resolved: false
      };
    }

    return null;
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId, resolution) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    try {
      // Apply resolution
      if (resolution.type === 'usePrimary') {
        await updateSecondarySource(conflict.sourceId, conflict.primaryData);
      } else if (resolution.type === 'useSecondary') {
        await updatePrimarySource(conflict.secondaryData);
      } else if (resolution.type === 'merge') {
        const mergedData = await mergeData(conflict.primaryData, conflict.secondaryData);
        await updatePrimarySource(mergedData);
        await updateSecondarySource(conflict.sourceId, mergedData);
      }

      // Mark conflict as resolved
      setConflicts(prev => prev.map(c => 
        c.id === conflictId ? { ...c, resolved: true, resolvedAt: new Date() } : c
      ));

      // Trigger data change callback
      onDataChanged?.(conflict.primaryData, 'conflict_resolved');

    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }, [conflicts, onDataChanged]);

  // Update primary source
  const updatePrimarySource = useCallback(async (data) => {
    if (!primarySource?.update) return;

    try {
      await primarySource.update(data);
      
      // Update local state
      setDataSources(prev => {
        const updated = new Map(prev);
        const primary = updated.get('primary');
        if (primary) {
          updated.set('primary', {
            ...primary,
            data,
            lastUpdate: new Date()
          });
        }
        return updated;
      });

      onDataChanged?.(data, 'primary_updated');
    } catch (error) {
      console.error('Failed to update primary source:', error);
      throw error;
    }
  }, [primarySource, onDataChanged]);

  // Update secondary source
  const updateSecondarySource = useCallback(async (sourceId, data) => {
    const sourceInfo = dataSources.get(sourceId);
    if (!sourceInfo?.source?.update) return;

    try {
      await sourceInfo.source.update(data);
      
      // Update local state
      setDataSources(prev => {
        const updated = new Map(prev);
        const source = updated.get(sourceId);
        if (source) {
          updated.set(sourceId, {
            ...source,
            data,
            lastUpdate: new Date()
          });
        }
        return updated;
      });

      onDataChanged?.(data, 'secondary_updated');
    } catch (error) {
      console.error('Failed to update secondary source:', error);
      throw error;
    }
  }, [dataSources, onDataChanged]);

  // Merge data from multiple sources
  const mergeData = useCallback(async (primaryData, secondaryData) => {
    // Simple merge strategy - in a real app, you might use more sophisticated merging
    return {
      ...primaryData,
      ...secondaryData,
      lastModified: Date.now(),
      mergedAt: new Date().toISOString(),
      mergeSource: 'auto'
    };
  }, []);

  // Add to offline queue
  const addToOfflineQueue = useCallback((operation) => {
    if (!enableOfflineQueue) return;

    const queueItem = {
      id: Date.now(),
      operation,
      timestamp: new Date(),
      retryCount: 0
    };

    setOfflineQueue(prev => [...prev, queueItem]);
  }, [enableOfflineQueue]);

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const item of queue) {
      try {
        await executeOperation(item.operation);
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        
        if (item.retryCount < maxRetries) {
          item.retryCount += 1;
          setOfflineQueue(prev => [...prev, item]);
        }
      }
    }
  }, [offlineQueue, maxRetries]);

  // Execute operation
  const executeOperation = useCallback(async (operation) => {
    switch (operation.type) {
      case 'update_primary':
        await updatePrimarySource(operation.data);
        break;
      case 'update_secondary':
        await updateSecondarySource(operation.sourceId, operation.data);
        break;
      case 'merge_data':
        const mergedData = await mergeData(operation.primaryData, operation.secondaryData);
        await updatePrimarySource(mergedData);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }, [updatePrimarySource, updateSecondarySource, mergeData]);

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    if (syncInProgressRef.current) return;
    await performSync();
  }, [performSync]);

  // Force sync without checking if already in progress
  const forceSync = useCallback(async () => {
    syncInProgressRef.current = false;
    await performSync();
  }, [performSync]);

  // Abort current sync operation
  const abortSync = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Get sync statistics
  const getSyncStats = useMemo(() => ({
    isSyncing,
    lastSyncTime,
    syncStatus,
    retryCount,
    conflictsCount: conflicts.length,
    unresolvedConflicts: conflicts.filter(c => !c.resolved).length,
    offlineQueueLength: offlineQueue.length,
    dataSourcesCount: dataSources.size,
    primarySourceStatus: dataSources.get('primary')?.error ? 'error' : 'ok'
  }), [isSyncing, lastSyncTime, syncStatus, retryCount, conflicts, offlineQueue, dataSources]);

  // Get data from specific source
  const getDataFromSource = useCallback((sourceId) => {
    return dataSources.get(sourceId)?.data || null;
  }, [dataSources]);

  // Get primary data
  const getPrimaryData = useCallback(() => {
    return getDataFromSource('primary');
  }, [getDataFromSource]);

  // Check if source has errors
  const hasSourceErrors = useCallback((sourceId) => {
    const source = dataSources.get(sourceId);
    return source?.error !== null && source?.error !== undefined;
  }, [dataSources]);

  // Clear conflicts
  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  // Reset sync state
  const resetSync = useCallback(() => {
    stopRealTimeSync();
    setSyncStatus('idle');
    setRetryCount(0);
    setConflicts([]);
    setOfflineQueue([]);
    syncInProgressRef.current = false;
  }, [stopRealTimeSync]);

  return {
    // State
    isSyncing,
    lastSyncTime,
    syncStatus,
    conflicts,
    offlineQueue,
    dataSources,

    // Functions
    syncNow,
    forceSync,
    abortSync,
    resolveConflict,
    addToOfflineQueue,
    getDataFromSource,
    getPrimaryData,
    hasSourceErrors,
    clearConflicts,
    resetSync,

    // Statistics
    stats: getSyncStats,

    // Status helpers
    isOnline: navigator.onLine,
    canSync: !syncInProgressRef.current && dataSources.size > 0,
    hasConflicts: conflicts.length > 0,
    hasOfflineItems: offlineQueue.length > 0
  };
}

/**
 * Specialized hook for syncing user preferences
 */
export function usePreferencesSync(preferences, options = {}) {
  const syncHook = useDataSync({
    primarySource: {
      fetch: () => Promise.resolve(preferences),
      update: options.updateFunction || (() => Promise.resolve())
    },
    secondarySources: options.secondarySources || [],
    syncInterval: options.syncInterval || 10000,
    enableConflictResolution: true,
    ...options
  });

  return syncHook;
}

/**
 * Specialized hook for syncing shopping cart
 */
export function useCartSync(cartData, options = {}) {
  const syncHook = useDataSync({
    primarySource: {
      fetch: () => Promise.resolve(cartData),
      update: options.updateFunction || (() => Promise.resolve())
    },
    secondarySources: options.secondarySources || [],
    syncInterval: options.syncInterval || 2000,
    enableRealTimeSync: true,
    enableConflictResolution: true,
    ...options
  });

  return syncHook;
}

/**
 * Specialized hook for syncing user data
 */
export function useUserDataSync(userData, options = {}) {
  const syncHook = useDataSync({
    primarySource: {
      fetch: () => Promise.resolve(userData),
      update: options.updateFunction || (() => Promise.resolve())
    },
    secondarySources: options.secondarySources || [],
    syncInterval: options.syncInterval || 30000,
    enableConflictResolution: true,
    enableOfflineQueue: true,
    ...options
  });

  return syncHook;
}
