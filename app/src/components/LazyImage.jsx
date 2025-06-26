import { useState } from "react";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

export default function LazyImage({
  src,
  alt,
  className = "",
  style = {},
  placeholder = null,
  onLoad,
  onError,
  fallbackSrc = "/placeholder-plant.jpg",
  ...props
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
    threshold: 0.1,
  });

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = (e) => {
    setLoaded(true);
    setError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      setLoaded(false);
    }
    if (onError) onError(e);
  };

  const handleRetry = () => {
    setError(false);
    setLoaded(false);
    setImageSrc(src);
  };

  return (
    <div
      ref={ref}
      className={`lazy-image-wrapper ${className}`}
      style={{ 
        position: "relative", 
        overflow: "hidden",
        borderRadius: "8px",
        ...style 
      }}
    >
      {isIntersecting ? (
        <>
          <img
            src={imageSrc}
            alt={alt}
            className={`img-fluid ${loaded ? "loaded" : ""} ${
              error ? "error" : ""
            }`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: loaded ? 1 : 0.3,
              transform: loaded ? "scale(1)" : "scale(1.05)",
              filter: loaded ? "none" : "blur(2px)",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            {...props}
          />
          
          {/* Loading overlay */}
          {!loaded && !error && (
            <div
              className="loading-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <div className="loading-spinner">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #6A9304",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div
              className="error-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#dc3545", marginBottom: "10px" }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "24px" }} />
              </div>
              <p style={{ margin: "0 0 15px 0", color: "#6c757d", fontSize: "14px" }}>
                Failed to load image
              </p>
              <button
                onClick={handleRetry}
                className="btn btn-outline-primary btn-sm"
                style={{ fontSize: "12px" }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      ) : (
        placeholder || (
          <div
            className="placeholder"
            style={{
              height: "200px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontSize: "14px",
              borderRadius: "8px",
              border: "2px dashed #dee2e6",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "8px" }}>
                <i className="fas fa-leaf" style={{ fontSize: "20px", color: "#6A9304" }} />
              </div>
              <span>Loading...</span>
            </div>
          </div>
        )
      )}
    </div>
  );
}
