import * as THREE from "three";

// Rolling-block transition engine.
//
// Every module travels from its current pose to its pose in the next layout. The motion is a
// staggered arc ("hop") combined with whole revolutions about the horizontal axis perpendicular to the
// direction of travel, i.e. the block rolls. Because the extra rotation is a multiple of 2π, a block
// always lands exactly on its target orientation, and because it is applied on top of the interpolated
// pose (not stored), interrupting a transition mid-way is seamless.

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createRoller(count) {
  const cur = Array.from({ length: count }, () => ({ p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1 }));
  const st = Array.from({ length: count }, () => ({
    fromP: new THREE.Vector3(), fromQ: new THREE.Quaternion(), fromS: 1,
    toP: new THREE.Vector3(), toQ: new THREE.Quaternion(), toS: 1,
    axis: new THREE.Vector3(0, 0, 1), turns: 0, lift: 0, delay: 0, dur: 1, t: 0, running: false,
  }));
  const tmpE = new THREE.Euler();
  const tmpQ = new THREE.Quaternion();
  const dir = new THREE.Vector3();

  function setTarget(layout, instant) {
    layout.forEach((target, i) => {
      const s = st[i], c = cur[i];
      s.toP.set(...target.p); s.toQ.setFromEuler(tmpE.set(...target.r)); s.toS = target.s;
      if (instant) {
        c.p.copy(s.toP); c.q.copy(s.toQ); c.s = s.toS; s.running = false; return;
      }
      s.fromP.copy(c.p); s.fromQ.copy(c.q); s.fromS = c.s;
      const dist = s.fromP.distanceTo(s.toP);
      dir.subVectors(s.toP, s.fromP).setY(0);
      if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
      dir.normalize();
      s.axis.crossVectors(UP, dir).normalize();           // rolling about the axis perpendicular to travel
      s.turns = dist > 0.4 ? (dist > 5 ? 2 : 1) : 0;
      s.lift = dist > 0.3 ? 0.45 + Math.min(dist, 4) * 0.12 : 0;
      s.delay = i * 0.045;                                  // coordinated stagger
      s.dur = 1.1 + Math.min(dist, 5) * 0.08;
      s.t = 0; s.running = true;
    });
  }

  function update(delta) {
    let running = false;
    for (let i = 0; i < st.length; i++) {
      const s = st[i];
      if (!s.running) continue;
      s.t += delta;
      const local = Math.min(1, Math.max(0, (s.t - s.delay) / s.dur));
      const e = ease(local);
      const c = cur[i];
      c.p.lerpVectors(s.fromP, s.toP, e);
      c.p.y += Math.sin(Math.PI * e) * s.lift;
      c.q.copy(s.fromQ).slerp(s.toQ, e);
      if (s.turns) { tmpQ.setFromAxisAngle(s.axis, s.turns * TAU * e); c.q.premultiply(tmpQ); }
      c.s = s.fromS + (s.toS - s.fromS) * e;
      if (local >= 1) { c.p.copy(s.toP); c.q.copy(s.toQ); c.s = s.toS; s.running = false; } else running = true;
    }
    return running;
  }

  return { cur, setTarget, update };
}
