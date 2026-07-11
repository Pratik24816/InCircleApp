import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import type { Mesh, Points } from 'three';

function GlowingRing() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.18;
    ref.current.rotation.z = clock.getElapsedTime() * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
      <Torus ref={ref} args={[2.2, 0.04, 24, 120]}>
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#8cff4f"
          emissiveIntensity={1.8}
          transparent
          opacity={0.75}
        />
      </Torus>
    </Float>
  );
}

function OuterRing() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.08;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.2;
  });

  return (
    <Torus ref={ref} args={[2.6, 0.015, 16, 100]}>
      <meshStandardMaterial
        color="#4db5ff"
        emissive="#4db5ff"
        emissiveIntensity={1.2}
        transparent
        opacity={0.4}
      />
    </Torus>
  );
}

function InnerCore() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <Sphere ref={ref} args={[0.55, 48, 48]}>
        <MeshDistortMaterial
          color="#4db5ff"
          emissive="#1a3a5c"
          emissiveIntensity={0.9}
          distort={0.28}
          speed={2.5}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>
    </Float>
  );
}

function AmbientParticles() {
  const count = 64;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.8 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const ref = useRef<Points>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#8cff4f"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

export function CircleBackground3D() {
  return (
    <div className="circle-bg-3d" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={1.1} color="#8cff4f" />
        <pointLight position={[-5, -3, 3]} intensity={0.7} color="#4db5ff" />
        <pointLight position={[0, -4, 2]} intensity={0.4} color="#ffb020" />
        <GlowingRing />
        <OuterRing />
        <InnerCore />
        <AmbientParticles />
      </Canvas>
    </div>
  );
}
