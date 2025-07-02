import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";

export default function VirtualScrollList({
  items = [],
  itemHeight = 200,
  containerHeight = 600,
  overscan = 5,
  renderItem,
  className = "",
  onLoadMore,
  hasMore = false,
  loading = false
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollTimeoutRef = useRef(null);
  const lastScrollTop = useRef(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerHeight || !itemHeight) return { start: 0, end: 0 };
    
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end: end
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      virtualIndex: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  // Calculate total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    // Detect if user is actively scrolling
    setIsScrolling(true);
    
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling to false after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    // Check if we need to load more items
    if (hasMore && !loading) {
      const scrollPercentage = (newScrollTop + containerHeight) / totalHeight;
      if (scrollPercentage > 0.8) {
        onLoadMore?.();
      }
    }
    
    lastScrollTop.current = newScrollTop;
  }, [containerHeight, totalHeight, hasMore, loading, onLoadMore]);

  // Smooth scroll to specific item
  const scrollToItem = useCallback((index) => {
    if (containerRef) {
      const targetScrollTop = index * itemHeight;
      containerRef.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [containerRef, itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef) {
      containerRef.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [containerRef]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (containerRef) {
      containerRef.scrollTo({
        top: totalHeight - containerHeight,
        behavior: 'smooth'
      });
    }
  }, [containerRef, totalHeight, containerHeight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef) return;
      
      const currentIndex = Math.floor(scrollTop / itemHeight);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          scrollToItem(Math.min(currentIndex + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          scrollToItem(Math.max(currentIndex - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          scrollToTop();
          break;
        case 'End':
          e.preventDefault();
          scrollToBottom();
          break;
        case 'PageDown':
          e.preventDefault();
          const pageDownIndex = Math.min(currentIndex + Math.floor(containerHeight / itemHeight), items.length - 1);
          scrollToItem(pageDownIndex);
          break;
        case 'PageUp':
          e.preventDefault();
          const pageUpIndex = Math.max(currentIndex - Math.floor(containerHeight / itemHeight), 0);
          scrollToItem(pageUpIndex);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, scrollTop, itemHeight, items.length, containerHeight, scrollToItem, scrollToTop, scrollToBottom]);

  // Performance optimization: throttle scroll events
  const throttledScrollHandler = useCallback((e) => {
    if (isScrolling) return;
    handleScroll(e);
  }, [isScrolling, handleScroll]);

  // Render individual item with proper positioning
  const renderVirtualItem = useCallback((item, index) => {
    const top = (visibleRange.start + index) * itemHeight;
    
    return (
      <div
        key={item.id || item.virtualIndex || index}
        className="virtual-item"
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`
        }}
      >
        {renderItem(item, visibleRange.start + index)}
      </div>
    );
  }, [visibleRange.start, itemHeight, renderItem]);

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="loading-indicator text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading more items...</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="empty-state text-center py-5">
      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
      <h4>No items found</h4>
      <p className="text-muted">Try adjusting your search or filters.</p>
    </div>
  );

  // Scroll position indicator
  const ScrollPositionIndicator = () => {
    const scrollPercentage = totalHeight > 0 ? (scrollTop / (totalHeight - containerHeight)) * 100 : 0;
    
    return (
      <div className="scroll-position-indicator">
        <div className="scroll-bar">
          <div 
            className="scroll-thumb"
            style={{ height: `${Math.max(10, (containerHeight / totalHeight) * 100)}%` }}
          />
          <div 
            className="scroll-progress"
            style={{ height: `${scrollPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Quick navigation buttons
  const QuickNavigation = () => (
    <div className="quick-navigation">
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={scrollToTop}
        title="Scroll to top"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={scrollToBottom}
        title="Scroll to bottom"
      >
        <i className="fas fa-arrow-down"></i>
      </button>
    </div>
  );

  return (
    <div className={`virtual-scroll-container ${className}`}>
      {/* Scroll position indicator */}
      <ScrollPositionIndicator />
      
      {/* Quick navigation */}
      <QuickNavigation />
      
      {/* Main scrollable container */}
      <div
        ref={setContainerRef}
        className="virtual-scroll-viewport"
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={throttledScrollHandler}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Render only visible items */}
          {visibleItems.map((item, index) => renderVirtualItem(item, index))}
        </div>
        
        {/* Loading indicator at bottom */}
        {hasMore && loading && <LoadingIndicator />}
      </div>
      
      {/* Empty state */}
      {items.length === 0 && !loading && <EmptyState />}
      
      {/* Scroll info */}
      <div className="scroll-info">
        <small className="text-muted">
          Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, items.length)} of {items.length} items
          {scrollTop > 0 && ` • Scrolled ${Math.round(scrollTop / totalHeight * 100)}%`}
        </small>
      </div>

      <style jsx>{`
        .virtual-scroll-container {
          position: relative;
        }
        
        .virtual-scroll-viewport {
          scrollbar-width: thin;
          scrollbar-color: #007bff #f8f9fa;
        }
        
        .virtual-scroll-viewport::-webkit-scrollbar {
          width: 8px;
        }
        
        .virtual-scroll-viewport::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .virtual-scroll-viewport::-webkit-scrollbar-thumb {
          background: #007bff;
          border-radius: 4px;
        }
        
        .virtual-scroll-viewport::-webkit-scrollbar-thumb:hover {
          background: #0056b3;
        }
        
        .virtual-item {
          transition: opacity 0.2s ease;
        }
        
        .virtual-item:hover {
          z-index: 10;
        }
        
        .scroll-position-indicator {
          position: absolute;
          right: 10px;
          top: 10px;
          z-index: 100;
        }
        
        .scroll-bar {
          width: 4px;
          height: 100px;
          background: rgba(0, 123, 255, 0.1);
          border-radius: 2px;
          position: relative;
        }
        
        .scroll-thumb {
          background: rgba(0, 123, 255, 0.3);
          border-radius: 2px;
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        
        .scroll-progress {
          background: rgba(0, 123, 255, 0.6);
          border-radius: 2px;
          position: absolute;
          bottom: 0;
          width: 100%;
          transition: height 0.1s ease;
        }
        
        .quick-navigation {
          position: absolute;
          left: 10px;
          top: 10px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .quick-navigation .btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
        
        .quick-navigation .btn:hover {
          opacity: 1;
        }
        
        .loading-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
        }
        
        .empty-state {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        
        .scroll-info {
          text-align: center;
          padding: 10px;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
        }
        
        @media (max-width: 768px) {
          .scroll-position-indicator,
          .quick-navigation {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for infinite scrolling
export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  
  const [ref, inView] = useInView({
    threshold,
    rootMargin,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      callback();
    }
  }, [inView, callback]);

  return ref;
}

// Hook for scroll position
export function useScrollPosition() {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('none');
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback((e) => {
    const currentScrollTop = e.target.scrollTop;
    setScrollTop(currentScrollTop);
    
    if (currentScrollTop > lastScrollTop.current) {
      setScrollDirection('down');
    } else if (currentScrollTop < lastScrollTop.current) {
      setScrollDirection('up');
    }
    
    lastScrollTop.current = currentScrollTop;
  }, []);

  return { scrollTop, scrollDirection, handleScroll };
}

// Hook for scroll performance
export function useScrollPerformance() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTime = useRef(0);
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback((e) => {
    const now = Date.now();
    const currentScrollTop = e.target.scrollTop;
    
    // Calculate scroll velocity
    if (lastScrollTime.current > 0) {
      const timeDiff = now - lastScrollTime.current;
      const scrollDiff = Math.abs(currentScrollTop - lastScrollTop.current);
      const velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
      setScrollVelocity(velocity);
    }
    
    // Set scrolling state
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      setScrollVelocity(0);
    }, 150);
    
    lastScrollTime.current = now;
    lastScrollTop.current = currentScrollTop;
  }, []);

  return { isScrolling, scrollVelocity, handleScroll };
}
