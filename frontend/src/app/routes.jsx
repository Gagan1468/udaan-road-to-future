import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../auth/RequireAuth.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import Home from "../pages/Home.jsx";

const ProfileLayout = lazy(() => import("../pages/profile/ProfileLayout.jsx"));
const AdminPage = lazy(() => import("../pages/Admin.jsx"));
const lazyNamed = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const CoursesListPage = lazyNamed(() => import("../pages/Courses.jsx"), "CoursesListPage");
const CourseDetailPage = lazyNamed(() => import("../pages/Courses.jsx"), "CourseDetailPage");
const ProfileOverview = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "ProfileOverview");
const AccountSettings = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "AccountSettings");
const SecuritySettings = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "SecuritySettings");
const PrivacySettings = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "PrivacySettings");
const AppearanceSettings = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "AppearanceSettings");
const SessionSettings = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "SessionSettings");
const AccountManagement = lazyNamed(() => import("../pages/profile/ProfileViews.jsx"), "AccountManagement");

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="route-loading"><LoadingState label="Loading…" /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursesListPage />} />
        <Route path="/courses/road-to-future" element={<CourseDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
          <Route index element={<ProfileOverview />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="privacy" element={<PrivacySettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="sessions" element={<SessionSettings />} />
          <Route path="manage" element={<AccountManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
