import useIntersectionObserver from "../hooks/useIntersectionObserver";

export default function LazyImage({
  src,
  alt,
  className = "",
  style = {},
  placeholder = null,
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
  });

  return (
    <div
      ref={ref}
      className={`lazy-image-wrapper ${className}`}
      style={{ position: "relative", ...style }}
    >
      {isIntersecting ? (
        <img src={src} alt={alt} className="img-fluid" />
      ) : (
        placeholder || (
          <div style={{ height: "100%", backgroundColor: "#f0f0f0" }} />
        )
      )}
    </div>
  );
}
