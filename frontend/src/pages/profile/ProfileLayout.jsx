import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Eye, KeyRound, Monitor, Palette, ShieldAlert, SlidersHorizontal, UserRound } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle.js";

const ITEMS = [
  ["/profile", "Profile", UserRound, true], ["/profile/account", "Account", SlidersHorizontal], ["/profile/security", "Security", KeyRound],
  ["/profile/privacy", "Privacy", Eye], ["/profile/appearance", "Appearance", Palette], ["/profile/sessions", "Sessions", Monitor],
  ["/profile/manage", "Account management", ShieldAlert],
];

export default function ProfileLayout() {
  usePageTitle("Profile & settings");
  return (
    <main id="main" tabIndex={-1} className="profile-shell">
      <aside className="profile-nav">
        <h1 className="mono">SETTINGS</h1>
        <nav aria-label="Settings">
          {ITEMS.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end}><Icon size={16} aria-hidden="true" />{label}</NavLink>)}
        </nav>
      </aside>
      <section className="profile-panel"><Outlet /></section>
    </main>
  );
}
