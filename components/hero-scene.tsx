"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

/**
 * Guards the scene's click handlers against orbit drags. The browser fires a
 * `click` whenever pointerdown and pointerup land on the same element, so
 * dragging to rotate the laptop would otherwise also "click" it. Returns a
 * predicate that reports whether a click stayed close enough to its press to
 * count as a tap rather than a rotate.
 */
function useWasTap() {
  const down = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      down.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, []);

  return useCallback((e: ThreeEvent<MouseEvent>) => {
    const start = down.current;
    if (!start) return true;
    return Math.hypot(e.nativeEvent.clientX - start.x, e.nativeEvent.clientY - start.y) <= 6;
  }, []);
}

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

// --- real laptop proportions (a 16:10 machine, roughly MacBook-shaped) ---

const BASE_W = 3.0;
const BASE_D = 2.05;
const BASE_H = 0.11;
const LID_W = 3.0;
const LID_H = 1.92;
const LID_T = 0.07;
/** Radians back from vertical — a real screen opens to ~105°, not straight up. */
const LID_TILT = -0.3;

const BASE_TOP = BASE_H / 2;
const KEY_AREA_W = 2.62;
const KEY_AREA_D = 0.92;
const KEY_AREA_Z = -0.42;
const TRACKPAD_Z = 0.6;

type Chassis = {
  shell: string;
  shellDark: string;
  well: string;
  key: string;
  keyTop: string;
  trackpad: string;
  bezel: string;
  env: string;
  shadow: string;
  shadowOpacity: number;
};

// Silver anodized aluminium vs. space-black — the two finishes a real
// machine actually ships in, rather than a recolor of the same slab.
const CHASSIS: Record<ThemeMode, Chassis> = {
  light: {
    shell: "#cdd1d7",
    shellDark: "#a9aeb6",
    well: "#b6bbc2",
    key: "#2a2d33",
    keyTop: "#34383f",
    trackpad: "#d3d7dc",
    bezel: "#17191d",
    env: "#eef1f6",
    shadow: "#2b3348",
    shadowOpacity: 0.3,
  },
  dark: {
    shell: "#3c414a",
    shellDark: "#23272e",
    well: "#22262c",
    key: "#121418",
    keyTop: "#191c21",
    trackpad: "#363b43",
    bezel: "#0b0d10",
    env: "#141821",
    shadow: "#000000",
    shadowOpacity: 0.5,
  },
};

// --- the screen: a real rendered code editor, painted to a canvas texture ---

type EditorPalette = {
  bg: string;
  chrome: string;
  chromeText: string;
  lineNumber: string;
  text: string;
  keyword: string;
  string: string;
  comment: string;
  func: string;
};

const DARK_EDITOR: EditorPalette = {
  bg: "#0b1220",
  chrome: "#151d2b",
  chromeText: "#5b6b7c",
  lineNumber: "#3a4658",
  text: "#d6deeb",
  keyword: "#c792ea",
  string: "#addb67",
  comment: "#5b6b7c",
  func: "#82aaff",
};

const LIGHT_EDITOR: EditorPalette = {
  bg: "#fbfcfd",
  chrome: "#eceef2",
  chromeText: "#9aa0ab",
  lineNumber: "#c3c8d1",
  text: "#39404d",
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

function drawEditorTexture(
  canvas: HTMLCanvasElement,
  palette: EditorPalette,
  accent: string,
  cursorOn: boolean
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  const barH = h * 0.088;
  ctx.fillStyle = palette.chrome;
  ctx.fillRect(0, 0, w, barH);

  const dotR = barH * 0.17;
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(barH * 0.62 + i * dotR * 3, barH * 0.5, dotR, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = palette.chromeText;
  ctx.font = `${barH * 0.36}px "Courier New", monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("index.ts", w / 2, barH * 0.52);

  const fontSize = h * 0.062;
  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const lineHeight = fontSize * 1.72;
  const padX = w * 0.035;
  const padTop = barH + lineHeight * 0.55;
  const lineNumW = w * 0.045;

  let lastX = padX + lineNumW;
  let lastY = padTop;

  CODE_LINES.forEach((line, i) => {
    const y = padTop + i * lineHeight;
    ctx.fillStyle = palette.lineNumber;
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), padX + lineNumW - fontSize * 0.45, y);
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
    ctx.fillRect(lastX + fontSize * 0.14, lastY, fontSize * 0.48, fontSize * 1.15);
  }
}

const DISPLAY_W = LID_W - 0.15;
const DISPLAY_H = LID_H - 0.2;

function ScreenDisplay({ theme, accent }: { theme: ThemeMode; accent: string }) {
  // The canvas/texture are a pure imperative side-channel: created inside an
  // effect (never read during render) and repainted in place via
  // `needsUpdate`. The material is reached through a JSX ref rather than a
  // prop, since assigning `.map` is also a mutation, not a render value.
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
      canvas.height = Math.round((1024 * DISPLAY_H) / DISPLAY_W);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      paintRef.current = { canvas, texture };
      if (materialRef.current) {
        materialRef.current.map = texture;
        materialRef.current.needsUpdate = true;
      }
    }
    redraw();
    // Cheap: repaints a small offscreen canvas twice a second, not per-frame.
    const id = setInterval(() => {
      cursorOn.current = !cursorOn.current;
      redraw();
    }, 530);
    return () => clearInterval(id);
  }, [redraw]);

  useEffect(() => {
    return () => paintRef.current?.texture.dispose();
  }, []);

  return (
    // Unlit: a display emits its own light, so it must not be shaded by the
    // scene lights the way the aluminium around it is.
    <mesh position={[0, LID_H / 2 + 0.015, LID_T / 2 + 0.004]}>
      <planeGeometry args={[DISPLAY_W, DISPLAY_H]} />
      <meshBasicMaterial ref={materialRef} toneMapped={false} />
    </mesh>
  );
}

// --- keyboard ---

type KeySpec = { x: number; z: number; w: number };

function buildKeyLayout(): KeySpec[] {
  const cols = 14;
  const rows = 5;
  const colPitch = KEY_AREA_W / cols;
  const rowPitch = KEY_AREA_D / rows;
  const keys: KeySpec[] = [];

  const centerOf = (startCol: number, span: number) =>
    (startCol + span / 2 - cols / 2) * colPitch;

  for (let r = 0; r < rows; r++) {
    const z = (r - (rows - 1) / 2) * rowPitch;
    if (r === rows - 1) {
      // Bottom row gets a real spacebar and wider modifiers, which is most of
      // what makes a key grid read as a keyboard instead of a waffle.
      const spans = [
        { start: 0, span: 1.6 },
        { start: 1.6, span: 1.4 },
        { start: 3.0, span: 1.4 },
        { start: 4.4, span: 5.2 },
        { start: 9.6, span: 1.4 },
        { start: 11.0, span: 1.5 },
        { start: 12.5, span: 1.5 },
      ];
      spans.forEach((s) => keys.push({ x: centerOf(s.start, s.span), z, w: s.span * colPitch }));
    } else {
      for (let c = 0; c < cols; c++) {
        keys.push({ x: centerOf(c, 1), z, w: colPitch });
      }
    }
  }
  return keys;
}

const KEY_GAP = 0.022;
const KEY_D = KEY_AREA_D / 5 - KEY_GAP;
const KEY_H = 0.03;

function Keyboard({ color }: { color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const keys = useMemo(() => buildKeyLayout(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    keys.forEach((k, i) => {
      pos.set(k.x, BASE_TOP + 0.026, KEY_AREA_Z + k.z);
      scale.set(k.w - KEY_GAP, KEY_H, KEY_D);
      m.compose(pos, q, scale);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    // InstancedMesh.raycast() computes its bounding sphere lazily and caches
    // it. Any raycast landing before this effect runs would cache a
    // degenerate sphere (the matrices start out all-zero) and every later
    // click on the keyboard would silently miss, so recompute it here.
    mesh.computeBoundingSphere();
  }, [keys]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, keys.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.15} />
    </instancedMesh>
  );
}

// --- laptop ---

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
  const c = CHASSIS[theme];
  const group = useRef<THREE.Group>(null);
  const wasTap = useWasTap();

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.045;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!wasTap(e)) return;
    onToggleTheme();
  };

  return (
    <group
      ref={group}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoverCursor(true);
      }}
      onPointerOut={() => setHoverCursor(false)}
    >
      {/* Base */}
      <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.035} smoothness={4}>
        <meshStandardMaterial color={c.shell} roughness={0.36} metalness={0.72} />
      </RoundedBox>

      {/* Keyboard well — a recessed darker plate the keys sit inside */}
      <RoundedBox
        args={[KEY_AREA_W + 0.1, 0.022, KEY_AREA_D + 0.1]}
        radius={0.008}
        smoothness={3}
        position={[0, BASE_TOP, KEY_AREA_Z]}
      >
        <meshStandardMaterial color={c.well} roughness={0.7} metalness={0.3} />
      </RoundedBox>

      {/* Backlight bleeding up through the gaps between keycaps */}
      <mesh position={[0, BASE_TOP + 0.013, KEY_AREA_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KEY_AREA_W + 0.05, KEY_AREA_D + 0.05]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <Keyboard color={c.key} />

      {/* Trackpad */}
      <RoundedBox
        args={[1.02, 0.014, 0.66]}
        radius={0.012}
        smoothness={3}
        position={[0, BASE_TOP + 0.002, TRACKPAD_Z]}
      >
        <meshStandardMaterial color={c.trackpad} roughness={0.28} metalness={0.5} />
      </RoundedBox>

      {/* Hinge */}
      <mesh position={[0, BASE_TOP - 0.01, -BASE_D / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, BASE_W * 0.62, 16]} />
        <meshStandardMaterial color={c.shellDark} roughness={0.45} metalness={0.8} />
      </mesh>

      {/* Lid — pivots at the hinge line so it opens like a real one */}
      <group position={[0, BASE_TOP, -BASE_D / 2 + LID_T / 2]} rotation={[LID_TILT, 0, 0]}>
        <RoundedBox args={[LID_W, LID_H, LID_T]} radius={0.03} smoothness={4} position={[0, LID_H / 2, 0]}>
          <meshStandardMaterial color={c.shell} roughness={0.36} metalness={0.72} />
        </RoundedBox>
        {/* Black bezel inset, so the display isn't sitting straight on metal */}
        <mesh position={[0, LID_H / 2 + 0.015, LID_T / 2 + 0.002]}>
          <planeGeometry args={[DISPLAY_W + 0.04, DISPLAY_H + 0.04]} />
          <meshBasicMaterial color={c.bezel} toneMapped={false} />
        </mesh>
        <ScreenDisplay theme={theme} accent={accent} />
        {/* Spill from the panel onto the keyboard below it */}
        <pointLight
          position={[0, LID_H / 2, 0.5]}
          color={theme === "dark" ? "#7fb4ff" : "#ffffff"}
          intensity={theme === "dark" ? 1.6 : 0.9}
          distance={4}
          decay={2}
        />
      </group>

      {showHint && (
        <Html position={[0, 2.15, 0]} center transform={false} zIndexRange={[10, 0]}>
          <div className="laptop-hint pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-[#11151d]/95 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white shadow-lg">
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
  const wasTap = useWasTap();

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * 0.5;
      ref.current.position.set(Math.cos(t) * 2.5, 1.15 + Math.sin(t * 1.4) * 0.35, Math.sin(t) * 2.5);
    }
    if (matRef.current) {
      matRef.current.opacity = 0.65 + Math.sin(clock.elapsedTime * 3) * 0.35;
    }
  });

  return (
    <group ref={ref}>
      {/* Oversized invisible hit target — the visible orb is far too small to click. */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (!wasTap(e)) return;
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
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshBasicMaterial ref={matRef} color={accent} transparent toneMapped={false} />
      </mesh>
      <pointLight color={accent} intensity={1.2} distance={2.5} decay={2} />
    </group>
  );
}

function ContactShadow({ color, opacity }: { color: string; opacity: number }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.45, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -BASE_H / 2 - 0.01, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[BASE_W * 1.5, BASE_D * 1.5]} />
      <meshBasicMaterial map={texture} color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
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
  const rig = useRef<THREE.Group>(null);
  const { size } = useThree();
  const c = CHASSIS[theme];

  // Narrow viewports can't fit the machine beside the copy, so it drops
  // behind and below it instead of running off the right edge.
  // Below the layout's `lg` breakpoint there isn't room to sit the machine
  // beside the copy, so it drops to the bottom of the frame and the copy
  // stacks above it. Keep this threshold in step with hero.tsx.
  const narrow = size.width < 1024;
  const rigPosition: [number, number, number] = narrow ? [0, -2.9, -0.4] : [1.85, -0.7, 0];
  const rigScale = narrow ? THREE.MathUtils.clamp(size.width / 900, 0.5, 0.72) : 0.78;

  // A bounded sway rather than a full spin — the lid has a real front and
  // back now, so a continuous rotation would swing its blank side into view.
  useFrame(({ pointer, clock }) => {
    if (rig.current) {
      const target = -0.34 + Math.sin(clock.elapsedTime * 0.16) * 0.16 + pointer.x * 0.16;
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, target, 0.045);
    }
  });

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.5 : 0.85} />
      <directionalLight position={[3.5, 6, 4]} intensity={theme === "dark" ? 1.5 : 2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={theme === "dark" ? 0.5 : 0.7} color="#9dc4ff" />

      {/* A tiny generated cubemap (never fetched from a CDN) so the metal has
          something to reflect — without it, high metalness renders near-black. */}
      <Environment key={theme} resolution={64}>
        <color attach="background" args={[c.env]} />
        <Lightformer intensity={theme === "dark" ? 1.6 : 2.4} position={[0, 5, -2]} scale={[12, 5, 1]} />
        <Lightformer intensity={1} position={[-5, 1, 2]} scale={[6, 8, 1]} />
        <Lightformer intensity={0.9} position={[5, 2, 1]} scale={[6, 8, 1]} color={accent} />
      </Environment>

      <group ref={rig} position={rigPosition} scale={rigScale}>
        {/* On phones the copy's own "it's interactive" line sits right where
            this badge would land, so only one of the two is shown. */}
        <Laptop
          theme={theme}
          accent={accent}
          onToggleTheme={onToggleTheme}
          showHint={showHint && !narrow}
        />
        <Spark accent={accent} onCycleAccent={onCycleAccent} />
        <ContactShadow color={c.shadow} opacity={c.shadowOpacity} />
      </group>
    </>
  );
}

function Controls() {
  // Desktop-only (see HeroScene) — drag-to-orbit. The idle sway is handled by
  // Scene's own useFrame instead, since OrbitControls attaches touch
  // listeners that block page-scroll swipes purely by existing, regardless
  // of its enabled/enableRotate props.
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate
      rotateSpeed={0.35}
      minPolarAngle={Math.PI / 2 - 0.45}
      maxPolarAngle={Math.PI / 2 + 0.1}
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
  // props don't stop this. So on touch devices it isn't rendered at all.
  // This component is dynamically imported with ssr:false, so it only ever
  // renders in the browser — matchMedia is safe to read directly here.
  const [isTouch] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  return (
    // Transparent on purpose: the hero's colour comes from the CSS gradient
    // behind the canvas, which is what lets it follow the site theme for free.
    <Canvas
      camera={{ position: [0, 1.45, 5.8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
    >
      <Suspense fallback={null}>
        <Scene
          theme={theme}
          accent={accent}
          showHint={showHint}
          onToggleTheme={onToggleTheme}
          onCycleAccent={onCycleAccent}
        />
      </Suspense>
      {!isTouch && <Controls />}
    </Canvas>
  );
}
