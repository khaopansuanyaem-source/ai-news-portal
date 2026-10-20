'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { overviewMockData } from './mockData';
import { useDashboardFilter } from './DashboardFilterContext';
import { supabase } from '../../utils/supabase';
import { getOsClassification } from '../../utils/osClassifier';

export default function DashboardOverview() {
  const { 
    timeRange, 
    category, 
    severity, 
    platform, 
    resetFilters, 
    hasActiveFilters 
  } = useDashboardFilter();

  const [realNews, setRealNews] = useState([]);

  // Fetch real articles from Supabase to augment the news pool
  useEffect(() => {
    async function fetchSupabaseArticles() {
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(30);

        if (!error && data && data.length > 0) {
          const formatted = data.map((item, idx) => {
            const rawCat = (item.category || '').toLowerCase();
            const isTech = rawCat.includes('tech') || rawCat.includes('ai') || rawCat.includes('เทคโนโลยี');
            const categoryLabel = isTech ? 'เทคโนโลยี' : 'ความปลอดภัยไซเบอร์';
            
            const rawImpact = (item.impact_level || '').toLowerCase();
            let sev = 'ปานกลาง';
            let score = 65;
            if (rawImpact.includes('crit') || rawImpact.includes('วิกฤต')) {
              sev = 'วิกฤต';
              score = 92 + (idx % 6);
            } else if (rawImpact.includes('high') || rawImpact.includes('สูง')) {
              sev = 'สูง';
              score = 80 + (idx % 8);
            } else if (rawImpact.includes('low') || rawImpact.includes('ต่ำ')) {
              sev = 'ต่ำ';
              score = 35 + (idx % 10);
            }

            // Estimate OS classification
            let osType = 'หลายแพลตฟอร์ม';
            try {
              const detected = getOsClassification((item.title || '') + ' ' + (item.summary || ''));
              if (detected && detected.length > 0) {
                osType = detected[0].os;
              }
            } catch {
              osType = 'หลายแพลตฟอร์ม';
            }

            // Calculate days ago
            let daysAgo = 1;
            if (item.published_at) {
              const diffMs = Date.now() - new Date(item.published_at).getTime();
              daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            }

            return {
              id: `db-${item.id || idx}`,
              headline: item.title,
              category: categoryLabel,
              topic: item.source || 'ข่าวกรอง',
              riskScore: score,
              severity: sev,
              source: item.source || 'CyberInsight',
              publishedAt: daysAgo === 0 ? 'วันนี้' : `${daysAgo} วันที่แล้ว`,
              daysAgo,
              os: osType,
              url: item.url
            };
          });
          setRealNews(formatted);
        }
      } catch (err) {
        console.warn('Could not load real news articles:', err);
      }
    }

    fetchSupabaseArticles();
  }, []);

  // Merge static intelligence mock pool + dynamic database news
  const allArticlesPool = useMemo(() => {
    return [...overviewMockData.latestHighRiskNews, ...realNews];
  }, [realNews]);

  // Filtered latest news list
  const filteredNews = useMemo(() => {
    return allArticlesPool.filter(news => {
      // 1. Time range filter
      if (timeRange === '7d' && news.daysAgo > 7) return false;
      if (timeRange === '30d' && news.daysAgo > 30) return false;

      // 2. Category filter
      if (category === 'tech' && news.category !== 'เทคโนโลยี') return false;
      if (category === 'cyber' && news.category !== 'ความปลอดภัยไซเบอร์') return false;

      // 3. Severity filter
      if (severity === 'critical' && news.severity !== 'วิกฤต') return false;
      if (severity === 'high' && news.severity !== 'สูง') return false;
      if (severity === 'medium' && news.severity !== 'ปานกลาง') return false;
      if (severity === 'low' && news.severity !== 'ต่ำ') return false;

      // 4. Platform filter
      if (platform !== 'all') {
        const osLower = (news.os || '').toLowerCase();
        const targetLower = platform.toLowerCase();
        const matches = osLower.includes(targetLower) || news.os === 'หลายแพลตฟอร์ม';
        if (!matches) return false;
      }

      return true;
    });
  }, [allArticlesPool, timeRange, category, severity, platform]);

  // Dynamic KPI Calculation based on filters
  const dynamicKpis = useMemo(() => {
    // Base counts for (7d, all, all, all)
    let totalBase = 12450;
    let techBase = 8240;
    let cyberBase = 4210;
    let highRiskBase = 342;

    // Time scaling multiplier
    let timeScale = 1.0;
    if (timeRange === '30d') timeScale = 3.93;
    if (timeRange === 'all') timeScale = 10.31;

    // Platform share multiplier
    let platformScale = 1.0;
    if (platform === 'Windows') platformScale = 0.45;
    else if (platform === 'Linux') platformScale = 0.28;
    else if (platform === 'macOS') platformScale = 0.16;
    else if (platform === 'Android') platformScale = 0.08;
    else if (platform === 'iOS') platformScale = 0.05;

    let computedTotal = Math.round(totalBase * timeScale * platformScale);
    let computedTech = Math.round(techBase * timeScale * platformScale);
    let computedCyber = Math.round(cyberBase * timeScale * platformScale);
    let computedHighRisk = Math.round(highRiskBase * timeScale * platformScale);

    // Category overrides
    if (category === 'tech') {
      computedCyber = 0;
      computedTotal = computedTech;
      computedHighRisk = Math.round(computedTech * 0.015);
    } else if (category === 'cyber') {
      computedTech = 0;
      computedTotal = computedCyber;
      computedHighRisk = Math.round(computedCyber * 0.081);
    }

    // Severity overrides
    if (severity === 'critical') {
      computedHighRisk = Math.round(computedHighRisk * 0.38);
      computedTotal = computedHighRisk;
      computedTech = Math.round(computedHighRisk * 0.15);
      computedCyber = computedTotal - computedTech;
    } else if (severity === 'high') {
      computedHighRisk = Math.round(computedHighRisk * 0.62);
      computedTotal = computedHighRisk;
      computedTech = Math.round(computedHighRisk * 0.25);
      computedCyber = computedTotal - computedTech;
    } else if (severity === 'medium') {
      computedTotal = Math.round(computedTotal * 0.42);
      computedTech = Math.round(computedTotal * 0.65);
      computedCyber = computedTotal - computedTech;
      computedHighRisk = 0;
    } else if (severity === 'low') {
      computedTotal = Math.round(computedTotal * 0.35);
      computedTech = Math.round(computedTotal * 0.78);
      computedCyber = computedTotal - computedTech;
      computedHighRisk = 0;
    }

    return [
      { id: 'total-news', label: 'ข่าวที่วิเคราะห์ทั้งหมด', value: computedTotal.toLocaleString(), trend: 12.5, status: 'up' },
      { id: 'tech-news', label: 'ข่าวเทคโนโลยี', value: computedTech.toLocaleString(), trend: 8.2, status: 'up' },
      { id: 'cyber-news', label: 'ข่าวความปลอดภัยไซเบอร์', value: computedCyber.toLocaleString(), trend: 24.1, status: 'up' },
      { id: 'high-risk', label: 'ความเสี่ยงระดับ วิกฤต/สูง', value: computedHighRisk.toLocaleString(), trend: -5.4, status: 'down' },
    ];
  }, [timeRange, category, severity, platform]);

  // Dynamic News Trend data
  const dynamicNewsTrend = useMemo(() => {
    let rawTrend = [];
    if (timeRange === '7d') {
      rawTrend = [
        { date: '10/01', tech: 240, cyber: 120 },
        { date: '10/02', tech: 280, cyber: 150 },
        { date: '10/03', tech: 210, cyber: 110 },
        { date: '10/04', tech: 350, cyber: 220 },
        { date: '10/05', tech: 310, cyber: 190 },
        { date: '10/06', tech: 420, cyber: 280 },
        { date: '10/07', tech: 380, cyber: 250 },
      ];
    } else if (timeRange === '30d') {
      rawTrend = [
        { date: 'สัปดาห์ 1', tech: 1820, cyber: 940 },
        { date: 'สัปดาห์ 2', tech: 2150, cyber: 1080 },
        { date: 'สัปดาห์ 3', tech: 2340, cyber: 1190 },
        { date: 'สัปดาห์ 4', tech: 2580, cyber: 1320 },
      ];
    } else {
      rawTrend = [
        { date: 'พ.ค.', tech: 6800, cyber: 3200 },
        { date: 'มิ.ย.', tech: 7400, cyber: 3600 },
        { date: 'ก.ค.', tech: 8100, cyber: 4100 },
        { date: 'ส.ค.', tech: 8900, cyber: 4500 },
        { date: 'ก.ย.', tech: 9800, cyber: 5100 },
        { date: 'ต.ค.', tech: 11200, cyber: 5900 },
      ];
    }

    // Platform and Category scaling
    return rawTrend.map(point => {
      let techVal = point.tech;
      let cyberVal = point.cyber;

      if (platform === 'Windows') {
        techVal = Math.round(techVal * 0.45);
        cyberVal = Math.round(cyberVal * 0.52);
      } else if (platform === 'Linux') {
        techVal = Math.round(techVal * 0.28);
        cyberVal = Math.round(cyberVal * 0.32);
      } else if (platform === 'macOS') {
        techVal = Math.round(techVal * 0.16);
        cyberVal = Math.round(cyberVal * 0.11);
      } else if (platform === 'Android' || platform === 'iOS') {
        techVal = Math.round(techVal * 0.08);
        cyberVal = Math.round(cyberVal * 0.07);
      }

      if (category === 'tech') cyberVal = 0;
      if (category === 'cyber') techVal = 0;

      return {
        date: point.date,
        tech: techVal,
        cyber: cyberVal,
      };
    });
  }, [timeRange, category, platform]);

  // Dynamic Distribution Pie data
  const dynamicDistribution = useMemo(() => {
    if (category === 'all') {
      let techVal = 65;
      let cyberVal = 35;
      if (severity === 'critical' || severity === 'high') {
        techVal = 20;
        cyberVal = 80;
      }
      return [
        { name: 'เทคโนโลยี', value: techVal, fill: '#0284c7' },
        { name: 'ความปลอดภัยไซเบอร์', value: cyberVal, fill: '#ef4444' }
      ];
    } else if (category === 'tech') {
      return [
        { name: 'ปัญญาประดิษฐ์ (AI)', value: 45, fill: '#0ea5e9' },
        { name: 'คลาวด์ & ระบบพื้นฐาน', value: 25, fill: '#8b5cf6' },
        { name: 'ฮาร์ดแวร์ & ชิปเซ็ต', value: 18, fill: '#f59e0b' },
        { name: 'ซอฟต์แวร์ประยุกต์', value: 12, fill: '#10b981' },
      ];
    } else {
      return [
        { name: 'แรนซัมแวร์', value: 38, fill: '#ef4444' },
        { name: 'ช่องโหว่ Zero-Day', value: 28, fill: '#f97316' },
        { name: 'ฟิชชิง & โซเชียล', value: 20, fill: '#f59e0b' },
        { name: 'ข้อมูลรั่วไหล', value: 14, fill: '#ec4899' },
      ];
    }
  }, [category, severity]);

  // Dynamic Trending Topics
  const dynamicTopTopics = useMemo(() => {
    if (platform === 'Windows') {
      return [
        { name: 'Windows SMB Zero-Day', count: 680, fill: '#0078d4' },
        { name: 'Active Directory Attack', count: 540, fill: '#f43f5e' },
        { name: 'PowerShell Scripts', count: 420, fill: '#8b5cf6' },
        { name: 'Microsoft Copilot AI', count: 390, fill: '#0ea5e9' },
        { name: 'Defender Bypass', count: 310, fill: '#f59e0b' },
      ];
    } else if (platform === 'Linux') {
      return [
        { name: 'Linux Kernel Exploits', count: 720, fill: '#fcc624' },
        { name: 'Kubernetes Cluster', count: 580, fill: '#f43f5e' },
        { name: 'SSH Brute-force', count: 460, fill: '#8b5cf6' },
        { name: 'OpenSSL / Web Server', count: 380, fill: '#0ea5e9' },
        { name: 'Docker Vulnerability', count: 320, fill: '#f59e0b' },
      ];
    } else if (platform === 'macOS') {
      return [
        { name: 'Gatekeeper Bypass', count: 480, fill: '#a3aaae' },
        { name: 'Apple M4 Chip Security', count: 390, fill: '#0ea5e9' },
        { name: 'Safari WebKit Zero-Day', count: 360, fill: '#f43f5e' },
        { name: 'macOS InfoStealer', count: 290, fill: '#8b5cf6' },
        { name: 'Keychain Encryption', count: 220, fill: '#10b981' },
      ];
    } else if (platform === 'Android') {
      return [
        { name: 'โทรจันการเงิน Anatsa', count: 510, fill: '#3ddc84' },
        { name: 'Play Store Malicious Apps', count: 420, fill: '#f43f5e' },
        { name: 'MediaTek/Qualcomm Baseband', count: 330, fill: '#f59e0b' },
        { name: 'Android 16 Kernel Defense', count: 280, fill: '#0ea5e9' },
        { name: 'SMS OTP Sniffer', count: 210, fill: '#8b5cf6' },
      ];
    } else if (platform === 'iOS') {
      return [
        { name: 'Pegasus Spyware Variants', count: 540, fill: '#007aff' },
        { name: 'iMessage Zero-Click', count: 460, fill: '#f43f5e' },
        { name: 'WebKit Remote Code Exec', count: 380, fill: '#f59e0b' },
        { name: 'Apple Intelligence Sec', count: 310, fill: '#0ea5e9' },
        { name: 'Sandbox Escape Vulnerability', count: 240, fill: '#8b5cf6' },
      ];
    }

    // Default by category
    if (category === 'tech') {
      return [
        { name: 'ปัญญาประดิษฐ์ (Generative AI)', count: 1840, fill: '#0ea5e9' },
        { name: 'คลาวด์เนทีฟ & Kubernetes', count: 960, fill: '#8b5cf6' },
        { name: 'ชิปเซ็ตประมวลผล AI', count: 740, fill: '#f59e0b' },
        { name: 'ควอนตัมคอมพิวติง', count: 510, fill: '#10b981' },
        { name: 'หุ่นยนต์และระบบอัตโนมัติ', count: 430, fill: '#06b6d4' },
      ];
    } else if (category === 'cyber') {
      return [
        { name: 'แรนซัมแวร์สายพันธุ์ใหม่', count: 1250, fill: '#f43f5e' },
        { name: 'ช่องโหว่ Zero-Day', count: 890, fill: '#ef4444' },
        { name: 'แคมเปญฟิชชิงแนบมัลแวร์', count: 680, fill: '#f59e0b' },
        { name: 'ข้อมูลรั่วไหลในองค์กร', count: 570, fill: '#ec4899' },
        { name: 'การโจมตี DDoS ระดับ Terabit', count: 490, fill: '#8b5cf6' },
      ];
    }

    return overviewMockData.topTopics;
  }, [platform, category]);

  // Label for Trend chart header
  const trendSubtitle = useMemo(() => {
    let t = '7 วันล่าสุด';
    if (timeRange === '30d') t = '30 วันล่าสุด (รายสัปดาห์)';
    if (timeRange === 'all') t = 'ทั้งหมด (รายเดือน)';
    return `เปรียบเทียบปริมาณข่าวเทคโนโลยีและข่าวความปลอดภัยไซเบอร์ (${t})`;
  }, [timeRange]);

  return (
    <div className="dashboard-grid">
      {/* KPI Row */}
      <div className="col-span-12 kpi-row">
        {dynamicKpis.map((kpi) => (
          <div key={kpi.id} className="kpi-card" style={{ transition: 'all 0.3s ease' }}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ transition: 'color 0.2s ease' }}>{kpi.value}</div>
            <div className={`kpi-trend ${kpi.status}`}>
              {kpi.status === 'up' ? '↗' : '↘'} {Math.abs(kpi.trend)}% เทียบกับช่วงก่อนหน้า
            </div>
          </div>
        ))}
      </div>

      {/* News Trend Chart */}
      <div className="col-span-8 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">แนวโน้มปริมาณข่าว ({timeRange === '7d' ? '7 วันล่าสุด' : timeRange === '30d' ? '30 วันล่าสุด' : 'ทั้งหมด'})</h2>
          <p className="dash-card-subtitle">{trendSubtitle}</p>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicNewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {category !== 'cyber' && (
                <Line type="monotone" dataKey="tech" name="Technology" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              )}
              {category !== 'tech' && (
                <Line type="monotone" dataKey="cyber" name="Cybersecurity" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* News Distribution */}
      <div className="col-span-4 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">สัดส่วนหมวดหมู่</h2>
          <p className="dash-card-subtitle">
            {category === 'all' ? 'การแบ่งสัดส่วนตามหมวดหมู่หลัก' : `สัดส่วนประเด็นย่อยในหมวด ${category === 'tech' ? 'เทคโนโลยี' : 'ความปลอดภัยไซเบอร์'}`}
          </p>
        </div>
        <div style={{ height: 260, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dynamicDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dynamicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)' }}
              />
              <Legend verticalAlign="bottom" height={45} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Topics */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">หัวข้อยอดนิยม (Trending)</h2>
          <p className="dash-card-subtitle">
            {platform !== 'all' ? `หัวข้อที่ถูกพูดถึงมากที่สุดบน ${platform}` : 'หัวข้อที่ถูกพูดถึงมากที่สุดจากการวิเคราะห์ข่าว'}
          </p>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicTopTopics} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-gray)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={130} />
              <Tooltip 
                cursor={{ fill: 'var(--border-gray)' }}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Bar dataKey="count" name="Articles" radius={[0, 4, 4, 0]} barSize={20}>
                {dynamicTopTopics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest Intelligence / High-Risk News */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="dash-card-title">
              {severity !== 'all' ? `ข่าวกรองระดับความเสี่ยง: ${severity}` : 'ข่าวกรองความเสี่ยงวิกฤต/สูง'}
            </h2>
            <p className="dash-card-subtitle">
              {filteredNews.length > 0 ? `แสดง ${filteredNews.length} รายการที่ตรงกับตัวกรอง` : 'ไม่มีรายการที่ตรงกับตัวกรองปัจจุบัน'}
            </p>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={resetFilters} 
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredNews.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              background: 'var(--bg-page)', 
              borderRadius: '12px',
              border: '1px dashed var(--border-gray)' 
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '12px' }}>
                ไม่พบข่าวสารที่ตรงกับเงื่อนไขตัวกรองที่คุณเลือก
              </p>
              <button 
                onClick={resetFilters}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            filteredNews.map(news => {
              const isCrit = news.severity === 'วิกฤต';
              const isHigh = news.severity === 'สูง';
              const isMed = news.severity === 'ปานกลาง';
              const sevColor = isCrit ? '#ef4444' : isHigh ? '#f59e0b' : isMed ? '#3b82f6' : '#10b981';

              return (
                <div key={news.id} style={{ 
                  padding: '16px', 
                  background: 'var(--bg-page)', 
                  borderRadius: '12px',
                  border: '1px solid var(--border-gray)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    background: `${sevColor}15`,
                    border: `1px solid ${sevColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', flexShrink: 0
                  }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1 }}>คะแนน</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: sevColor, lineHeight: 1 }}>
                      {news.riskScore}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: 'var(--text-dark)', 
                      marginBottom: '6px', 
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {news.headline}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', alignItems: 'center' }}>
                      <span style={{ 
                        color: news.category === 'เทคโนโลยี' ? '#0ea5e9' : '#f43f5e', 
                        background: news.category === 'เทคโนโลยี' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(244, 63, 94, 0.1)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        {news.category}
                      </span>
                      <span>•</span>
                      <span style={{ background: 'var(--border-gray)', padding: '2px 6px', borderRadius: '4px' }}>
                        {news.os}
                      </span>
                      <span>•</span>
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.publishedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
