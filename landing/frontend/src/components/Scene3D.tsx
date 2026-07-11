import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import type { Mesh } from 'three';

function GlowingRing() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.25;
    ref.current.rotation.y = clock.getElapsedTime() * 0.4;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
      <Torus ref={ref} args={[1.6, 0.06, 32, 128]}>
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#8cff4f"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </Torus>
    </Float>
  );
}

function InnerOrb() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <Sphere ref={ref} args={[0.85, 64, 64]}>
      <MeshDistortMaterial
        color="#4db5ff"
        emissive="#1a3a5c"
        emissiveIntensity={0.8}
        distort={0.35}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function Particles() {
  const count = 48;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.5 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#8cff4f" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export function Scene3D() {
  return (
    <div className="scene-3d" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[4, 4, 4]} intensity={1.2} color="#8cff4f" />
        <pointLight position={[-4, -2, 2]} intensity={0.8} color="#4db5ff" />
        <GlowingRing />
        <InnerOrb />
        <Particles />
      </Canvas>
    </div>
  );
}
