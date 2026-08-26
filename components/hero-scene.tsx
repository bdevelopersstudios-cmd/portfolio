"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const RADIUS = 2;
const POINT_COUNT = 220;
const ARC_ENDPOINT_INDICES = [3, 27, 54, 88, 121, 150, 178, 205];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const rand = mulberry32(7);
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    const jitter = 1 + (rand() - 0.5) * 0.015;
    points.push(
      new THREE.Vector3(
        Math.cos(phi) * r * radius * jitter,
        y * radius * jitter,
        Math.sin(phi) * r * radius * jitter
      )
    );
  }
  return points;
}

function arcBetween(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(RADIUS * 1.55);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(48);
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => fibonacciSphere(POINT_COUNT, RADIUS * 1.01), []);
  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  const arcs = useMemo(() => {
    const list: THREE.Vector3[][] = [];
    for (let i = 0; i < ARC_ENDPOINT_INDICES.length - 1; i++) {
      const a = points[ARC_ENDPOINT_INDICES[i]];
      const b = points[ARC_ENDPOINT_INDICES[i + 1]];
      if (a && b) list.push(arcBetween(a, b));
    }
    const last = points[ARC_ENDPOINT_INDICES[ARC_ENDPOINT_INDICES.length - 1]];
    const first = points[ARC_ENDPOINT_INDICES[0]];
    if (last && first) list.push(arcBetween(last, first));
    return list;
  }, [points]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[RADIUS, 3]} />
        <meshBasicMaterial
          color="#f2a63d"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[RADIUS * 0.86, 48, 48]} />
        <meshStandardMaterial
          color="#191411"
          emissive="#3a2510"
          emissiveIntensity={0.4}
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>

      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#f7c988"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>

      {arcs.map((arc, i) => (
        <Line
          key={i}
          points={arc}
          color="#f2a63d"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.1} color="#ffe3b0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#4f9d92" />
      <Sparkles count={40} scale={7} size={1.2} speed={0.15} opacity={0.25} color="#f2a63d" />
      <Globe />
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
