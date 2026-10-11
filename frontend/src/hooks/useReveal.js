import { useEffect, useRef } from "react";

/** Adds `is-in` once the element enters the viewport (CSS handles the transform/opacity transition). */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) { el.classList.add("is-in"); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("is-in"); observer.disconnect(); }
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
