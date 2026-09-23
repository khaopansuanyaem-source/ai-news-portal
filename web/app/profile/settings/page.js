export default function SettingsPage() {
  return (
    <div className="profile-page-content">
      <h1 className="profile-page-title">การตั้งค่า</h1>

      <div className="settings-cards">
        {/* Newsletters */}
        <div className="profile-card profile-list-card">
          <div className="profile-list-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div className="profile-list-content">
            <h3>การรับข่าวสาร</h3>
            <p>รับข้อมูลข่าวสารเกี่ยวกับโปรโมชันและข้อเสนอพิเศษ</p>
          </div>
          <div className="profile-list-action">
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="profile-card profile-list-card settings-multi-row">
          <div className="settings-row-main">
            <div className="profile-list-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div className="profile-list-content">
              <h3>การแจ้งเตือน</h3>
              <p>อัปเดตการสั่งซื้อและข้อมูลของคุณ</p>
            </div>
            <div className="profile-list-action">
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          
          <div className="settings-sub-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              การแจ้งเตือน email
            </label>
            <label className="checkbox-container">
              <input type="checkbox" defaultChecked />
              <span className="checkmark"></span>
              การแจ้งเตือน Push
            </label>
          </div>
        </div>

        {/* Language */}
        <div className="profile-card profile-list-card">
          <div className="profile-list-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div className="profile-list-content">
            <h3>ภาษา</h3>
            <p>เปลี่ยนภาษา</p>
          </div>
          <div className="profile-list-action">
            <select className="language-select">
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="profile-card profile-list-card">
          <div className="profile-list-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
          <div className="profile-list-content">
            <h3>โหมด</h3>
            <p>Dark Mode</p>
          </div>
          <div className="profile-list-action">
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
