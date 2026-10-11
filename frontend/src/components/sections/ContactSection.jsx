import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { Button } from "../ui/Button.jsx";
import { ErrorMessage } from "../ui/ErrorMessage.jsx";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { scrollToId } from "../../lib/navigation.js";

const SERVICES = ["AI & Intelligent Agents", "Digital Experiences", "Engineering & Automation", "Early access", "Something else"];
const EMPTY = { name: "", email: "", company: "", service: "", message: "", website: "" };

export function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!SERVICES.includes(f.service)) e.service = "Choose a service.";
  if (f.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters).";
  if (f.message.length > 4000) e.message = "Please keep this under 4000 characters.";
  return e;
}

export function ContactSection({ service }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (service) setForm((f) => ({ ...f, service })); }, [service]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); setServerError(""); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;                                   // no duplicate submissions
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) { document.getElementById(`enq-${Object.keys(found)[0]}`)?.focus(); return; }
    setBusy(true); setServerError("");
    try {
      await api("/api/enquiries", { method: "POST", body: JSON.stringify({ ...form, company: form.company.trim() || null, website: form.website || null }) });
      setDone(true); setForm(EMPTY);
    } catch (err) {
      setServerError(err.status === 429 ? err.message : err.message?.startsWith("Request failed") || err instanceof TypeError || err.message === "Failed to fetch"
        ? "We couldn't reach the server. Please check your connection and try again." : err.message);
    } finally { setBusy(false); }
  }

  const field = (k, label, props = {}, optional) => (
    <div className={`field ${props.full ? "full" : ""}`}>
      <label htmlFor={`enq-${k}`}>{label}{optional && <span className="optional"> (optional)</span>}</label>
      {props.as === "textarea"
        ? <textarea id={`enq-${k}`} rows="5" maxLength="4000" value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `enq-${k}-err` : undefined} />
        : props.as === "select"
          ? <select id={`enq-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `enq-${k}-err` : undefined}><option value="">Select…</option>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
          : <input id={`enq-${k}`} value={form[k]} onChange={set(k)} maxLength="254" aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `enq-${k}-err` : undefined} {...props} />}
      <ErrorMessage id={`enq-${k}-err`}>{errors[k]}</ErrorMessage>
    </div>
  );

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <SectionHeading id="contact-title" index="07" eyebrow="START A PROJECT" title="HAVE A CHALLENGE WORTH SOLVING?">
        Tell us what you're building. We'll help you turn the idea into a practical next step.
      </SectionHeading>
      <div className="contact-grid">
        {done ? (
          <div className="form-success" role="status"><CheckCircle2 size={28} /><h3>Message received.</h3><p>Thanks. We'll read it and reply to the email you gave us.</p><Button variant="ghost" onClick={() => setDone(false)}>Send another</Button></div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field-grid">
              {field("name", "Name", { autoComplete: "name" })}
              {field("email", "Email", { type: "email", autoComplete: "email" })}
              {field("company", "Company or organisation", { autoComplete: "organization" }, true)}
              {field("service", "Service of interest", { as: "select" })}
              {field("message", "Project description", { as: "textarea", full: true })}
              <div className="hp" aria-hidden="true"><label>Website<input tabIndex="-1" autoComplete="off" value={form.website} onChange={set("website")} /></label></div>
            </div>
            <ErrorMessage>{serverError}</ErrorMessage>
            <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Sending…" : <>Start a Project <ArrowRight size={16} /></>}</button>
          </form>
        )}
        <aside className="contact-aside">
          <p className="mono">PREFER TO BROWSE FIRST?</p>
          <Button variant="ghost" onClick={() => scrollToId("services")}>Explore Our Services</Button>
          <p className="fine">Your message is stored securely and used only to reply to you.</p>
        </aside>
      </div>
    </section>
  );
}
