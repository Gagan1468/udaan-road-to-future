import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useScene } from "../app/SceneContext.jsx";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { SECTION_IDS, scrollToId } from "../lib/navigation.js";
import { SceneLayer } from "../components/three/SceneLayer.jsx";
import { HeroSection } from "../components/sections/HeroSection.jsx";
import { TechHighlights } from "../components/sections/TechHighlights.jsx";
import { ServicesSection } from "../components/sections/ServicesSection.jsx";
import { WorkSection } from "../components/sections/WorkSection.jsx";
import { ProcessSection } from "../components/sections/ProcessSection.jsx";
import { ProductsSection } from "../components/sections/ProductsSection.jsx";
import { CoursesSection } from "../components/sections/CoursesSection.jsx";
import { AboutSection } from "../components/sections/AboutSection.jsx";
import { ContactSection } from "../components/sections/ContactSection.jsx";

export default function Home() {
  usePageTitle("");
  const { setSection } = useScene();
  const location = useLocation();
  const [service, setService] = useState("");

  useActiveSection(SECTION_IDS, setSection);
  useEffect(() => { setSection("hero"); return () => setSection(null); }, [setSection]);

  // /#services style links (from the footer or other pages) scroll once the page has rendered.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => scrollToId(id), 60);
    return () => clearTimeout(t);
  }, [location.hash, location.key]);

  const onEnquire = useCallback((s) => { setService(s); scrollToId("contact"); }, []);

  return (
    <>
      <SceneLayer />
      <main id="main" className="home" tabIndex={-1}>
        <HeroSection />
        <TechHighlights />
        <ServicesSection onEnquire={onEnquire} />
        <WorkSection />
        <ProcessSection />
        <ProductsSection onEnquire={onEnquire} />
        <CoursesSection />
        <AboutSection />
        <ContactSection service={service} />
      </main>
    </>
  );
}
