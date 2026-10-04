'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './dashboard.css';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', path: '/dashboard', exact: true },
    { name: 'Threat Intelligence', path: '/dashboard/threat', exact: false },
    { name: 'Technology Intelligence', path: '/dashboard/technology', exact: false },
    { name: 'Risk Analysis', path: '/dashboard/risk', exact: false },
    { name: 'Trend & Forecast', path: '/dashboard/trend', exact: false },
    { name: 'AI Intelligence Center', path: '/dashboard/ai-center', exact: false },
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

      {/* Global Filter Bar Placeholder (will be extracted into a component later) */}
      <div className="dashboard-global-filter">
        <div className="filter-group">
          <label>Date Range</label>
          <select><option>Last 7 Days</option><option>Last 30 Days</option><option>All Time</option></select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select><option>All Categories</option><option>Technology</option><option>Cybersecurity</option></select>
        </div>
        <div className="filter-group">
          <label>Severity</label>
          <select><option>All Levels</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="filter-group">
          <label>OS / Platform</label>
          <select><option>All Systems</option><option>Windows</option><option>macOS</option><option>Linux</option><option>Android</option><option>iOS</option></select>
        </div>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}
