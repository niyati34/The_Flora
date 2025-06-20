import { useState, useEffect, useRef, useMemo } from "react";

export default function VirtualScrollList({
  items,
  itemHeight = 200,
  containerHeight = 600,
  renderItem,
  overscan = 5,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Throttle scroll events for better performance
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let ticking = false;
    const handleScrollThrottled = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollElement.addEventListener("scroll", handleScrollThrottled, {
      passive: true,
    });
    return () =>
      scrollElement.removeEventListener("scroll", handleScrollThrottled);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="virtual-scroll-container"
      style={{
        height: containerHeight,
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={item.id || actualIndex}
                style={{
                  height: itemHeight,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
