import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "udaan_theme"; // "system" | "light" | "dark" — stored per device
const ThemeContext = createContext(null);
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => { try { return localStorage.getItem(KEY) || "system"; } catch { return "system"; } });
  const [resolved, setResolved] = useState(() => (preference === "system" ? (systemDark() ? "dark" : "light") : preference));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const next = preference === "system" ? (mq.matches ? "dark" : "light") : preference;
      setResolved(next);
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [preference]);

  const value = useMemo(() => ({
    preference, resolved,
    setPreference: (p) => { setPreference(p); try { localStorage.setItem(KEY, p); } catch { /* storage unavailable */ } },
  }), [preference, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
