import React from "react";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { useReveal } from "../../hooks/useReveal.js";

export function AboutSection() {
  const ref = useReveal();
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SectionHeading id="about-title" index="06" eyebrow="ABOUT UDAAN" title="TECHNOLOGY SHOULD MOVE YOU FORWARD." />
      <div className="about-grid reveal" ref={ref}>
        <p className="about-lead">We combine engineering, AI, and thoughtful digital design to solve real problems, not to decorate them.</p>
        <div className="about-points">
          <p><strong>Start from the problem.</strong> We begin with what the business and its users actually need, then pick the technology.</p>
          <p><strong>Build it properly.</strong> Typed APIs, real databases, tested flows, and deployments you can maintain after we leave.</p>
          <p><strong>Say what's true.</strong> We label concepts as concepts and products by their real status.</p>
        </div>
      </div>
    </section>
  );
}
