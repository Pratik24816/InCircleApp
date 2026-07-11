import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import type { Group, Mesh } from 'three';

function CoffeeCup() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.4;
  });

  return (
    <group ref={ref} scale={0.55}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.32, 0.55, 20]} />
        <meshStandardMaterial color="#c4a882" roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.06, 20]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.4} />
      </mesh>
      <mesh position={[0.42, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.045, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#c4a882" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#8cff4f"
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function CricketBall() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.5;
    ref.current.rotation.z = clock.getElapsedTime() * 0.3;
  });

  return (
    <group ref={ref} scale={0.5}>
      <Sphere args={[0.55, 32, 32]}>
        <meshStandardMaterial color="#c41e3a" roughness={0.35} metalness={0.15} />
      </Sphere>
      <Torus args={[0.56, 0.025, 8, 48]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </Torus>
      <Torus args={[0.56, 0.025, 8, 48]} rotation={[0, Math.PI / 2, Math.PI / 4]}>
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </Torus>
    </group>
  );
}

function MapPin() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.35;
  });

  return (
    <group ref={ref} scale={0.5}>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#4a9e1f"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.28, 0.7, 24]} />
        <meshStandardMaterial
          color="#8cff4f"
          emissive="#4a9e1f"
          emissiveIntensity={0.3}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function NightOrb() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <Sphere ref={ref} args={[0.45, 32, 32]}>
      <MeshDistortMaterial
        color="#4db5ff"
        emissive="#1a3a5c"
        emissiveIntensity={1}
        distort={0.25}
        speed={2}
        roughness={0.1}
        metalness={0.9}
      />
    </Sphere>
  );
}

// function CentralRing() {
//   const ref = useRef<Mesh>(null);

//   useFrame(({ clock }) => {
//     if (!ref.current) return;
//     ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
//     ref.current.rotation.z = clock.getElapsedTime() * 0.12;
//   });

//   return (
//     <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
//       <Torus ref={ref} args={[2.8, 0.03, 16, 120]} position={[0, 0, -3]}>
//         <meshStandardMaterial
//           color="#8cff4f"
//           emissive="#8cff4f"
//           emissiveIntensity={1.5}
//           transparent
//           opacity={0.35}
//         />
//       </Torus>
//     </Float>
//   );
// }

function HeroParticles() {
  const count = 48;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
  }

  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#8cff4f"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingObjects() {
  return (
    <>
      {/* <CentralRing /> */}
      <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1.4} position={[-4.2, 1.8, -1]}>
        <CoffeeCup />
      </Float>
      <Float speed={1.8} rotationIntensity={1} floatIntensity={1.2} position={[4.5, 0.5, -0.5]}>
        <CricketBall />
      </Float>
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.6} position={[-3.8, -1.5, 0]}>
        <MapPin />
      </Float>
      <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1} position={[4, -1.8, -1.5]}>
        <NightOrb />
      </Float>
      <HeroParticles />
    </>
  );
}

export function HeroScene3D() {
  return (
    <div className="hero__scene-3d" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <pointLight position={[5, 4, 4]} intensity={1.3} color="#8cff4f" />
          <pointLight position={[-5, -2, 3]} intensity={0.9} color="#4db5ff" />
          <pointLight position={[0, 3, -2]} intensity={0.5} color="#ffb020" />
          <FloatingObjects />
        </Suspense>
      </Canvas>
    </div>
  );
}
