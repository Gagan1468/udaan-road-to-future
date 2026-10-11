// The sculpture: 14 modules with fixed proportions and materials. Layout 0 is the hand-composed hero
// installation; the other layouts re-arrange the SAME modules, so section changes read as one machine
// reconfiguring itself rather than scenes being swapped.

// mat: "dark" brushed obsidian metal · "light" brushed steel · "matte" powder-coated · "accent" cyan
export const BLOCKS = [
  { size: [3.4, 0.35, 3.0], mat: "dark",   p: [0, 0.175, 0],        r: [0, 0, 0] },
  { size: [0.9, 2.8, 0.9],  mat: "light",  p: [-1.0, 1.75, -0.7],   r: [0, 0, 0] },
  { size: [0.8, 1.7, 0.8],  mat: "matte",  p: [0.9, 1.2, -0.8],     r: [0, 0, 0] },
  { size: [2.9, 0.42, 0.62],mat: "dark",   p: [-0.05, 2.3, -0.75],  r: [0, 0, 0] },
  { size: [0.62, 0.62, 2.4],mat: "matte",  p: [0.2, 1.45, 0.55],    r: [0, 0, 0] },
  { size: [0.55, 0.55, 0.55],mat: "accent",p: [-0.85, 0.62, 0.95],  r: [0, 0.35, 0] },
  { size: [1.7, 0.16, 1.15],mat: "light",  p: [0.75, 3.05, -0.1],   r: [0, -0.35, 0.08] },
  { size: [1.25, 0.55, 1.1],mat: "matte",  p: [1.15, 0.62, 0.85],   r: [0, 0, 0] },
  { size: [0.38, 1.3, 0.38],mat: "dark",   p: [-1.35, 1.0, 0.9],    r: [0, 0, 0] },
  { size: [2.2, 0.3, 0.3],  mat: "matte",  p: [0.1, 0.95, -1.25],   r: [0, 0, 0] },
  { size: [0.45, 0.45, 0.45],mat: "light", p: [1.6, 2.2, 0.6],      r: [0.5, 0.6, 0.2] },
  { size: [0.28, 0.28, 0.28],mat: "accent",p: [-1.7, 2.6, 0.4],     r: [0.3, 0.9, 0.4] },
  { size: [1.5, 0.22, 0.9], mat: "dark",   p: [-0.3, 1.88, 0.25],   r: [0, 0.1, 0] },
  { size: [0.5, 2.0, 0.5],  mat: "matte",  p: [1.5, 1.35, -0.2],    r: [0, 0, 0] },
];

export const MATERIALS = {
  dark:   { color: "#171b22", metalness: 0.92, roughness: 0.3,  emissive: 0 },
  light:  { color: "#c9ced6", metalness: 0.88, roughness: 0.34, emissive: 0 },
  matte:  { color: "#20252d", metalness: 0.15, roughness: 0.82, emissive: 0 },
  accent: { color: "#3ad7ff", metalness: 0.3,  roughness: 0.38, emissive: 0.35 },
};

const stacked = (cols, spacing, scale, spin) => {
  const heights = Array(cols).fill(0);
  return BLOCKS.map((b, i) => {
    const c = i % cols;
    const h = b.size[1] * scale;
    const y = heights[c] + h / 2;
    heights[c] += h + 0.03;
    return { p: [(c - (cols - 1) / 2) * spacing, y, ((i % 2) - 0.5) * 0.3], r: [0, i * spin, 0], s: scale };
  });
};

const flatGrid = () => {
  const s = 0.4, cols = 5;
  return BLOCKS.map((b, i) => ({
    p: [((i % cols) - (cols - 1) / 2) * 1.25, (b.size[1] * s) / 2, (Math.floor(i / cols) - 1) * 1.25],
    r: [0, i * 0.4, 0], s,
  }));
};

const ring = () => {
  const s = 0.5, radius = 2.5;
  return BLOCKS.map((b, i) => {
    const a = (i / BLOCKS.length) * Math.PI * 2;
    return { p: [Math.cos(a) * radius, (b.size[1] * s) / 2, Math.sin(a) * radius], r: [0, -a + Math.PI / 2, 0], s };
  });
};

// Index → layout. 0 hero · 1 services (3 stacks) · 2 work (flat plan) · 3 process (4 aligned stacks) · 4 about (ring)
const CACHE = {};
export function getLayout(index) {
  if (CACHE[index]) return CACHE[index];
  let layout;
  switch (index) {
    case 1: layout = stacked(3, 2.3, 0.5, 0.35); break;
    case 2: layout = flatGrid(); break;
    case 3: layout = stacked(4, 1.9, 0.5, 0); break;
    case 4: layout = ring(); break;
    default: layout = BLOCKS.map((b) => ({ p: b.p, r: b.r, s: 1 }));
  }
  return (CACHE[index] = layout);
}

export const LAYOUT_BY_SECTION = { hero: 0, services: 1, work: 2, process: 3, products: 2, courses: 1, about: 4, contact: 0 };
// How strongly the canvas shows through behind each section (text-heavy sections get a quieter scene).
export const SCENE_OPACITY = { hero: 1, services: 0.8, work: 0.45, process: 0.85, products: 0.4, courses: 0.5, about: 0.75, contact: 0.7 };
