import React from "react";

export function LoadingState({ label = "Loading…" }) {
  return <div className="loading-block" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}</div>;
}
