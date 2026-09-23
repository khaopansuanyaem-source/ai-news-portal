"use client";

import { useState } from 'react';

export default function SecurityPage() {
  const [openSection, setOpenSection] = useState(null);
  
  const [socials, setSocials] = useState({
    line: false,
    google: true,
    apple: false
  });

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleSocial = (provider) => {
    setSocials(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="profile-page-content">
      <h1 className="profile-page-title">ความปลอดภัยของบัญชี</h1>

      <div className="security-cards">
        {/* Change Password */}
        <div className={`profile-card profile-list-card ${openSection === 'password' ? 'settings-multi-row' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSection('password')}>
          <div className="settings-row-main">
            <div className="profile-list-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className="profile-list-content">
              <h3>เปลี่ยนรหัสผ่าน</h3>
              <p>เปลี่ยนรหัสผ่านใหม่เพื่อความปลอดภัย</p>
            </div>
            <div className="profile-list-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openSection === 'password' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          {openSection === 'password' && (
            <div className="settings-sub-options" onClick={e => e.stopPropagation()}>
              <div className="profile-form" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>รหัสผ่านเดิม</label>
                  <input type="password" placeholder="รหัสผ่านปัจจุบัน" className="form-control editable" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>รหัสผ่านใหม่</label>
                  <input type="password" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" className="form-control editable" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>ยืนยันรหัสผ่านใหม่</label>
                  <input type="password" placeholder="ใส่รหัสผ่านใหม่อีกครั้ง" className="form-control editable" />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button className="profile-save-btn" onClick={() => { alert('บันทึกรหัสผ่านใหม่สำเร็จ!'); toggleSection(null); }}>อัปเดตรหัสผ่าน</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className={`profile-card profile-list-card ${openSection === 'social' ? 'settings-multi-row' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSection('social')}>
          <div className="settings-row-main">
            <div className="profile-list-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div className="profile-list-content">
              <h3>บัญชีโซเชียลมีเดีย</h3>
              <p>ตรวจสอบบัญชีโซเชียลมีเดียที่คุณกำลังเชื่อมต่อ</p>
            </div>
            <div className="profile-list-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openSection === 'social' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          {openSection === 'social' && (
            <div className="settings-sub-options" onClick={e => e.stopPropagation()}>
              <div className="connected-accounts" style={{ marginTop: '10px' }}>
                {/* LINE */}
                <div className="account-item">
                  <div className="account-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" style={{ width: '32px', height: '32px' }} />
                  </div>
                  <div className="account-name">LINE</div>
                  <button 
                    className={`account-status ${socials.line ? 'connected' : 'disconnected'}`}
                    onClick={() => toggleSocial('line')}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {socials.line ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                  </button>
                </div>
                {/* Google */}
                <div className="account-item">
                  <div className="account-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '28px', height: '28px' }} />
                  </div>
                  <div className="account-name">Google</div>
                  <button 
                    className={`account-status ${socials.google ? 'connected' : 'disconnected'}`}
                    onClick={() => toggleSocial('google')}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {socials.google ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                  </button>
                </div>
                {/* Apple */}
                <div className="account-item">
                  <div className="account-logo">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="dark-invert">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.948h-1.928v-4.938H9.123L12 7.052l2.877 4.958h-1.949v4.938z" style={{display: 'none'}}></path>
                      <path d="M16.3 14.4c-.1-.8.2-1.6.8-2.1.8-.7 1.2-1.6 1-2.6-.2-1.1-1-1.9-2-2.3-1.1-.4-2.2-.2-3.1.3-.4.2-.8.3-1.2.3-.4 0-.8-.1-1.2-.3-.9-.5-2-.7-3.1-.3-1 .4-1.8 1.2-2 2.3-.3 1.5.3 3.1 1.4 4.3 1 1.2 2.2 2 3.5 2.1h.3c.4 0 .9-.2 1.3-.4.4-.2.8-.2 1.2-.2.4 0 .8.1 1.2.2.4.2.9.4 1.3.4h.3c1.3-.1 2.5-.9 3.5-2.1.4-.4.6-.9.8-1.5-.6-.2-1.1-.7-1.1-1.3zM12 7.2c.7 0 1.4-.3 1.9-.8.5-.5.8-1.2.8-1.9 0-.2 0-.4-.1-.5-.7.1-1.4.4-1.9.9-.5.5-.8 1.2-.8 1.9 0 .2 0 .4.1.5z"></path>
                    </svg>
                  </div>
                  <div className="account-name">Apple</div>
                  <button 
                    className={`account-status ${socials.apple ? 'connected' : 'disconnected'}`}
                    onClick={() => toggleSocial('apple')}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {socials.apple ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logged in Devices */}
        <div className="profile-card profile-list-card" style={{ marginBottom: '16px' }}>
          <div className="settings-row-main" style={{ padding: 0 }}>
            <div className="profile-list-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div className="profile-list-content">
              <h3>อุปกรณ์ที่เข้าสู่ระบบ</h3>
              <p>ตรวจสอบอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณ</p>
            </div>
          </div>
        </div>

        {/* Device Cards */}
        <div className="device-cards-grid">
          <div className="device-card">
            <div className="device-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div className="device-info">
              <h4>Macbook Pro</h4>
              <p>ตรัง,ไทย 115.90.123.345</p>
              <span className="device-badge active">กำลังใช้งาน</span>
            </div>
          </div>
          
          <div className="device-card">
            <div className="device-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <div className="device-info">
              <h4>iPhone</h4>
              <p>สงขลา,ไทย 142.54.35.896.900</p>
              <span className="device-badge inactive">ใช้งานเมื่อ 1 ชั่วโมงที่แล้ว</span>
            </div>
          </div>
        </div>

        <button className="logout-all-btn" onClick={() => alert('ทำการออกจากระบบทุกอุปกรณ์เรียบร้อยแล้ว')}>ออกจากระบบทุกอุปกรณ์</button>
      </div>
    </div>
  );
}
