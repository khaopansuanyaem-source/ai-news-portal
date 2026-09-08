'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function AvatarScene({ isSpeaking, currentPhoneme, emotion, speechEnergy = 0 }) {
  const mountRef = useRef(null);
  const vrmRef = useRef(null);
  const requestRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Refs for latest props inside animation loop
  const emotionRef = useRef(emotion);
  const isSpeakingRef = useRef(isSpeaking);
  const phonemeRef = useRef(currentPhoneme);
  const speechEnergyRef = useRef(speechEnergy);

  useEffect(() => { emotionRef.current = emotion; }, [emotion]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { phonemeRef.current = currentPhoneme; }, [currentPhoneme]);
  useEffect(() => { speechEnergyRef.current = speechEnergy; }, [speechEnergy]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const motionScale = prefersReducedMotion ? 0.35 : 1;

    // --- Scene ---
    const scene = new THREE.Scene();

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20);
    camera.position.set(0, 1.32, isTouchDevice ? 1.45 : 1.2);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouchDevice ? 1.35 : 2));
    container.appendChild(renderer.domElement);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0);
    controls.enablePan = false; // เอาเลื่อน (Pan) ออกตามที่ผู้ใช้ต้องการ
    controls.enableZoom = false; // เอาซูมออกตามที่ผู้ใช้ต้องการ
    controls.enableRotate = !isTouchDevice && !prefersReducedMotion;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // ปลดล็อคมุมกล้องให้หมุนดูได้อิสระขึ้น มีชีวิตชีวา
    controls.minPolarAngle = Math.PI / 4; // ไม่ให้ก้มต่ำเกินไป
    controls.maxPolarAngle = Math.PI / 1.5; // ไม่ให้เงยสูงเกินไป
    controls.update();

    // --- Lights ---
    const dirLight = new THREE.DirectionalLight(0xffffff, Math.PI);
    dirLight.position.set(1, 1, 1).normalize();
    scene.add(dirLight);

    // Soft fill light from the left
    const fillLight = new THREE.DirectionalLight(0x88ccff, 1.5);
    fillLight.position.set(-1, 0.5, 0.5).normalize();
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 2.5);
    scene.add(ambientLight);

    // --- Blink state ---
    let nextBlinkTime = 2 + Math.random() * 4;
    let blinkPhase = 0; // 0 = open, 1 = closing, 2 = closed, 3 = opening
    let blinkTimer = 0;
    const BLINK_SPEED = 0.08; // seconds per phase

    // --- LookAt & Eye Gaze Saccades ---
    const lookAtTarget = new THREE.Object3D();
    lookAtTarget.position.set(0, 1.35, camera.position.z);
    scene.add(lookAtTarget);

    let nextSaccadeTime = 2.0;
    let saccadeTimer = 0;
    let saccadeOffsetX = 0;
    let saccadeOffsetY = 0;

    // --- Smooth Lip-sync & Mouse Tracking ---
    let currentMouthValue = 0;
    const MOUTH_LERP_SPEED = 12;
    let smoothedSpeaking = 0;
    let smoothedVoiceEnergy = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // --- VRM Loader ---
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/models/avatar.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm;
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        vrmRef.current = vrm;
        scene.add(vrm.scene);

        // Face camera
        vrm.scene.rotation.y = Math.PI;

        // Initialize LookAt Eye Tracking
        if (vrm.lookAt) {
          vrm.lookAt.target = lookAtTarget;
          vrm.lookAt.autoUpdate = true;
        }

        // Natural relaxed pose (arms gently resting, not stiff A-pose)
        if (vrm.humanoid) {
          try {
            vrm.humanoid.getNormalizedBoneNode('leftUpperArm').rotation.z = 1.25;
            vrm.humanoid.getNormalizedBoneNode('rightUpperArm').rotation.z = -1.25;
            vrm.humanoid.getNormalizedBoneNode('leftUpperArm').rotation.x = 0.08;
            vrm.humanoid.getNormalizedBoneNode('rightUpperArm').rotation.x = 0.08;
            vrm.humanoid.getNormalizedBoneNode('leftLowerArm').rotation.z = 0.28;
            vrm.humanoid.getNormalizedBoneNode('rightLowerArm').rotation.z = -0.28;
          } catch (e) { console.log('Bone adjust error', e); }
        }

        setLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
          setLoadProgress(percent);
        }
      },
      (err) => {
        console.error('Model not found:', err);
        setError('ไม่พบไฟล์โมเดล 3D (public/models/avatar.vrm)');
        setLoading(false);
      }
    );

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let lastEmotion = emotionRef.current;
    let happyGestureUntil = 0;

    const animate = () => {
      const deltaTime = clock.getDelta();
      const time = clock.getElapsedTime();
      const rawVoiceEnergy = isSpeakingRef.current ? speechEnergyRef.current : 0;
      
      // Smooth out transitions to prevent stuttering/jerking
      smoothedSpeaking += ((isSpeakingRef.current ? 1 : 0) - smoothedSpeaking) * Math.min(1, deltaTime * 6);
      smoothedVoiceEnergy += (rawVoiceEnergy - smoothedVoiceEnergy) * Math.min(1, deltaTime * 10);

      if (emotionRef.current !== lastEmotion) {
        if (emotionRef.current === 'happy') {
          happyGestureUntil = time + 2.4;
        }
        lastEmotion = emotionRef.current;
      }

      controls.update(); // Update controls for smooth damping

      // Smooth lerp mouse coordinates
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      if (vrmRef.current) {
        const vrm = vrmRef.current;
        const expressionManager = vrm.expressionManager;

        // ═══ 0. EYE GAZE TRACKING (LookAt with Saccades) ═══
        if (vrm.lookAt) {
          saccadeTimer += deltaTime;
          if (saccadeTimer > nextSaccadeTime) {
            saccadeTimer = 0;
            nextSaccadeTime = 1.6 + Math.random() * 2.4;
            // 75% eye contact on user/camera, 25% slight natural glance
            if (Math.random() < 0.25) {
              saccadeOffsetX = (Math.random() - 0.5) * 0.05;
              saccadeOffsetY = (Math.random() - 0.5) * 0.04;
            } else {
              saccadeOffsetX = 0;
              saccadeOffsetY = 0;
            }
          }

          const gazeX = camera.position.x + currentMouseX * 0.38 + saccadeOffsetX;
          const gazeY = 1.38 + currentMouseY * 0.22 + saccadeOffsetY;
          const gazeZ = camera.position.z;
          lookAtTarget.position.set(gazeX, gazeY, gazeZ);
        }

        // ═══ 1. SKELETAL CO-ROTATION & NATURAL BODY LANGUAGE ═══
        if (vrm.humanoid) {
          // Respiratory wave (smooth continuous breath)
          const breathCycle = time * 1.5;
          const breathSine = Math.sin(breathCycle);
          const breathLift = (breathSine + 1) * 0.5;

          const targetTurnY = currentMouseX * (isTouchDevice ? 0.08 : 0.38);
          const targetTurnX = currentMouseY * (isTouchDevice ? 0.05 : 0.24);

          // 1.1 Spine & Chest (Breathing expansion + subtle torso rotation)
          try {
            const spineNode = vrm.humanoid.getNormalizedBoneNode('spine');
            if (spineNode) {
              spineNode.rotation.x = (breathSine * 0.012 + (isSpeakingRef.current ? smoothedVoiceEnergy * 0.008 : 0)) * motionScale;
              spineNode.rotation.y = targetTurnY * 0.12 + Math.sin(time * 0.5) * 0.008 * motionScale;
              spineNode.rotation.z = Math.sin(time * 0.5) * 0.006 * motionScale;
            }

            const chestNode = vrm.humanoid.getNormalizedBoneNode('chest');
            if (chestNode) {
              chestNode.rotation.x = (breathSine * 0.016 + (isSpeakingRef.current ? smoothedVoiceEnergy * 0.012 : 0)) * motionScale;
              chestNode.rotation.y = targetTurnY * 0.18;
              chestNode.rotation.z = -targetTurnY * 0.02;
            }
          } catch(e) {}

          // 1.2 Neck (Carries 32% of turn to eliminate "stiff pole" neck)
          try {
            const neckNode = vrm.humanoid.getNormalizedBoneNode('neck');
            if (neckNode) {
              const neckRotY = targetTurnY * 0.32 + Math.sin(time * 0.6) * 0.012 * motionScale;
              const neckRotX = targetTurnX * 0.26 + (isSpeakingRef.current ? Math.sin(time * 3.5) * smoothedVoiceEnergy * 0.012 : 0);
              neckNode.rotation.y = neckRotY;
              neckNode.rotation.x = neckRotX;
              neckNode.rotation.z = targetTurnY * -0.03;
            }
          } catch(e) {}

          // 1.3 Head (Head turn + conversational nods & accent tilts)
          try {
            const headNode = vrm.humanoid.getNormalizedBoneNode('head');
            if (headNode) {
              const alertTilt = emotionRef.current === 'angry' ? 0.03 : 0;
              const thinkingTilt = (!isSpeakingRef.current && emotionRef.current === 'neutral')
                ? Math.sin(time * 0.45) * 0.05
                : 0;

              // Speech nodding: subtle rhythmic nod that accents speech cadence
              const speechNod = isSpeakingRef.current
                ? (Math.sin(time * 6.5) * 0.024 + Math.sin(time * 3.2) * 0.016) * Math.min(1, smoothedVoiceEnergy * 1.5)
                : 0;

              const speechSwayY = isSpeakingRef.current ? Math.sin(time * 2.2) * 0.02 * smoothedVoiceEnergy : 0;
              const speechTiltZ = isSpeakingRef.current ? Math.sin(time * 1.8) * 0.02 * smoothedVoiceEnergy : 0;

              const headRotY = targetTurnY * 0.50 + Math.sin(time * 0.4) * 0.016 * motionScale + speechSwayY;
              const headRotX = targetTurnX * 0.44 + Math.sin(time * 0.3) * 0.01 * motionScale + speechNod + alertTilt;
              const headRotZ = targetTurnY * -0.05 + Math.sin(time * 0.25) * 0.012 * motionScale + thinkingTilt + speechTiltZ;

              headNode.rotation.y = headRotY;
              headNode.rotation.x = headRotX;
              headNode.rotation.z = headRotZ;
            }
          } catch(e) {}

          // 1.4 Shoulders (Breathe with chest)
          try {
            const leftShoulder = vrm.humanoid.getNormalizedBoneNode('leftShoulder');
            const rightShoulder = vrm.humanoid.getNormalizedBoneNode('rightShoulder');
            if (leftShoulder) {
              leftShoulder.rotation.z = breathLift * 0.016 * motionScale;
              leftShoulder.rotation.x = breathSine * 0.008 * motionScale;
            }
            if (rightShoulder) {
              rightShoulder.rotation.z = -breathLift * 0.016 * motionScale;
              rightShoulder.rotation.x = breathSine * 0.008 * motionScale;
            }
          } catch(e) {}

          // 1.5 Relaxed Resting Arms & Hands (Kept still and relaxed down: แขนไม่ต้องขยับ)
          try {
            const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
            const rightHand = vrm.humanoid.getNormalizedBoneNode('rightHand');

            const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
            const leftHand = vrm.humanoid.getNormalizedBoneNode('leftHand');

            if (rightUpperArm) {
              rightUpperArm.rotation.set(0.08, 0, -1.25);
            }
            if (rightLowerArm) {
              rightLowerArm.rotation.set(0, -0.05, -0.28);
            }
            if (rightHand) {
              rightHand.rotation.set(0, 0, 0);
            }

            if (leftUpperArm) {
              leftUpperArm.rotation.set(0.08, 0, 1.25);
            }
            if (leftLowerArm) {
              leftLowerArm.rotation.set(0, 0.05, 0.28);
            }
            if (leftHand) {
              leftHand.rotation.set(0, 0, 0);
            }
          } catch(e) {}
        }

        // ═══ 2. BLINK ANIMATION ═══
        if (expressionManager) {
          blinkTimer += deltaTime;

          if (blinkPhase === 0 && blinkTimer >= nextBlinkTime) {
            // Start blink
            blinkPhase = 1;
            blinkTimer = 0;
          } else if (blinkPhase === 1) {
            // Closing
            const val = Math.min(1, blinkTimer / BLINK_SPEED);
            expressionManager.setValue('blink', val);
            if (val >= 1) { blinkPhase = 2; blinkTimer = 0; }
          } else if (blinkPhase === 2) {
            // Closed briefly
            expressionManager.setValue('blink', 1);
            if (blinkTimer > 0.05) { blinkPhase = 3; blinkTimer = 0; }
          } else if (blinkPhase === 3) {
            // Opening
            const val = Math.max(0, 1 - blinkTimer / BLINK_SPEED);
            expressionManager.setValue('blink', val);
            if (val <= 0) {
              blinkPhase = 0;
              blinkTimer = 0;
              // Randomize next blink: 2-6 seconds
              nextBlinkTime = 2 + Math.random() * 4;
              // Occasional double blink
              if (Math.random() < 0.2) nextBlinkTime = 0.3;
            }
          }

          // ═══ 3. DYNAMIC NATURAL LIP-SYNC ═══
          let targetOpenness = 0;
          let activePhoneme = 'aa';

          if (isSpeakingRef.current) {
            // Voice energy from audio analyzer
            const audioVol = Math.max(speechEnergyRef.current, smoothedVoiceEnergy);
            
            // Calm, natural speech rhythm (~2.5 syllables per sec, matching natural speech flow)
            const speechRhythm = (Math.sin(time * 8.5) * 0.5 + 0.5); // smooth 0 to 1

            if (audioVol > 0.03) {
              // Smooth volume-driven mouth opening (gentle comfortable anime speaking range)
              targetOpenness = Math.min(0.48, Math.max(0.10, audioVol * 0.62));
            } else {
              // Gentle speaking rhythm fallback
              targetOpenness = 0.12 + speechRhythm * 0.30;
            }

            // Map current phoneme for expressive mouth shapes
            if (phonemeRef.current === 'ih' || phonemeRef.current === 'E') {
              activePhoneme = 'ee';
            } else if (phonemeRef.current === 'ou') {
              activePhoneme = 'ou';
            } else if (phonemeRef.current === 'oh') {
              activePhoneme = 'oh';
            } else {
              activePhoneme = 'aa';
            }
          } else {
            targetOpenness = 0;
          }

          // Gentle, organic lerp (deltaTime * 9) — eliminates all rapid jitter and fluttering
          currentMouthValue += (targetOpenness - currentMouthValue) * Math.min(1, deltaTime * 9);

          // Smoothly interpolate all mouth shapes (seamless morphing between vowels)
          ['aa', 'ih', 'ou', 'ee', 'oh'].forEach(ph => {
            const cur = expressionManager.getValue(ph) || 0;
            const target = (ph === activePhoneme && isSpeakingRef.current && currentMouthValue > 0.02)
              ? currentMouthValue
              : 0;
            expressionManager.setValue(ph, cur + (target - cur) * Math.min(1, deltaTime * 10));
          });

          // ═══ 4. EMOTION ═══
          // Keep emotion weights gentle so eyes don't squint shut and mouth doesn't distort
          const isSpeakingNow = isSpeakingRef.current;
          const emotionCaps = {
            happy: isSpeakingNow ? 0.28 : 0.38,   // Subtle smile with wide, bright eyes
            relaxed: isSpeakingNow ? 0.30 : 0.40,
            sad: isSpeakingNow ? 0.25 : 0.35,
            angry: isSpeakingNow ? 0.25 : 0.35,
            neutral: 0
          };

          ['neutral', 'happy', 'angry', 'sad', 'relaxed'].forEach(em => {
            const currentVal = expressionManager.getValue(em) || 0;
            const maxCap = emotionCaps[em] || 0.3;
            const target = em === emotionRef.current ? maxCap : 0;
            expressionManager.setValue(em, currentVal + (target - currentVal) * deltaTime * 3.5);
          });

          expressionManager.update();
        }

        vrm.update(deltaTime);
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} ref={mountRef}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', zIndex: 20 }}>
          <div style={{ color: '#38bdf8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px', width: '100%', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginBottom: '6px' }}>กำลังโหลด Sai (3D Avatar)</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {loadProgress > 0 ? `ดาวน์โหลดโมเดล ${loadProgress}%` : 'กำลังเชื่อมต่อทรัพยากร...'}
              </div>
            </div>
            {loadProgress > 0 && (
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${loadProgress}%`, height: '100%', backgroundColor: '#38bdf8', transition: 'width 0.2s ease', borderRadius: '99px' }}></div>
              </div>
            )}
          </div>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', textAlign: 'center', padding: '32px', zIndex: 20 }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '12px', padding: '24px', maxWidth: '400px' }}>
            <h3 style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Avatar Missing</h3>
            <p style={{ color: '#d1d5db', fontSize: '14px' }}>
              กรุณาดาวน์โหลดโมเดล VRM (เช่น จาก VRoid Hub) 
              และนำไปวางไว้ที่ <code>web/public/models/avatar.vrm</code>
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
