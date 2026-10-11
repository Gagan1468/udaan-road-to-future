import React from "react";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "../../data/content.js";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { ServiceVisual } from "../ui/ServiceVisual.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function ServiceRow({ s, index, onEnquire }) {
  const ref = useReveal();
  return (
    <article className={`service-row reveal ${index % 2 ? "flip" : ""}`} ref={ref}>
      <div className="service-visual-wrap"><ServiceVisual kind={s.id} /></div>
      <div className="service-body">
        <span className="mono service-n">0{index + 1}</span>
        <h3>{s.title}</h3>
        <p className="service-lead">{s.lead}</p>
        <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <button className="link-cta" onClick={() => onEnquire(s.enquiry)}>Enquire about {s.title.toLowerCase()} <ArrowRight size={15} /></button>
      </div>
    </article>
  );
}

export function ServicesSection({ onEnquire }) {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <SectionHeading id="services-title" index="01" eyebrow="WHAT WE DO" title="FROM COMPLEX IDEAS TO REAL SYSTEMS.">
        Three disciplines, one team. We design the experience, build the system behind it, and connect it to the way you already work.
      </SectionHeading>
      <div className="service-list">{SERVICES.map((s, i) => <ServiceRow key={s.id} s={s} index={i} onEnquire={onEnquire} />)}</div>
    </section>
  );
}
