'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './dashboard.css';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'ภาพรวม', path: '/dashboard', exact: true },
    { name: 'ข่าวกรองภัยคุกคาม', path: '/dashboard/threat', exact: false },
    { name: 'ข่าวกรองเทคโนโลยี', path: '/dashboard/technology', exact: false },
    { name: 'วิเคราะห์ความเสี่ยง', path: '/dashboard/risk', exact: false },
    { name: 'แนวโน้มและการพยากรณ์', path: '/dashboard/trend', exact: false },
    { name: 'ศูนย์กลาง AI อัจฉริยะ', path: '/dashboard/ai-center', exact: false },
  ];

  return (
    <div className="dashboard-container">
      {/* Dashboard Sub-Navigation */}
      <div className="dashboard-subnav-wrapper">
        <nav className="dashboard-subnav">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`dashboard-subnav-item ${isActive ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global Filter Bar */}
      <div className="dashboard-global-filter">
        <div className="filter-group">
          <label>ช่วงเวลา</label>
          <select><option>7 วันล่าสุด</option><option>30 วันล่าสุด</option><option>ทั้งหมด</option></select>
        </div>
        <div className="filter-group">
          <label>หมวดหมู่</label>
          <select><option>ทุกหมวดหมู่</option><option>เทคโนโลยี</option><option>ความปลอดภัยไซเบอร์</option></select>
        </div>
        <div className="filter-group">
          <label>ระดับความรุนแรง</label>
          <select><option>ทุกระดับ</option><option>วิกฤต (Critical)</option><option>สูง (High)</option><option>ปานกลาง (Medium)</option><option>ต่ำ (Low)</option></select>
        </div>
        <div className="filter-group">
          <label>ระบบปฏิบัติการ / แพลตฟอร์ม</label>
          <select><option>ทุกระบบ</option><option>Windows</option><option>macOS</option><option>Linux</option><option>Android</option><option>iOS</option></select>
        </div>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}
