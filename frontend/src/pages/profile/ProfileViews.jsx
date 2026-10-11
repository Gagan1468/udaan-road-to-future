import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useTheme } from "../../app/ThemeContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ErrorMessage } from "../../components/ui/ErrorMessage.jsx";
import { LoadingState } from "../../components/ui/LoadingState.jsx";
import { initials } from "../../components/layout/Navbar.jsx";

const fmt = (d, opts) => new Date(d).toLocaleString(undefined, opts || { dateStyle: "long", timeStyle: "short" });

function Panel({ title, lead, children }) {
  return <div><h2 className="panel-title">{title}</h2>{lead && <p className="panel-lead">{lead}</p>}{children}</div>;
}
function Notice({ children }) { return children ? <p className="form-ok" role="status"><CheckCircle2 size={16} /> {children}</p> : null; }

// Small helper: run an async action with busy / error / success state.
function useAction() {
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [ok, setOk] = useState("");
  const run = async (fn, okMsg) => {
    setBusy(true); setError(""); setOk("");
    try { const r = await fn(); if (okMsg) setOk(okMsg); return r; }
    catch (e) { setError(e.status === 401 ? "Your session has ended. Please sign in again." : e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };
  return { busy, error, ok, run, reset: () => { setError(""); setOk(""); } };
}

export function ProfileOverview() {
  const { user } = useAuth();
  return (
    <Panel title="Profile" lead="Your details as stored on your Udaan account.">
      <div className="profile-card">
        <span className="avatar-lg" aria-hidden="true">{initials(user.name)}</span>
        <div><h3>{user.name}</h3><p>{user.email}</p></div>
        <Button variant="ghost" to="/profile/account">Edit profile</Button>
      </div>
      <dl className="facts">
        <div><dt>Name</dt><dd>{user.name}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Member since</dt><dd>{fmt(user.created_at, { dateStyle: "long" })}</dd></div>
        <div><dt>Sign-in methods</dt><dd>{[user.has_password && "Email & password", user.google_linked && "Google"].filter(Boolean).join(" · ") || "—"}</dd></div>
      </dl>
    </Panel>
  );
}

export function AccountSettings() {
  const { user, setUser, authFetch } = useAuth();
  const [name, setName] = useState(user.name);
  const a = useAction();
  const dirty = name.trim() !== user.name;
  const save = (e) => { e.preventDefault(); a.run(async () => { setUser(await authFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify({ name }) })); }, "Profile updated."); };
  return (
    <Panel title="Account" lead="Update the details on your account.">
      <form className="settings-form" onSubmit={save}>
        <div className="field"><label htmlFor="acc-name">Full name</label><input id="acc-name" value={name} minLength={2} maxLength={120} required autoComplete="name" onChange={(e) => { setName(e.target.value); a.reset(); }} /></div>
        <div className="field"><label htmlFor="acc-email">Email</label><input id="acc-email" value={user.email} readOnly aria-describedby="acc-email-note" /><p id="acc-email-note" className="fine">Changing your email isn't available yet. It needs a verification step that hasn't been built.</p></div>
        <ErrorMessage>{a.error}</ErrorMessage><Notice>{a.ok}</Notice>
        <button className="btn btn-primary" disabled={a.busy || !dirty}>{a.busy ? "Saving…" : "Save changes"}</button>
      </form>
    </Panel>
  );
}

export function SecuritySettings() {
  const { user, setUser, authFetch, replaceToken } = useAuth();
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [local, setLocal] = useState("");
  const a = useAction();
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setLocal(""); a.reset(); };
  const submit = (e) => {
    e.preventDefault();
    if (f.next.length < 8) return setLocal("New password must be at least 8 characters.");
    if (f.next !== f.confirm) return setLocal("The new passwords don't match.");
    a.run(async () => {
      const r = await authFetch("/api/auth/change-password", { method: "POST", body: JSON.stringify({ current_password: user.has_password ? f.current : null, new_password: f.next }) });
      replaceToken(r.access_token);                 // server rotated the token: other sessions are now signed out
      setUser({ ...user, has_password: true });
      setF({ current: "", next: "", confirm: "" });
    }, "Password updated. All other devices have been signed out.");
  };
  return (
    <Panel title="Security" lead={user.has_password ? "Change your password. Doing so signs out every other device." : "Your account uses Google sign-in. You can also set a password to sign in with your email."}>
      <form className="settings-form" onSubmit={submit}>
        {user.has_password && <div className="field"><label htmlFor="sec-cur">Current password</label><input id="sec-cur" type="password" required autoComplete="current-password" value={f.current} onChange={set("current")} /></div>}
        <div className="field"><label htmlFor="sec-new">New password</label><input id="sec-new" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={f.next} onChange={set("next")} /></div>
        <div className="field"><label htmlFor="sec-conf">Confirm new password</label><input id="sec-conf" type="password" required autoComplete="new-password" value={f.confirm} onChange={set("confirm")} /></div>
        <ErrorMessage>{local || a.error}</ErrorMessage><Notice>{a.ok}</Notice>
        <button className="btn btn-primary" disabled={a.busy}>{a.busy ? "Updating…" : user.has_password ? "Change password" : "Set password"}</button>
      </form>
      <p className="fine">Password reset by email isn't available yet because the backend has no email-sending service configured.</p>
    </Panel>
  );
}

export function PrivacySettings() {
  const { user, setUser, authFetch } = useAuth();
  const a = useAction(), x = useAction();
  const toggle = (e) => a.run(async () => { setUser(await authFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify({ marketing_opt_in: e.target.checked }) })); }, "Preference saved.");
  const exportData = () => x.run(async () => {
    const data = await authFetch("/api/auth/me/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "udaan-my-data.json" });
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }, "Your data was downloaded.");
  return (
    <Panel title="Privacy" lead="Controls that are active today are listed first.">
      <div className="setting-row">
        <div><h3>Product-update emails</h3><p>Allow Udaan to email you about new courses and products. Saved on your account.</p></div>
        <label className="switch"><input type="checkbox" checked={user.marketing_opt_in} onChange={toggle} disabled={a.busy} aria-label="Product-update emails" /><span /></label>
      </div>
      <ErrorMessage>{a.error}</ErrorMessage><Notice>{a.ok}</Notice>
      <div className="setting-row">
        <div><h3>Download your data</h3><p>A JSON file with your account details and course registrations.</p></div>
        <button className="btn btn-ghost" onClick={exportData} disabled={x.busy}><Download size={15} /> {x.busy ? "Preparing…" : "Export"}</button>
      </div>
      <ErrorMessage>{x.error}</ErrorMessage><Notice>{x.ok}</Notice>
      <div className="setting-row"><div><h3>Delete your account</h3><p>Permanently remove your account and registrations.</p></div><Button variant="ghost" to="/profile/manage">Go to account management</Button></div>
      <h3 className="not-yet">Not available yet</h3>
      <ul className="not-yet-list"><li>Profile visibility — Udaan has no public profiles.</li><li>Analytics and personalisation preferences — we don't run any that you could opt out of.</li></ul>
    </Panel>
  );
}

export function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  const opts = [["system", "System", "Match your device setting."], ["light", "Light", "Light surfaces on the homepage and settings."], ["dark", "Dark", "Obsidian surfaces everywhere."]];
  return (
    <Panel title="Appearance" lead="Saved on this device only.">
      <div role="radiogroup" aria-label="Theme" className="theme-options">
        {opts.map(([v, l, d]) => (
          <label key={v} className={`theme-opt ${preference === v ? "is-on" : ""}`}>
            <input type="radio" name="theme" value={v} checked={preference === v} onChange={() => setPreference(v)} /><strong>{l}</strong><span>{d}</span>
          </label>
        ))}
      </div>
      <p className="fine">The course and admin pages keep their original dark design in every theme.</p>
    </Panel>
  );
}

export function SessionSettings() {
  const { authFetch, replaceToken, logout } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null), [loadErr, setLoadErr] = useState("");
  const a = useAction();
  useEffect(() => { authFetch("/api/auth/session").then(setInfo).catch((e) => setLoadErr(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const revoke = () => a.run(async () => { replaceToken((await authFetch("/api/auth/sessions/revoke-others", { method: "POST" })).access_token); }, "Signed out of all other devices.");
  return (
    <Panel title="Sessions" lead="Where you're signed in.">
      {loadErr ? <ErrorMessage>{loadErr}</ErrorMessage> : !info ? <LoadingState label="Loading session…" /> : (
        <div className="setting-row"><div><h3>This device</h3><p>Signed in. Session expires {fmt(info.expires_at)}.</p></div><button className="btn btn-ghost" onClick={() => { logout(); navigate("/"); }}>Sign out</button></div>
      )}
      <div className="setting-row"><div><h3>Other devices</h3><p>Sign out everywhere except here. Sessions are stateless tokens, so we can revoke them all at once but can't list them individually.</p></div><button className="btn btn-ghost" onClick={revoke} disabled={a.busy}>{a.busy ? "Working…" : "Sign out other devices"}</button></div>
      <ErrorMessage>{a.error}</ErrorMessage><Notice>{a.ok}</Notice>
    </Panel>
  );
}

export function AccountManagement() {
  const { user, authFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState(""), [confirm, setConfirm] = useState("");
  const a = useAction();
  const del = (e) => {
    e.preventDefault();
    a.run(async () => {
      await authFetch("/api/auth/delete-account", { method: "POST", body: JSON.stringify({ confirm, password: user.has_password ? password : null }) });
      logout(); navigate("/");
    });
  };
  return (
    <Panel title="Account management" lead="Permanent actions.">
      <form className="settings-form danger" onSubmit={del}>
        <h3>Delete account</h3>
        <p>This permanently deletes your account <strong>and your course registrations</strong>. It can't be undone, and you'll be signed out everywhere. Backups held by our hosting provider may persist briefly before they expire.</p>
        {user.has_password && <div className="field"><label htmlFor="del-pw">Your password</label><input id="del-pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); a.reset(); }} /></div>}
        <div className="field"><label htmlFor="del-confirm">Type DELETE to confirm</label><input id="del-confirm" value={confirm} autoComplete="off" onChange={(e) => { setConfirm(e.target.value); a.reset(); }} /></div>
        <ErrorMessage>{a.error}</ErrorMessage>
        <button className="btn btn-danger" disabled={a.busy || confirm !== "DELETE"}>{a.busy ? "Deleting…" : "Delete my account"}</button>
      </form>
      <p className="fine"><Link to="/profile/privacy">Want a copy of your data first?</Link></p>
    </Panel>
  );
}
