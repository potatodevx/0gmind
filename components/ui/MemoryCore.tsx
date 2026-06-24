'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Lavender / blue palette
const BLUE = '#0091ff';
const CYAN = '#00C2FF';
const NAVY = '#0B1B2E';

// Wireframe geodesic "memory lattice" — nested rotating icosahedrons with
// glowing nodes at every vertex. Clean, techy, no solid blob.
function Lattice() {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  // 12 vertices of the base icosahedron for the glowing nodes
  const vertices = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(2.25, 0);
    const pos = g.attributes.position;
    const seen = new Set<string>();
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    }
    g.dispose();
    return out;
  }, []);

  useFrame((state, dt) => {
    if (outer.current) {
      outer.current.rotation.y += dt * 0.16;
      outer.current.rotation.x += dt * 0.05;
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.22;
      inner.current.rotation.z += dt * 0.08;
    }
    if (core.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      core.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* faint translucent core */}
      <mesh ref={core}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.18} />
      </mesh>

      {/* inner counter-rotating geodesic */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.35} />
      </mesh>

      {/* outer geodesic grill + glowing vertex nodes */}
      <group ref={outer}>
        <mesh>
          <icosahedronGeometry args={[2.25, 1]} />
          <meshBasicMaterial color={NAVY} wireframe transparent opacity={0.4} />
        </mesh>
        {vertices.map((v, i) => (
          <mesh key={i} position={[v.x, v.y, v.z]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={i % 2 === 0 ? BLUE : CYAN} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface RingProps {
  radius: number;
  tilt: number;
  color: string;
  speed: number;
  count?: number;
}

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
      <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.35} />
      <group ref={orbit}>
        {Array.from({ length: count }).map((_, i) => {
          const ang = (i / count) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(ang) * radius, 0, Math.sin(ang) * radius]}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshBasicMaterial color={color} />
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
    if (root.current) root.current.rotation.y += dt * 0.04;
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <group ref={root}>
        <Lattice />
        <Ring radius={3.1} tilt={0.5} color={BLUE} speed={0.3} count={2} />
        <Ring radius={3.8} tilt={-0.4} color={CYAN} speed={-0.22} count={1} />
      </group>
      <Sparkles count={50} scale={11} size={3} speed={0.3} color={BLUE} opacity={0.6} />
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
