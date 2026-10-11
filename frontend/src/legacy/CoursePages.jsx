import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, BrainCircuit, Presentation, Code2, CalendarDays, Clock3, ShieldCheck, Zap, BookOpen, Users, Download, CheckCircle2, X, GraduationCap, LogOut, RefreshCw, Search, Trash2, LockKeyhole } from "lucide-react";
import { api } from "../lib/api.js";
import emailjs from "@emailjs/browser";

const pillars = [
  { icon: Presentation, title: "AI for presentations & visuals", text: "Create polished slides, posters, infographics, and visual concepts with AI tools." },
  { icon: Code2, title: "AI for developers", text: "Explore AI-assisted coding, debugging, websites, apps, and beginner-friendly projects." },
  { icon: BrainCircuit, title: "AI for everyday life", text: "Use AI for study support, research, planning, writing, and practical problem-solving." },
];

function Art({ small = false }) {
  return <div className={`art ${small ? "art-small" : ""}`} aria-hidden="true"><div className="art-grid" /><div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" /><div className="art-core"><BrainCircuit size={small ? 54 : 78} strokeWidth={1.1} /></div><span className="art-tag art-tag-one">CREATE</span><span className="art-tag art-tag-two">BUILD</span><span className="art-tag art-tag-three">EXPLORE</span></div>;
}

export function CourseList({ onOpen }) {
  return <main className="shell">
    <section className="hero"><div className="eyebrow"><span /> UDAAN COURSES</div><h1>Learn what’s next.<br /><em>Build what’s possible.</em></h1><p>Practical learning for a future shaped by AI, creativity, and technology.</p><div className="hero-pills"><span><Sparkles size={15}/> Learn by exploring</span><span><ShieldCheck size={15}/> Student-focused</span></div><div className="hero-glow" /></section>
    <section className="course-section"><div className="section-head"><div><small>YOUR NEXT CHAPTER</small><h2>Explore our courses</h2></div><span className="count-tag">01 COURSE</span></div>
      <button className="course-card" onClick={onOpen} aria-label="Open Road to Future course details"><Art/><div className="course-card-copy"><div className="card-label-row"><span className="tag">FEATURED COURSE</span><span className="circle-arrow"><ArrowRight size={18}/></span></div><h3>Road to Future</h3><p>Discover how to use AI to create better presentations, build digital projects, and work smarter every day.</p><div className="course-meta"><span><BookOpen size={15}/> 3 learning pillars</span><span><Users size={15}/> Classes 9 &amp; 11</span></div><div className="text-cta">Explore course <ArrowRight size={17}/></div></div></button>
    </section>
  </main>;
}

function AnimatedShowcase() {
  return <div className="showcase" role="img" aria-label="Animated illustration of AI powering creative work, coding and productivity"><div className="showcase-ring ring-a"/><div className="showcase-ring ring-b"/><div className="showcase-center"><BrainCircuit size={60} strokeWidth={1.1}/></div><div className="float-box float-one"><Presentation size={18}/> Visual ideas</div><div className="float-box float-two"><Code2 size={18}/> Build projects</div><div className="float-box float-three"><Zap size={18}/> Work smarter</div><span className="showcase-caption">ONE IDEA. MANY POSSIBILITIES.</span></div>;
}

export function CourseDetail({ onBack, onRegister, registerLabel = "Register Yourself", hasRegistered = false }) {
  const perks = [["01","Practical demonstrations","See AI tools applied to real student tasks."],["02","Creative problem-solving","Turn your ideas into structured projects."],["03","Future-ready awareness","Understand AI’s possibilities, limits, and responsible use."],["04","A clear next step","Explore the course and decide whether to register."]];
  return <main className="shell detail-shell"><button className="back-link" onClick={onBack}><ArrowLeft size={17}/> All courses</button>
    <section className="detail-hero"><div className="detail-copy"><small>UDAAN COURSES / FEATURED COURSE</small><span className="tag detail-tag"><Sparkles size={13}/> PRACTICAL AI LEARNING</span><h1>Road to <em>Future.</em></h1><p className="lead">Turn curiosity into capability. Learn how AI can help you create, code, and solve everyday problems—with practical, student-friendly examples.</p><div className="course-meta detail-meta"><span><GraduationCap size={17}/> Classes 9 &amp; 11</span><span><BookOpen size={17}/> 3 learning pillars</span></div><button className="primary" onClick={onRegister}>{registerLabel} <ArrowRight size={18}/></button><p className="note">Orientation session: free · Full course: paid enrollment</p></div><AnimatedShowcase/></section>
    <section className="content-section"><div className="section-head"><div><small>THE LEARNING PATH</small><h2>What you’ll learn</h2></div><span className="count-tag">03 PILLARS</span></div><div className="pillar-grid">{pillars.map(({icon:Icon,title,text},i)=><article className="pillar-card" key={title}><div className="pillar-icon"><Icon size={22}/></div><span className="pillar-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="perks-section"><div><small>MORE THAN THEORY</small><h2>Perks that move you forward.</h2><p className="muted">A hands-on introduction designed to help students explore technology with confidence.</p></div><div className="perks-list">{perks.map(([n,t,d])=><div className="perk-row" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowRight size={18}/></div>)}</div></section>
    <section className="course-details"><div><small>THE ESSENTIALS</small><h2>Course details</h2></div><div className="detail-rows"><div><span><Users size={17}/> Target audience</span><strong>Classes 9 and 11</strong></div><div><span><BookOpen size={17}/> Learning format</span><strong>Practical demonstrations and guided activities</strong></div><div><span><CalendarDays size={17}/> Duration</span><strong>To be announced</strong></div><div><span><Clock3 size={17}/> Orientation</span><strong>Free of charge</strong></div><div><span><ShieldCheck size={17}/> Full course</span><strong>Paid enrollment · Fee to be announced</strong></div></div></section>
    <section className="bottom-cta"><div><small>YOUR FUTURE STARTS WITH CURIOSITY</small><h2>Ready to take the first step?</h2><p>Register your interest in the Road to Future program.</p></div><button className="primary" onClick={onRegister}>{registerLabel} <ArrowRight size={18}/></button><div className="cta-glow"/></section>
  </main>;
}

export function RegistrationModal({ onClose, onSuccess, token }) {
  const [mode,setMode]=useState("individual"), [form,setForm]=useState({name:"",email:"",phone:"",class_level:"9",school:"",city:""}), [busy,setBusy]=useState(false), [error,setError]=useState("");
  const change=(k,v)=>{setForm(p=>({...p,[k]:v}));setError("");};
  async function submit(e){
    e.preventDefault();
    if(busy)return;
    setBusy(true);setError("");
    try {
      // Persist first. Email failure must not turn a saved registration into a retryable
      // form error, because retrying could create another enrollment.
      const result = await api("/api/registrations",{method:"POST",body:JSON.stringify({...form,mode})},token);
      let confirmationEmailSent = false;
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        const templateId = import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID || "m22699q";
        if (!serviceId || !publicKey || !templateId) throw new Error("EmailJS is not configured");
        await emailjs.send(serviceId, templateId, {
          name: form.name.trim(),
          email: form.email.trim(),
          registration_code: result.registration_code,
          course_name: "Road to Future",
          dashboard_url: `${window.location.origin}/dashboard/course/road-to-future`,
        }, { publicKey });
        confirmationEmailSent = true;
      } catch {
        // Registration is already saved; the success screen explains email status.
      }
      onSuccess({...result, confirmation_email_sent: confirmationEmailSent});
    } catch(err) {
      setError(err.message || "Could not submit registration.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="registration-title"><button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20}/></button><small>ROAD TO FUTURE</small><h2 id="registration-title">Register your interest</h2><p className="muted">Your registration is sent to the course database.</p><div className="mode-tabs" role="group" aria-label="Registration type"><button type="button" className={mode==="individual"?"selected":""} onClick={()=>setMode("individual")}><Users size={16}/> Individual</button><button type="button" className={mode==="school"?"selected":""} onClick={()=>setMode("school")}><GraduationCap size={16}/> School</button></div><form onSubmit={submit}><div className="form-grid"><label>Full name<input required minLength="2" maxLength="120" autoComplete="name" value={form.name} onChange={e=>change("name",e.target.value)} placeholder="Your full name"/></label><label>Email address<input required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={e=>change("email",e.target.value)} placeholder="you@example.com"/></label><label>Phone <span>(optional)</span><input type="tel" maxLength="40" autoComplete="tel" value={form.phone} onChange={e=>change("phone",e.target.value)} placeholder="Phone number"/></label><label>Class<select value={form.class_level} onChange={e=>change("class_level",e.target.value)}><option value="9">Class 9</option><option value="11">Class 11</option></select></label>{mode==="school"&&<><label className="full">School name<input required maxLength="180" value={form.school} onChange={e=>change("school",e.target.value)} placeholder="Name of school"/></label><label className="full">City<input required maxLength="120" value={form.city} onChange={e=>change("city",e.target.value)} placeholder="City"/></label></>}</div><p className="privacy-note">By submitting, you confirm these details are accurate. Do not enter sensitive information.</p>{error&&<p className="error" role="alert">{error}</p>}<button className="primary submit" disabled={busy}>{busy?"Submitting…":"Submit registration"} <ArrowRight size={17}/></button></form></section></div>;
}

export function SuccessModal({entry,onClose,onDashboard}) {
  if(!entry)return null;
  return <div className="modal-backdrop"><section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-icon"><CheckCircle2 size={34}/></div><small>REGISTRATION SAVED</small><h2 id="success-title">You’re on your way.</h2><p>Your registration has been saved to the Road to Future database.</p>{entry.confirmation_email_sent ? <p className="email-status" role="status">Confirmation email sent to {entry.email}.</p> : <p className="email-status email-warning" role="status">We couldn't confirm email delivery. Your registration is saved—do not submit it again. You can open your dashboard now.</p>}<div className="reference"><span>Registration ID</span><strong>{entry.registration_code}</strong></div><button className="primary submit" onClick={onDashboard}>Go to Course Dashboard <ArrowRight size={17}/></button><button className="secondary-action" onClick={onClose}>Close</button></section></div>;
}
