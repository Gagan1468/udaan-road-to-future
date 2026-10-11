import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { scrollToId } from "../../lib/navigation.js";

const HEADLINE = ["WE", "BUILD", "WHAT'S", "NEXT."];

export function HeroSection() {
  return (
    <section id="hero" className="section hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="status-label mono"><span className="pulse" aria-hidden="true" />INDEPENDENT TECHNOLOGY STUDIO · AI × ENGINEERING</p>
        <h1 id="hero-title" className="hero-title" aria-label="We build what's next.">
          {HEADLINE.map((w, i) => <span key={w} className="word" style={{ "--i": i }} aria-hidden="true"><span>{w}</span>{" "}</span>)}
        </h1>
        <p className="hero-sub">AI systems, intelligent agents, and digital experiences engineered to move ambitious businesses forward.</p>
        <div className="hero-actions">
          <Button onClick={() => scrollToId("contact")}>Let's Build Something <ArrowRight size={16} /></Button>
          <Button variant="ghost" onClick={() => scrollToId("work")}>Explore Our Work</Button>
        </div>
      </div>
      <button className="scroll-cue mono" onClick={() => scrollToId("services")} aria-label="Scroll to services"><span className="cue-line" aria-hidden="true" />SCROLL</button>
    </section>
  );
}
