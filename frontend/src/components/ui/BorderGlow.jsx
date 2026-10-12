import React from "react";

export function BorderGlow({ children, className = "", glowColor = "190 85 70", backgroundColor = "#101317", borderRadius = 22, colors = ["#38bdf8", "#8b5cf6", "#22d3ee"] }) {
  return <div className={`border-glow ${className}`} style={{ "--border-glow-color": glowColor, "--border-glow-bg": backgroundColor, "--border-glow-radius": `${borderRadius}px`, "--border-glow-a": colors[0], "--border-glow-b": colors[1], "--border-glow-c": colors[2] }}>{children}</div>;
}
