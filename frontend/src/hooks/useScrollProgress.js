import { useEffect, useState } from "react";

/** Page scroll progress (0..1) and whether the page has scrolled past the hero edge. Passive + rAF-throttled. */
export function useScrollProgress(threshold = 24) {
  const [state, setState] = useState({ progress: 0, scrolled: false });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const next = { progress: max > 0 ? Math.min(1, y / max) : 0, scrolled: y > threshold };
      setState((prev) => (prev.scrolled === next.scrolled && Math.abs(prev.progress - next.progress) < 0.005 ? prev : next));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [threshold]);
  return state;
}
