"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, MeshDistortMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const ACCENT = "#3fd9ec";
const ACCENT_2 = "#7c8cf8";

function CoreKnot() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.08;
      ref.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.05, 0.32, 200, 24, 2, 3]} />
      <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.55} />
    </mesh>
  );
}

function StackPanels() {
  const group = useRef<THREE.Group>(null);
  const panels = useMemo(
    () => [
      { pos: [1.9, 0.55, -0.4] as const, rot: [0.15, -0.35, 0.08] as const, phase: 0 },
      { pos: [2.15, 0.05, -0.15] as const, rot: [0.1, -0.3, -0.05] as const, phase: 1.4 },
      { pos: [2.0, -0.5, 0.1] as const, rot: [0.2, -0.28, 0.12] as const, phase: 2.7 },
    ],
    []
  );
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    panels.forEach((p, i) => {
      const m = meshRefs.current[i];
      if (m) {
        m.position.y = p.pos[1] + Math.sin(clock.elapsedTime * 0.6 + p.phase) * 0.08;
      }
    });
    if (group.current) group.current.rotation.y += 0.0015;
  });

  return (
    <group ref={group}>
      {panels.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={p.pos}
          rotation={p.rot}
        >
          <boxGeometry args={[1.3, 0.85, 0.02]} />
          <meshStandardMaterial
            color="#0d131b"
            transparent
            opacity={0.55}
            roughness={0.3}
            metalness={0.2}
            emissive={ACCENT}
            emissiveIntensity={0.03}
          />
          <Edges scale={1} threshold={15} color={i === 1 ? ACCENT : ACCENT_2} />
        </mesh>
      ))}
    </group>
  );
}

function Orbiter({
  radius,
  speed,
  phase,
  tilt,
  children,
}: {
  radius: number;
  speed: number;
  phase: number;
  tilt: [number, number, number];
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 1.7) * 0.25;
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.014;
    }
  });

  return (
    <group rotation={tilt}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

function Composition() {
  const outerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={outerRef}>
      <CoreKnot />
      <StackPanels />

      <Orbiter radius={2.6} speed={0.35} phase={0} tilt={[0.4, 0, 0.1]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <meshBasicMaterial color={ACCENT} wireframe />
        </mesh>
      </Orbiter>

      <Orbiter radius={3.1} speed={-0.25} phase={2.1} tilt={[-0.3, 0, -0.25]}>
        <mesh>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial
            color={ACCENT_2}
            emissive={ACCENT_2}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      </Orbiter>

      <Orbiter radius={1.9} speed={0.5} phase={4.2} tilt={[0.1, 0, 0.55]}>
        <mesh>
          <icosahedronGeometry args={[0.27, 4]} />
          <MeshDistortMaterial
            color={ACCENT}
            distort={0.45}
            speed={2.2}
            roughness={0.25}
            metalness={0.2}
          />
        </mesh>
      </Orbiter>
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 9], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 5]} intensity={1.1} color="#bdf3ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color={ACCENT_2} />
      <Sparkles count={40} scale={7.5} size={1.2} speed={0.15} opacity={0.25} color={ACCENT} />
      <Composition />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI / 2 - 0.6}
        maxPolarAngle={Math.PI / 2 + 0.6}
      />
    </Canvas>
  );
}
