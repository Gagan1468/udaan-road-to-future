import React, { useEffect, useRef } from "react";
import { PROCESS } from "../../data/content.js";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { useScene } from "../../app/SceneContext.jsx";

export function ProcessSection() {
  const { setStep, step } = useScene();
  const refs = useRef([]);
  // As each stage passes the middle of the screen, the matching modules light up in the 3D scene.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setStep(Number(e.target.dataset.step)); }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [setStep]);

  return (
    <section id="process" className="section" aria-labelledby="process-title">
      <SectionHeading id="process-title" index="03" eyebrow="HOW WE BUILD" title="FOUR STAGES. NO SURPRISES.">
        Every project moves through the same connected sequence.
      </SectionHeading>
      <ol className="process-list">
        {PROCESS.map((p, i) => (
          <li key={p.n} data-step={i} ref={(el) => (refs.current[i] = el)} className={step === i ? "is-active" : ""}>
            <span className="mono process-n">{p.n}</span>
            <div><h3>{p.title}</h3><p>{p.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
