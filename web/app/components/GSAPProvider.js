'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

// Register GSAP Plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Draggable);
}

// ─── Custom SplitText (Free Implementation) ───
export function splitText(element) {
  if (!element) return [];
  const text = element.textContent;
  element.innerHTML = '';
  const chars = [];
  
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.overflow = 'hidden';
    
    const inner = document.createElement('span');
    inner.textContent = text[i] === ' ' ? '\u00A0' : text[i];
    inner.style.display = 'inline-block';
    inner.style.transform = 'translateY(120%)';
    
    span.appendChild(inner);
    element.appendChild(span);
    chars.push(inner);
  }
  
  return chars;
}

// ─── Magnetic Button Effect ───
export function magneticEffect(element, strength = 0.3) {
  if (!element) return;
  
  const handleMove = (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out'
    });
  };
  
  const handleLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)'
    });
  };
  
  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);
  
  return () => {
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
  };
}

// ─── Custom Cursor Component ───
export function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'none'
      });
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out'
      });
    };

    // Scale up on hover over links/buttons
    const handleHoverIn = () => {
      gsap.to(cursor, { scale: 0.5, opacity: 0.5, duration: 0.3 });
      gsap.to(follower, { scale: 1.8, opacity: 1, duration: 0.3, mixBlendMode: 'difference' });
    };
    const handleHoverOut = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 0.4, duration: 0.3, mixBlendMode: 'normal' });
    };

    window.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll('a, button, .news-card, .sidebar-item');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverIn);
      el.addEventListener('mouseleave', handleHoverOut);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverIn);
        el.removeEventListener('mouseleave', handleHoverOut);
      });
    };
  }, []);

  // Hide custom cursor on mobile/touch devices
  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          position: 'fixed',
          top: -5,
          left: -5,
          width: 10,
          height: 10,
          background: '#a855f7',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)'
        }}
      />
      <div
        ref={followerRef}
        className="custom-cursor-follower"
        style={{
          position: 'fixed',
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          border: '1.5px solid rgba(168, 85, 247, 0.5)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0.4,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </>
  );
}

// ─── GSAP Provider ───
export default function GSAPProvider({ children }) {
  useEffect(() => {
    // Global GSAP defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8
    });

    // Refresh ScrollTrigger on route change
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
