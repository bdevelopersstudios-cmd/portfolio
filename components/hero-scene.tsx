"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

const CODE_PALETTE = ["#5ec8ff", "#ff6ec7", "#ffd166", "#7dffb3", "#b39bff"];

const CHASSIS: Record<ThemeMode, { deck: string; key: string; trackpad: string }> = {
  dark: { deck: "#333d4c", key: "#232b37", trackpad: "#2a3340" },
  light: { deck: "#e7eaf0", key: "#f7f8fa", trackpad: "#dde1e8" },
};

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

type Voxel = { position: THREE.Vector3; scale: number; color: THREE.Color };

function VoxelMesh({ voxels }: { voxels: Voxel[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    voxels.forEach((v, i) => {
      m.makeScale(v.scale, v.scale, v.scale);
      m.setPosition(v.position);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, v.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [voxels]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, voxels.length]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* Unlit on purpose: color already carries all the shading, and
          skipping per-pixel lighting matters once this canvas is full-bleed. */}
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// --- laptop shape (stable across theme toggles — only color depends on theme) ---

const BASE_WIDTH = 2.7;
const BASE_DEPTH = 1.5;
const BASE_THICKNESS = 0.14;
const BASE_CENTER = new THREE.Vector3(0, -0.25, 0.4);
const SCREEN_TILT = -0.22;
const SCREEN_HEIGHT = 1.65;
const HINGE = new THREE.Vector3(0, BASE_CENTER.y + BASE_THICKNESS / 2, BASE_CENTER.z - BASE_DEPTH / 2);

type RoleVoxel = { position: THREE.Vector3; scale: number; role: string };

function buildLaptopShape(pitch: number): RoleVoxel[] {
  const voxels: RoleVoxel[] = [];

  // Deck: only the outer shell (top face + side walls) is ever visible from
  // outside a solid block, so interior/bottom cells are skipped entirely —
  // keeps this a solid-looking slab without paying for hidden instances.
  const nx = Math.max(2, Math.round(BASE_WIDTH / pitch));
  const nz = Math.max(2, Math.round(BASE_DEPTH / pitch));
  const ny = Math.max(1, Math.round(BASE_THICKNESS / pitch));

  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      const boundary = ix === 0 || ix === nx - 1 || iz === 0 || iz === nz - 1;
      for (let iy = 0; iy < ny; iy++) {
        const top = iy === ny - 1;
        if (!top && !boundary) continue;
        if (top && boundary && Math.random() > 0.85) continue;
        const lx = (ix / (nx - 1) - 0.5) * BASE_WIDTH;
        const lz = (iz / (nz - 1) - 0.5) * BASE_DEPTH;
        const ly = ny > 1 ? (iy / (ny - 1) - 0.5) * BASE_THICKNESS : 0;
        voxels.push({
          position: new THREE.Vector3(BASE_CENTER.x + lx, BASE_CENTER.y + ly, BASE_CENTER.z + lz),
          scale: pitch * (0.88 + Math.random() * 0.16),
          role: "deck",
        });
      }
    }
  }

  // Keyboard: a proper full grid (not sparse confetti) with a handful of
  // backlit accent keys scattered through it.
  const keyCols = 13;
  const keyRows = 4;
  for (let r = 0; r < keyRows; r++) {
    for (let c = 0; c < keyCols; c++) {
      if (Math.random() > 0.94) continue;
      const lx = (c / (keyCols - 1) - 0.5) * BASE_WIDTH * 0.82;
      const lz = (r / (keyRows - 1) - 0.5) * BASE_DEPTH * 0.5 - BASE_DEPTH * 0.08;
      const accentKey = Math.random() < 0.16;
      voxels.push({
        position: new THREE.Vector3(BASE_CENTER.x + lx, BASE_CENTER.y + BASE_THICKNESS * 0.55, BASE_CENTER.z + lz),
        scale: pitch * 0.85,
        role: accentKey ? `keyAccent:${(r + c) % CODE_PALETTE.length}` : "key",
      });
    }
  }

  // Trackpad
  const padCols = 5;
  const padRows = 3;
  for (let r = 0; r < padRows; r++) {
    for (let c = 0; c < padCols; c++) {
      const lx = (c / (padCols - 1) - 0.5) * BASE_WIDTH * 0.22;
      const lz = (r / (padRows - 1) - 0.5) * BASE_DEPTH * 0.16 + BASE_DEPTH * 0.32;
      voxels.push({
        position: new THREE.Vector3(BASE_CENTER.x + lx, BASE_CENTER.y + BASE_THICKNESS * 0.55, BASE_CENTER.z + lz),
        scale: pitch * 0.85,
        role: "trackpad",
      });
    }
  }

  return voxels;
}

function roleColor(role: string, theme: ThemeMode): THREE.Color {
  const c = CHASSIS[theme];
  if (role === "trackpad") return new THREE.Color(c.trackpad);
  if (role === "key") return new THREE.Color(c.key);
  if (role.startsWith("keyAccent:")) {
    const idx = Number(role.split(":")[1]);
    return new THREE.Color(CODE_PALETTE[idx % CODE_PALETTE.length]);
  }
  return new THREE.Color(c.deck);
}

function buildGroundVoxels(pitch: number) {
  const voxels: Voxel[] = [];
  const size = 11;
  const n = Math.round(size / pitch);
  const base = new THREE.Color("#071824");
  const rim = new THREE.Color("#123a4d");

  for (let ix = 0; ix < n; ix++) {
    for (let iz = 0; iz < n; iz++) {
      // Skip most cells — keeps total instances (and therefore GPU cost) in
      // check while still reading as a dense, dune-like field.
      if (Math.random() > 0.18) continue;
      const x = (ix / (n - 1) - 0.5) * size;
      const z = (iz / (n - 1) - 0.5) * size * 0.6 + 1.6;
      const dist = Math.sqrt(x * x + z * z);
      if (dist > size * 0.5) continue;
      const y = -1.35 + Math.sin(x * 1.3) * 0.05 + Math.cos(z * 1.1) * 0.05;
      const fade = THREE.MathUtils.clamp(1 - dist / (size * 0.5), 0, 1);
      const sparkle = Math.random() < 0.02;
      voxels.push({
        position: new THREE.Vector3(x, y, z),
        scale: pitch * (0.7 + Math.random() * 0.5),
        color: sparkle
          ? new THREE.Color(CODE_PALETTE[Math.floor(Math.random() * CODE_PALETTE.length)])
          : base.clone().lerp(rim, fade),
      });
    }
  }
  return voxels;
}

// --- laptop screen: a real rendered code editor, not abstract color bars ---

type EditorPalette = {
  bg: string;
  bezel: string;
  chrome: string;
  lineNumber: string;
  text: string;
  keyword: string;
  string: string;
  comment: string;
  func: string;
};

const DARK_EDITOR: EditorPalette = {
  bg: "#0b1220",
  bezel: "#05080d",
  chrome: "#141d2b",
  lineNumber: "#3a4658",
  text: "#d6deeb",
  keyword: "#c792ea",
  string: "#addb67",
  comment: "#5b6b7c",
  func: "#82aaff",
};

const LIGHT_EDITOR: EditorPalette = {
  bg: "#fafbfc",
  bezel: "#c9cdd6",
  chrome: "#eef0f3",
  lineNumber: "#c7ccd4",
  text: "#3b4252",
  keyword: "#a626a4",
  string: "#50a14f",
  comment: "#a0a1a7",
  func: "#4078f2",
};

type Token = { text: string; type: keyof EditorPalette };
const CODE_LINES: { indent: number; tokens: Token[] }[] = [
  {
    indent: 0,
    tokens: [
      { text: "export ", type: "keyword" },
      { text: "function ", type: "keyword" },
      { text: "buildPortfolio", type: "func" },
      { text: "(dev) {", type: "text" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "const ", type: "keyword" },
      { text: "stack ", type: "text" },
      { text: "= [", type: "text" },
      { text: "'react'", type: "string" },
      { text: ", ", type: "text" },
      { text: "'node'", type: "string" },
      { text: "];", type: "text" },
    ],
  },
  { indent: 1, tokens: [{ text: "// ship it end to end", type: "comment" }] },
  {
    indent: 1,
    tokens: [
      { text: "if ", type: "keyword" },
      { text: "(dev.", type: "text" },
      { text: "ships", type: "func" },
      { text: ") {", type: "text" },
    ],
  },
  {
    indent: 2,
    tokens: [
      { text: "return ", type: "keyword" },
      { text: "dev.", type: "text" },
      { text: "hire", type: "func" },
      { text: "();", type: "text" },
    ],
  },
  { indent: 1, tokens: [{ text: "}", type: "text" }] },
  { indent: 0, tokens: [{ text: "}", type: "text" }] },
];

function drawEditorTexture(canvas: HTMLCanvasElement, palette: EditorPalette, accent: string, cursorOn: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = palette.bezel;
  ctx.fillRect(0, 0, w, h);

  const inset = w * 0.018;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(inset, inset, w - inset * 2, h - inset * 2);

  const barH = h * 0.1;
  ctx.fillStyle = palette.chrome;
  ctx.fillRect(inset, inset, w - inset * 2, barH);

  const dotR = barH * 0.16;
  const dotColors = ["#ff5f56", "#ffbd2e", "#27c93f"];
  dotColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(inset + barH * 0.55 + i * dotR * 2.8, inset + barH * 0.5, dotR, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = palette.lineNumber;
  ctx.font = `${barH * 0.32}px "Courier New", monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("index.ts", inset + barH * 0.55 + dotColors.length * dotR * 2.8, inset + barH * 0.5);

  const fontSize = h * 0.058;
  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.textBaseline = "top";
  const lineHeight = fontSize * 1.7;
  const padX = inset + w * 0.045;
  const padTop = inset + barH + lineHeight * 0.6;
  const lineNumW = w * 0.055;

  let lastX = padX + lineNumW;
  let lastY = padTop;

  CODE_LINES.forEach((line, i) => {
    const y = padTop + i * lineHeight;
    ctx.fillStyle = palette.lineNumber;
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), padX + lineNumW - fontSize * 0.5, y);
    ctx.textAlign = "left";

    let x = padX + lineNumW + line.indent * fontSize * 1.5;
    line.tokens.forEach((tok) => {
      ctx.fillStyle = palette[tok.type];
      ctx.fillText(tok.text, x, y);
      x += ctx.measureText(tok.text).width;
    });
    lastX = x;
    lastY = y;
  });

  if (cursorOn) {
    ctx.fillStyle = accent;
    ctx.fillRect(lastX + fontSize * 0.15, lastY, fontSize * 0.5, fontSize * 1.2);
  }
}

function ScreenDisplay({
  theme,
  accent,
}: {
  theme: ThemeMode;
  accent: string;
}) {
  // The canvas/texture are a pure imperative side-channel: created once
  // inside an effect (never read during render) and repainted in place via
  // `needsUpdate`. The material itself is reached through a JSX ref rather
  // than a prop, since assigning `.map` is also a mutation, not a render value.
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const paintRef = useRef<{ canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } | null>(null);
  const cursorOn = useRef(true);

  const redraw = useCallback(() => {
    const paint = paintRef.current;
    if (!paint) return;
    drawEditorTexture(paint.canvas, theme === "dark" ? DARK_EDITOR : LIGHT_EDITOR, accent, cursorOn.current);
    paint.texture.needsUpdate = true;
  }, [theme, accent]);

  useEffect(() => {
    if (!paintRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 620;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      paintRef.current = { canvas, texture };
      if (materialRef.current) {
        materialRef.current.map = texture;
        materialRef.current.needsUpdate = true;
      }
    }
    redraw();
    // Cheap: redraws a small offscreen canvas twice a second, not per-frame.
    const id = setInterval(() => {
      cursorOn.current = !cursorOn.current;
      redraw();
    }, 530);
    return () => clearInterval(id);
  }, [redraw]);

  useEffect(() => {
    return () => paintRef.current?.texture.dispose();
  }, []);

  const cos = Math.cos(SCREEN_TILT);
  const sin = Math.sin(SCREEN_TILT);
  const half = SCREEN_HEIGHT / 2;
  const position: [number, number, number] = [HINGE.x, HINGE.y + half * cos, HINGE.z + half * sin];
  const bezel = CHASSIS[theme].deck;

  return (
    <mesh position={position} rotation={[SCREEN_TILT, 0, 0]}>
      {/* A thin box, not a flat plane, so the lid has real edges; the code
          texture only goes on the front (+z) face — box materials are
          ordered [+x,-x,+y,-y,+z,-z], so index 4 is the face that ends up
          pointed at the camera once tilted. */}
      <boxGeometry args={[BASE_WIDTH * 0.97, SCREEN_HEIGHT * 0.95, 0.05]} />
      <meshBasicMaterial attach="material-0" color={bezel} toneMapped={false} />
      <meshBasicMaterial attach="material-1" color={bezel} toneMapped={false} />
      <meshBasicMaterial attach="material-2" color={bezel} toneMapped={false} />
      <meshBasicMaterial attach="material-3" color={bezel} toneMapped={false} />
      <meshBasicMaterial ref={materialRef} attach="material-4" toneMapped={false} />
      <meshBasicMaterial attach="material-5" color={bezel} toneMapped={false} />
    </mesh>
  );
}

function Laptop({
  theme,
  accent,
  onToggleTheme,
  showHint,
}: {
  theme: ThemeMode;
  accent: string;
  onToggleTheme: () => void;
  showHint: boolean;
}) {
  const shape = useMemo(() => buildLaptopShape(0.055), []);
  // Only colors are re-derived on theme change — positions stay put so the
  // chassis doesn't visibly reshuffle every time you click it.
  const voxels = useMemo(
    () => shape.map((s) => ({ position: s.position, scale: s.scale, color: roleColor(s.role, theme) })),
    [shape, theme]
  );
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.08;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onToggleTheme();
  };

  return (
    <group
      ref={group}
      scale={1.15}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoverCursor(true);
      }}
      onPointerOut={() => setHoverCursor(false)}
    >
      <VoxelMesh voxels={voxels} />
      <ScreenDisplay theme={theme} accent={accent} />
      {showHint && (
        <Html position={[0, 0.7, 0.3]} center transform={false} zIndexRange={[10, 0]}>
          <div className="laptop-hint pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/30 bg-[#0d1a24] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#8fe3ff] shadow-lg">
            👆 It&apos;s interactive
          </div>
        </Html>
      )}
    </group>
  );
}

function Spark({ accent, onCycleAccent }: { accent: string; onCycleAccent: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * 0.6;
      ref.current.position.set(Math.cos(t) * 2.3, 0.6 + Math.sin(t * 1.4) * 0.3, Math.sin(t) * 2.3);
    }
    if (matRef.current) {
      matRef.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.4;
    }
  });

  return (
    <group ref={ref}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onCycleAccent();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoverCursor(true);
        }}
        onPointerOut={() => setHoverCursor(false)}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial ref={matRef} color={accent} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ground() {
  const voxels = useMemo(() => buildGroundVoxels(0.2), []);
  return <VoxelMesh voxels={voxels} />;
}

function Scene({
  theme,
  accent,
  showHint,
  onToggleTheme,
  onCycleAccent,
}: {
  theme: ThemeMode;
  accent: string;
  showHint: boolean;
  onToggleTheme: () => void;
  onCycleAccent: () => void;
}) {
  const parallax = useRef<THREE.Group>(null);

  // A bounded sway (not an unbounded spin) so the laptop never turns far
  // enough to show the screen edge-on, and reads as a product shot rather
  // than a rotisserie.
  useFrame(({ pointer, clock }) => {
    if (parallax.current) {
      const sway = Math.sin(clock.elapsedTime * 0.15) * 0.18;
      const target = sway + pointer.x * 0.2;
      parallax.current.rotation.y = THREE.MathUtils.lerp(parallax.current.rotation.y, target, 0.04);
    }
  });

  return (
    <>
      <color attach="background" args={["#081420"]} />
      <fog attach="fog" args={["#081420", 5, 14]} />
      <Sparkles count={50} scale={10} size={1.4} speed={0.15} opacity={0.5} color="#bfe9ff" />
      <group ref={parallax} position={[2.2, 0, 0]}>
        <Laptop theme={theme} accent={accent} onToggleTheme={onToggleTheme} showHint={showHint} />
        <Spark accent={accent} onCycleAccent={onCycleAccent} />
      </group>
      <Ground />
    </>
  );
}

function Controls() {
  // Desktop-only (see HeroScene) — drag-to-orbit. autoRotate is handled by
  // Scene's own useFrame instead, since OrbitControls attaches touch
  // listeners that block page-scroll swipes purely by existing, regardless
  // of its enabled/enableRotate props.
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate
      rotateSpeed={0.4}
      minPolarAngle={Math.PI / 2 - 0.3}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
}

export function HeroScene({
  theme,
  accent,
  showHint,
  onToggleTheme,
  onCycleAccent,
}: {
  theme: ThemeMode;
  accent: string;
  accent2: string;
  showHint: boolean;
  onToggleTheme: () => void;
  onCycleAccent: () => void;
}) {
  // OrbitControls attaches touch listeners that block a page-scroll swipe
  // starting on the canvas simply by being mounted — its enabled/enableRotate
  // props don't stop this. So on touch devices it isn't rendered at all;
  // Scene's own useFrame drives the idle rotation instead either way. This
  // component is dynamically imported with ssr:false, so it only ever
  // renders in the browser — matchMedia is safe to read directly here.
  const [isTouch] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  return (
    <Canvas
      camera={{ position: [0, 0.35, 6.4], fov: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.4]}
    >
      <Suspense fallback={null}>
        <Scene theme={theme} accent={accent} showHint={showHint} onToggleTheme={onToggleTheme} onCycleAccent={onCycleAccent} />
      </Suspense>
      {!isTouch && <Controls />}
    </Canvas>
  );
}
