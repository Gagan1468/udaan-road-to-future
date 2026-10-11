import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
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
      {success && <SuccessModal entry={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}
