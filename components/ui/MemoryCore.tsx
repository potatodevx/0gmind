'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Line, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const TEAL = '#2EE6C5';
const CYAN = '#36C5FF';
const WHITE = '#EAF6F4';

// Central crystalline "memory core" — a distorting glowing icosahedron
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
          color={TEAL}
          emissive={TEAL}
          emissiveIntensity={0.55}
          roughness={0.12}
          metalness={0.5}
          distort={0.32}
          speed={2.2}
        />
      </Icosahedron>
      <Icosahedron ref={shell} args={[1.55, 1]}>
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.22} />
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

// An orbit ring with glowing "agent" nodes traveling around the core.
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
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.3} />
      <group ref={orbit}>
        {Array.from({ length: count }).map((_, i) => {
          const ang = (i / count) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(ang) * radius, 0, Math.sin(ang) * radius]}>
              <mesh>
                <sphereGeometry args={[0.11, 24, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
              </mesh>
              {/* faint halo */}
              <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.12} />
              </mesh>
            </group>
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
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={90} color={TEAL} />
      <pointLight position={[-5, -3, -4]} intensity={55} color={CYAN} />
      <pointLight position={[0, 3, 6]} intensity={40} color={WHITE} />

      <group ref={root}>
        <Core />
        <Ring radius={2.3} tilt={0.55} color={TEAL} speed={0.35} count={2} />
        <Ring radius={3.0} tilt={-0.35} color={CYAN} speed={-0.26} count={1} />
        <Ring radius={3.7} tilt={0.95} color={WHITE} speed={0.18} count={2} />
      </group>

      <Sparkles count={70} scale={11} size={2.2} speed={0.3} color={TEAL} opacity={0.5} />
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
