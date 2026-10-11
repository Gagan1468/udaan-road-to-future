import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "../../data/content.js";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function ProductCard({ p, onEnquire }) {
  const ref = useReveal();
  const live = p.status === "Available";
  return (
    <article className="product-card reveal" ref={ref}>
      <div className="product-top"><span className={`status-pill ${live ? "is-live" : ""}`}>{p.status}</span></div>
      <h3>{p.name}</h3>
      <p>{p.text}</p>
      {p.cta.to
        ? <Link className="link-cta" to={p.cta.to}>{p.cta.label} <ArrowRight size={15} /></Link>
        : <button className="link-cta" onClick={() => onEnquire(p.cta.service)}>{p.cta.label} <ArrowRight size={15} /></button>}
    </article>
  );
}

export function ProductsSection({ onEnquire }) {
  return (
    <section id="products" className="section" aria-labelledby="products-title">
      <SectionHeading id="products-title" index="04" eyebrow="PRODUCTS" title="WHAT'S READY, AND WHAT ISN'T YET.">
        Every product shows its real status. "Available" means people can use it today.
      </SectionHeading>
      <div className="product-grid">{PRODUCTS.map((p) => <ProductCard key={p.id} p={p} onEnquire={onEnquire} />)}</div>
    </section>
  );
}
