"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { ThemeMode } from "@/lib/theme";

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

function clickable(handler: () => void) {
  return {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      handler();
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHoverCursor(true);
    },
    onPointerOut: () => setHoverCursor(false),
  };
}

function GlassMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.12}
      metalness={0.3}
      clearcoat={1}
      clearcoatRoughness={0.06}
      transmission={0.15}
      ior={1.4}
    />
  );
}

function chevronArm(angle: number, length: number, thickness: number) {
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

// The hero object IS the symbol — a large "</>" rather than a device that
// merely displays code. Bold, simple to render well, and unambiguous.
function CodeSymbol({
  accent,
  accent2,
  showHint,
  onToggleTheme,
}: {
  accent: string;
  accent2: string;
  showHint: boolean;
  onToggleTheme: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const angle = Math.PI / 5.5;
  const armLength = 1.15;
  const thickness = 0.16;
  const upper = chevronArm(angle, armLength, thickness);
  const lower = chevronArm(-angle, armLength, thickness);
  const gap = 1.05;

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.12;
    }
  });

  const bind = clickable(onToggleTheme);

  return (
    <group ref={group}>
      <group position={[-gap, 0, 0]}>
        <RoundedBox args={upper.args} radius={0.06} smoothness={6} position={upper.position} rotation={upper.rotation} {...bind}>
          <GlassMaterial color={accent} />
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.06} smoothness={6} position={lower.position} rotation={lower.rotation} {...bind}>
          <GlassMaterial color={accent} />
        </RoundedBox>
      </group>

      <RoundedBox
        args={[armLength * 1.15, thickness * 0.9, thickness * 0.9]}
        radius={0.045}
        smoothness={6}
        rotation={[0, 0, Math.PI / 2.5]}
        {...bind}
      >
        <GlassMaterial color={accent2} />
      </RoundedBox>

      <group position={[gap, 0, 0]} scale={[-1, 1, 1]}>
        <RoundedBox args={upper.args} radius={0.06} smoothness={6} position={upper.position} rotation={upper.rotation} {...bind}>
          <GlassMaterial color={accent} />
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.06} smoothness={6} position={lower.position} rotation={lower.rotation} {...bind}>
          <GlassMaterial color={accent} />
        </RoundedBox>
      </group>

      {showHint && (
        <Html position={[0, 1.05, 0.2]} center transform={false} zIndexRange={[10, 0]}>
          <div className="laptop-hint pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-bg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-accent shadow-lg">
            👆 It&apos;s interactive
          </div>
        </Html>
      )}
    </group>
  );
}

// A blinking text-cursor satellite — click to cycle the accent color.
function CursorBlink({ accent, onCycleAccent }: { accent: string; onCycleAccent: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
    if (matRef.current) {
      matRef.current.opacity = Math.sin(clock.elapsedTime * 3.2) > 0 ? 1 : 0.15;
    }
  });

  return (
    <group ref={ref}>
      {/* invisible, larger hit area — the visible bar is too thin to click reliably */}
      <mesh {...clickable(onCycleAccent)}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <RoundedBox args={[0.1, 0.42, 0.1]} radius={0.04} smoothness={4}>
        <meshBasicMaterial ref={matRef} color={accent} transparent opacity={1} toneMapped={false} />
      </RoundedBox>
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
  accent,
  accent2,
  showHint,
  onToggleTheme,
  onCycleAccent,
}: {
  accent: string;
  accent2: string;
  showHint: boolean;
  onToggleTheme: () => void;
  onCycleAccent: () => void;
}) {
  const parallax = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(parallax.current.rotation.y, pointer.x * 0.3, 0.04);
      parallax.current.rotation.x = THREE.MathUtils.lerp(parallax.current.rotation.x, -pointer.y * 0.15, 0.04);
    }
  });

  return (
    <group ref={parallax}>
      <CodeSymbol accent={accent} accent2={accent2} showHint={showHint} onToggleTheme={onToggleTheme} />
      <Orbiter radius={2.1} speed={0.35} phase={0} tilt={[0.3, 0, 0.1]}>
        <CursorBlink accent={accent2} onCycleAccent={onCycleAccent} />
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
      camera={{ position: [0, 0.2, 7.5], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 5]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color={accent2} />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.7} />
      </Suspense>
      <Composition
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
