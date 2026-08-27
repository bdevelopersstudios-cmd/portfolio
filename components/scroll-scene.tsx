"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

/**
 * The fixed layer behind the page.
 *
 * Two things it has to get right. Parallax: every object carries its own
 * scroll speed, so the far ones drift and the near ones sweep — the camera
 * itself never moves, which makes the speed difference explicit rather than
 * something perspective has to imply. Scrollytelling: each model is anchored
 * to its own section, and scrolling through that section scrubs the model's
 * rotation and fades it in and out, so scroll drives the animation instead of
 * merely passing it by.
 *
 * Everything is drawn as line art in the site's own hairline colours, for the
 * same reason the page is built from 1px rules rather than filled panels.
 */

/** World units travelled per unit of scroll fraction, before each object's own speed. */
const SCROLL_SPAN = 92;
const CAM_Z = 10;
/** Where an object begins and finishes fading, by absolute world y. */
const FADE_IN = 3.6;
const FADE_OUT = 7.6;
/** Radians of scrub per unit of scroll fraction. */
const SCRUB = 13;

type P3 = [number, number, number];
type ModelKind = "brackets" | "terminal" | "bars" | "gitgraph" | "atom" | "database";

/** `k` is how far out toward the margin each one sits — see `frustumX`. */
const MODELS: { id: string; kind: ModelKind; side: 1 | -1; k: number }[] = [
  // About's column is a table of hairlines; kept furthest out so the model
  // isn't drawing on top of its rules.
  { id: "about", kind: "brackets", side: 1, k: 0.78 },
  { id: "work", kind: "terminal", side: -1, k: 0.7 },
  { id: "impact", kind: "bars", side: 1, k: 0.66 },
  { id: "experience", kind: "gitgraph", side: -1, k: 0.72 },
  { id: "skills", kind: "atom", side: 1, k: 0.68 },
  { id: "contact", kind: "database", side: -1, k: 0.7 },
];

/** The real stack, straight from the Skills section. */
const LANGUAGES = [
  "TypeScript",
  "React",
  "Next.js",
  "PostgreSQL",
  "Supabase",
  "Node",
  "Stripe",
  "Cloudflare",
  "Figma API",
  "CSS",
  "Bubble.io",
  "OCR",
  "JavaScript",
  "HTML",
  "Bootstrap",
  "Workers",
  "Triggers",
  "Realtime",
  "Migrations",
  "Webhooks",
];

type Palette = { stroke: string; strokeSoft: string; chipText: string; chipEdge: string };

const PALETTES: Record<ThemeMode, Palette> = {
  // Straight from the site's own tokens: --ink-faint, --line and friends.
  light: { stroke: "#8b93a1", strokeSoft: "#e2e6ee", chipText: "#8b93a1", chipEdge: "#e2e6ee" },
  dark: { stroke: "#67748a", strokeSoft: "#333e4d", chipText: "#67748a", chipEdge: "#333e4d" },
};

// --- geometry helpers: models are described as polylines, then flattened
// --- into segment pairs so each one is a single draw call.

function circle(r: number, seg = 64, z = 0): P3[] {
  const pts: P3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([Math.cos(a) * r, Math.sin(a) * r, z]);
  }
  return pts;
}

function ellipse(rx: number, ry: number, cy = 0, seg = 48): P3[] {
  const pts: P3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([Math.cos(a) * rx, cy + Math.sin(a) * ry, 0]);
  }
  return pts;
}

function rect(w: number, h: number, cx = 0, cy = 0): P3[] {
  const x = w / 2;
  const y = h / 2;
  return [
    [cx - x, cy - y, 0],
    [cx + x, cy - y, 0],
    [cx + x, cy + y, 0],
    [cx - x, cy + y, 0],
    [cx - x, cy - y, 0],
  ];
}

/** Spins a path about the Y then X axis — used to splay the atom's rings. */
function tilt(path: P3[], ry: number, rx: number): P3[] {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  return path.map(([x, y, z]) => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    return [x1, y2, z2] as P3;
  });
}

function toSegments(paths: P3[][]): P3[] {
  const out: P3[] = [];
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i++) {
      out.push(path[i], path[i + 1]);
    }
  }
  return out;
}

function geometryFrom(paths: P3[][]) {
  const pts = toSegments(paths);
  const positions = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => {
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Each model returns its outline plus a small set of accent strokes — the
 * one part that picks up the site's accent colour, the way the page uses it
 * for a single marker rather than everywhere.
 */
function buildModel(kind: ModelKind): { base: P3[][]; accent: P3[][] } {
  switch (kind) {
    case "brackets":
      // Wider than they are tall, and well clear of the slash. Made taller or
      // closer, the three strokes stop reading as `</>` and start closing up
      // into a single hexagon — especially over the page's own hairlines.
      return {
        base: [
          [
            [-0.88, 0.62, 0],
            [-1.62, 0, 0],
            [-0.88, -0.62, 0],
          ],
          [
            [0.88, 0.62, 0],
            [1.62, 0, 0],
            [0.88, -0.62, 0],
          ],
        ],
        accent: [
          [
            [-0.18, -0.74, 0],
            [0.18, 0.74, 0],
          ],
        ],
      };

    case "terminal": {
      const w = 3.2;
      const h = 2.1;
      const barY = h / 2 - 0.42;
      const rows: P3[][] = [0, 1, 2].map((i) => {
        const y = barY - 0.42 - i * 0.42;
        const len = [1.9, 1.3, 2.3][i];
        return [
          [-w / 2 + 0.3, y, 0],
          [-w / 2 + 0.3 + len, y, 0],
        ];
      });
      return {
        base: [
          rect(w, h),
          [
            [-w / 2, barY, 0],
            [w / 2, barY, 0],
          ],
          ...[0, 1, 2].map((i) => circle(0.075, 14).map(([x, y]) => [x - w / 2 + 0.34 + i * 0.24, y + h / 2 - 0.21, 0] as P3)),
          ...rows,
        ],
        // The caret: the one live thing on a terminal.
        accent: [
          [
            [-w / 2 + 0.3, barY - 1.26 - 0.16, 0],
            [-w / 2 + 0.3, barY - 1.26 + 0.16, 0],
          ],
        ],
      };
    }

    case "bars": {
      const heights = [0.85, 1.6, 1.15, 2.25, 1.45];
      const bw = 0.46;
      const gap = 0.66;
      const base: P3[][] = heights.map((hh, i) => rect(bw, hh, (i - 2) * gap, hh / 2 - 1.1));
      base.push([
        [-1.9, -1.1, 0],
        [1.9, -1.1, 0],
      ]);
      // Tallest bar carries the accent — the point the section is making.
      const tallest = heights.indexOf(Math.max(...heights));
      return {
        base,
        accent: [rect(bw, heights[tallest], (tallest - 2) * gap, heights[tallest] / 2 - 1.1)],
      };
    }

    case "gitgraph": {
      const nodes: [number, number][] = [
        [0, -1.9],
        [0, -0.7],
        [1.15, 0.1],
        [1.15, 1.0],
        [0, 0.5],
        [0, 1.9],
      ];
      const edges: [number, number][] = [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 4],
        [4, 5],
        [3, 5],
      ];
      const base: P3[][] = [
        ...edges.map(([a, b]) => [
          [nodes[a][0], nodes[a][1], 0],
          [nodes[b][0], nodes[b][1], 0],
        ] as P3[]),
        ...nodes.slice(0, 5).map(([x, y]) => circle(0.19, 20).map(([px, py]) => [px + x, py + y, 0] as P3)),
      ];
      // HEAD, at the tip of the trunk.
      return { base, accent: [circle(0.19, 20).map(([px, py]) => [px, py + 1.9, 0] as P3)] };
    }

    case "atom": {
      const ring = circle(1.65, 72);
      return {
        base: [tilt(ring, 0, 0), tilt(ring, Math.PI / 3, 0.95), tilt(ring, -Math.PI / 3, -0.95)],
        accent: [circle(0.26, 24)],
      };
    }

    case "database": {
      const rx = 1.2;
      const ry = 0.36;
      const levels = [-0.72, 0, 0.72];
      const base: P3[][] = levels.map((y) => ellipse(rx, ry, y));
      base.push(
        [
          [-rx, 0.72, 0],
          [-rx, -0.72, 0],
        ],
        [
          [rx, 0.72, 0],
          [rx, -0.72, 0],
        ]
      );
      return { base, accent: [ellipse(rx, ry, 0.72)] };
    }
  }
}

// --- language chips, drawn to match the site's own tech pills ---

function makeChipTexture(label: string, palette: Palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);
    const text = label.toUpperCase();
    ctx.font = '30px "IBM Plex Mono", "Courier New", monospace';
    // letterSpacing is not in every engine's 2D context; harmless where absent.
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "4px";
    const textWidth = ctx.measureText(text).width;
    const padX = 34;
    const w = Math.min(textWidth + padX * 2, 500);
    const h = 74;
    const x = (512 - w) / 2;
    const y = (128 - h) / 2;
    const r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    // Outline only, like the site's pills — no fill to sit on top of the copy.
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.chipEdge;
    ctx.stroke();

    ctx.fillStyle = palette.chipText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 66);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// --- placement ---

type Chip = {
  label: string;
  side: 1 | -1;
  k: number;
  anchor: number;
  z: number;
  /** Multiplier on scroll travel — the whole point of the parallax. */
  speed: number;
};

function buildChips(): Chip[] {
  return LANGUAGES.map((label, i) => {
    // Three explicit bands. Far ones barely creep, near ones sweep past, and
    // the gap between is what actually reads as depth.
    const band = i % 3;
    const speed = [0.38, 0.72, 1.25][band];
    const z = [-9, -4.5, 0.5][band];
    return {
      label,
      side: (i % 2 === 0 ? 1 : -1) as 1 | -1,
      // Deterministic spread rather than random, so the layout is the same on
      // every load and can actually be judged.
      k: 0.5 + ((i * 41) % 45) / 100,
      anchor: 0.05 + (i / LANGUAGES.length) * 0.95,
      z,
      speed,
    };
  });
}

/**
 * World x for something that should sit a given fraction out from the centre
 * of frame at its own depth. Fixed coordinates survive neither a depth change
 * nor a viewport change — on a phone they simply leave the screen.
 */
function frustumX(camera: THREE.PerspectiveCamera, z: number, side: number, k: number) {
  const distance = Math.max(camera.position.z - z, 0.1);
  const halfWidth = distance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
  return side * k * halfWidth;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

type ScrollState = { fraction: number };

function Exhibit({
  kind,
  side,
  k,
  z,
  anchor,
  palette,
  accent,
  reduced,
  scroll,
  pointer,
}: {
  kind: ModelKind;
  side: 1 | -1;
  k: number;
  z: number;
  anchor: number;
  palette: Palette;
  accent: string;
  reduced: boolean;
  scroll: React.RefObject<ScrollState>;
  pointer: React.RefObject<THREE.Vector2>;
}) {
  const group = useRef<THREE.Group>(null);
  const baseMat = useRef<THREE.LineBasicMaterial>(null);
  const accentMat = useRef<THREE.LineBasicMaterial>(null);

  const { base, accent: accentPaths } = useMemo(() => buildModel(kind), [kind]);
  const baseGeom = useMemo(() => geometryFrom(base), [base]);
  const accentGeom = useMemo(() => geometryFrom(accentPaths), [accentPaths]);
  useEffect(() => {
    return () => {
      baseGeom.dispose();
      accentGeom.dispose();
    };
  }, [baseGeom, accentGeom]);

  const strokeColor = useMemo(() => new THREE.Color(palette.stroke), [palette]);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;

    const rel = (scroll.current?.fraction ?? 0) - anchor;
    const y = rel * SCROLL_SPAN * 0.78;

    g.position.set(frustumX(camera as THREE.PerspectiveCamera, z, side, k), y, z);

    // Fade at both ends of the model's travel, which gives it an entrance and
    // an exit rather than simply existing.
    const presence = 1 - smoothstep(FADE_IN, FADE_OUT, Math.abs(y));
    g.visible = presence > 0.01;
    if (!g.visible) return;

    // Scroll scrubs the rotation: the section you are reading is turning the
    // model, which is the whole point of tying it to the scroll at all.
    const scrub = reduced ? 0 : rel * SCRUB;
    const lean = reduced ? 0 : (pointer.current?.x ?? 0) * 0.28;
    g.rotation.y = scrub + lean;
    g.rotation.x = reduced ? 0 : -(pointer.current?.y ?? 0) * 0.12;
    // Small enough to stay background. Bigger than this and it stops being a
    // backdrop and starts arguing with the copy in front of it.
    g.scale.setScalar(0.5 + presence * 0.14);

    if (baseMat.current) {
      baseMat.current.color.copy(strokeColor);
      baseMat.current.opacity = presence * 0.95;
    }
    if (accentMat.current) {
      accentMat.current.color.copy(accentColor);
      accentMat.current.opacity = presence;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={baseGeom}>
        <lineBasicMaterial ref={baseMat} transparent depthWrite={false} toneMapped={false} />
      </lineSegments>
      <lineSegments geometry={accentGeom}>
        <lineBasicMaterial ref={accentMat} transparent depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function Chips({
  chips,
  palette,
  scroll,
  reduced,
}: {
  chips: Chip[];
  palette: Palette;
  scroll: React.RefObject<ScrollState>;
  reduced: boolean;
}) {
  const textures = useMemo(() => chips.map((c) => makeChipTexture(c.label, palette)), [chips, palette]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera, clock }) => {
    const cam = camera as THREE.PerspectiveCamera;
    const fraction = scroll.current?.fraction ?? 0;
    chips.forEach((c, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const rel = fraction - c.anchor;
      const y = rel * SCROLL_SPAN * c.speed;
      m.position.set(frustumX(cam, c.z, c.side, c.k), y, c.z);
      const presence = 1 - smoothstep(FADE_IN + 1, FADE_OUT + 3, Math.abs(y));
      m.visible = presence > 0.01;
      if (!m.visible) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * 0.85;
      m.rotation.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.2 + i) * 0.16;
    });
  });

  return (
    <>
      {chips.map((c, i) => (
        <mesh
          key={c.label}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          renderOrder={-1}
        >
          <planeGeometry args={[1.9, 0.475]} />
          <meshBasicMaterial
            map={textures[i]}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** The faint horizon rules that give the drifting objects something to move against. */
function Rules({ palette, scroll }: { palette: Palette; scroll: React.RefObject<ScrollState> }) {
  const group = useRef<THREE.Group>(null);
  const COUNT = 14;
  const geom = useMemo(() => {
    const paths: P3[][] = [];
    for (let i = 0; i < COUNT; i++) {
      const y = i * 4.5;
      paths.push([
        [-40, y, 0],
        [40, y, 0],
      ]);
    }
    return geometryFrom(paths);
  }, []);
  useEffect(() => () => geom.dispose(), [geom]);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const color = useMemo(() => new THREE.Color(palette.strokeSoft), [palette]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const fraction = scroll.current?.fraction ?? 0;
    // The slowest layer of all, and it wraps, so there is always a rule in
    // view for the faster objects to move against.
    const travel = (fraction * SCROLL_SPAN * 0.22) % 4.5;
    g.position.y = travel - COUNT * 4.5 * 0.5;
    if (mat.current) mat.current.color.copy(color);
  });

  return (
    <group ref={group} position={[0, 0, -14]}>
      <lineSegments geometry={geom}>
        <lineBasicMaterial ref={mat} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function Rig({
  theme,
  accent,
  reduced,
  offsets,
  chips,
  scroll,
  pointer,
}: {
  theme: ThemeMode;
  accent: string;
  reduced: boolean;
  offsets: Record<string, number>;
  chips: Chip[];
  scroll: React.RefObject<ScrollState>;
  pointer: React.RefObject<THREE.Vector2>;
}) {
  const palette = PALETTES[theme];

  useFrame(({ camera }) => {
    // The camera holds still — all motion is per-object, which is what lets
    // the layers move at genuinely different rates.
    camera.position.x = reduced
      ? 0
      : THREE.MathUtils.lerp(camera.position.x, (pointer.current?.x ?? 0) * 0.45, 0.05);
  });

  return (
    <>
      <Rules palette={palette} scroll={scroll} />
      <Chips chips={chips} palette={palette} scroll={scroll} reduced={reduced} />
      {MODELS.map((m, i) => (
        <Exhibit
          key={m.id}
          kind={m.kind}
          side={m.side}
          k={m.k}
          z={-3.6 - (i % 3) * 1.3}
          anchor={offsets[m.id] ?? (i + 0.7) / MODELS.length}
          palette={palette}
          accent={accent}
          reduced={reduced}
          scroll={scroll}
          pointer={pointer}
        />
      ))}
    </>
  );
}

export function ScrollScene({ theme, accent }: { theme: ThemeMode; accent: string }) {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;
  const pointer = useRef(new THREE.Vector2(0, 0));
  const scroll = useRef<ScrollState>({ fraction: 0 });
  const [active, setActive] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const chips = useMemo(() => buildChips(), []);

  // Anchor each model to where its section actually sits, so a 220vh section
  // holds its model for as long as it is genuinely on screen.
  const measure = useCallback(() => {
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const next: Record<string, number> = {};
    for (const m of MODELS) {
      const el = document.getElementById(m.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const centre = rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
      next[m.id] = THREE.MathUtils.clamp(centre / scrollable, 0, 1);
    }
    setOffsets(next);
  }, []);

  useEffect(() => {
    // Deferred a frame: this reads layout and then sets state, which run
    // inline in an effect is a cascading render.
    const raf = requestAnimationFrame(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(measure, 900);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [measure]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
      scroll.current.fraction = THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1);
      // The hero paints an opaque background over this layer, so there is
      // nothing to render until the page has scrolled clear of it.
      const hero = document.getElementById("top");
      setActive(!hero || window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    // pointer-events:none is load-bearing — this covers the whole viewport,
    // and anything else here would swallow clicks and block touch scrolling.
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, CAM_Z], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
      >
        <Rig
          theme={theme}
          accent={accent}
          reduced={reduced}
          offsets={offsets}
          chips={chips}
          scroll={scroll}
          pointer={pointer}
        />
      </Canvas>
    </div>
  );
}
