import React, { Suspense, lazy, useState } from "react";
import { useScene } from "../../app/SceneContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { hasWebGL } from "../../lib/webgl.js";
import { ErrorBoundary } from "../ui/ErrorBoundary.jsx";
import { LAYOUT_BY_SECTION, SCENE_OPACITY } from "./blocks.js";

const HeroScene = lazy(() => import("./HeroScene.jsx")); // three.js loads after first paint, not before

function StaticFallback() {
  return <div className="scene-fallback" aria-hidden="true"><i /><i /><i /><i /><i /></div>;
}

/** Fixed full-viewport layer behind the page. Pointer events pass through to the UI. */
export function SceneLayer() {
  const { section, step } = useScene();
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(false);

  const key = section || "hero";
  const layoutIndex = LAYOUT_BY_SECTION[key] ?? 0;
  const opacity = SCENE_OPACITY[key] ?? 0.6;

  return (
    <div className="scene-layer" style={{ opacity: ready || !webgl ? opacity : 0 }} aria-hidden="true">
      {webgl ? (
        <ErrorBoundary fallback={<StaticFallback />}>
          <Suspense fallback={null}>
            <HeroScene layoutIndex={layoutIndex} step={step} reduced={reduced} onReady={() => setReady(true)} />
          </Suspense>
        </ErrorBoundary>
      ) : <StaticFallback />}
      {webgl && !ready && <span className="scene-loading" role="status">Initialising 3D scene…</span>}
    </div>
  );
}
