import React from "react";
import { useReveal } from "../../hooks/useReveal.js";

export function SectionHeading({ index, eyebrow, title, children, id }) {
  const ref = useReveal();
  return (
    <header className="section-heading reveal" ref={ref}>
      <div className="eyebrow-row"><span className="mono">{index}</span><span className="rule" /><span className="mono">{eyebrow}</span></div>
      <h2 id={id}>{title}</h2>
      {children && <p className="section-lead">{children}</p>}
    </header>
  );
}
