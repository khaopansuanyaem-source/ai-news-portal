"use client";
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Sparkles, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// Building Mesh Component with Hover and Pulsing Glow
function Building({ position, size, color, label, icon, category, active, onClick, route }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating / pulsing effect
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.08;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
    if (route) router.push(route);
  };

  return (
    <group position={position}>
      {/* 3D Building Base Block */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.35}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Holographic Roof Cap */}
      <mesh position={[0, size[1] / 2 + 0.15, 0]}>
        <boxGeometry args={[size[0] * 0.9, 0.1, size[2] * 0.9]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>

      {/* Floating 3D Badge / Label */}
      <Html position={[0, size[1] / 2 + 1.2, 0]} center distanceFactor={15}>
        <div
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${color}`,
            boxShadow: hovered ? `0 0 25px ${color}` : `0 0 10px ${color}44`,
            padding: '8px 16px',
            borderRadius: '16px',
            color: '#fff',
            fontFamily: 'sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transform: hovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <div>
            <div style={{ color, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</div>
            <div>{label}</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Scene Content
function CityScene({ onSelectModule }) {
  return (
    <>
      {/* Ambient and Directional Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 15]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, -5]} color="#38bdf8" intensity={2} />
      <pointLight position={[5, 5, 5]} color="#a855f7" intensity={2} />

      {/* Cyberpunk Ground Grid */}
      <Grid
        position={[0, -0.01, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={1}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#38bdf8"
        fadeDistance={25}
        fadeStrength={1.5}
      />

      {/* Floating Particles */}
      <Sparkles count={150} scale={18} size={2.5} speed={0.4} color="#38bdf8" />
      <Sparkles count={100} scale={15} size={3} speed={0.6} color="#a855f7" />

      {/* 3D Isometric Buildings */}
      
      {/* 1. LINE CRM & Messenger Command Center */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Building
          position={[-3.5, 1.5, -2]}
          size={[2.2, 3, 2.2]}
          color="#06C755"
          icon="💬"
          category="LINE OA & CRM"
          label="LINE Command Center"
          route="/?category=Tech"
        />
      </Float>

      {/* 2. Content Studio / น้อง Sai 3D Avatar */}
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <Building
          position={[0, 2.2, 0]}
          size={[2.8, 4.4, 2.8]}
          color="#a855f7"
          icon="🤖"
          category="3D AI Agent"
          label="น้อง Sai Studio"
          route="/character"
        />
      </Float>

      {/* 3. News Core & Supabase DB */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Building
          position={[3.5, 1.8, -2.5]}
          size={[2.4, 3.6, 2.4]}
          color="#38bdf8"
          icon="🗄️"
          category="Data Engine"
          label="Supabase Core"
          route="/"
        />
      </Float>

      {/* 4. Cyber Threat Intelligence */}
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.3}>
        <Building
          position={[-3.8, 1.2, 3]}
          size={[2, 2.4, 2]}
          color="#f43f5e"
          icon="🛡️"
          category="Cyber Shield"
          label="Threat Analyzer"
          route="/?category=Cybersecurity"
        />
      </Float>

      {/* 5. Favorites & Saved Briefs */}
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.3}>
        <Building
          position={[3.8, 1.4, 2.5]}
          size={[2.2, 2.8, 2.2]}
          color="#eab308"
          icon="❤️"
          category="Personal Hub"
          label="Favorites Library"
          route="/?category=Favorites"
        />
      </Float>
    </>
  );
}

export default function AgentOffice3D({ onSelectModule }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: '24px', overflow: 'hidden', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [12, 12, 12], fov: 40 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <CityScene onSelectModule={onSelectModule} />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={0.8}
          enablePan={false}
        />
      </Canvas>

      {/* Top Banner Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '10px 18px', color: '#fff' }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ⚡ VIRTUAL AGENT OFFICE CITY
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            CyberInsight AI Command Center
          </div>
        </div>
      </div>

      {/* Bottom Control Hint Overlay */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '8px 14px', color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🖱️ หมุนมุมมองได้ 360° | คลิกตึกเพื่อเข้าสู่แผนก</span>
        </div>
      </div>
    </div>
  );
}
