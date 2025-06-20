import { useEffect, useRef, useState } from "react";

export default function useIntersectionObserver({ root = null, rootMargin = "0px", threshold = 0.1 } = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { root, rootMargin, threshold });

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [root, rootMargin, threshold]);

  return { ref, isIntersecting };
}
