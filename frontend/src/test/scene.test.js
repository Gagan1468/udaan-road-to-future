import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { BLOCKS, getLayout } from "../components/three/blocks.js";
import { createRoller } from "../components/three/RollingTransition.js";

const run = (r, seconds) => { for (let t = 0; t < seconds; t += 1 / 60) r.update(1 / 60); };

describe("rolling transition", () => {
  it("every block lands exactly on its target pose and scale", () => {
    const r = createRoller(BLOCKS.length);
    r.setTarget(getLayout(0), true);
    [1, 2, 3, 4, 0].forEach((idx) => {
      r.setTarget(getLayout(idx), false);
      run(r, 4);
      getLayout(idx).forEach((t, i) => {
        expect(r.cur[i].p.distanceTo(new THREE.Vector3(...t.p))).toBeLessThan(1e-6);
        expect(r.cur[i].q.angleTo(new THREE.Quaternion().setFromEuler(new THREE.Euler(...t.r)))).toBeLessThan(1e-5);
        expect(r.cur[i].s).toBeCloseTo(t.s, 6);
      });
    });
  });

  it("actually rolls: blocks leave the ground plane and rotate mid-flight", () => {
    const r = createRoller(BLOCKS.length);
    r.setTarget(getLayout(0), true);
    r.setTarget(getLayout(2), false);
    let maxLift = 0, rotated = false;
    for (let t = 0; t < 2; t += 1 / 60) {
      r.update(1 / 60);
      r.cur.forEach((c, i) => { maxLift = Math.max(maxLift, c.p.y - Math.max(getLayout(0)[i].p[1], getLayout(2)[i].p[1])); if (c.q.angleTo(new THREE.Quaternion()) > 1) rotated = true; });
    }
    expect(maxLift).toBeGreaterThan(0.3);
    expect(rotated).toBe(true);
  });

  it("is seamless when interrupted mid-transition (no position or rotation jump)", () => {
    const r = createRoller(BLOCKS.length);
    r.setTarget(getLayout(0), true);
    r.setTarget(getLayout(1), false);
    run(r, 0.6);
    const before = r.cur.map((c) => ({ p: c.p.clone(), q: c.q.clone() }));
    r.setTarget(getLayout(3), false);
    r.update(0);                                    // new transition begins from the exact current pose
    r.cur.forEach((c, i) => { expect(c.p.distanceTo(before[i].p)).toBeLessThan(1e-9); expect(c.q.angleTo(before[i].q)).toBeLessThan(1e-6); });
    run(r, 5);
    getLayout(3).forEach((t, i) => expect(r.cur[i].p.distanceTo(new THREE.Vector3(...t.p))).toBeLessThan(1e-6));
  });

  it("never produces NaN", () => {
    const r = createRoller(BLOCKS.length);
    r.setTarget(getLayout(0), true);
    r.setTarget(getLayout(0), false); // zero-distance transition
    run(r, 2);
    r.cur.forEach((c) => { expect(Number.isFinite(c.p.x + c.p.y + c.p.z + c.q.x + c.q.w)).toBe(true); });
  });
});

describe("layouts", () => {
  it("keep every block above the ground plane (axis-aligned blocks rest on y=0)", () => {
    [1, 2, 3, 4].forEach((idx) => getLayout(idx).forEach((t, i) => {
      const half = (BLOCKS[i].size[1] * t.s) / 2;
      expect(t.p[1] - half).toBeGreaterThanOrEqual(-1e-9);
    }));
  });
  it("hero layout is the hand-composed pose of each block", () => {
    getLayout(0).forEach((t, i) => { expect(t.p).toEqual(BLOCKS[i].p); expect(t.s).toBe(1); });
  });
});
