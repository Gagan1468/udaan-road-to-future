export const SECTION_IDS = ["hero", "services", "work", "process", "products", "courses", "about", "team", "reviews", "contact"];

export function scrollToId(id, { behavior } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: behavior || (reduced ? "auto" : "smooth"), block: "start" });
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  return true;
}

export const NAV_LINKS = [
  { label: "Services", section: "services" },
  { label: "Work", section: "work" },
  { label: "Products", section: "products" },
  { label: "About", section: "about" },
  { label: "Courses", to: "/courses", section: "courses" },
  { label: "Reviews", section: "reviews" },
  { label: "Contact", section: "contact" },
];
