import './globals.css';
import Link from 'next/link';
import GSAPProvider, { CustomCursor } from './components/GSAPProvider';
import NavbarSearch from './components/NavbarSearch';

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
                <Link href="/?category=Favorites" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <span>รายการโปรด</span> <span style={{fontSize: '11px', background: 'rgba(239,68,68,0.25)', padding: '1px 6px', borderRadius: '10px', color: '#f87171'}}>❤️</span>
                </Link>
                <a href="/newsroom.html" target="_blank" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '700'}}>
                  <span>🏢</span> ห้องข่าวสด AI <span style={{fontSize: '10px', background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8', padding: '1px 6px', borderRadius: '10px', color: '#38bdf8'}}>LIVE</span>
                </a>
                <Link href="/character" className="nav-link cyberpunk-sai-btn">
                  <span>🤖</span> คุยกับ Sai
                </Link>
              </nav>

              <NavbarSearch />
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>
          
          <nav className="mobile-bottom-nav glass">
            <Link href="/" className="bottom-nav-item">
              <span className="icon">
                <svg viewBox="0 0 24 24"><path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              </span>
              <span className="label">หน้าหลัก</span>
            </Link>
            <Link href="/?category=Favorites" className="bottom-nav-item">
              <span className="icon">
                <svg viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </span>
              <span className="label">โปรด</span>
            </Link>
            <Link href="/character" className="bottom-nav-item">
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <span className="label">น้อง Sai</span>
            </Link>
            <a href="/newsroom.html" target="_blank" className="bottom-nav-item">
              <span className="icon">🏢</span>
              <span className="label">ห้องข่าวสด</span>
            </a>
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
