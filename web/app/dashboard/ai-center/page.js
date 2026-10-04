'use client';

import { useState } from 'react';
import { aiCenterMockData } from '../mockData';

export default function AICenter() {
  const [data] = useState(aiCenterMockData);
  const [query, setQuery] = useState('');

  return (
    <div className="dashboard-grid">
      
      {/* AI Daily Briefing */}
      <div className="col-span-12 dash-card" style={{ 
        background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        borderColor: 'rgba(139,92,246,0.2)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
            🧠
          </div>
          <div>
            <h2 className="dash-card-title" style={{ fontSize: '20px' }}>AI Daily Intelligence Briefing</h2>
            <p className="dash-card-subtitle">Executive summary synthesized by CyberInsight AI.</p>
          </div>
        </div>
        <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-dark)' }}>
          {data.dailySummary}
        </p>
      </div>

      {/* AI Query Interface */}
      <div className="col-span-12 dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Ask AI Intelligence</h2>
          <p className="dash-card-subtitle">Query the intelligence database using natural language.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="e.g., What are the latest ransomware tactics?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '16px',
              background: 'var(--bg-page)',
              border: '1px solid var(--border-gray)',
              borderRadius: '8px',
              color: 'var(--text-dark)',
              fontSize: '15px'
            }}
          />
          <button style={{
            padding: '0 24px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Ask AI
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Queries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.recentQueries.map((q, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                background: 'var(--bg-page)', 
                borderRadius: '8px',
                border: '1px solid var(--border-gray)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#8b5cf6' }}>Q:</span> {q.q}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#0ea5e9' }}>A:</span> {q.a}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
