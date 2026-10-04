'use client';

import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { trendForecastMockData } from '../mockData';

export default function TrendForecast() {
  const [data] = useState(trendForecastMockData);

  return (
    <div className="dashboard-grid">
      
      {/* Predictive Trend Chart */}
      <div className="col-span-8 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">แนวโน้มภัยคุกคาม (พยากรณ์โดย AI)</h2>
          <p className="dash-card-subtitle">เปรียบเทียบสถิติภัยคุกคามที่เกิดขึ้นจริงกับการพยากรณ์อนาคตโดย AI</p>
        </div>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.predictiveTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-dark)' }} />
              <Line type="monotone" dataKey="actual" name="ภัยคุกคามที่เกิดขึ้นจริง" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="predicted" name="AI พยากรณ์" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emerging Threats */}
      <div className="col-span-4 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">ภัยคุกคามที่กำลังเติบโต (Emerging)</h2>
          <p className="dash-card-subtitle">หมวดหมู่ภัยคุกคามที่มีแนวโน้มการขยายตัวสูงสุด</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {data.emergingThreats.map((threat, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'var(--bg-page)',
              border: '1px solid var(--border-gray)',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }}>{threat.name}</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: threat.color,
                background: `${threat.color}15`,
                padding: '4px 12px',
                borderRadius: '99px'
              }}>
                {threat.growth}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
