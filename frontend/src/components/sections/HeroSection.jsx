import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { scrollToId } from "../../lib/navigation.js";
import RotatingText from "../ui/RotatingText.jsx";
import PixelSwap from "../ui/PixelSwap.jsx";
import BlurText from "../ui/BlurText.jsx";


export function HeroSection() {
  const [activeService, setActiveService] = useState(0);
  const isCourses = activeService === 2;
  return (
    <section id="hero" className="section hero" aria-labelledby="hero-title">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-copy">
        <p className="status-label mono"><span className="pulse" aria-hidden="true" />INDEPENDENT TECHNOLOGY STUDIO · AI × ENGINEERING</p>
        <h1 id="hero-title" className="hero-title hero-title-rotating" aria-label="We provide website building, app development, and courses.">
          <span key={isCourses ? "provide" : "do"} className="hero-static-line hero-static-line-enter">{isCourses ? "WE PROVIDE" : "WE DO"}</span>
          <RotatingText
            texts={["WEBSITE BUILDING", "APP DEVELOPMENT", "COURSES"]}
            onNext={setActiveService}
            rotationInterval={2600}
            staggerFrom="last"
            staggerDuration={0.018}
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-110%", opacity: 0 }}
            mainClassName="hero-rotating-text"
            splitLevelClassName="hero-rotating-word"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          />
        </h1>
        <p className="hero-sub"><BlurText text="From standout websites and powerful apps to practical courses, we help people and businesses turn ideas into reality." className="hero-blur-copy" animateBy="words" duration={0.48} /></p>
        <div className="hero-actions">
          <Button onClick={() => scrollToId("contact")}>Let's Build Something <ArrowRight size={16} /></Button>
          <Button variant="ghost" onClick={() => scrollToId("work")}>Explore Our Work</Button>
        </div>
        <div className="hero-pixel-showcase">
          <p className="hero-pixel-label mono">A QUICK LOOK · CLICK TO TRANSFORM</p>
          <PixelSwap
            className="hero-pixel-swap"
            aspectRatio="16 / 5"
            firstContent={
              <div className="hero-swap-content hero-swap-website">
                <div className="hero-swap-browser">
                  <span /><span /><span />
                  <b>YOUR NEXT WEBSITE</b>
                </div>
                <div className="hero-swap-web-layout">
                  <div className="hero-swap-web-copy">
                    <small>DESIGNED TO STAND OUT</small>
                    <strong>Ideas into<br />experiences.</strong>
                    <i>Discover the difference <span>↗</span></i>
                  </div>
                  <div className="hero-swap-web-art" aria-hidden="true">
                    <span className="hero-swap-art-block art-a" />
                    <span className="hero-swap-art-block art-b" />
                    <span className="hero-swap-art-block art-c" />
                  </div>
                </div>
                <span className="hero-swap-corner">01 / WEB</span>
              </div>
            }
            secondContent={
              <div className="hero-swap-content hero-swap-app">
                <div className="hero-swap-browser">
                  <span /><span /><span />
                  <b>APPS + LEARNING</b>
                </div>
                <div className="hero-swap-app-layout">
                  <div className="hero-swap-phone" aria-hidden="true">
                    <div className="hero-swap-phone-top" />
                    <div className="hero-swap-phone-glow" />
                    <div className="hero-swap-phone-line" />
                    <div className="hero-swap-phone-line short" />
                    <div className="hero-swap-phone-button" />
                  </div>
                  <div className="hero-swap-app-copy">
                    <small>BUILD · LEARN · GROW</small>
                    <strong>More than<br />just a website.</strong>
                    <i>Apps and practical courses <span>↗</span></i>
                  </div>
                </div>
                <span className="hero-swap-corner">02 / APP + COURSES</span>
              </div>
            }
            pixelSize={42}
            pixelRadius={8}
            pixelScale={0.28}
            pixelSpin={0}
            duration={1050}
            pixelDuration={380}
            pattern="diagonal"
            randomness={0.12}
            trigger="click"
          />
          <span className="hero-pixel-hint">Tap or click the preview to reveal the next side.</span>
        </div>
      </div>
      <button className="scroll-cue mono" onClick={() => scrollToId("services")} aria-label="Scroll to services"><span className="cue-line" aria-hidden="true" />SCROLL</button>
    </section>
  );
}
