"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Edges,
  Environment,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

const ACCENT = "#2f5eff";
const ACCENT_2 = "#ff7a45";
const CASE_COLOR = "#262b33";
const KEY_COLOR = "#34393f";

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

function caseMaterial() {
  return (
    <meshPhysicalMaterial
      color={CASE_COLOR}
      roughness={0.32}
      metalness={0.75}
      clearcoat={0.6}
      clearcoatRoughness={0.25}
    />
  );
}

function Laptop() {
  const group = useRef<THREE.Group>(null);
  const codeTexture = useCodeTexture();

  const keys = useMemo(() => {
    const rows = 4;
    const cols = 11;
    const pitch = 0.155;
    const startX = -((cols - 1) * pitch) / 2;
    const startZ = -((rows - 1) * pitch) / 2 + 0.28;
    const list: { pos: [number, number, number]; lit: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          pos: [startX + c * pitch, 0, startZ + r * pitch],
          lit: (r + c) % 8 === 0,
        });
      }
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <group ref={group} rotation={[0.08, -0.32, 0]}>
      {/* base / keyboard deck */}
      <RoundedBox args={[2.1, 0.09, 1.3]} radius={0.035} smoothness={4} position={[0, -0.32, 0.15]}>
        {caseMaterial()}
        <Edges color={ACCENT_2} threshold={20} />
      </RoundedBox>

      {keys.map((k, i) => (
        <RoundedBox
          key={i}
          args={[0.1, 0.035, 0.1]}
          radius={0.015}
          smoothness={2}
          position={[k.pos[0], -0.32 + 0.06, k.pos[2]]}
        >
          <meshPhysicalMaterial
            color={KEY_COLOR}
            roughness={0.55}
            metalness={0.15}
            clearcoat={0.3}
            emissive={k.lit ? ACCENT : "#000000"}
            emissiveIntensity={k.lit ? 0.9 : 0}
          />
        </RoundedBox>
      ))}

      {/* hinge + screen, tilted back */}
      <group position={[0, -0.275, -0.5]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[2.1, 1.3, 0.05]} radius={0.03} smoothness={4} position={[0, 0.65, 0]}>
          {caseMaterial()}
          <Edges color={ACCENT} threshold={20} />
        </RoundedBox>
        <mesh position={[0, 0.65, 0.028]}>
          <planeGeometry args={[1.9, 1.1]} />
          <meshBasicMaterial map={codeTexture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function TerminalWindow() {
  const bars = useMemo(
    () => [
      { width: 0.55, color: ACCENT_2 },
      { width: 0.75, color: "#e2e8f0" },
      { width: 0.4, color: ACCENT },
      { width: 0.62, color: "#e2e8f0" },
    ],
    []
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
      <RoundedBox args={[1.15, 0.85, 0.04]} radius={0.04} smoothness={4}>
        <meshPhysicalMaterial color="#171d28" roughness={0.4} metalness={0.4} clearcoat={0.7} />
        <Edges color={ACCENT} threshold={20} />
      </RoundedBox>

      {[-0.35, -0.22, -0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0.03]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color={[ACCENT_2, "#e2e8f0", ACCENT][i]} />
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
        <meshBasicMaterial color={ACCENT} transparent opacity={1} />
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

function bracketMaterial(color: string) {
  return <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.2} clearcoat={1} clearcoatRoughness={0.1} />;
}

function CodeBrackets() {
  const angle = Math.PI / 6;
  const armLength = 0.5;
  const thickness = 0.08;
  const upper = bracketArm(angle, armLength, thickness);
  const lower = bracketArm(-angle, armLength, thickness);

  return (
    <group>
      <group position={[-0.55, 0, 0]}>
        <RoundedBox args={upper.args} radius={0.03} smoothness={2} position={upper.position} rotation={upper.rotation}>
          {bracketMaterial(ACCENT)}
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.03} smoothness={2} position={lower.position} rotation={lower.rotation}>
          {bracketMaterial(ACCENT)}
        </RoundedBox>
      </group>
      <RoundedBox
        args={[0.62, thickness * 0.85, thickness * 0.85]}
        radius={0.025}
        smoothness={2}
        rotation={[0, 0, Math.PI / 2.6]}
      >
        {bracketMaterial(ACCENT_2)}
      </RoundedBox>
      <group position={[0.55, 0, 0]} scale={[-1, 1, 1]}>
        <RoundedBox args={upper.args} radius={0.03} smoothness={2} position={upper.position} rotation={upper.rotation}>
          {bracketMaterial(ACCENT)}
        </RoundedBox>
        <RoundedBox args={lower.args} radius={0.03} smoothness={2} position={lower.position} rotation={lower.rotation}>
          {bracketMaterial(ACCENT)}
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

function Composition() {
  const parallax = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(
        parallax.current.rotation.y,
        pointer.x * 0.25,
        0.04
      );
      parallax.current.rotation.x = THREE.MathUtils.lerp(
        parallax.current.rotation.x,
        -pointer.y * 0.12,
        0.04
      );
    }
  });

  return (
    <group ref={parallax}>
      <group scale={1.35}>
        <Laptop />
      </group>
      <Orbiter radius={2.7} speed={0.3} phase={0} tilt={[0.25, 0, 0.05]} scale={0.85}>
        <TerminalWindow />
      </Orbiter>
      <Orbiter radius={3.1} speed={-0.22} phase={2.6} tilt={[-0.2, 0, -0.15]} scale={1}>
        <CodeBrackets />
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color={ACCENT} />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.6} />
      </Suspense>
      <Composition />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.3} scale={9} blur={2.6} far={2.2} color="#10141b" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
      />
    </Canvas>
  );
}
