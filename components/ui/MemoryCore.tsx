'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Line, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

// 0G brand palette
const PURPLE = '#9200E1';
const PURPLE_LT = '#B75FFF';
const PURPLE_DK = '#6B00A8';

// Central crystalline "memory core" — a distorting purple icosahedron
// wrapped in a slowly counter-rotating wireframe shell.
function Core() {
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 0.25;
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12;
      shell.current.rotation.x += dt * 0.05;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.7}>
      <Icosahedron ref={inner} args={[1, 5]}>
        <MeshDistortMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={0.15}
          roughness={0.25}
          metalness={0.35}
          distort={0.32}
          speed={2.2}
        />
      </Icosahedron>
      <Icosahedron ref={shell} args={[1.55, 1]}>
        <meshBasicMaterial color={PURPLE_DK} wireframe transparent opacity={0.35} />
      </Icosahedron>
    </Float>
  );
}

interface RingProps {
  radius: number;
  tilt: number;
  color: string;
  speed: number;
  count?: number;
}

// An orbit ring with traveling "agent" nodes around the core.
function Ring({ radius, tilt, color, speed, count = 1 }: RingProps) {
  const orbit = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    return arr;
  }, [radius]);

  useFrame((state) => {
    if (orbit.current) orbit.current.rotation.y = state.clock.elapsedTime * speed;
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.4} />
      <group ref={orbit}>
        {Array.from({ length: count }).map((_, i) => {
          const ang = (i / count) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(ang) * radius, 0, Math.sin(ang) * radius]}>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Scene() {
  const root = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (root.current) root.current.rotation.y += dt * 0.06;
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 6, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-4, -2, 4]} intensity={40} color={PURPLE_LT} />

      <group ref={root}>
        <Core />
        <Ring radius={2.3} tilt={0.55} color={PURPLE} speed={0.35} count={2} />
        <Ring radius={3.0} tilt={-0.35} color={PURPLE_LT} speed={-0.26} count={1} />
        <Ring radius={3.7} tilt={0.95} color={PURPLE_DK} speed={0.18} count={2} />
      </group>

      <Sparkles count={60} scale={11} size={3} speed={0.3} color={PURPLE} opacity={0.7} />
    </>
  );
}

export function MemoryCore() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  );
}
