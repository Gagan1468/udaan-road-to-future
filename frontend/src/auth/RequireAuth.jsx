import React, { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { Button } from "../components/ui/Button.jsx";

/** Protects a route. The server verifies the session (AuthContext calls /api/auth/me); this only gates the UI.
 *  Unauthenticated visitors get the existing AuthModal, and stay on the intended URL after signing in. */
export function RequireAuth({ children }) {
  const { status, isAuthenticated, openAuth, retry } = useAuth();
  const asked = useRef(false);
  useEffect(() => { if (status === "anonymous" && !asked.current) { asked.current = true; openAuth(); } }, [status, openAuth]);

  if (isAuthenticated) return children;
  if (status === "loading") return <div className="gate"><LoadingState label="Checking your session…" /></div>;
  if (status === "error") return <div className="gate"><h1>We couldn't verify your session</h1><p>The server didn't respond. Your sign-in is still saved on this device.</p><Button onClick={retry}>Try again</Button></div>;
  return <div className="gate"><h1>Sign in to continue</h1><p>This page is only available to signed-in users.</p><Button onClick={() => openAuth()}>Sign in</Button></div>;
}
