"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

/**
 * A fixed 3D layer behind the page. Scrolling translates the camera down a
 * tall column of objects, and because they sit at different depths the
 * perspective gives real parallax for free — near things sweep past, far
 * things barely drift.
 *
 * Each model is pinned to the document offset of the section it belongs to,
 * so it takes focus exactly as that section arrives however tall the
 * sections happen to be. That is the scrollytelling half.
 */

/** How many world units the camera travels across the whole page. */
const COLUMN_H = 78;
const CAM_Z = 10;
/** Distance either side of centre over which a model is "in focus". */
const FOCUS_RANGE = 7;

type ModelKind = "brackets" | "terminal" | "bars" | "gitgraph" | "atom" | "database";

/** Ordered to match the page: the id is the section each model belongs to. */
const MODELS: { id: string; kind: ModelKind; side: 1 | -1 }[] = [
  { id: "about", kind: "brackets", side: 1 },
  { id: "work", kind: "terminal", side: -1 },
  { id: "impact", kind: "bars", side: 1 },
  { id: "experience", kind: "gitgraph", side: -1 },
  { id: "skills", kind: "atom", side: 1 },
  { id: "contact", kind: "database", side: -1 },
];

const LANGUAGES = [
  { label: "TS", tint: "#3178c6" },
  { label: "JS", tint: "#e8c020" },
  { label: "JSX", tint: "#61dafb" },
  { label: "SQL", tint: "#4a90d9" },
  { label: "CSS", tint: "#2965f1" },
  { label: "HTML", tint: "#e34c26" },
  { label: "node", tint: "#68a063" },
  { label: "JSON", tint: "#b3ae3e" },
  { label: "sh", tint: "#89e051" },
  { label: "git", tint: "#f1502f" },
  { label: "npm", tint: "#cb3837" },
  { label: "env", tint: "#9b8cff" },
];

type Palette = {
  solid: string;
  solidLit: string;
  cardBg: string;
  cardEdge: string;
  cardText: string;
};

const PALETTES: Record<ThemeMode, Palette> = {
  // Deliberately close to each theme's page background. These sit directly
  // behind body copy, so they have to stay quiet until you interact with
  // them — focus and hover are what bring them up.
  dark: {
    solid: "#151f31",
    solidLit: "#263d5e",
    cardBg: "rgba(19,28,44,0.9)",
    cardEdge: "rgba(125,160,205,0.35)",
    cardText: "#c4d4ea",
  },
  light: {
    solid: "#dde5f0",
    solidLit: "#bacee6",
    cardBg: "rgba(255,255,255,0.86)",
    cardEdge: "rgba(40,70,120,0.16)",
    cardText: "#41546f",
  },
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeCardTexture(label: string, tint: string, palette: Palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 320, 200);
    // Baked-in translucency. The page's copy is drawn over this layer, and a
    // solid panel behind a paragraph reads as a rendering fault rather than
    // as depth.
    ctx.globalAlpha = 0.5;
    roundRect(ctx, 10, 10, 300, 180, 26);
    ctx.fillStyle = palette.cardBg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.cardEdge;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(46, 52, 11, 0, Math.PI * 2);
    ctx.fillStyle = tint;
    ctx.fill();

    ctx.fillStyle = palette.cardText;
    ctx.font = 'bold 62px "Courier New", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 40, 128);
    ctx.globalAlpha = 1;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeTerminalTexture(palette: Palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 260;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 420, 260);
    roundRect(ctx, 6, 6, 408, 248, 14);
    ctx.fillStyle = palette.cardBg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.cardEdge;
    ctx.stroke();

    // Muted rather than the usual saturated traffic lights: this sits behind
    // body copy, and a bright dot back there reads as a defect on the text.
    ctx.globalAlpha = 0.45;
    ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(34 + i * 26, 36, 8, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });

    ctx.font = '25px "Courier New", monospace';
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.4;
    const lines: [string, string][] = [
      ["$ ", "npm run build"],
      ["", "✓ compiled"],
      ["$ ", "git push"],
    ];
    lines.forEach(([prompt, rest], i) => {
      const y = 82 + i * 46;
      ctx.fillStyle = "#4f9e77";
      ctx.fillText(prompt, 30, y);
      ctx.fillStyle = palette.cardText;
      ctx.fillText(rest, 30 + ctx.measureText(prompt).width, y);
    });
    ctx.globalAlpha = 1;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// --- the individual models, all built from primitives ---

function Brackets({ material }: { material: THREE.Material }) {
  // `< />` — angle brackets built from rotated bars, with a slash between.
  const bar: [number, number, number] = [0.22, 1.5, 0.22];
  return (
    <group>
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * 1.5, 0, 0]}>
          <mesh material={material} position={[0, 0.52, 0]} rotation={[0, 0, dir * 0.62]}>
            <boxGeometry args={bar} />
          </mesh>
          <mesh material={material} position={[0, -0.52, 0]} rotation={[0, 0, dir * -0.62]}>
            <boxGeometry args={bar} />
          </mesh>
        </group>
      ))}
      <mesh material={material} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.22, 2.4, 0.22]} />
      </mesh>
    </group>
  );
}

function Terminal({ material, texture }: { material: THREE.Material; texture: THREE.Texture }) {
  return (
    <group>
      <RoundedBox args={[3.4, 2.2, 0.22]} radius={0.1} smoothness={3} material={material} />
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[3.1, 1.95]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Bars({ material }: { material: THREE.Material }) {
  const heights = [0.9, 1.7, 1.2, 2.3, 1.5];
  return (
    <group position={[0, -0.6, 0]}>
      {heights.map((h, i) => (
        <mesh key={i} material={material} position={[(i - 2) * 0.66, h / 2, 0]}>
          <boxGeometry args={[0.44, h, 0.44]} />
        </mesh>
      ))}
    </group>
  );
}

function GitGraph({ material }: { material: THREE.Material }) {
  // A trunk with one branch off it and a merge back — commits as spheres,
  // edges as thin cylinders rotated to join them.
  const nodes: [number, number][] = [
    [0, -1.8],
    [0, -0.6],
    [1.1, 0.2],
    [1.1, 1.1],
    [0, 0.6],
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
  return (
    <group>
      {nodes.map(([x, y], i) => (
        <mesh key={i} material={material} position={[x, y, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
        </mesh>
      ))}
      {edges.map(([a, b], i) => {
        const [ax, ay] = nodes[a];
        const [bx, by] = nodes[b];
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy);
        return (
          <mesh
            key={i}
            material={material}
            position={[ax + dx / 2, ay + dy / 2, 0]}
            rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}
          >
            <cylinderGeometry args={[0.06, 0.06, len, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Atom({ material, spin }: { material: THREE.Material; spin: React.RefObject<THREE.Group | null> }) {
  return (
    <group>
      <mesh material={material}>
        <sphereGeometry args={[0.36, 20, 20]} />
      </mesh>
      <group ref={spin}>
        {[0, 60, 120].map((deg) => (
          <mesh key={deg} material={material} rotation={[Math.PI / 2, 0, (deg * Math.PI) / 180]}>
            <torusGeometry args={[1.7, 0.055, 10, 60]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Database({ material }: { material: THREE.Material }) {
  return (
    <group>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} material={material} position={[0, i * 0.78, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.62, 28]} />
        </mesh>
      ))}
    </group>
  );
}

// --- placement ---

type Placed = {
  id: string;
  kind: ModelKind;
  side: 1 | -1;
  /** Fraction of the visible half-width to sit at — see `frustumX`. */
  k: number;
  z: number;
  /** 0..1 down the page; resolved to a world y once sections are measured. */
  fraction: number;
};

type Card = {
  label: string;
  tint: string;
  side: 1 | -1;
  k: number;
  y: number;
  z: number;
  tilt: number;
  drift: number;
};

/**
 * World x for something that should sit at a given fraction of the way out
 * from the centre of the frame, whatever its depth. Fixed world coordinates
 * do not survive either a depth change (distant objects crowd the vanishing
 * point) or a viewport change (a phone's frustum is a fraction as wide), and
 * both would push these off screen or in front of the text.
 */
function frustumX(camera: THREE.PerspectiveCamera, z: number, side: number, k: number) {
  const distance = Math.max(camera.position.z - z, 0.1);
  const halfWidth = distance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
  return side * k * halfWidth;
}

function buildCards(): Card[] {
  return LANGUAGES.map((lang, i) => ({
    ...lang,
    side: (i % 2 === 0 ? 1 : -1) as 1 | -1,
    // Kept to the outer part of the frame, as clear of the text column as a
    // 1400px content width inside a 1600px viewport allows.
    k: 0.62 + Math.random() * 0.32,
    y: -1 - (i + Math.random()) * (COLUMN_H / LANGUAGES.length),
    // Depth spread is what produces the parallax: the far ones barely move.
    // All well behind the camera plane so none of them loom.
    z: -12 + Math.random() * 9,
    tilt: (Math.random() - 0.5) * 0.5,
    drift: Math.random() * Math.PI * 2,
  }));
}

const _ray = new THREE.Raycaster();

function Exhibit({
  placed,
  worldY,
  palette,
  accent,
  reduced,
  terminalTex,
  pointer,
  hovered,
  onHover,
  spinRef,
}: {
  placed: Placed;
  worldY: number;
  palette: Palette;
  accent: string;
  reduced: boolean;
  terminalTex: THREE.Texture;
  pointer: React.RefObject<THREE.Vector2>;
  hovered: boolean;
  onHover: (id: string | null) => void;
  spinRef: React.RefObject<Record<string, number>>;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const focusRef = useRef(0);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(palette.solid),
        roughness: 0.44,
        metalness: 0.15,
      }),
    [palette]
  );
  useEffect(() => () => material.dispose(), [material]);

  const litColor = useMemo(() => new THREE.Color(palette.solidLit), [palette]);
  const baseColor = useMemo(() => new THREE.Color(palette.solid), [palette]);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame(({ camera, clock }, delta) => {
    const g = group.current;
    if (!g) return;

    g.position.x = frustumX(camera as THREE.PerspectiveCamera, placed.z, placed.side, placed.k);

    // How centred this model is in the viewport — drives the scrollytelling
    // beat, where whatever section you are reading is the thing lit up.
    const focus = THREE.MathUtils.clamp(1 - Math.abs(worldY - camera.position.y) / FOCUS_RANGE, 0, 1);
    const eased = focus * focus * (3 - 2 * focus);
    focusRef.current = reduced ? eased : THREE.MathUtils.lerp(focusRef.current, eased, 0.08);
    const f = focusRef.current;

    const boost = hovered ? 1 : 0;
    g.scale.setScalar(0.46 + f * 0.32 + boost * 0.08);
    g.visible = f > 0.004 || hovered;

    // A hint of the site accent as a model comes into focus, so the layer
    // belongs to whatever colour the visitor picked rather than sitting
    // apart from it. Hover pushes it much further.
    material.color.copy(baseColor).lerp(litColor, f).lerp(accentColor, f * 0.16);
    if (hovered) material.color.lerp(accentColor, 0.4);

    const spin = spinRef.current?.[placed.id] ?? 0;
    if (inner.current) {
      const idle = reduced ? 0 : Math.sin(clock.elapsedTime * 0.35 + placed.fraction * 9) * 0.22;
      // Turn toward the cursor a little when it is near, so the models feel
      // aware of the pointer rather than merely decorative.
      const lean = hovered ? (pointer.current?.x ?? 0) * 0.5 : 0;
      const yTarget = idle + lean + spin;
      const xTarget = hovered ? -(pointer.current?.y ?? 0) * 0.35 : 0;
      inner.current.rotation.y = reduced
        ? yTarget
        : THREE.MathUtils.lerp(inner.current.rotation.y, yTarget, 0.07);
      inner.current.rotation.x = reduced
        ? xTarget
        : THREE.MathUtils.lerp(inner.current.rotation.x, xTarget, 0.07);
    }
    if (rings.current && !reduced) rings.current.rotation.z += delta * 0.35;

    // Bleed off any click spin so it settles back to rest.
    if (spinRef.current && spin !== 0) {
      const next = THREE.MathUtils.lerp(spin, 0, 0.035);
      spinRef.current[placed.id] = Math.abs(next) < 0.002 ? 0 : next;
    }
  });

  const model = (() => {
    switch (placed.kind) {
      case "brackets":
        return <Brackets material={material} />;
      case "terminal":
        return <Terminal material={material} texture={terminalTex} />;
      case "bars":
        return <Bars material={material} />;
      case "gitgraph":
        return <GitGraph material={material} />;
      case "atom":
        return <Atom material={material} spin={rings} />;
      case "database":
        return <Database material={material} />;
    }
  })();

  return (
    <group
      ref={group}
      position={[0, worldY, placed.z]}
      onPointerOver={() => onHover(placed.id)}
      onPointerOut={() => onHover(null)}
    >
      <group ref={inner}>{model}</group>
    </group>
  );
}

function Cards({ cards, palette, reduced }: { cards: Card[]; palette: Palette; reduced: boolean }) {
  const textures = useMemo(
    () => cards.map((c) => makeCardTexture(c.label, c.tint, palette)),
    [cards, palette]
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock, camera }) => {
    const cam = camera as THREE.PerspectiveCamera;
    cards.forEach((c, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.x = frustumX(cam, c.z, c.side, c.k);
      m.rotation.y = reduced ? c.tilt : c.tilt + Math.sin(clock.elapsedTime * 0.25 + c.drift) * 0.25;
      // Cull by distance so far-off cards cost nothing.
      m.visible = Math.abs(c.y - camera.position.y) < 16;
    });
  });

  return (
    <>
      {cards.map((c, i) => (
        <mesh
          key={c.label}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0, c.y, c.z]}
          renderOrder={-1}
        >
          <planeGeometry args={[1.35, 0.84]} />
          {/* Blended, with the translucency baked into the texture; a low
              alphaTest still discards the corners outright. depthWrite off
              plus renderOrder -1 keeps these behind the solid models. */}
          <meshBasicMaterial
            map={textures[i]}
            transparent
            alphaTest={0.04}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

function Rig({
  theme,
  accent,
  reduced,
  offsets,
  cards,
  placed,
  pointer,
  spinRef,
}: {
  theme: ThemeMode;
  accent: string;
  reduced: boolean;
  offsets: Record<string, number>;
  cards: Card[];
  placed: Placed[];
  pointer: React.RefObject<THREE.Vector2>;
  spinRef: React.RefObject<Record<string, number>>;
}) {
  const palette = PALETTES[theme];
  const [hovered, setHovered] = useState<string | null>(null);
  const terminalTex = useMemo(() => makeTerminalTexture(palette), [palette]);
  useEffect(() => () => terminalTex.dispose(), [terminalTex]);

  // camera/scene come from the frame callback's argument rather than
  // useThree(): they are mutated every frame, which is exactly what a value
  // returned from a hook is not allowed to be.
  useFrame(({ camera, scene }) => {
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const progress = THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1);
    const targetY = -progress * COLUMN_H;
    // Snapped rather than eased under reduced motion: a lerp only ever
    // approaches its target, so it would keep creeping and the layer would
    // never actually hold still.
    camera.position.y = reduced ? targetY : THREE.MathUtils.lerp(camera.position.y, targetY, 0.12);
    // A touch of lateral drift with the cursor, which reads as depth.
    camera.position.x = reduced
      ? 0
      : THREE.MathUtils.lerp(camera.position.x, (pointer.current?.x ?? 0) * 0.7, 0.05);
    camera.lookAt(camera.position.x * 0.4, camera.position.y, 0);

    // The canvas takes no pointer events (it must never eat a click or a
    // scroll), so hover is resolved by raycasting from the window pointer.
    if (pointer.current) {
      _ray.setFromCamera(pointer.current, camera);
      const hits = _ray.intersectObjects(scene.children, true);
      let found: string | null = null;
      for (const hit of hits) {
        let o: THREE.Object3D | null = hit.object;
        while (o && !o.userData.exhibitId) o = o.parent;
        if (o?.userData.exhibitId) {
          found = o.userData.exhibitId as string;
          break;
        }
      }
      if (found !== hovered) setHovered(found);
    }
  });

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.55 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={theme === "dark" ? 1.1 : 1.5} />
      <pointLight position={[-6, 0, 6]} color={accent} intensity={theme === "dark" ? 1.4 : 0.8} distance={26} />

      <Cards cards={cards} palette={palette} reduced={reduced} />

      {placed.map((p) => (
        <group key={p.id} userData={{ exhibitId: p.id }}>
          <Exhibit
            placed={p}
            worldY={-(offsets[p.id] ?? p.fraction) * COLUMN_H}
            palette={palette}
            accent={accent}
            reduced={reduced}
            terminalTex={terminalTex}
            pointer={pointer}
            hovered={hovered === p.id}
            onHover={() => {}}
            spinRef={spinRef}
          />
        </group>
      ))}
    </>
  );
}

export function ScrollScene({ theme, accent }: { theme: ThemeMode; accent: string }) {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;
  const pointer = useRef(new THREE.Vector2(0, 0));
  const spinRef = useRef<Record<string, number>>({});
  const [active, setActive] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const cards = useMemo(() => buildCards(), []);
  const placed = useMemo<Placed[]>(
    () =>
      MODELS.map((m, i) => ({
        id: m.id,
        kind: m.kind,
        side: m.side,
        // Out toward the margin and set back, so they read as depth behind
        // the page rather than as objects competing with it.
        k: 0.58,
        z: -3.2 - (i % 3) * 1.1,
        fraction: (i + 0.7) / MODELS.length,
      })),
    []
  );

  // Pin each model to where its section actually sits in the document, so a
  // tall section like Impact holds its model for as long as it is on screen.
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
    // Deferred to a frame rather than run inline: this reads layout and then
    // sets state, which inside an effect body is a cascading render.
    const raf = requestAnimationFrame(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // Sections settle after fonts and images land; one late pass catches that.
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
    // The hero paints an opaque background over this layer, so there is no
    // point rendering until the page has scrolled clear of it.
    const onScroll = () => {
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
          cards={cards}
          placed={placed}
          pointer={pointer}
          spinRef={spinRef}
        />
      </Canvas>
    </div>
  );
}
