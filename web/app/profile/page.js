"use client";

import { useState, useEffect, useRef } from "react";

export default function PersonalInfoPage() {
  const [profile, setProfile] = useState({
    firstName: "Linda",
    lastName: "Yadee",
    phone: "089-123-4567",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  });

  const [form, setForm] = useState({
    firstName: "Linda",
    lastName: "Yadee",
    phone: "089-123-4567"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cyber_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(prev => ({ ...prev, ...parsed }));
        setForm({
          firstName: parsed.firstName || "Linda",
          lastName: parsed.lastName || "Yadee",
          phone: parsed.phone || "089-123-4567"
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 3500);
  };

  // Handle Photo Upload from local machine
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP, ฯลฯ)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const updated = { ...profile, avatar: dataUrl };
      setProfile(updated);

      try {
        localStorage.setItem("cyber_user_profile", JSON.stringify(updated));
        window.dispatchEvent(new Event("profileUpdated"));
        showToast("✓ เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = () => {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone
    });
    setIsEditing(true);
  };

  const handleSaveInfo = (e) => {
    if (e) e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    const updated = {
      ...profile,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim()
    };

    setProfile(updated);
    setIsEditing(false);

    try {
      localStorage.setItem("cyber_user_profile", JSON.stringify(updated));
      window.dispatchEvent(new Event("profileUpdated"));
      showToast("✓ บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page-content">
      <h1 className="profile-page-title">ข้อมูลส่วนตัว</h1>

      {toastMsg && (
        <div className="profile-toast-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Card */}
      <div className="profile-card profile-hero-card">
        <div className="profile-hero-content">
          <div 
            className="profile-hero-avatar"
            onClick={() => fileInputRef.current?.click()}
            title="คลิกเพื่อเปลี่ยนรูปภาพจากเครื่อง"
          >
            <img 
              src={profile.avatar} 
              alt={`${profile.firstName} ${profile.lastName}`} 
              className="avatar-img-lg"
            />
            <div className="avatar-upload-overlay">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>เปลี่ยนรูป</span>
            </div>
            <button 
              type="button" 
              className="avatar-badge-btn" 
              aria-label="เปลี่ยนรูปโปรไฟล์"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>

          <div className="profile-hero-info">
            <h2 className="profile-hero-name">{profile.firstName} {profile.lastName}</h2>
            <div className="profile-hero-phone">{profile.phone}</div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          accept="image/*" 
          style={{ display: "none" }} 
        />

        {isEditing ? (
          <div className="profile-actions-group">
            <button type="button" className="profile-save-btn" onClick={handleSaveInfo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              บันทึกข้อมูล
            </button>
            <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
              ยกเลิก
            </button>
          </div>
        ) : (
          <button type="button" className="profile-edit-btn" onClick={handleStartEdit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            แก้ไขข้อมูล
          </button>
        )}
      </div>

      {/* Basic Info Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>ข้อมูลพื้นฐาน</h3>
            {!isEditing && (
              <span className="profile-edit-hint" onClick={handleStartEdit}>
                คลิกเพื่อแก้ไข
              </span>
            )}
          </div>
        </div>
        <div className="profile-card-body">
          <form onSubmit={handleSaveInfo} className="profile-form">
            <div className="form-group">
              <label>ชื่อ</label>
              <input 
                type="text" 
                className={`form-control ${isEditing ? 'editable' : 'readonly'}`}
                value={isEditing ? form.firstName : profile.firstName} 
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                onClick={() => { if (!isEditing) handleStartEdit(); }}
                placeholder="กรุณากรอกชื่อ"
              />
            </div>
            <div className="form-group">
              <label>นามสกุล</label>
              <input 
                type="text" 
                className={`form-control ${isEditing ? 'editable' : 'readonly'}`}
                value={isEditing ? form.lastName : profile.lastName} 
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                onClick={() => { if (!isEditing) handleStartEdit(); }}
                placeholder="กรุณากรอกนามสกุล"
              />
            </div>
            <div className="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input 
                type="text" 
                className={`form-control ${isEditing ? 'editable' : 'readonly'}`}
                value={isEditing ? form.phone : profile.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                onClick={() => { if (!isEditing) handleStartEdit(); }}
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
              />
            </div>

            {isEditing && (
              <div className="form-submit-row">
                <button type="submit" className="profile-save-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  บันทึกข้อมูล
                </button>
                <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
                  ยกเลิก
                </button>
              </div>
            )}
          </form>

          {/* Connected Accounts */}
          <div className="connected-accounts">
            <div className="account-item">
              <div className="account-logo line-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" />
              </div>
              <div className="account-name">LINE</div>
              <div className="account-status disconnected">ยังไม่เชื่อมต่อ</div>
            </div>
            <div className="account-item">
              <div className="account-logo google-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
              </div>
              <div className="account-name">Google</div>
              <div className="account-status connected">เชื่อมต่อแล้ว</div>
            </div>
            <div className="account-item">
              <div className="account-logo apple-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="dark-invert" />
              </div>
              <div className="account-name">Apple</div>
              <div className="account-status disconnected">ยังไม่เชื่อมต่อ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
