'use client';

import { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { riskAnalysisMockData } from '../mockData';

export default function RiskAnalysis() {
  const [data] = useState(riskAnalysisMockData);

  // Helper to determine color based on risk score
  const getRiskColor = (score) => {
    if (score >= 75) return '#ef4444'; // Critical
    if (score >= 50) return '#f59e0b'; // High
    if (score >= 25) return '#eab308'; // Medium
    return '#22c55e'; // Low
  };

  const riskColor = getRiskColor(data.currentRiskScore);

  return (
    <div className="dashboard-grid">
      
      {/* Risk Score Highlight */}
      <div className="col-span-12 dash-card" style={{ flexDirection: 'row', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-page)', borderRadius: '16px', border: `1px solid ${riskColor}40` }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Overall Risk Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '72px', fontWeight: '900', color: riskColor, lineHeight: '1' }}>{data.currentRiskScore}</span>
            <span style={{ fontSize: '24px', color: 'var(--text-gray)', fontWeight: '600' }}>/ 100</span>
          </div>
          <div style={{ marginTop: '12px', padding: '4px 16px', background: `${riskColor}20`, color: riskColor, borderRadius: '99px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}>
            {data.severityLevel} SEVERITY
          </div>
        </div>

        <div style={{ flex: '2 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h2 className="dash-card-title">AI Risk Assessment</h2>
          </div>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-gray)' }}>
            {data.aiExplanation}
          </p>
        </div>
      </div>

      {/* Risk Factors Radar Chart */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Risk Factors Breakdown</h2>
          <p className="dash-card-subtitle">AI analysis of 5 key metrics determining the overall risk.</p>
        </div>
        <div style={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.riskFactors}>
              <PolarGrid stroke="var(--border-gray)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Risk Level" dataKey="A" stroke={riskColor} fill={riskColor} fillOpacity={0.4} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Trend History */}
      <div className="col-span-6 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Risk Trend History</h2>
          <p className="dash-card-subtitle">Fluctuation of the average risk score over time.</p>
        </div>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.riskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={riskColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={riskColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gray)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-dark)' }}
                labelStyle={{ color: 'var(--text-gray)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="score" stroke={riskColor} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
