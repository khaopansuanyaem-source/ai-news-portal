'use client';

import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { techIntelligenceMockData } from '../mockData';

export default function TechnologyIntelligence() {
  const [data] = useState(techIntelligenceMockData);

  return (
    <div className="dashboard-grid">
      
      {/* Top Vendor Vulnerabilities Bar Chart */}
      <div className="col-span-8 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Vulnerabilities by Vendor</h2>
          <p className="dash-card-subtitle">Volume of newly discovered CVEs per major software vendor.</p>
        </div>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.vendorVulns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                {data.vendorVulns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vulnerability Severity Distribution */}
      <div className="col-span-4 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">CVE Severity Distribution</h2>
          <p className="dash-card-subtitle">Breakdown by CVSS score.</p>
        </div>
        <div style={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.vulnSeverity}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.vulnSeverity.map((entry, index) => (
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

      {/* OS Affected Distribution */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Affected Operating Systems</h2>
          <p className="dash-card-subtitle">Distribution of threats affecting different OS platforms.</p>
        </div>
        <div style={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.osAffected}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.osAffected.map((entry, index) => (
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

      {/* Recommended Actions */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">AI Remediation Advice</h2>
          <p className="dash-card-subtitle">Actionable steps based on current tech intelligence.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-gray)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>⚠️</span> Urgent: Patch Windows Servers
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              High volume of Critical CVEs identified in Windows Server components (SMB and Active Directory). Apply out-of-band patches immediately.
            </p>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-gray)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>⚠️</span> Monitor Supply Chain Tools
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Recent disclosures affect popular CI/CD pipelines. Review access logs and enforce strict MFA policies for developer accounts.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
