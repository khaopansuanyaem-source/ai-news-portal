'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NavbarProfile() {
  const [avatar, setAvatar] = useState('https://randomuser.me/api/portraits/women/44.jpg');

  useEffect(() => {
    const updateAvatar = () => {
      try {
        const saved = localStorage.getItem('cyber_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.avatar) {
            setAvatar(parsed.avatar);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateAvatar();
    window.addEventListener('profileUpdated', updateAvatar);
    return () => window.removeEventListener('profileUpdated', updateAvatar);
  }, []);

  return (
    <Link 
      href="/profile" 
      className="hide-on-mobile navbar-profile-link" 
      aria-label="User Profile"
    >
      <div className="navbar-avatar-wrapper" title="โปรไฟล์ผู้ใช้">
        <img 
          src={avatar} 
          alt="User Profile" 
          className="navbar-avatar-img"
        />
      </div>
    </Link>
  );
}

export function BottomNavProfile() {
  const [avatar, setAvatar] = useState('https://randomuser.me/api/portraits/women/44.jpg');

  useEffect(() => {
    const updateAvatar = () => {
      try {
        const saved = localStorage.getItem('cyber_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.avatar) {
            setAvatar(parsed.avatar);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateAvatar();
    window.addEventListener('profileUpdated', updateAvatar);
    return () => window.removeEventListener('profileUpdated', updateAvatar);
  }, []);

  return (
    <Link href="/profile" className="bottom-nav-item">
      <div className="bottom-nav-avatar-wrapper">
        <img 
          src={avatar} 
          alt="Profile" 
          className="bottom-nav-avatar-img" 
        />
      </div>
      <span className="label">Profile</span>
    </Link>
  );
}
