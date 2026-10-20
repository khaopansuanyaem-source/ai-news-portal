'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './dashboard.css';
import { DashboardFilterProvider, useDashboardFilter } from './DashboardFilterContext';

function GlobalFilterBar() {
  const {
    timeRange,
    setTimeRange,
    category,
    setCategory,
    severity,
    setSeverity,
    platform,
    setPlatform,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useDashboardFilter();

  return (
    <div className="dashboard-global-filter">
      <div className="filter-group">
        <label>
          <span>ช่วงเวลา</span>
          {timeRange !== '7d' && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>• กำหนดเอง</span>}
        </label>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className={timeRange !== '7d' ? 'filter-active' : ''}
        >
          <option value="7d">7 วันล่าสุด</option>
          <option value="30d">30 วันล่าสุด</option>
          <option value="all">ทั้งหมด</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <span>หมวดหมู่</span>
          {category !== 'all' && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>• กำหนดเอง</span>}
        </label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className={category !== 'all' ? 'filter-active' : ''}
        >
          <option value="all">ทุกหมวดหมู่</option>
          <option value="tech">เทคโนโลยี</option>
          <option value="cyber">ความปลอดภัยไซเบอร์</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <span>ระดับความรุนแรง</span>
          {severity !== 'all' && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>• กำหนดเอง</span>}
        </label>
        <select 
          value={severity} 
          onChange={(e) => setSeverity(e.target.value)}
          className={severity !== 'all' ? 'filter-active' : ''}
        >
          <option value="all">ทุกระดับ</option>
          <option value="critical">วิกฤต (Critical)</option>
          <option value="high">สูง (High)</option>
          <option value="medium">ปานกลาง (Medium)</option>
          <option value="low">ต่ำ (Low)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <span>ระบบปฏิบัติการ / แพลตฟอร์ม</span>
          {platform !== 'all' && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>• กำหนดเอง</span>}
        </label>
        <select 
          value={platform} 
          onChange={(e) => setPlatform(e.target.value)}
          className={platform !== 'all' ? 'filter-active' : ''}
        >
          <option value="all">ทุกระบบ</option>
          <option value="Windows">Windows</option>
          <option value="macOS">macOS</option>
          <option value="Linux">Linux</option>
          <option value="Android">Android</option>
          <option value="iOS">iOS</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={resetFilters} 
          className="dashboard-reset-filter-btn"
          title="ล้างตัวกรองทั้งหมด"
        >
          <span>✕</span> ล้างตัวกรอง ({activeFilterCount})
        </button>
      )}
    </div>
  );
}

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
    <DashboardFilterProvider>
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
        <GlobalFilterBar />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </DashboardFilterProvider>
  );
}
