import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * Enhanced Performance Monitoring Hook
 * Tracks various performance metrics and provides optimization insights
 */
export function usePerformanceMonitor(options = {}) {
  const {
    enableRealTimeMonitoring = true,
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = true,
    enableUserInteractionMonitoring = true,
    enableErrorMonitoring = true,
    enableCustomMetrics = true,
    samplingRate = 1000, // ms
    maxDataPoints = 1000,
    enableLocalStorage = true,
    storageKey = 'performance_metrics'
  } = options;

  // Performance state
  const [metrics, setMetrics] = useState({
    pageLoad: {},
    memory: {},
    network: {},
    interactions: {},
    errors: [],
    custom: {},
    summary: {}
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Refs for monitoring
  const monitoringIntervalRef = useRef(null);
  const performanceObserverRef = useRef(null);
  const sessionStartTimeRef = useRef(0);
  const dataPointsRef = useRef([]);
  const customMetricsRef = useRef(new Map());

  // Initialize performance monitoring
  useEffect(() => {
    if (enableRealTimeMonitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enableRealTimeMonitoring]);

  // Start real-time monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    sessionStartTimeRef.current = Date.now();
    setCurrentSession(generateSessionId());

    // Start periodic monitoring
    monitoringIntervalRef.current = setInterval(() => {
      collectMetrics();
    }, samplingRate);

    // Initialize performance observers
    initializePerformanceObservers();

    // Collect initial metrics
    collectInitialMetrics();
  }, [isMonitoring, samplingRate]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }

    setIsMonitoring(false);
  }, []);

  // Initialize performance observers
  const initializePerformanceObservers = useCallback(() => {
    if (!window.PerformanceObserver) return;

    try {
      // Monitor long tasks
      if (window.PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              addCustomMetric('longTasks', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name || 'Unknown'
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }

      // Monitor paint timing
      if (window.PerformanceObserver.supportedEntryTypes?.includes('paint')) {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            addCustomMetric('paintMetrics', {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      }

      // Monitor layout shifts
      if (window.PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.value > 0.1) { // Significant layout shifts
              addCustomMetric('layoutShifts', {
                value: entry.value,
                sources: entry.sources,
                startTime: entry.startTime
              });
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Monitor resource timing
      if (window.PerformanceObserver.supportedEntryTypes?.includes('resource')) {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === 'img' || entry.initiatorType === 'script') {
              addCustomMetric('resourceTiming', {
                name: entry.name,
                initiatorType: entry.initiatorType,
                duration: entry.duration,
                transferSize: entry.transferSize,
                decodedBodySize: entry.decodedBodySize
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      }

    } catch (error) {
      console.warn('Performance observer initialization failed:', error);
    }
  }, []);

  // Collect initial metrics
  const collectInitialMetrics = useCallback(() => {
    // Page load metrics
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigation = window.performance.navigation;

      const pageLoadMetrics = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        redirectCount: navigation.redirectCount,
        navigationType: navigation.type
      };

      setMetrics(prev => ({
        ...prev,
        pageLoad: pageLoadMetrics
      }));
    }

    // Navigation API metrics (modern browsers)
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntries = window.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        const modernPageLoadMetrics = {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          domReady: nav.domContentLoadedEventEnd - nav.startTime,
          pageLoad: nav.loadEventEnd - nav.startTime,
          firstByte: nav.responseStart - nav.requestStart,
          dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
          tcpConnection: nav.connectEnd - nav.connectStart,
          serverResponse: nav.responseEnd - nav.responseStart
        };

        setMetrics(prev => ({
          ...prev,
          pageLoad: { ...prev.pageLoad, ...modernPageLoadMetrics }
        }));
      }
    }
  }, []);

  // Collect real-time metrics
  const collectMetrics = useCallback(() => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - sessionStartTimeRef.current;

    // Memory metrics
    if (enableMemoryMonitoring && window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      const memoryMetrics = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      setMetrics(prev => ({
        ...prev,
        memory: memoryMetrics
      }));
    }

    // Network metrics
    if (enableNetworkMonitoring && navigator.connection) {
      const connection = navigator.connection;
      const networkMetrics = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };

      setMetrics(prev => ({
        ...prev,
        network: networkMetrics
      }));
    }

    // Store data point
    const dataPoint = {
      timestamp: currentTime,
      sessionDuration,
      memory: enableMemoryMonitoring ? metrics.memory : {},
      network: enableNetworkMonitoring ? metrics.network : {},
      custom: Object.fromEntries(customMetricsRef.current)
    };

    dataPointsRef.current.push(dataPoint);

    // Limit data points
    if (dataPointsRef.current.length > maxDataPoints) {
      dataPointsRef.current = dataPointsRef.current.slice(-maxDataPoints);
    }

    // Update summary metrics
    updateSummaryMetrics();
  }, [enableMemoryMonitoring, enableNetworkMonitoring, maxDataPoints, metrics.memory, metrics.network]);

  // Update summary metrics
  const updateSummaryMetrics = useCallback(() => {
    if (dataPointsRef.current.length === 0) return;

    const summary = {
      totalDataPoints: dataPointsRef.current.length,
      sessionDuration: Date.now() - sessionStartTimeRef.current,
      averageMemoryUsage: calculateAverage(dataPointsRef.current, 'memory.usagePercentage'),
      peakMemoryUsage: Math.max(...dataPointsRef.current.map(dp => dp.memory.usagePercentage || 0)),
      averageNetworkRTT: calculateAverage(dataPointsRef.current, 'network.rtt'),
      totalErrors: metrics.errors.length,
      performanceScore: calculatePerformanceScore()
    };

    setMetrics(prev => ({
      ...prev,
      summary
    }));
  }, [metrics.errors.length]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    let score = 100;

    // Deduct points for poor performance
    if (metrics.pageLoad.pageLoad > 3000) score -= 20;
    if (metrics.pageLoad.pageLoad > 5000) score -= 30;

    if (metrics.memory.usagePercentage > 80) score -= 15;
    if (metrics.memory.usagePercentage > 90) score -= 25;

    if (metrics.errors.length > 5) score -= 20;
    if (metrics.errors.length > 10) score -= 30;

    return Math.max(0, score);
  }, [metrics.pageLoad.pageLoad, metrics.memory.usagePercentage, metrics.errors.length]);

  // Add custom metric
  const addCustomMetric = useCallback((category, value) => {
    if (!enableCustomMetrics) return;

    if (!customMetricsRef.current.has(category)) {
      customMetricsRef.current.set(category, []);
    }

    const categoryMetrics = customMetricsRef.current.get(category);
    categoryMetrics.push({
      ...value,
      timestamp: Date.now()
    });

    // Limit metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.splice(0, categoryMetrics.length - 100);
    }
  }, [enableCustomMetrics]);

  // Track user interaction
  const trackInteraction = useCallback((type, details = {}) => {
    if (!enableUserInteractionMonitoring) return;

    const interaction = {
      type,
      timestamp: Date.now(),
      details,
      sessionDuration: Date.now() - sessionStartTimeRef.current
    };

    setMetrics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        [type]: [...(prev.interactions[type] || []), interaction].slice(-50)
      }
    }));
  }, [enableUserInteractionMonitoring]);

  // Track error
  const trackError = useCallback((error, context = {}) => {
    if (!enableErrorMonitoring) return;

    const errorEntry = {
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: Date.now(),
      context,
      sessionDuration: Date.now() - sessionStartTimeRef.current
    };

    setMetrics(prev => ({
      ...prev,
      errors: [...prev.errors, errorEntry].slice(-100)
    }));
  }, [enableErrorMonitoring]);

  // Get performance insights
  const getInsights = useMemo(() => {
    const insights = [];

    // Page load insights
    if (metrics.pageLoad.pageLoad > 3000) {
      insights.push({
        type: 'warning',
        category: 'pageLoad',
        message: 'Page load time is above recommended threshold (3s)',
        value: metrics.pageLoad.pageLoad,
        recommendation: 'Consider optimizing images, reducing bundle size, or implementing lazy loading'
      });
    }

    // Memory insights
    if (metrics.memory.usagePercentage > 80) {
      insights.push({
        type: 'warning',
        category: 'memory',
        message: 'High memory usage detected',
        value: `${Math.round(metrics.memory.usagePercentage)}%`,
        recommendation: 'Check for memory leaks, optimize component rendering, or implement virtualization'
      });
    }

    // Network insights
    if (metrics.network.rtt > 100) {
      insights.push({
        type: 'info',
        category: 'network',
        message: 'High network latency detected',
        value: `${metrics.network.rtt}ms`,
        recommendation: 'Consider using CDN, optimizing API calls, or implementing caching'
      });
    }

    // Error insights
    if (metrics.errors.length > 5) {
      insights.push({
        type: 'error',
        category: 'errors',
        message: 'Multiple errors detected in this session',
        value: metrics.errors.length,
        recommendation: 'Review error logs and implement proper error handling'
      });
    }

    return insights;
  }, [metrics]);

  // Export metrics
  const exportMetrics = useCallback(() => {
    const exportData = {
      session: currentSession,
      sessionStart: sessionStartTimeRef.current,
      sessionEnd: Date.now(),
      metrics,
      dataPoints: dataPointsRef.current,
      insights: getInsights
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${currentSession}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }, [currentSession, metrics, dataPointsRef.current, getInsights]);

  // Save metrics to localStorage
  useEffect(() => {
    if (enableLocalStorage && isMonitoring) {
      try {
        const dataToStore = {
          lastUpdated: Date.now(),
          metrics,
          session: currentSession
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      } catch (error) {
        console.warn('Failed to save metrics to localStorage:', error);
      }
    }
  }, [enableLocalStorage, isMonitoring, metrics, currentSession, storageKey]);

  // Load metrics from localStorage
  useEffect(() => {
    if (enableLocalStorage) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.metrics) {
            setMetrics(parsed.metrics);
          }
        }
      } catch (error) {
        console.warn('Failed to load metrics from localStorage:', error);
      }
    }
  }, [enableLocalStorage, storageKey]);

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Utility function to calculate average
  const calculateAverage = (dataPoints, path) => {
    const values = dataPoints
      .map(dp => getNestedValue(dp, path))
      .filter(val => typeof val === 'number' && !isNaN(val));

    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // Utility function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return {
    // State
    metrics,
    isMonitoring,
    currentSession,
    insights: getInsights,

    // Functions
    startMonitoring,
    stopMonitoring,
    trackInteraction,
    trackError,
    addCustomMetric,
    exportMetrics,

    // Computed values
    performanceScore: metrics.summary.performanceScore || 0,
    sessionDuration: Date.now() - sessionStartTimeRef.current,
    dataPointCount: dataPointsRef.current.length
  };
}

/**
 * Specialized hook for monitoring React component performance
 */
export function useComponentPerformance(componentName, options = {}) {
  const { enableRenderTracking = true, enableMemoryTracking = true } = options;
  
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const mountTimeRef = useRef(0);

  const performanceMonitor = usePerformanceMonitor({
    ...options,
    enableCustomMetrics: true
  });

  useEffect(() => {
    mountTimeRef.current = Date.now();
    performanceMonitor.addCustomMetric('componentMounts', {
      component: componentName,
      mountTime: mountTimeRef.current
    });

    return () => {
      const unmountTime = Date.now();
      const lifetime = unmountTime - mountTimeRef.current;
      
      performanceMonitor.addCustomMetric('componentUnmounts', {
        component: componentName,
        unmountTime,
        lifetime,
        renderCount: renderCountRef.current
      });
    };
  }, [componentName, performanceMonitor]);

  useEffect(() => {
    renderCountRef.current += 1;
    lastRenderTimeRef.current = Date.now();

    if (enableRenderTracking) {
      performanceMonitor.addCustomMetric('componentRenders', {
        component: componentName,
        renderCount: renderCountRef.current,
        renderTime: lastRenderTimeRef.current,
        timeSinceMount: lastRenderTimeRef.current - mountTimeRef.current
      });
    }

    if (enableMemoryTracking && window.performance?.memory) {
      const memory = window.performance.memory;
      performanceMonitor.addCustomMetric('componentMemory', {
        component: componentName,
        renderCount: renderCountRef.current,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    timeSinceMount: Date.now() - mountTimeRef.current,
    performanceMonitor
  };
}

/**
 * Hook for monitoring API performance
 */
export function useApiPerformance() {
  const performanceMonitor = usePerformanceMonitor({
    enableCustomMetrics: true
  });

  const trackApiCall = useCallback(async (apiFunction, endpoint, options = {}) => {
    const startTime = performance.now();
    const startMemory = window.performance?.memory?.usedJSHeapSize || 0;

    try {
      const result = await apiFunction();
      
      const endTime = performance.now();
      const endMemory = window.performance?.memory?.usedJSHeapSize || 0;
      
      performanceMonitor.addCustomMetric('apiCalls', {
        endpoint,
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        success: true,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      
      performanceMonitor.addCustomMetric('apiCalls', {
        endpoint,
        duration: endTime - startTime,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });

      throw error;
    }
  }, [performanceMonitor]);

  return {
    trackApiCall,
    performanceMonitor
  };
}

/**
 * Hook for monitoring user interactions
 */
export function useInteractionPerformance() {
  const performanceMonitor = usePerformanceMonitor({
    enableUserInteractionMonitoring: true
  });

  const trackClick = useCallback((element, context = {}) => {
    performanceMonitor.trackInteraction('click', {
      element: element.tagName || 'unknown',
      ...context
    });
  }, [performanceMonitor]);

  const trackScroll = useCallback((direction, distance, context = {}) => {
    performanceMonitor.trackInteraction('scroll', {
      direction,
      distance,
      ...context
    });
  }, [performanceMonitor]);

  const trackInput = useCallback((inputType, context = {}) => {
    performanceMonitor.trackInteraction('input', {
      type: inputType,
      ...context
    });
  }, [performanceMonitor]);

  return {
    trackClick,
    trackScroll,
    trackInput,
    performanceMonitor
  };
}
