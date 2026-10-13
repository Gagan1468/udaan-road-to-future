import { useEffect } from "react";

/** Lightweight, route-agnostic motion layer for every page in the Vite app. */
export default function SitewideEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const onPointerMove = (event) => {
      const card = event.target.closest?.(".service-card,.work-card,.product-card,.course-card,.pillar-card,.stat-card,.dashboard-card,.tech-card,.feature-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
      }
      if (reduceMotion) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };

    const revealSelector = [
      ".hero-copy", ".hero-visual", ".section-head", ".section-heading", ".section-title",
      ".service-card", ".work-card", ".product-card", ".course-card", ".pillar-card",
      ".stat-card", ".dashboard-card", ".registrations-card", ".profile-panel", ".profile-nav",
      ".detail-hero", ".course-details", ".perks-section", ".bottom-cta", ".contact-card",
      ".process-step", ".tech-card", ".feature-card", ".legacy-surface .shell > section",
    ].join(",");

    const revealObserver = !reduceMotion && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("motion-in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" })
      : null;

    const observeContent = () => {
      document.querySelectorAll(revealSelector).forEach((element, index) => {
        if (element.dataset.motionReady) return;
        element.dataset.motionReady = "true";
        if (revealObserver) {
          element.classList.add("motion-reveal");
          element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
          revealObserver.observe(element);
        } else {
          element.classList.add("motion-in-view");
        }
      });
      document.querySelectorAll("main#main, .legacy-surface, .profile-shell, .admin-shell").forEach((page) => {
        page.classList.add("page-motion-enter");
      });
    };

    observeContent();
    const mutationObserver = new MutationObserver(observeContent);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      mutationObserver.disconnect();
      revealObserver?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
    };
  }, []);

  return <div className="site-atmosphere" aria-hidden="true"><span /><span /><span /></div>;
}
