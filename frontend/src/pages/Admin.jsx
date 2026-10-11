import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { AdminDashboard, AdminLogin } from "../legacy/AdminPages.jsx";

export default function AdminPage() {
  usePageTitle("Admin");
  const navigate = useNavigate();
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("udaan_admin_token") || "");
  const logout = () => { sessionStorage.removeItem("udaan_admin_token"); setAdminToken(""); navigate("/courses"); };
  return (
    <div className="legacy-surface" id="main" tabIndex={-1}>
      {adminToken ? <AdminDashboard token={adminToken} onLogout={logout} /> : <AdminLogin onBack={() => navigate("/courses")} onLogin={setAdminToken} />}
    </div>
  );
}
