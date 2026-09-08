import { supabase } from '../../utils/supabase';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboard() {
  const { data: news } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
  const { data: users } = await supabase.from('user_preferences').select('*');
  const { data: members } = await supabase.from('members').select('*');

  const totalNews = news?.length || 0;
  const totalUsers = members?.length || 0;
  const activePrefs = users?.length || 0;
  const recentNews = news?.slice(0, 10) || [];

  const agents = [
    { name: 'Scout Agent', role: 'Data Fetching', status: 'Online', uptime: '99.9%', color: '#3b82f6', icon: '📡' },
    { name: 'Analyst Agent', role: 'Threat Analysis', status: 'Online', uptime: '99.8%', color: '#eab308', icon: '🔍' },
    { name: 'Checker Agent', role: 'Fact Checking', status: 'Online', uptime: '99.9%', color: '#10b981', icon: '✅' },
    { name: 'Editor Agent', role: 'Content Formatting', status: 'Online', uptime: '100%', color: '#8b5cf6', icon: '📝' },
  ];

  let ransomware = 0; let zeroDay = 0; let dataLeak = 0; let other = 0;
  let techNews = 0; let cyberNews = 0;

  news?.forEach(a => {
    if (a.category === 'Tech') techNews++;
    else if (a.category === 'Cybersecurity') cyberNews++;

    const text = (a.title + ' ' + (a.summary || '')).toLowerCase();
    if (text.includes('ransomware') || text.includes('แรนซัมแวร์')) ransomware++;
    else if (text.includes('zero-day') || text.includes('vulnerability') || text.includes('ช่องโหว่')) zeroDay++;
    else if (text.includes('breach') || text.includes('leak') || text.includes('หลุด')) dataLeak++;
    else other++;
  });

  const totalAnalyzed = ransomware + zeroDay + dataLeak + other || 1;

  let alertAll = 0; let alertMod = 0; let alertHigh = 0; let alertCrit = 0;
  users?.forEach(u => {
    const level = u.alert_level || 'ALL';
    if (level === 'ALL') alertAll++;
    else if (level === 'MODERATE') alertMod++;
    else if (level === 'HIGH') alertHigh++;
    else if (level === 'CRITICAL') alertCrit++;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'var(--font-space), sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: '#0f172a', fontWeight: 700 }}>CyberInsight Admin</h1>
            <p style={{ margin: 0, color: '#64748b' }}>System Analytics & Threat Intelligence Overview</p>
          </div>
          <Link href="/" style={{ background: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
            ← กลับสู่หน้าหลัก
          </Link>
        </header>

        {/* Top Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📰</div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Articles</p>
              <h2 style={{ margin: 0, fontSize: '32px', color: '#0f172a', fontWeight: 800 }}>{totalNews}</h2>
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👥</div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>LINE Subscribers</p>
              <h2 style={{ margin: 0, fontSize: '32px', color: '#0f172a', fontWeight: 800 }}>{totalUsers}</h2>
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>⚙️</div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Preferences</p>
              <h2 style={{ margin: 0, fontSize: '32px', color: '#0f172a', fontWeight: 800 }}>{activePrefs}</h2>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          
          {/* Threat Distribution */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#0f172a' }}>
              <span>🎯</span> Threat Types Distribution
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>Ransomware</span>
                  <span style={{ color: '#ef4444' }}>{Math.round((ransomware/totalAnalyzed)*100)}%</span>
                </div>
                <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(ransomware/totalAnalyzed)*100}%`, background: '#ef4444', height: '100%', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>Zero-Day & Vulnerabilities</span>
                  <span style={{ color: '#f97316' }}>{Math.round((zeroDay/totalAnalyzed)*100)}%</span>
                </div>
                <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(zeroDay/totalAnalyzed)*100}%`, background: '#f97316', height: '100%', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>Data Breach & Leaks</span>
                  <span style={{ color: '#eab308' }}>{Math.round((dataLeak/totalAnalyzed)*100)}%</span>
                </div>
                <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(dataLeak/totalAnalyzed)*100}%`, background: '#eab308', height: '100%', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>General Security & Policies</span>
                  <span style={{ color: '#3b82f6' }}>{Math.round((other/totalAnalyzed)*100)}%</span>
                </div>
                <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(other/totalAnalyzed)*100}%`, background: '#3b82f6', height: '100%', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* User Alert Thresholds */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#0f172a' }}>
              <span>🔔</span> User Alert Thresholds
            </h3>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {activePrefs === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>No preference data yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '100px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>ALL</div>
                    <div style={{ flex: 1, background: '#f1f5f9', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: '#10b981', height: '100%', borderRadius: '6px', width: `${(alertAll/activePrefs)*100}%`, minWidth: '4px' }} />
                      <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{alertAll} Users</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '100px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#eab308' }}>MODERATE+</div>
                    <div style={{ flex: 1, background: '#f1f5f9', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: '#eab308', height: '100%', borderRadius: '6px', width: `${(alertMod/activePrefs)*100}%`, minWidth: '4px' }} />
                      <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{alertMod} Users</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '100px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#f97316' }}>HIGH+</div>
                    <div style={{ flex: 1, background: '#f1f5f9', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: '#f97316', height: '100%', borderRadius: '6px', width: `${(alertHigh/activePrefs)*100}%`, minWidth: '4px' }} />
                      <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{alertHigh} Users</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '100px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>CRITICAL</div>
                    <div style={{ flex: 1, background: '#f1f5f9', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: '#ef4444', height: '100%', borderRadius: '6px', width: `${(alertCrit/activePrefs)*100}%`, minWidth: '4px' }} />
                      <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{alertCrit} Users</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
              <span>Tech: {techNews} Articles</span>
              <span>Cyber: {cyberNews} Articles</span>
            </div>
          </div>
        </div>

        {/* AI Agents System Health */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#0f172a' }}>
            <span>🤖</span> Multi-Agent System Health
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {agents.map((agent, i) => (
              <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderTop: `4px solid ${agent.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ fontSize: '24px' }}>{agent.icon}</div>
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                    {agent.status}
                  </div>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>{agent.name}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>{agent.role}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span>Uptime</span>
                  <span style={{ color: '#0f172a' }}>{agent.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Intelligence Table */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginTop: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#0f172a' }}>
            <span>📋</span> Recent Processed Intelligence
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID (Hash)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date Processed</th>
                </tr>
              </thead>
              <tbody>
                {recentNews.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>{item.id.slice(0,8)}</td>
                    <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{item.title.length > 60 ? item.title.slice(0,60)+'...' : item.title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: item.category === 'Tech' ? '#dbeafe' : '#f3e8ff', color: item.category === 'Tech' ? '#2563eb' : '#9333ea', fontSize: '12px', fontWeight: 600 }}>
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '60px', fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} CyberInsight AI Admin Dashboard
        </div>
        
      </div>
    </div>
  );
}
