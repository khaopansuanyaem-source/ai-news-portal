'use client';

import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { threatIntelligenceMockData } from '../mockData';
import { useDashboardFilter } from '../DashboardFilterContext';

export default function ThreatIntelligence() {
  const { severity, platform, resetFilters, hasActiveFilters } = useDashboardFilter();
  const [data] = useState(threatIntelligenceMockData);

  const filteredAlerts = data.recentAlerts.filter(alert => {
    if (severity === 'critical' && alert.severity !== 'วิกฤต' && alert.severity !== 'Critical') return false;
    if (severity === 'high' && alert.severity !== 'สูง' && alert.severity !== 'High') return false;
    if (severity === 'medium' && alert.severity !== 'ปานกลาง' && alert.severity !== 'Medium') return false;
    if (severity === 'low' && alert.severity !== 'ต่ำ' && alert.severity !== 'Low') return false;
    return true;
  });

  return (
    <div className="dashboard-grid">
      
      {/* Malware Families Bar Chart */}
      <div className="col-span-8 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">แรนซัมแวร์ยอดนิยม (Top Malware)</h2>
          <p className="dash-card-subtitle">ตระกูลมัลแวร์ที่พบการโจมตีบ่อยที่สุด</p>
        </div>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.malwareFamilies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-gray)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--border-gray)' }}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.malwareFamilies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack Vectors Donut Chart */}
      <div className="col-span-4 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">รูปแบบการโจมตี (Attack Vectors)</h2>
          <p className="dash-card-subtitle">วิธีการหลักที่แฮกเกอร์ใช้</p>
        </div>
        <div style={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.attackVectors}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.attackVectors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-dark)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Targeted Industries */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">อุตสาหกรรมเป้าหมาย</h2>
          <p className="dash-card-subtitle">ภาคธุรกิจที่ถูกพุ่งเป้าโจมตีหนักที่สุด</p>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.targetedIndustries} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-gray)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="industry" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                cursor={{ fill: 'var(--border-gray)' }}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Bar dataKey="attacks" name="การโจมตี" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts List */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">แจ้งเตือนภัยคุกคามล่าสุด</h2>
          <p className="dash-card-subtitle">แคมเปญการโจมตีที่เพิ่งตรวจพบเร็วๆ นี้</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)', background: 'var(--bg-page)', borderRadius: '8px' }}>
              ไม่พบการแจ้งเตือนที่ตรงกับระดับความรุนแรงที่เลือก
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} style={{
                padding: '16px',
                background: 'var(--bg-page)',
                borderLeft: `4px solid ${alert.severity === 'Critical' || alert.severity === 'วิกฤต' ? '#ef4444' : alert.severity === 'High' || alert.severity === 'สูง' ? '#f59e0b' : '#3b82f6'}`,
                borderRadius: '0 8px 8px 0',
                borderTop: '1px solid var(--border-gray)',
                borderRight: '1px solid var(--border-gray)',
                borderBottom: '1px solid var(--border-gray)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-dark)' }}>{alert.threat}</h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>ประเภท: {alert.type}</span>
                    <span>•</span>
                    <span>{alert.date}</span>
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: alert.severity === 'Critical' || alert.severity === 'วิกฤต' ? 'rgba(239, 68, 68, 0.1)' : alert.severity === 'High' || alert.severity === 'สูง' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: alert.severity === 'Critical' || alert.severity === 'วิกฤต' ? '#ef4444' : alert.severity === 'High' || alert.severity === 'สูง' ? '#f59e0b' : '#3b82f6'
                }}>
                  {alert.severity}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
