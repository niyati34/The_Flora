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
  ...props
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
  });

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  return (
    <div
      ref={ref}
      className={`lazy-image-wrapper ${className}`}
      style={{ position: "relative", ...style }}
    >
      {isIntersecting ? (
        <img
          src={src}
          alt={alt}
          className={`img-fluid ${loaded ? "loaded" : ""} ${
            error ? "error" : ""
          }`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            transition: "opacity 0.3s ease",
            opacity: loaded ? 1 : 0.7,
          }}
          {...props}
        />
      ) : (
        placeholder || (
          <div
            style={{
              height: "200px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            Loading...
          </div>
        )
      )}
    </div>
  );
}
