"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AmbientGlobe() {
  const globeRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.15;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.25;
  });

  return (
    <group position={[0, -0.5, -2]}>
      {/* Subtle Wireframe Sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[3.5, 24, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Outer Cyan Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function HeroAmbient3D() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.7,
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} color="#38bdf8" intensity={1.5} />
        <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={1.5} />

        <AmbientGlobe />

        {/* Ambient Floating Dust */}
        <Sparkles count={120} scale={12} size={2} speed={0.4} color="#38bdf8" opacity={0.4} />
        <Sparkles count={80} scale={10} size={2} speed={0.6} color="#a855f7" opacity={0.4} />
      </Canvas>
    </div>
  );
}
