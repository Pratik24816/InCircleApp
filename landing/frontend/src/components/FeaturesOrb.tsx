import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import type { Mesh } from 'three';

function Orb() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.12;
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={ref} args={[1.2, 48, 48]}>
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#4a9e1f"
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.35}
        />
      </Sphere>
    </Float>
  );
}

function InnerCore() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.2;
  });

  return (
    <Sphere ref={ref} args={[0.45, 32, 32]}>
      <meshStandardMaterial
        color="#4db5ff"
        emissive="#4db5ff"
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}

export function FeaturesOrb() {
  return (
    <div className="features__orb" aria-hidden>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#8cff4f" />
        <pointLight position={[-3, -1, 2]} intensity={0.6} color="#4db5ff" />
        <Orb />
        <InnerCore />
      </Canvas>
    </div>
  );
}
