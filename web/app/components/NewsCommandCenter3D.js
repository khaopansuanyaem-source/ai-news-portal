"use client";
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Sparkles, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// Central Holographic Data Globe
function CyberGlobe() {
  const globeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.3;
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.4;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Holographic Globe Mesh */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#9333ea"
          emissiveIntensity={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Orbital Cyber Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.03, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>

      {/* Orbital Cyber Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.8, 0.04, 16, 100]} />
        <meshBasicMaterial color="#a855f7" wireframe />
      </mesh>
    </group>
  );
}

// 3D News Data Node (Floating Interactive Sphere/Cube)
function NewsNode({ position, color, label, icon, category, route, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
    if (route) router.push(route);
  };

  return (
    <group position={position}>
      {/* 3D Node Mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
      >
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={hovered ? 1 : 0.5}
          roughness={0.2}
          metalness={0.8}
          wireframe={!hovered}
        />
      </mesh>

      {/* Outer Pulse Shell on Hover */}
      {hovered && (
        <mesh scale={[1.4, 1.4, 1.4]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </mesh>
      )}

      {/* Floating 3D News Badge */}
      <Html position={[0, 1.4, 0]} center distanceFactor={14}>
        <div
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${color}`,
            boxShadow: hovered ? `0 0 25px ${color}` : `0 0 12px ${color}44`,
            padding: '8px 16px',
            borderRadius: '16px',
            color: '#fff',
            fontFamily: 'sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transform: hovered ? 'scale(1.12) translateY(-4px)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <div>
            <div style={{ color, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</div>
            <div>{label}</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function NewsCommandCenter3D() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: '24px', overflow: 'hidden', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-5, 5, -5]} color="#38bdf8" intensity={2} />
        <pointLight position={[5, 5, 5]} color="#a855f7" intensity={2} />

        {/* Central Holographic News Globe */}
        <CyberGlobe />

        {/* Floating Sparkles & Data Dust */}
        <Sparkles count={200} scale={16} size={3} speed={0.5} color="#38bdf8" />
        <Sparkles count={120} scale={14} size={2.5} speed={0.8} color="#a855f7" />

        {/* Interactive 3D News Category Nodes */}

        {/* 1. Cyber Security Threat Hub */}
        <Float speed={1.5} rotationIntensity={0.2}>
          <NewsNode
            position={[-4.5, 1.2, 1.5]}
            color="#f43f5e"
            icon="🛡️"
            category="Cyber Intelligence"
            label="ศูนย์ภัยคุกคามไซเบอร์"
            route="/?category=Cybersecurity"
          />
        </Float>

        {/* 2. Tech & AI Innovations */}
        <Float speed={1.8} rotationIntensity={0.3}>
          <NewsNode
            position={[4.5, 1.5, 1]}
            color="#38bdf8"
            icon="💻"
            category="Tech & Innovation"
            label="ข่าวเทคโนโลยี & AI"
            route="/?category=Tech"
          />
        </Float>

        {/* 3. น้อง Sai AI Assistant */}
        <Float speed={2} rotationIntensity={0.4}>
          <NewsNode
            position={[0, 3.2, -1]}
            color="#a855f7"
            icon="🤖"
            category="Interactive AI"
            label="สนทนากับน้อง Sai"
            route="/character"
          />
        </Float>

        {/* 4. Daily Brief Summary */}
        <Float speed={1.3} rotationIntensity={0.2}>
          <NewsNode
            position={[-3.8, -2.0, 1.8]}
            color="#06C755"
            icon="📰"
            category="Executive Brief"
            label="สรุปข่าวประจำวัน"
            route="/"
          />
        </Float>

        {/* 5. Favorites Library */}
        <Float speed={1.6} rotationIntensity={0.2}>
          <NewsNode
            position={[3.8, -2.0, 1.8]}
            color="#eab308"
            icon="❤️"
            category="Saved Collection"
            label="รายการข่าวโปรด"
            route="/?category=Favorites"
          />
        </Float>

        {/* Orbit & Smooth Zooming Controls */}
        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={16}
          autoRotate={true}
          autoRotateSpeed={0.7}
        />
      </Canvas>

      {/* Top Banner Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '10px 18px', color: '#fff' }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🌐 3D CYBER NEWS COMMAND HUB
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            ศูนย์บัญชาการวิเคราะห์ข่าวสาร CyberInsight
          </div>
        </div>
      </div>

      {/* Bottom Control Hint Overlay */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '8px 14px', color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔍 หมุน / ซูมเข้าออกได้ 360° | คลิกโหนดข่าวเพื่อเข้าสู่หมวดหมู่</span>
        </div>
      </div>
    </div>
  );
}
