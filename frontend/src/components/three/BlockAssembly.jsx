import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BLOCKS, MATERIALS, getLayout } from "./blocks.js";
import { createRoller } from "./RollingTransition.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function BlockAssembly({ layoutIndex, step, reduced }) {
  const { size, viewport, invalidate } = useThree();
  const isMobile = size.width < 768;
  const roller = useMemo(() => createRoller(BLOCKS.length), []);
  const meshes = useRef([]);
  const mats = useRef([]);
  const group = useRef();
  const stage = useRef();
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const first = useRef(true);

  // Pointer parallax from window events (the canvas itself ignores pointer events so UI stays clickable).
  useEffect(() => {
    if (reduced) return undefined;
    const onMove = (e) => { pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1; };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  // New layout → roll every module to its place. The first layout (and reduced motion) is applied instantly.
  useEffect(() => {
    roller.setTarget(getLayout(layoutIndex), first.current || reduced);
    first.current = false;
    invalidate();
  }, [layoutIndex, reduced, roller, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    roller.update(dt);
    const time = state.clock.elapsedTime;

    BLOCKS.forEach((_, i) => {
      const mesh = meshes.current[i]; if (!mesh) return;
      const c = roller.cur[i];
      mesh.position.copy(c.p);
      if (!reduced) mesh.position.y += Math.sin(time * 0.6 + i * 1.3) * 0.025 * c.s;
      mesh.quaternion.copy(c.q);
      mesh.scale.setScalar(c.s);
      const mat = mats.current[i];
      if (mat) {
        const base = MATERIALS[BLOCKS[i].mat].emissive;
        const lit = layoutIndex === 3 && i % 4 === step;     // process step: the active module group glows
        mat.emissiveIntensity += ((lit ? 0.9 : base) - mat.emissiveIntensity) * Math.min(1, dt * 5);
        if (reduced) mat.emissiveIntensity = lit ? 0.9 : base;
      }
    });

    // Stage framing: responsive offset and scale, idle sway, damped pointer parallax.
    const scale = clamp(viewport.width / 5.2, 0.55, 1);
    const targetX = isMobile ? 0 : viewport.width * 0.2;
    const targetY = isMobile ? -2.0 : -1.5;
    const g = stage.current;
    g.scale.setScalar(scale);
    g.position.x += (targetX - g.position.x) * Math.min(1, dt * 3);
    g.position.y += (targetY - g.position.y) * Math.min(1, dt * 3);

    const p = pointer.current;
    p.sx += (p.x - p.sx) * Math.min(1, dt * 2.5); p.sy += (p.y - p.sy) * Math.min(1, dt * 2.5);
    const amp = reduced ? 0 : layoutIndex === 0 ? 1 : 0.5;
    group.current.rotation.y = (Math.sin(time * 0.15) * 0.25 + p.sx * 0.14) * amp;
    group.current.rotation.x = p.sy * 0.05 * amp;
  });

  return (
    <group ref={stage}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <shadowMaterial opacity={0.32} />
      </mesh>
      <gridHelper args={[14, 28, "#3ad7ff", "#3ad7ff"]} position={[0, -0.004, 0]} onUpdate={(g) => { [].concat(g.material).forEach((m) => { m.transparent = true; m.opacity = 0.07; m.depthWrite = false; }); }} />
      <group ref={group}>
        {BLOCKS.map((b, i) => (
          <mesh key={i} ref={(el) => (meshes.current[i] = el)} castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial ref={(el) => (mats.current[i] = el)} color={MATERIALS[b.mat].color} metalness={MATERIALS[b.mat].metalness}
              roughness={MATERIALS[b.mat].roughness} emissive="#0aa6d6" emissiveIntensity={MATERIALS[b.mat].emissive} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
