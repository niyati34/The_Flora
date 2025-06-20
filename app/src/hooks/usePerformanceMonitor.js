import { useState, useEffect, useRef } from "react";

export default function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
  });
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderStart = useRef(performance.now());

  // Measure page load time
  useEffect(() => {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;
    setMetrics((prev) => ({ ...prev, loadTime }));
  }, []);

  // Measure render performance
  useEffect(() => {
    renderStart.current = performance.now();
    return () => {
      const renderTime = performance.now() - renderStart.current;
      setMetrics((prev) => ({ ...prev, renderTime }));
    };
  });

  // Monitor FPS
  useEffect(() => {
    let animationFrame;

    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();

      if (now - lastTime.current >= 1000) {
        const fps = frameCount.current;
        setMetrics((prev) => ({ ...prev, fps }));
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationFrame = requestAnimationFrame(measureFPS);
    };

    measureFPS();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Monitor memory usage (if available)
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memoryUsage),
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Performance monitoring component
export function PerformanceMonitor({ showMetrics = false }) {
  const metrics = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(showMetrics);

  if (!isVisible) {
    return (
      <button
        className="btn btn-sm btn-outline-info position-fixed bottom-0 start-0 m-2"
        onClick={() => setIsVisible(true)}
        style={{ zIndex: 1000 }}
      >
        <i className="fas fa-chart-line"></i>
      </button>
    );
  }

  return (
    <div
      className="performance-monitor position-fixed bottom-0 start-0 m-2 p-2 bg-dark text-white rounded small"
      style={{ zIndex: 1000 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-1">
        <strong>Performance</strong>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
      <div>Load: {metrics.loadTime}ms</div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      <div>FPS: {metrics.fps}</div>
      {metrics.memoryUsage > 0 && <div>Memory: {metrics.memoryUsage}MB</div>}
    </div>
  );
}
