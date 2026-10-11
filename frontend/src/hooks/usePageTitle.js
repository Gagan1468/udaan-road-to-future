import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => { document.title = title ? `${title} — Udaan TechSolutions` : "Udaan TechSolutions — We build what's next"; }, [title]);
}
