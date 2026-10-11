import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { WORK } from "../../data/content.js";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function Preview({ kind, id }) {
  // Layered CSS/SVG compositions stand in for screenshots we don't have permission to show.
  return (
    <div className={`work-preview wp-${id}`} aria-hidden="true">
      <div className="wp-layer wp-l1" /><div className="wp-layer wp-l2" /><div className="wp-layer wp-l3" />
      <span className="mono wp-badge">{kind === "real" ? "LIVE PROJECT" : "CONCEPT"}</span>
    </div>
  );
}

function Card({ w }) {
  const ref = useReveal();
  const inner = (
    <>
      <Preview kind={w.kind} id={w.id} />
      <div className="work-body">
        <span className="mono">{w.category}</span>
        <h3>{w.name}{w.to && <ArrowUpRight size={18} />}</h3>
        <p>{w.text}</p>
      </div>
    </>
  );
  return <article className="work-card reveal" ref={ref}>{w.to ? <Link to={w.to} aria-label={`${w.name} — view details`}>{inner}</Link> : <div>{inner}</div>}</article>;
}

export function WorkSection() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <SectionHeading id="work-title" index="02" eyebrow="SELECTED WORK" title="THINGS WE HAVE BUILT, AND THINGS WE ARE EXPLORING.">
        One live project and two clearly labelled concepts. We don't show client logos or results we can't back up.
      </SectionHeading>
      <div className="work-grid">{WORK.map((w) => <Card key={w.id} w={w} />)}</div>
    </section>
  );
}
