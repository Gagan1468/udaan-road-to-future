import React from "react";

export class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error("Rendering error:", error.message); } // message only; no user data
  render() { return this.state.failed ? (this.props.fallback ?? <p className="form-error" role="alert">Something went wrong loading this section.</p>) : this.props.children; }
}
