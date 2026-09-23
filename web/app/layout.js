import './globals.css';
import Link from 'next/link';
import GSAPProvider, { CustomCursor } from './components/GSAPProvider';
import NavbarSearch from './components/NavbarSearch';
import DarkModeToggle from './components/DarkModeToggle';
import NavbarProfile, { BottomNavProfile } from './components/NavbarProfile';

export const metadata = {
  title: 'CyberInsight AI',
  description: 'ระบบรวบรวม วิเคราะห์ และสรุปข่าวเทคโนโลยีและไซเบอร์ซิเคียวริตี้ด้วย AI',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GSAPProvider>
          <CustomCursor />
          <header className="top-navbar">
            <div className="navbar-container">
              <div className="brand-logo">
                <span className="brand-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </span>
                <Link href="/" className="brand-text">
                  Cyber<span className="text-gradient">Insight</span>
                  <span className="brand-ai-badge"><span className="pulse-dot"></span>AI 5.0</span>
                </Link>
              </div>

              <nav className="main-nav">
                <Link href="/" className="nav-link">หน้าหลัก</Link>
                <Link href="/?category=Favorites" className="nav-link">
                  ติดตาม
                </Link>
                <Link href="/character" className="nav-link cyberpunk-sai-btn">
                  คุยกับ SAI
                </Link>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <NavbarSearch />
                <NavbarProfile />
                <DarkModeToggle />
              </div>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>
          
          <nav className="mobile-bottom-nav glass">
            <Link href="/" className="bottom-nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span className="label">Home</span>
            </Link>
            <Link href="/?category=Favorites" className="bottom-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span className="label">ติดตาม</span>
            </Link>
            <Link href="/character" className="bottom-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="label">คุยกับSAI</span>
            </Link>
            <BottomNavProfile />
          </nav>
          
          <footer className="footer-bar">
            <div className="navbar-container">
              <p>© 2026 AI News Portal. All rights reserved.</p>
            </div>
          </footer>
        </GSAPProvider>
      </body>
    </html>
  );
}
