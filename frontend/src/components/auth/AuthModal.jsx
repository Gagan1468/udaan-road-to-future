import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, BrainCircuit, Presentation, Code2, CalendarDays, Clock3, ShieldCheck, Zap, BookOpen, Users, Download, CheckCircle2, X, GraduationCap, LogOut, RefreshCw, Search, Trash2, LockKeyhole } from "lucide-react";
import { api } from "../../lib/api.js";

export function AuthModal({ onClose, onAuthenticated }) {
  const [mode,setMode]=useState("signup"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (cancelled || !googleClientId || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setBusy(true); setError("");
          try {
            const result = await api("/api/auth/google", {method:"POST", body:JSON.stringify({credential:response.credential})});
            onAuthenticated(result.access_token);
          } catch (err) { setError(err.message || "Google sign-in failed."); }
          finally { setBusy(false); }
        }
      });
      const target = document.getElementById("google-signin-button");
      if (target) window.google.accounts.id.renderButton(target, {theme:"outline", size:"large", shape:"pill", text:"continue_with", width:280});
    };
    const timer = setInterval(() => { if (window.google?.accounts?.id) { render(); clearInterval(timer); } }, 250);
    render();
    return () => { cancelled = true; clearInterval(timer); };
  }, [googleClientId, onAuthenticated]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const payload = mode === "signup" ? {name,email,password} : {email,password};
      const result = await api(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {method:"POST",body:JSON.stringify(payload)});
      onAuthenticated(result.access_token);
    } catch(err) { setError(err.message || "Could not sign in."); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="close-button" onClick={onClose} aria-label="Close sign in"><X size={20}/></button>
      <small>UDAAN ACCOUNT</small><h2 id="auth-title">{mode==="signup"?"Create your account":"Welcome back"}</h2>
      <p className="muted">Sign in to your Udaan account to register for courses and manage your profile.</p>
      <div className="mode-tabs"><button type="button" className={mode==="signup"?"selected":""} onClick={()=>{setMode("signup");setError("");}}>Create account</button><button type="button" className={mode==="login"?"selected":""} onClick={()=>{setMode("login");setError("");}}>Sign in</button></div>
      <form onSubmit={submit}>
        {mode==="signup"&&<label>Full name<input required minLength="2" maxLength="120" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>}
        <label>Email address<input required type="email" maxLength="254" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
        <label>Password<input required type="password" minLength={mode==="signup"?8:1} maxLength="128" autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup"?"At least 8 characters":"Your password"}/></label>
        {error&&<p className="error" role="alert">{error}</p>}
        <button className="primary submit" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":"Sign in"} <ArrowRight size={17}/></button>
      </form>
      <div className="google-divider">or</div>
      {googleClientId ? <div id="google-signin-button" className="google-signin"/> : <p className="privacy-note">Google sign-in becomes available after the Google OAuth Client ID is configured.</p>}
      <p className="privacy-note">Use an email you control. Passwords are stored as salted hashes, never as plain text.</p>
    </section>
  </div>;
}
