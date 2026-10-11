import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Github } from "lucide-react";
import { GITHUB_URL, PRODUCTS } from "../../data/content.js";
import { scrollToId } from "../../lib/navigation.js";

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";
  // Same-page anchors scroll smoothly; from other routes the router navigates to /#id and Home scrolls.
  const sec = (id, label, extra) => (
    <Link to={`/${extra || ""}#${id}`} onClick={(e) => { if (onHome && !extra) { e.preventDefault(); scrollToId(id); navigate({ hash: `#${id}` }, { replace: true }); } }}>{label}</Link>
  );
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <div>
          <span className="mono">START A PROJECT</span>
          <h2>Have a challenge worth solving?</h2>
        </div>
        {sec("contact", "Request a quote →")}
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="wordmark" aria-label="Udaan TechSolutions home">
            <span className="wordmark-mark"><img src="/udaan-logo.png" alt="" width="28" height="28" /></span>
            <span>udaan<span className="wordmark-light"> techsolutions</span></span>
          </Link>
          <p>An independent technology studio building AI systems, intelligent agents, and digital experiences for ambitious businesses.</p>
          <a className="social" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Udaan on GitHub (opens in a new tab)"><Github size={16} /> GitHub</a>
        </div>
        <nav aria-label="Services"><h3>Services</h3>
          <ul><li>{sec("services", "AI & Intelligent Agents")}</li><li>{sec("services", "Digital Experiences")}</li><li>{sec("services", "Engineering & Automation")}</li><li>{sec("work", "Selected work")}</li></ul>
        </nav>
        <nav aria-label="Products"><h3>Products</h3>
          <ul>{PRODUCTS.map((p) => <li key={p.id}>{sec("products", p.name)} <span className="status-tag">{p.status}</span></li>)}</ul>
        </nav>
        <nav aria-label="Learn"><h3>Learn</h3>
          <ul><li><Link to="/courses">Courses &amp; workshops</Link></li><li><Link to="/courses/road-to-future">Road to Future</Link></li><li>{sec("about", "About Udaan")}</li><li>{sec("contact", "Contact")}</li></ul>
        </nav>
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} Udaan TechSolutions. All rights reserved.</span>
        <Link to="/admin" className="footer-admin">Admin access</Link>
      </div>
    </footer>
  );
}
