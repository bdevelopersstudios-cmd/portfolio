"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function setHoverCursor(hovering: boolean) {
  const el = document.getElementById("hero-3d");
  if (!el) return;
  if (hovering) el.setAttribute("data-cursor-hover", "true");
  else el.removeAttribute("data-cursor-hover");
  document.body.style.cursor = hovering ? "pointer" : "";
}

type Voxel = { position: THREE.Vector3; scale: number; color: THREE.Color };

function chevronArm(angle: number, length: number, thickness: number) {
  return {
    offset: new THREE.Vector2(Math.cos(angle) * length * 0.5, Math.sin(angle) * length * 0.5),
    rotation: angle,
    length,
    thickness,
  };
}

// Fills a bar-shaped region (given local length along X, square cross-section)
// with small jittered cubes, then places them at the bar's world position and
// rotation — the same building block used for every stroke of the symbol.
function fillBar(
  center: THREE.Vector2,
  rotationZ: number,
  length: number,
  thickness: number,
  pitch: number,
  color: THREE.Color,
  out: Voxel[]
) {
  const nx = Math.max(2, Math.round(length / pitch));
  const ny = Math.max(2, Math.round(thickness / pitch));
  const cos = Math.cos(rotationZ);
  const sin = Math.sin(rotationZ);

  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let iz = 0; iz < ny; iz++) {
        if (Math.random() > 0.88) continue;
        const lx = (ix / (nx - 1) - 0.5) * length;
        const ly = (iy / (ny - 1) - 0.5) * thickness;
        const lz = (iz / (ny - 1) - 0.5) * thickness;
        const wx = center.x + lx * cos - ly * sin;
        const wy = center.y + lx * sin + ly * cos;
        out.push({
          position: new THREE.Vector3(wx, wy, lz),
          scale: pitch * (0.75 + Math.random() * 0.4),
          color,
        });
      }
    }
  }
}

function buildSymbolVoxels(pitch: number) {
  const voxels: Voxel[] = [];
  const angle = Math.PI / 5.5;
  const armLength = 1.15;
  const thickness = 0.16;
  const gap = 1.05;
  const upper = chevronArm(angle, armLength, thickness);
  const lower = chevronArm(-angle, armLength, thickness);

  const colorFor = (y: number) => {
    const t = THREE.MathUtils.clamp((y + 0.9) / 1.8, 0, 1);
    return new THREE.Color("#0d3a52").lerp(new THREE.Color("#8fe3ff"), t);
  };

  for (const [cx, mirror] of [[-gap, 1] as const, [gap, -1] as const]) {
    for (const arm of [upper, lower]) {
      const center = new THREE.Vector2(cx + arm.offset.x * mirror, arm.offset.y);
      fillBar(center, arm.rotation * mirror, armLength, thickness, pitch, colorFor(arm.offset.y), voxels);
    }
  }
  fillBar(new THREE.Vector2(0, 0), Math.PI / 2.5, armLength * 1.15, thickness * 0.9, pitch, colorFor(0.3), voxels);

  return voxels;
}

function buildGroundVoxels(pitch: number) {
  const voxels: Voxel[] = [];
  const size = 7;
  const n = Math.round(size / pitch);
  const base = new THREE.Color("#071824");
  const rim = new THREE.Color("#123a4d");

  for (let ix = 0; ix < n; ix++) {
    for (let iz = 0; iz < n; iz++) {
      // Skip most cells — keeps total instances (and therefore GPU cost) in
      // check while still reading as a dense, dune-like field.
      if (Math.random() > 0.2) continue;
      const x = (ix / (n - 1) - 0.5) * size;
      const z = (iz / (n - 1) - 0.5) * size * 0.6 + 1.6;
      const dist = Math.sqrt(x * x + z * z);
      if (dist > size * 0.5) continue;
      const y = -1.35 + Math.sin(x * 1.3) * 0.05 + Math.cos(z * 1.1) * 0.05;
      const fade = THREE.MathUtils.clamp(1 - dist / (size * 0.5), 0, 1);
      voxels.push({
        position: new THREE.Vector3(x, y, z),
        scale: pitch * (0.7 + Math.random() * 0.5),
        color: base.clone().lerp(rim, fade),
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
      <meshStandardMaterial roughness={0.5} metalness={0.1} toneMapped={false} />
    </instancedMesh>
  );
}

function Symbol({ onToggleTheme, showHint }: { onToggleTheme: () => void; showHint: boolean }) {
  const voxels = useMemo(() => buildSymbolVoxels(0.06), []);
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
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoverCursor(true);
      }}
      onPointerOut={() => setHoverCursor(false)}
    >
      <VoxelMesh voxels={voxels} />
      {showHint && (
        <Html position={[0, 1.05, 0.2]} center transform={false} zIndexRange={[10, 0]}>
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
      ref.current.position.set(Math.cos(t) * 1.9, 0.5 + Math.sin(t * 1.4) * 0.3, Math.sin(t) * 1.9);
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
  const voxels = useMemo(() => buildGroundVoxels(0.16), []);
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

  useFrame(({ pointer }) => {
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(parallax.current.rotation.y, pointer.x * 0.25, 0.04);
    }
  });

  return (
    <>
      <color attach="background" args={["#081420"]} />
      <fog attach="fog" args={["#081420", 4, 11]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#bfe9ff" />
      <Sparkles count={40} scale={7} size={1.4} speed={0.15} opacity={0.5} color="#bfe9ff" />
      <group ref={parallax}>
        <Symbol onToggleTheme={onToggleTheme} showHint={showHint} />
        <Spark accent={accent} onCycleAccent={onCycleAccent} />
      </group>
      <Ground />
    </>
  );
}

function Controls({ enableDragRotate }: { enableDragRotate: boolean }) {
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate={enableDragRotate}
      autoRotate
      autoRotateSpeed={0.5}
      rotateSpeed={0.4}
      minPolarAngle={Math.PI / 2 - 0.35}
      maxPolarAngle={Math.PI / 2 + 0.2}
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
  const [enableDragRotate, setEnableDragRotate] = useState(true);

  useEffect(() => {
    // Touch-dragging the canvas to rotate the model fights with swiping to
    // scroll the page — the browser can't tell which gesture is intended,
    // and the result looks broken. Disabling drag-rotate on coarse pointers
    // (touch) leaves scrolling exclusively to the page.
    // matchMedia doesn't exist during the static-export build, so this can
    // only be read here, not derived at initial state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnableDragRotate(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.1, 6.4], fov: 38 }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Scene accent={accent} showHint={showHint} onToggleTheme={onToggleTheme} onCycleAccent={onCycleAccent} />
      </Suspense>
      <Controls enableDragRotate={enableDragRotate} />
    </Canvas>
  );
}
