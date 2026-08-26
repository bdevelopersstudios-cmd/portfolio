"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Edges,
  Environment,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

const CODE_LINES: Array<{ indent: number; width: number; color: string }> = [
  { indent: 0, width: 120, color: "#7c93ff" },
  { indent: 24, width: 200, color: "#e2e8f0" },
  { indent: 24, width: 150, color: "#5ec8ff" },
  { indent: 48, width: 170, color: "#e2e8f0" },
  { indent: 48, width: 90, color: "#7c8a9c" },
  { indent: 24, width: 60, color: "#e2e8f0" },
  { indent: 0, width: 140, color: "#7c93ff" },
  { indent: 24, width: 210, color: "#e2e8f0" },
  { indent: 24, width: 130, color: "#5ec8ff" },
  { indent: 24, width: 180, color: "#e2e8f0" },
  { indent: 0, width: 40, color: "#7c8a9c" },
  { indent: 0, width: 100, color: "#7c93ff" },
  { indent: 24, width: 160, color: "#e2e8f0" },
  { indent: 0, width: 20, color: "#7c8a9c" },
];

function useCodeTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0e1420";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let y = 18;
      for (const line of CODE_LINES) {
        ctx.fillStyle = line.color;
        ctx.fillRect(16 + line.indent, y, line.width, 9);
        y += 20;
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

// A single textured plane reads as a far cleaner keyboard than 40+ individual
// keycap meshes — cheaper to render (fixes a real performance/rendering glitch
// on weaker GPUs) and closer to how a product shot actually looks.
function useKeyboardTexture(accent: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1c2028";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rows = 4;
      const cols = 13;
      const pad = 6;
      const gap = 4;
      const cellW = (canvas.width - pad * 2) / cols;
      const cellH = (canvas.height - pad * 2 - 34) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = pad + c * cellW;
          const y = pad + r * cellH;
          const lit = (r + c) % 11 === 0;
          ctx.fillStyle = lit ? accent : "#2c313b";
          ctx.beginPath();
          ctx.roundRect(x + gap / 2, y + gap / 2, cellW - gap, cellH - gap, 3);
          ctx.fill();
        }
      }
      // spacebar
      ctx.fillStyle = "#2c313b";
      ctx.beginPath();
      ctx.roundRect(pad + cellW * 3, pad + rows * cellH + 4, cellW * 6, 24, 4);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [accent]);
}

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

function CaseMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial color={color} roughness={0.25} metalness={0.85} clearcoat={0.8} clearcoatRoughness={0.15} />
  );
}

function Laptop({
  caseColor,
  accent,
  accent2,
  showHint,
  onToggleTheme,
  onCycleAccent,
}: {
  caseColor: string;
  accent: string;
  accent2: string;
  showHint: boolean;
  onToggleTheme: () => void;
  onCycleAccent: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const codeTexture = useCodeTexture();
  const keyboardTexture = useKeyboardTexture(accent);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });

  const clickable = (handler: () => void) => ({
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      handler();
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHoverCursor(true);
    },
    onPointerOut: () => setHoverCursor(false),
  });

  return (
    <group ref={group} rotation={[0.08, -0.32, 0]}>
      {/* base / keyboard deck — click cycles the accent color */}
      <RoundedBox
        args={[2.1, 0.08, 1.3]}
        radius={0.05}
        smoothness={6}
        position={[0, -0.32, 0.15]}
        {...clickable(onCycleAccent)}
      >
        <CaseMaterial color={caseColor} />
        <Edges color={accent2} threshold={20} />
      </RoundedBox>

      {/* keyboard */}
      <mesh position={[0, -0.32 + 0.041, 0.06]} rotation={[-Math.PI / 2, 0, 0]} {...clickable(onCycleAccent)}>
        <planeGeometry args={[1.85, 0.72]} />
        <meshBasicMaterial map={keyboardTexture} toneMapped={false} />
      </mesh>

      {/* trackpad */}
      <RoundedBox
        args={[0.62, 0.01, 0.24]}
        radius={0.02}
        smoothness={3}
        position={[0, -0.32 + 0.05, 0.62]}
        {...clickable(onCycleAccent)}
      >
        <meshPhysicalMaterial color={caseColor} roughness={0.1} metalness={0.6} clearcoat={0.95} />
        <Edges color={accent2} threshold={20} />
      </RoundedBox>

      {/* hinge barrel */}
      <mesh position={[0, -0.29, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 2.02, 20]} />
        <CaseMaterial color={caseColor} />
      </mesh>

      {/* screen, tilted back — click toggles light/dark */}
      <group position={[0, -0.275, -0.5]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[2.1, 1.3, 0.04]} radius={0.05} smoothness={6} position={[0, 0.65, 0]} {...clickable(onToggleTheme)}>
          <CaseMaterial color={caseColor} />
          <Edges color={accent} threshold={20} />
        </RoundedBox>

        {/* webcam notch */}
        <mesh position={[0, 1.22, 0.022]}>
          <circleGeometry args={[0.012, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.3} />
        </mesh>

        {/* lid logo, visible from behind */}
        <mesh position={[0, 0.65, -0.022]} rotation={[0, Math.PI, 0]}>
          <ringGeometry args={[0.05, 0.065, 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
        </mesh>

        <mesh position={[0, 0.65, 0.024]} {...clickable(onToggleTheme)}>
          <planeGeometry args={[1.98, 1.16]} />
          <meshBasicMaterial map={codeTexture} toneMapped={false} />
        </mesh>

        {showHint && (
          <Html position={[0, 1.42, 0.1]} center transform={false} zIndexRange={[10, 0]}>
            <div className="laptop-hint pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-bg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-accent shadow-lg">
              👆 It&apos;s interactive
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function TerminalWindow({ accent, accent2 }: { accent: string; accent2: string }) {
  const bars = useMemo(
    () => [
      { width: 0.55, color: accent2 },
      { width: 0.75, color: "#e2e8f0" },
      { width: 0.4, color: accent },
      { width: 0.62, color: "#e2e8f0" },
    ],
    [accent, accent2]
  );
  const cursorRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (cursorRef.current) {
      const mat = cursorRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(clock.elapsedTime * 4) > 0 ? 1 : 0;
    }
  });

  return (
    <group>
      <RoundedBox args={[1.15, 0.85, 0.04]} radius={0.05} smoothness={6}>
        <meshPhysicalMaterial color="#171d28" roughness={0.35} metalness={0.5} clearcoat={0.8} />
        <Edges color={accent} threshold={20} />
      </RoundedBox>

      {[-0.35, -0.22, -0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0.03]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color={[accent2, "#e2e8f0", accent][i]} />
        </mesh>
      ))}

      {bars.map((b, i) => (
        <mesh key={i} position={[-0.5 + b.width / 2, 0.12 - i * 0.14, 0.03]}>
          <planeGeometry args={[b.width, 0.05]} />
          <meshBasicMaterial color={b.color} />
        </mesh>
      ))}

      <mesh ref={cursorRef} position={[-0.5 + bars[3].width + 0.05, 0.12 - 3 * 0.14, 0.03]}>
        <planeGeometry args={[0.05, 0.06]} />
        <meshBasicMaterial color={accent} transparent opacity={1} />
      </mesh>
    </group>
  );
}

function bracketArm(angle: number, length: number, thickness: number) {
  return {
    position: [(Math.cos(angle) * length) / 2, (Math.sin(angle) * length) / 2, 0] as [
      number,
      number,
      number,
    ],
    rotation: [0, 0, angle] as [number, number, number],
    args: [length, thickness, thickness] as [number, number, number],
  };
}

function BracketMaterial({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.2} clearcoat={1} clearcoatRoughness={0.1} />;
}

function CodeBrackets({ accent, accent2 }: { accent: string; accent2: string }) {
  const angle = Math.PI / 6;
  const armLength = 0.5;
  const thickness = 0.08;
  const upper = bracketArm(angle, armLength, thickness);
  const lower = bracketArm(-angle, armLength, thickness);

  return (
    <group>
      <group position={[-0.55, 0, 0]}>
        <RoundedBox args={upper.args} radius={0.03} smoothness={3} position={upper.position} rotation={upper.rotation}>
          <BracketMaterial color={accent} />
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.03} smoothness={3} position={lower.position} rotation={lower.rotation}>
          <BracketMaterial color={accent} />
        </RoundedBox>
      </group>
      <RoundedBox
        args={[0.62, thickness * 0.85, thickness * 0.85]}
        radius={0.025}
        smoothness={3}
        rotation={[0, 0, Math.PI / 2.6]}
      >
        <BracketMaterial color={accent2} />
      </RoundedBox>
      <group position={[0.55, 0, 0]} scale={[-1, 1, 1]}>
        <RoundedBox args={upper.args} radius={0.03} smoothness={3} position={upper.position} rotation={upper.rotation}>
          <BracketMaterial color={accent} />
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.03} smoothness={3} position={lower.position} rotation={lower.rotation}>
          <BracketMaterial color={accent} />
        </RoundedBox>
      </group>
    </group>
  );
}

function Orbiter({
  radius,
  speed,
  phase,
  tilt,
  scale = 1,
  children,
}: {
  radius: number;
  speed: number;
  phase: number;
  tilt: [number, number, number];
  scale?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 1.6) * 0.3;
      ref.current.rotation.y += 0.012;
    }
  });

  return (
    <group rotation={tilt}>
      <group ref={ref} scale={scale}>
        {children}
      </group>
    </group>
  );
}

function Composition({
  theme,
  accent,
  accent2,
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
  const parallax = useRef<THREE.Group>(null);
  const caseColor = theme === "dark" ? "#454d5c" : "#262b33";

  useFrame(({ pointer }) => {
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(parallax.current.rotation.y, pointer.x * 0.25, 0.04);
      parallax.current.rotation.x = THREE.MathUtils.lerp(parallax.current.rotation.x, -pointer.y * 0.12, 0.04);
    }
  });

  return (
    <group ref={parallax}>
      <group scale={1.35}>
        <Laptop
          caseColor={caseColor}
          accent={accent}
          accent2={accent2}
          showHint={showHint}
          onToggleTheme={onToggleTheme}
          onCycleAccent={onCycleAccent}
        />
      </group>
      <Orbiter radius={2.7} speed={0.3} phase={0} tilt={[0.25, 0, 0.05]} scale={0.85}>
        <TerminalWindow accent={accent} accent2={accent2} />
      </Orbiter>
      <Orbiter radius={3.1} speed={-0.22} phase={2.6} tilt={[-0.2, 0, -0.15]} scale={1}>
        <CodeBrackets accent={accent} accent2={accent2} />
      </Orbiter>
    </group>
  );
}

export function HeroScene({
  theme,
  accent,
  accent2,
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
  const [enableDragRotate, setEnableDragRotate] = useState(true);

  useEffect(() => {
    // Touch-dragging the canvas to rotate the model fights with swiping to
    // scroll the page — the browser can't tell which gesture is intended,
    // and the result looks broken. Disabling drag-rotate on coarse pointers
    // (touch) leaves scrolling exclusively to the page; autoRotate still runs.
    // matchMedia doesn't exist during the static-export build, so this can
    // only be read here, not derived at initial state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnableDragRotate(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.3, 9], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color={accent} />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.6} />
      </Suspense>
      <Composition
        theme={theme}
        accent={accent}
        accent2={accent2}
        showHint={showHint}
        onToggleTheme={onToggleTheme}
        onCycleAccent={onCycleAccent}
      />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={theme === "dark" ? 0.5 : 0.3}
        scale={9}
        blur={2.6}
        far={2.2}
        color={theme === "dark" ? "#000000" : "#10141b"}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={enableDragRotate}
        autoRotate
        autoRotateSpeed={0.5}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
      />
    </Canvas>
  );
}
