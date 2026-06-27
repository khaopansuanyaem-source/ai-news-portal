import './globals.css';

export const metadata = {
  title: 'AI News Portal',
  description: 'Traditional News Portal Interface',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="top-navbar">
          <div className="navbar-container">
            <div className="brand-logo">
              <span className="brand-icon">📺</span>
              <span className="brand-text">AI NEWS</span>
            </div>
            <nav className="main-nav">
              <a href="/" className="nav-link active">หน้าหลัก (Home)</a>
              <a href="/settings" className="nav-link">ตั้งค่าหมวดหมู่ (Settings)</a>
            </nav>
            <div className="search-bar-mock">
              <input type="text" placeholder="ค้นหาข่าว..." suppressHydrationWarning />
              <button suppressHydrationWarning>🔍</button>
            </div>
          </div>
        </header>
        
        {/* Category Sub-nav bar */}
        <div className="category-navbar">
          <div className="navbar-container">
            <a href="/">ทั้งหมด</a>
            <a href="/?category=Domestic">ในประเทศ</a>
            <a href="/?category=World">ต่างประเทศ</a>
            <a href="/?category=Politics">การเมือง</a>
            <a href="/?category=Finance">เศรษฐกิจ</a>
            <a href="/?category=Social">สังคม</a>
            <a href="/?category=Sports">กีฬา</a>
            <a href="/?category=Tech">เทคโนโลยี</a>
            <a href="/?category=Entertainment">บันเทิง</a>
            <a href="/?category=Business">ธุรกิจ</a>
          </div>
        </div>

        <main className="main-content">
          {children}
        </main>
        
        <footer className="footer-bar">
          <div className="navbar-container">
            <p>© 2026 AI News Portal. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
