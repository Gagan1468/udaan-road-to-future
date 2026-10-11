import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";
import { Footer } from "../components/layout/Footer.jsx";
import { ErrorBoundary } from "../components/ui/ErrorBoundary.jsx";
import { AppRoutes } from "./routes.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <ErrorBoundary><AppRoutes /></ErrorBoundary>
      <Footer />
    </>
  );
}
