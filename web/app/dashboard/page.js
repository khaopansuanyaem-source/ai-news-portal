'use client';

import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { overviewMockData } from './mockData';

export default function DashboardOverview() {
  const [data] = useState(overviewMockData);

  return (
    <div className="dashboard-grid">
      {/* KPI Row */}
      <div className="col-span-12 kpi-row">
        {data.kpis.map((kpi) => (
          <div key={kpi.id} className="kpi-card">
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-trend ${kpi.status}`}>
              {kpi.status === 'up' ? '↗' : '↘'} {Math.abs(kpi.trend)}% เทียบกับช่วงก่อนหน้า
            </div>
          </div>
        ))}
      </div>

      {/* News Trend Chart */}
      <div className="col-span-8 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">แนวโน้มปริมาณข่าว (7 วันล่าสุด)</h2>
          <p className="dash-card-subtitle">เปรียบเทียบปริมาณข่าวเทคโนโลยีและข่าวความปลอดภัยไซเบอร์</p>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.newsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="tech" name="Technology" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="cyber" name="Cybersecurity" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* News Distribution */}
      <div className="col-span-4 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">สัดส่วนหมวดหมู่</h2>
          <p className="dash-card-subtitle">การแบ่งสัดส่วนตามหมวดหมู่ข่าว</p>
        </div>
        <div style={{ height: 260, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.newsDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.newsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Topics */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">หัวข้อยอดนิยม (Trending)</h2>
          <p className="dash-card-subtitle">หัวข้อที่ถูกพูดถึงมากที่สุดจากการวิเคราะห์ข่าว</p>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topTopics} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-gray)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={120} />
              <Tooltip 
                cursor={{ fill: 'var(--border-gray)' }}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Bar dataKey="count" name="Articles" radius={[0, 4, 4, 0]} barSize={20}>
                {data.topTopics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest High-Risk News */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">ข่าวกรองความเสี่ยงวิกฤต/สูง</h2>
          <p className="dash-card-subtitle">ภัยคุกคามร้ายแรงล่าสุดที่ตรวจสอบพบโดย AI</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.latestHighRiskNews.map(news => (
            <div key={news.id} style={{ 
              padding: '16px', 
              background: 'var(--bg-page)', 
              borderRadius: '12px',
              border: '1px solid var(--border-gray)',
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: news.severity === 'วิกฤต' ? 'rgba(153, 27, 27, 0.2)' : 'rgba(153, 27, 27, 0.1)',
                border: `1px solid ${news.severity === 'วิกฤต' ? '#ef4444' : '#f59e0b'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', flexShrink: 0
              }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1 }}>คะแนน</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: news.severity === 'วิกฤต' ? '#ef4444' : '#f59e0b', lineHeight: 1 }}>
                  {news.riskScore}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '4px', lineHeight: '1.4' }}>
                  {news.headline}
                </h3>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', alignItems: 'center' }}>
                  <span style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{news.topic}</span>
                  <span>•</span>
                  <span>{news.os}</span>
                  <span>•</span>
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.publishedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
