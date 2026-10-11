import { useEffect } from "react";

/** Reports which section crosses the middle of the viewport. */
export function useActiveSection(ids, onChange) {
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) onChange(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
}
