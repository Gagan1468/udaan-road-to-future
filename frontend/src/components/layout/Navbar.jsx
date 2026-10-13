import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Menu, UserRound, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useScene } from "../../app/SceneContext.jsx";
import { useScrollProgress } from "../../hooks/useScrollProgress.js";
import { NAV_LINKS, scrollToId } from "../../lib/navigation.js";
import { MobileMenu } from "./MobileMenu.jsx";

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "U";
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div className="user-menu" ref={ref}>
      <button className="avatar-btn" aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${user?.name || "your account"}`} onClick={() => setOpen((o) => !o)}>
        {user ? initials(user.name) : <UserRound size={16} />}
      </button>
      {open && (
        <div className="menu-panel" role="menu">
          <div className="menu-head"><strong>{user?.name}</strong><span>{user?.email}</span></div>
          <Link role="menuitem" to="/profile" onClick={() => setOpen(false)}>Profile &amp; settings</Link>
          <Link role="menuitem" to="/courses" onClick={() => setOpen(false)}>My courses</Link>
          <button role="menuitem" onClick={() => { setOpen(false); logout(); navigate("/"); }}><LogOut size={14} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { scrolled } = useScrollProgress();
  const { section } = useScene();
  const { isAuthenticated, status, openAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [spotlightX, setSpotlightX] = useState("50%");
  const onHome = location.pathname === "/";

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  const goSection = (e, id) => {
    if (onHome) { e.preventDefault(); scrollToId(id); navigate({ hash: `#${id}` }, { replace: true }); }
  };
  const activeFor = (l) => Boolean((l.to && location.pathname.startsWith(l.to)) || (onHome && section === l.section));
  const currentFor = (l) => activeFor(l) ? (onHome ? "location" : "page") : undefined;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`navbar ${scrolled || !onHome ? "is-scrolled" : ""}`}>
        <nav className="navbar-inner spotlight-navbar" aria-label="Primary" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSpotlightX(`${e.clientX - r.left}px`); }} style={{ "--spotlight-x": spotlightX }}>
          <Link to="/" className="wordmark" aria-label="Udaan TechSolutions home">
            <span className="wordmark-mark"><img src="/udaan-logo.png" alt="" width="28" height="28" /></span>
            <span>udaan<span className="wordmark-light"> techsolutions</span></span>
          </Link>
          <ul className="nav-links gooey-nav" aria-label="Site sections">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <NavLink to={l.to} className={activeFor(l) ? "active" : ""} aria-current={currentFor(l)}>{l.label}</NavLink>
                ) : (
                  <Link to={`/#${l.section}`} onClick={(e) => goSection(e, l.section)} className={activeFor(l) ? "active" : ""} aria-current={currentFor(l)}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            {isAuthenticated ? <UserMenu /> : status === "loading" ? <span className="nav-skeleton" aria-label="Checking session" /> : (
              <>
                <button className="nav-signin" onClick={() => openAuth()}>Sign in</button>
                <button className="btn btn-primary btn-sm" onClick={() => openAuth()}>Get started <ArrowRight size={14} /></button>
              </>
            )}
            <button className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSection={goSection} />
    </>
  );
}
