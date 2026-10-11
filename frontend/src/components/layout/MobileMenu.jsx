import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { NAV_LINKS } from "../../lib/navigation.js";

export function MobileMenu({ open, onClose, onSection }) {
  const { isAuthenticated, openAuth, logout } = useAuth();
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector("a,button");
    first?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const items = [...panel.current.querySelectorAll("a,button")];
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  return (
    <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open ? "" : undefined}>
      <div className="mobile-panel" ref={panel} role="dialog" aria-modal="true" aria-label="Site menu">
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              {l.to ? <Link to={l.to} onClick={onClose}>{l.label}</Link>
                : <Link to={`/#${l.section}`} onClick={(e) => { onSection(e, l.section); onClose(); }}>{l.label}</Link>}
            </li>
          ))}
        </ul>
        <div className="mobile-actions">
          {isAuthenticated ? (
            <>
              <Link className="btn btn-primary" to="/profile" onClick={onClose}>Profile &amp; settings</Link>
              <button className="btn btn-ghost" onClick={() => { onClose(); logout(); }}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => { onClose(); openAuth(); }}>Get started</button>
              <button className="btn btn-ghost" onClick={() => { onClose(); openAuth(); }}>Sign in</button>
            </>
          )}
        </div>
      </div>
      <button className="mobile-scrim" tabIndex={-1} aria-label="Close menu" onClick={onClose} />
    </div>
  );
}
