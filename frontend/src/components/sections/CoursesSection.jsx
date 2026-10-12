import React from "react";
import { ArrowRight, BrainCircuit, Code2, Presentation } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { useReveal } from "../../hooks/useReveal.js";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import AnimatedContent from "../ui/AnimatedContent.jsx";

const PILLARS = [
  [Presentation, "AI for presentations & visuals", "Slides, posters, and visual concepts made with AI tools."],
  [Code2, "AI for developers", "AI-assisted coding, debugging, websites, and beginner-friendly projects."],
  [BrainCircuit, "AI for everyday life", "Study support, research, planning, writing, and practical problem-solving."],
];

export function CoursesSection() {
  const ref = useReveal();
  return (
    <section id="courses" className="section" aria-labelledby="courses-title">
      <SectionHeading id="courses-title" index="05" eyebrow="AI MASTERY · WORKSHOPS" title="LEARN WHAT'S NEXT. BUILD WHAT'S POSSIBLE.">
        Our Road to Future course teaches students (Classes 9 and 11) to use AI practically, through demonstrations and guided activities rather than theory alone.
      </SectionHeading>
      <AnimatedContent className="course-panel-motion" distance={24} duration={0.65}>
        <SpotlightCard as="div" className="course-panel reveal" ref={ref}>
          <ul className="pillar-list">{PILLARS.map(([Icon, t, d]) => <li key={t}><Icon size={20} aria-hidden="true" /><div><h3>{t}</h3><p>{d}</p></div></li>)}</ul>
          <div className="course-side">
            <p className="mono">ORIENTATION: FREE · FULL COURSE: PAID, FEE TO BE ANNOUNCED</p>
            <div className="course-actions">
              <Button to="/courses/road-to-future">Explore the course <ArrowRight size={16} /></Button>
              <Button variant="ghost" to="/courses">All courses</Button>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>
    </section>
  );
}
