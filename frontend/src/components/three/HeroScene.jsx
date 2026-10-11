import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { BlockAssembly } from "./BlockAssembly.jsx";
import { SceneLighting } from "./SceneLighting.jsx";

export default function HeroScene({ layoutIndex, step, reduced, onReady }) {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setMobile(window.innerWidth < 768), 150); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, mobile ? 1.5 : 2]}                         // cap pixel ratio: big saving on phones
      frameloop={reduced ? "demand" : "always"}
      camera={{ position: [0, 1.2, 12], fov: 35, near: 0.5, far: 60 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <SceneLighting shadowSize={mobile ? 512 : 1024} />
      <BlockAssembly layoutIndex={layoutIndex} step={step} reduced={reduced} />
    </Canvas>
  );
}
