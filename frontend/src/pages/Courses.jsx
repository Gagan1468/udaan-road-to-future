import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { CourseDetail, CourseList, RegistrationModal, SuccessModal } from "../legacy/CoursePages.jsx";

export function CoursesListPage() {
  usePageTitle("Courses");
  const navigate = useNavigate();
  return <div className="legacy-surface" id="main" tabIndex={-1}><CourseList onOpen={() => navigate("/courses/road-to-future")} /></div>;
}

// Registration behaviour is unchanged from the original app: sign in first, then register once.
export function CourseDetailPage() {
  usePageTitle("Road to Future");
  const navigate = useNavigate();
  const { token, openAuth } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [success, setSuccess] = useState(null);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (!token) { setHasRegistered(false); return; }
    api("/api/registrations/mine", {}, token).then((rows) => setHasRegistered(rows.length > 0)).catch(() => {});
  }, [token]);

  const handleRegister = () => {
    if (hasRegistered) { navigate("/dashboard/course/road-to-future"); return; }
    if (!token) {
      openAuth(async (t) => {
        try { const mine = await api("/api/registrations/mine", {}, t); setHasRegistered(mine.length > 0); if (!mine.length) setShowRegistration(true); }
        catch { setShowRegistration(true); }
      });
      return;
    }
    setShowRegistration(true);
  };
  const onSuccess = (entry) => { setShowRegistration(false); setSuccess(entry); setHasRegistered(true); };

  return (
    <div className="legacy-surface" id="main" tabIndex={-1}>
      <CourseDetail onBack={() => navigate("/courses")} onRegister={handleRegister} registerLabel={hasRegistered ? "Registration Complete ✓" : "Register Yourself"} hasRegistered={hasRegistered} />
      {showRegistration && token && <RegistrationModal token={token} onClose={() => setShowRegistration(false)} onSuccess={onSuccess} />}
      {success && <SuccessModal entry={success} onClose={() => setSuccess(null)} onDashboard={() => { setSuccess(null); navigate("/dashboard/course/road-to-future"); }} />}
    </div>
  );
}

export function CourseDashboardPage() {
  usePageTitle("Course Dashboard");
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    authFetch(`/api/courses/${encodeURIComponent(courseId)}/dashboard`)
      .then((data) => { if (active) setDashboard(data); })
      .catch((err) => { if (active) setError(err.status === 404 ? "This course dashboard is available only to enrolled accounts." : err.message || "The dashboard could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authFetch, courseId]);

  if (loading) return <div className="legacy-surface"><main className="shell dashboard-shell"><p role="status">Checking your enrollment…</p></main></div>;
  if (error) return <div className="legacy-surface"><main className="shell dashboard-shell"><button className="back-link" onClick={() => navigate("/courses/road-to-future")}><ArrowLeft size={17}/> Road to Future</button><section className="dashboard-state"><small>COURSE ACCESS</small><h1>Dashboard unavailable</h1><p role="alert">{error}</p><button className="primary" onClick={() => navigate("/courses/road-to-future")}>Return to course <ArrowRight size={17}/></button></section></main></div>;

  const sections = [
    ["Live classes", dashboard.live_classes],
    ["Recorded classes", dashboard.recorded_classes],
    ["Resources", dashboard.resources],
  ];
  return <div className="legacy-surface"><main className="shell dashboard-shell">
    <button className="back-link" onClick={() => navigate("/courses/road-to-future")}><ArrowLeft size={17}/> Road to Future</button>
    <section className="dashboard-hero"><small>YOUR LEARNING SPACE</small><h1>{dashboard.title}<br/><em>Course Dashboard</em></h1><p>{dashboard.overview}</p><span className="dashboard-access"><ShieldCheck size={16}/> Enrollment verified</span></section>
    <section className="dashboard-grid" aria-label="Course content">
      {sections.map(([title, section]) => <article className="dashboard-card" key={title}><div className="dashboard-card-icon"><BookOpen size={21}/></div><small>COURSE CONTENT</small><h2>{title}</h2><p className="dashboard-status">{section.status}</p><p>Details will appear here once the course team adds verified information.</p></article>)}
    </section>
  </main></div>;
}
