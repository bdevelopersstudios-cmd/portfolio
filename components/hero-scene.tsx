"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const CODE_PALETTE = ["#5ec8ff", "#ff6ec7", "#ffd166", "#7dffb3", "#b39bff"];

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

type Voxel = { position: THREE.Vector3; scale: number; color: THREE.Color };

// A flat slab of voxels — the laptop's base/keyboard deck.
function buildBaseVoxels(pitch: number, center: THREE.Vector3, width: number, depth: number, thickness: number) {
  const voxels: Voxel[] = [];
  const nx = Math.max(2, Math.round(width / pitch));
  const nz = Math.max(2, Math.round(depth / pitch));
  const ny = Math.max(1, Math.round(thickness / pitch));
  const deck = new THREE.Color("#131a24");

  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      for (let iy = 0; iy < ny; iy++) {
        if (Math.random() > 0.82) continue;
        const lx = (ix / (nx - 1) - 0.5) * width;
        const lz = (iz / (nz - 1) - 0.5) * depth;
        const ly = ny > 1 ? (iy / (ny - 1) - 0.5) * thickness : 0;
        voxels.push({
          position: new THREE.Vector3(center.x + lx, center.y + ly, center.z + lz),
          scale: pitch * (0.75 + Math.random() * 0.35),
          color: deck,
        });
      }
    }
  }

  // scattered backlit "keys" on the top surface, in a handful of vivid colors
  const keyCols = 11;
  const keyRows = 4;
  for (let r = 0; r < keyRows; r++) {
    for (let c = 0; c < keyCols; c++) {
      if (Math.random() > 0.35) continue;
      const lx = (c / (keyCols - 1) - 0.5) * width * 0.85;
      const lz = (r / (keyRows - 1) - 0.5) * depth * 0.6;
      voxels.push({
        position: new THREE.Vector3(center.x + lx, center.y + thickness * 0.55, center.z + lz),
        scale: pitch * 0.9,
        color: new THREE.Color(CODE_PALETTE[(r + c) % CODE_PALETTE.length]),
      });
    }
  }

  return voxels;
}

// The tilted screen — built from randomized colorful "code line" bands so it
// reads as a lit-up editor rather than a plain gradient panel.
function buildScreenVoxels(
  pitch: number,
  pivot: THREE.Vector3,
  tiltX: number,
  width: number,
  height: number
) {
  const voxels: Voxel[] = [];
  const cos = Math.cos(tiltX);
  const sin = Math.sin(tiltX);
  const rows = 11;
  const rowHeight = height / rows;

  for (let r = 0; r < rows; r++) {
    const color = new THREE.Color(CODE_PALETTE[r % CODE_PALETTE.length]);
    const lineWidthFrac = 0.22 + Math.random() * 0.6;
    const indentFrac = Math.random() * 0.18;
    const v = (r + 0.5) / rows;
    const nx = Math.max(2, Math.round((width * lineWidthFrac) / pitch));
    const nyThick = Math.max(1, Math.round((rowHeight * 0.55) / pitch));
    const nzThick = Math.max(1, Math.round(0.05 / pitch));

    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < nyThick; iy++) {
        for (let iz = 0; iz < nzThick; iz++) {
          if (Math.random() > 0.9) continue;
          const u = -0.5 + indentFrac + (ix / Math.max(nx - 1, 1)) * lineWidthFrac;
          const lx = u * width;
          const ly0 = v * height + (iy / Math.max(nyThick - 1, 1) - 0.5) * rowHeight * 0.55;
          const lz0 = (iz / Math.max(nzThick - 1, 1) - 0.5) * 0.05;
          const ly = ly0 * cos - lz0 * sin;
          const lz = ly0 * sin + lz0 * cos;
          voxels.push({
            position: new THREE.Vector3(pivot.x + lx, pivot.y + ly, pivot.z + lz),
            scale: pitch * (0.8 + Math.random() * 0.3),
            color,
          });
        }
      }
    }
  }
  return voxels;
}

function buildLaptopVoxels(pitch: number) {
  const baseWidth = 2.7;
  const baseDepth = 1.5;
  const baseThickness = 0.14;
  const baseCenter = new THREE.Vector3(0, -0.25, 0.4);
  const base = buildBaseVoxels(pitch, baseCenter, baseWidth, baseDepth, baseThickness);

  const hinge = new THREE.Vector3(0, baseCenter.y + baseThickness / 2, baseCenter.z - baseDepth / 2);
  const screen = buildScreenVoxels(pitch, hinge, -0.22, baseWidth, 1.65);

  return [...base, ...screen];
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

function Laptop({ onToggleTheme, showHint }: { onToggleTheme: () => void; showHint: boolean }) {
  const voxels = useMemo(() => buildLaptopVoxels(0.055), []);
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
  accent,
  showHint,
  onToggleTheme,
  onCycleAccent,
}: {
  accent: string;
  showHint: boolean;
  onToggleTheme: () => void;
  onCycleAccent: () => void;
}) {
  const parallax = useRef<THREE.Group>(null);

  // Handles the idle ambient spin itself (rather than OrbitControls'
  // autoRotate) so it works identically whether or not OrbitControls is
  // even mounted — see the note by HeroScene on why touch devices skip it
  // entirely.
  useFrame(({ pointer, clock }) => {
    if (parallax.current) {
      const target = clock.elapsedTime * 0.08 + pointer.x * 0.2;
      parallax.current.rotation.y = THREE.MathUtils.lerp(parallax.current.rotation.y, target, 0.04);
    }
  });

  return (
    <>
      <color attach="background" args={["#081420"]} />
      <fog attach="fog" args={["#081420", 5, 14]} />
      <Sparkles count={50} scale={10} size={1.4} speed={0.15} opacity={0.5} color="#bfe9ff" />
      <group ref={parallax} position={[2.2, 0, 0]}>
        <Laptop onToggleTheme={onToggleTheme} showHint={showHint} />
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
  accent,
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
        <Scene accent={accent} showHint={showHint} onToggleTheme={onToggleTheme} onCycleAccent={onCycleAccent} />
      </Suspense>
      {!isTouch && <Controls />}
    </Canvas>
  );
}
