import React from "react";

// Three bespoke compositions (one per service) instead of identical icon cards.
export function ServiceVisual({ kind }) {
  const common = { viewBox: "0 0 320 200", role: "img", className: "service-visual", fill: "none", stroke: "currentColor", strokeWidth: 1.2 };
  if (kind === "ai") {
    const nodes = [[40, 100], [120, 50], [120, 150], [210, 70], [210, 135], [285, 100]];
    const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5]];
    return (
      <svg {...common} aria-label="Network of connected nodes">
        {edges.map(([a, b], i) => <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="sv-line" style={{ "--d": `${i * 0.12}s` }} />)}
        {nodes.map(([x, y], i) => <rect key={i} x={x - 9} y={y - 9} width="18" height="18" className={i === 5 ? "sv-accent" : "sv-node"} transform={`rotate(${i * 9} ${x} ${y})`} />)}
      </svg>
    );
  }
  if (kind === "digital") {
    return (
      <svg {...common} aria-label="Layered interface frames">
        {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 26} y={118 - i * 32} width="170" height="92" rx="3" className={i === 2 ? "sv-frame sv-front" : "sv-frame"} style={{ "--d": `${i * 0.15}s` }} />)}
        <line x1="84" y1="68" x2="170" y2="68" className="sv-line" /><line x1="84" y1="80" x2="140" y2="80" className="sv-line" />
        <rect x="84" y="94" width="46" height="26" className="sv-accent" />
        <circle cx="260" cy="60" r="26" className="sv-line" /><circle cx="260" cy="60" r="12" className="sv-accent" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-label="Pipeline of system stages">
      {[0, 1, 2, 3].map((i) => <g key={i}>
        <rect x={20 + i * 76} y={78} width="52" height="44" className={i === 3 ? "sv-accent" : "sv-node"} />
        {i < 3 && <path d={`M${72 + i * 76} 100 H${96 + i * 76}`} className="sv-line" markerEnd="url(#sv-arrow)" />}
        <line x1={46 + i * 76} y1="122" x2={46 + i * 76} y2="160" className="sv-line" strokeDasharray="3 4" />
      </g>)}
      <defs><marker id="sv-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" /></marker></defs>
      <line x1="20" y1="160" x2="300" y2="160" className="sv-line" />
    </svg>
  );
}
