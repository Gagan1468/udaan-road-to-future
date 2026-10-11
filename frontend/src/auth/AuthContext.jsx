import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { AuthModal } from "../components/auth/AuthModal.jsx";

export const TOKEN_KEY = "udaan_user_token"; // same key the original app used: existing sessions keep working
const AuthContext = createContext(null);

function readToken() {
  // Preserve the original migration from tab-only storage to persistent storage.
  const saved = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  if (saved) localStorage.setItem(TOKEN_KEY, saved);
  sessionStorage.removeItem(TOKEN_KEY);
  return saved;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  // "loading" while a stored token is being verified with the server; never trust the token alone.
  const [status, setStatus] = useState(() => (token ? "loading" : "anonymous"));
  const [authOpen, setAuthOpen] = useState(false);
  const afterAuth = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(""); setUser(null); setStatus("anonymous");
  }, []);

  const verify = useCallback(async (t) => {
    try {
      const me = await api("/api/auth/me", {}, t);
      setUser(me); setStatus("authenticated");
      return me;
    } catch (err) {
      if (err.status === 401) clearSession();      // expired / revoked / deleted account
      else setStatus(t ? "error" : "anonymous");   // network problem: keep the token, show retry state
      return null;
    }
  }, [clearSession]);

  useEffect(() => { if (token && !user) verify(token); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep several tabs in sync (sign-in/out elsewhere).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== TOKEN_KEY) return;
      const next = e.newValue || "";
      setToken(next);
      if (next) { setStatus("loading"); verify(next); } else { setUser(null); setStatus("anonymous"); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [verify]);

  const onAuthenticated = useCallback(async (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(newToken); setStatus("loading");
    setAuthOpen(false);
    await verify(newToken);
    const cb = afterAuth.current; afterAuth.current = null;
    if (cb) cb(newToken);
  }, [verify]);

  const openAuth = useCallback((callback) => { afterAuth.current = typeof callback === "function" ? callback : null; setAuthOpen(true); }, []);
  const closeAuth = useCallback(() => { afterAuth.current = null; setAuthOpen(false); }, []);

  // Replace the token after the server rotates it (password change / revoke other sessions).
  const replaceToken = useCallback((t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }, []);

  // Authenticated request helper. A 401 means the server rejected the session, so sign out locally.
  const authFetch = useCallback(async (path, options = {}) => {
    try { return await api(path, options, token); }
    catch (err) { if (err.status === 401) clearSession(); throw err; }
  }, [token, clearSession]);

  const value = useMemo(() => ({
    token, user, status, setUser, logout: clearSession, openAuth, closeAuth, replaceToken, authFetch, retry: () => verify(token),
    isAuthenticated: status === "authenticated",
  }), [token, user, status, clearSession, openAuth, closeAuth, replaceToken, authFetch, verify]);

  return <AuthContext.Provider value={value}>
    {children}
    {authOpen && <AuthModal onClose={closeAuth} onAuthenticated={onAuthenticated} />}
  </AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
