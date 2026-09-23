"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./profile.css";

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState({
    firstName: "Linda",
    lastName: "Yadee",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  });

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem("cyber_user_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile(prev => ({
            ...prev,
            firstName: parsed.firstName || prev.firstName,
            lastName: parsed.lastName || prev.lastName,
            avatar: parsed.avatar || prev.avatar
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadProfile();
    window.addEventListener("profileUpdated", loadProfile);
    return () => window.removeEventListener("profileUpdated", loadProfile);
  }, []);

  return (
    <div className="profile-container">
      {/* Sidebar / Top Nav on Mobile */}
      <aside className="profile-sidebar">
        {/* User Info (Hidden on mobile tab bar, or simplified) */}
        <div className="profile-sidebar-header">
          <div className="profile-sidebar-avatar">
            <img 
              src={profile.avatar} 
              alt={`${profile.firstName} ${profile.lastName}`} 
              width={64} 
              height={64} 
              className="avatar-img"
            />
          </div>
          <div className="profile-sidebar-name">{profile.firstName} {profile.lastName}</div>
        </div>

        {/* Navigation Sections */}
        <div className="profile-sidebar-nav">
          <div className="profile-nav-section">
            <div className="profile-nav-heading">MY ACCOUNT</div>
            <Link 
              href="/profile" 
              className={`profile-nav-item ${pathname === '/profile' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>ข้อมูลส่วนตัว</span>
            </Link>
            <Link 
              href="/profile/security" 
              className={`profile-nav-item ${pathname === '/profile/security' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <span>ความปลอดภัยบัญชี</span>
            </Link>
            <Link 
              href="/profile/settings" 
              className={`profile-nav-item ${pathname === '/profile/settings' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>การตั้งค่าการใช้งาน</span>
            </Link>
          </div>

          <div className="profile-nav-section">
            <div className="profile-nav-heading">MY ORDERS</div>
            <Link href="/pricing" className="profile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>สมัครสมาชิก</span>
            </Link>
          </div>

          <div className="profile-nav-section hide-on-mobile" style={{ marginTop: 'auto' }}>
            <div className="profile-nav-heading">SYSTEM</div>
            <Link href="#" className="profile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>ออกจากระบบ</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="profile-content">
        {children}
      </div>
    </div>
  );
}
