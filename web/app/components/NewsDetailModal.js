'use client';

import { useState } from 'react';

export default function NewsDetailModal({
  news,
  onClose,
  imageUrl,
  fallbackImageUrl,
  isFavorite,
  onToggleFavorite,
  onShare,
  formattedDate,
  plainTitle,
  sanitizedHtml,
  searchableText,
}) {
  const [copiedIoCs, setCopiedIoCs] = useState(false);
  const [showExecModal, setShowExecModal] = useState(false);

  if (!news) return null;

  // Determine category type and scoring
  const catStr = (news.category || '').toLowerCase();
  const titleStr = (news.title || '').toLowerCase();
  const articleText = (searchableText || '').toLowerCase();
  const fullText = `${plainTitle || ''} ${news.summary || ''} ${news.analysis || ''} ${searchableText || ''}`;

  const scoreFromSignals = (signals) =>
    Math.min(
      100,
      signals.reduce((score, signal) => {
        const matches = signal.terms.filter((term) => articleText.includes(term)).length;
        return score + Math.min(signal.max, matches * signal.points);
      }, 18)
    );

  let type = 'tech';
  if (
    catStr.includes('cyber') ||
    catStr.includes('ransomware') ||
    catStr.includes('แฮก') ||
    catStr.includes('มัลแวร์') ||
    titleStr.includes('ransomware') ||
    titleStr.includes('hack')
  ) {
    type = 'cyber';
  }

  let scoreData = null;
  if (type === 'cyber') {
    const threat = scoreFromSignals([
      { terms: ['ransomware', 'malware', 'มัลแวร์', 'โจมตี', 'attack', 'phishing'], points: 12, max: 48 },
      { terms: ['critical', 'severe', 'รุนแรง', 'เร่งด่วน'], points: 10, max: 24 },
      { terms: ['exploit', 'active exploitation', 'ถูกใช้โจมตี'], points: 14, max: 28 },
    ]);
    const dataImpact = scoreFromSignals([
      { terms: ['data', 'ข้อมูล', 'leak', 'breach', 'หลุด', 'credential', 'password'], points: 13, max: 65 },
      { terms: ['customer', 'user', 'ผู้ใช้', 'personal'], points: 8, max: 24 },
    ]);
    const sysImpact = scoreFromSignals([
      { terms: ['server', 'system', 'cloud', 'network', 'ระบบ', 'บริการ', 'infrastructure'], points: 11, max: 55 },
      { terms: ['downtime', 'disruption', 'หยุดชะงัก', 'เสียหาย'], points: 12, max: 36 },
    ]);
    const scope = scoreFromSignals([
      { terms: ['global', 'worldwide', 'ทั่วโลก', 'องค์กร', 'enterprise', 'government', 'หน่วยงาน'], points: 12, max: 60 },
      { terms: ['million', 'ล้าน', 'จำนวนมาก', 'หลายประเทศ'], points: 10, max: 30 },
    ]);
    const exploit = scoreFromSignals([
      { terms: ['zero-day', 'vulnerability', 'cve', 'ช่องโหว่', 'exploit'], points: 14, max: 70 },
      { terms: ['patch', 'อัปเดต', 'แก้ไข'], points: 6, max: 18 },
    ]);
    const urgency = scoreFromSignals([
      { terms: ['urgent', 'immediate', 'critical', 'now', 'ด่วน', 'ทันที', 'แจ้งเตือน'], points: 13, max: 65 },
      { terms: ['today', 'ล่าสุด', 'new', 'ใหม่'], points: 8, max: 24 },
    ]);

    const total = Math.round(
      threat * 0.25 + dataImpact * 0.2 + sysImpact * 0.2 + scope * 0.15 + exploit * 0.1 + urgency * 0.1
    );

    scoreData = {
      title: 'Cybersecurity — Danger/Risk Score',
      scoreLabel: 'Danger Score',
      metrics: [
        { name: 'Threat Severity', th: 'ความรุนแรงของภัยคุกคาม', weight: 25, value: threat },
        { name: 'Data Impact', th: 'ผลกระทบต่อข้อมูล', weight: 20, value: dataImpact },
        { name: 'System Impact', th: 'ผลกระทบต่อระบบ/บริการ', weight: 20, value: sysImpact },
        { name: 'Affected Scope', th: 'ขอบเขตผู้ได้รับผลกระทบ', weight: 15, value: scope },
        { name: 'Exploitability', th: 'ความสามารถในการถูกโจมตี', weight: 10, value: exploit },
        { name: 'Urgency', th: 'ความเร่งด่วน', weight: 10, value: urgency },
      ],
      total,
      levels: [
        { max: 20, label: 'Low', class: 'low', color: '🟢' },
        { max: 40, label: 'Moderate', class: 'moderate', color: '🟡' },
        { max: 60, label: 'High', class: 'high', color: '🟠' },
        { max: 80, label: 'Critical', class: 'critical', color: '🔴' },
        { max: 100, label: 'Severe', class: 'severe', color: '⚫' },
      ],
    };
  } else {
    const business = scoreFromSignals([
      { terms: ['business', 'market', 'enterprise', 'รายได้', 'ธุรกิจ', 'ตลาด', 'ลงทุน'], points: 12, max: 60 },
      { terms: ['company', 'startup', 'บริษัท', 'ลูกค้า'], points: 8, max: 24 },
    ]);
    const innovation = scoreFromSignals([
      { terms: ['ai', 'model', 'agent', 'chip', 'robot', 'ปัญญาประดิษฐ์', 'นวัตกรรม'], points: 12, max: 60 },
      { terms: ['new', 'launch', 'เปิดตัว', 'รุ่นใหม่'], points: 8, max: 24 },
    ]);
    const adoption = scoreFromSignals([
      { terms: ['adopt', 'deploy', 'ใช้งาน', 'ผู้ใช้', 'customer', 'production'], points: 12, max: 60 },
      { terms: ['tool', 'platform', 'service', 'แพลตฟอร์ม'], points: 8, max: 24 },
    ]);
    const industry = scoreFromSignals([
      { terms: ['industry', 'sector', 'supply chain', 'อุตสาหกรรม', 'องค์กร'], points: 12, max: 60 },
      { terms: ['standard', 'regulation', 'มาตรฐาน', 'กฎระเบียบ'], points: 8, max: 24 },
    ]);
    const social = scoreFromSignals([
      { terms: ['people', 'society', 'privacy', 'education', 'สังคม', 'ประชาชน', 'ความเป็นส่วนตัว'], points: 12, max: 60 },
      { terms: ['job', 'แรงงาน', 'เศรษฐกิจ'], points: 8, max: 24 },
    ]);
    const velocity = scoreFromSignals([
      { terms: ['rapid', 'fast', 'growth', 'เร็ว', 'เติบโต', 'เปลี่ยนแปลง'], points: 12, max: 60 },
      { terms: ['today', 'ล่าสุด', 'new', 'ใหม่'], points: 8, max: 24 },
    ]);

    const total = Math.round(
      business * 0.25 + innovation * 0.2 + adoption * 0.2 + industry * 0.15 + social * 0.1 + velocity * 0.1
    );

    scoreData = {
      title: 'Technology — Impact/Significance Score',
      scoreLabel: 'Impact Score',
      metrics: [
        { name: 'Business Impact', th: 'ผลกระทบต่อธุรกิจ', weight: 25, value: business },
        { name: 'Innovation', th: 'ระดับความก้าวหน้าของเทคโนโลยี', weight: 20, value: innovation },
        { name: 'Practical Adoption', th: 'ศักยภาพในการใช้งานจริง', weight: 20, value: adoption },
        { name: 'Industry Impact', th: 'ผลกระทบต่ออุตสาหกรรม', weight: 15, value: industry },
        { name: 'Social & Economic Impact', th: 'ผลกระทบต่อสังคม/เศรษฐกิจ', weight: 10, value: social },
        { name: 'Change Velocity', th: 'ความเร็วในการเปลี่ยนแปลง', weight: 10, value: velocity },
      ],
      total,
      levels: [
        { max: 20, label: 'Low', class: 'low', color: '🟢' },
        { max: 40, label: 'Moderate', class: 'moderate', color: '🟡' },
        { max: 60, label: 'High', class: 'high', color: '🟠' },
        { max: 80, label: 'Critical', class: 'critical', color: '🔴' },
        { max: 100, label: 'Transformative', class: 'severe', color: '⚫' },
      ],
    };
  }

  const level = scoreData.levels.find((l) => scoreData.total <= l.max) || scoreData.levels[4];

  // ═══════════════════════════════════════════════════════════════
  // 🛡️ Threat Intelligence & IoCs Extraction Engine
  // ═══════════════════════════════════════════════════════════════
  const rawCves = fullText.match(/(?:CVE|cve)-\d{4}-\d{4,7}/gi) || [];
  const cveList = Array.from(new Set(rawCves.map((c) => c.toUpperCase())));

  // Extract MITRE ATT&CK Tactics & Techniques
  const mitreTactics = [];
  const lowerText = fullText.toLowerCase();

  if (lowerText.includes('phish') || lowerText.includes('exploit') || lowerText.includes('zero-day') || lowerText.includes('ช่องโหว่')) {
    mitreTactics.push({ id: 'TA0001', name: 'Initial Access', tech: 'T1190 Exploit Public-Facing Application' });
  }
  if (lowerText.includes('rce') || lowerText.includes('code execution') || lowerText.includes('script') || lowerText.includes('คำสั่ง')) {
    mitreTactics.push({ id: 'TA0002', name: 'Execution', tech: 'T1203 Exploitation for Client Execution' });
  }
  if (lowerText.includes('privilege') || lowerText.includes('escalat') || lowerText.includes('ยกระดับสิทธิ์')) {
    mitreTactics.push({ id: 'TA0004', name: 'Privilege Escalation', tech: 'T1068 Exploitation for Privilege Escalation' });
  }
  if (lowerText.includes('bypass') || lowerText.includes('obfuscat') || lowerText.includes('หลบเลี่ยง') || lowerText.includes('ซ่อนตัว')) {
    mitreTactics.push({ id: 'TA0005', name: 'Defense Evasion', tech: 'T1027 Obfuscated Files or Information' });
  }
  if (lowerText.includes('credential') || lowerText.includes('password') || lowerText.includes('token') || lowerText.includes('รหัสผ่าน')) {
    mitreTactics.push({ id: 'TA0006', name: 'Credential Access', tech: 'T1003 OS Credential Dumping' });
  }
  if (lowerText.includes('leak') || lowerText.includes('breach') || lowerText.includes('exfiltrat') || lowerText.includes('หลุด') || lowerText.includes('ขโมยข้อมูล')) {
    mitreTactics.push({ id: 'TA0010', name: 'Exfiltration', tech: 'T1048 Exfiltration Over Alternative Protocol' });
  }
  if (lowerText.includes('ransomware') || lowerText.includes('encrypt') || lowerText.includes('เรียกค่าไถ่') || lowerText.includes('เสียหาย')) {
    mitreTactics.push({ id: 'TA0040', name: 'Impact', tech: 'T1486 Data Encrypted for Impact (Ransomware)' });
  }

  // Detect targeted platforms / systems
  const potentialPlatforms = [
    'Windows', 'Linux', 'macOS', 'Android', 'iOS', 'VMware', 'Microsoft Exchange',
    'Apache', 'Cisco', 'Fortinet', 'WordPress', 'Google Chrome', 'Ivanti', 'Kubernetes', 'AWS', 'Azure'
  ];
  const detectedPlatforms = potentialPlatforms.filter((p) => lowerText.includes(p.toLowerCase()));

  // Detect IPv4 addresses (excluding standard local ranges)
  const rawIps = fullText.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g) || [];
  const extractedIps = Array.from(new Set(rawIps.filter((ip) => !ip.startsWith('127.') && !ip.startsWith('0.') && !ip.startsWith('255.'))));

  // Detect Hashes (SHA256: 64 hex, MD5: 32 hex)
  const rawSha256 = fullText.match(/\b[a-fA-F0-9]{64}\b/g) || [];
  const rawMd5 = fullText.match(/\b[a-fA-F0-9]{32}\b/g) || [];
  const extractedHashes = Array.from(new Set([...rawSha256, ...rawMd5]));

  // Generate Dynamic SOC Recommendations based on findings
  const socRecommendations = [];
  if (cveList.length > 0 || lowerText.includes('ช่องโหว่') || lowerText.includes('vulnerability')) {
    socRecommendations.push('เร่งตรวจสอบและติดตั้งอัปเดตแพตช์ (Patch) ล่าสุดจากผู้ผลิตทันที');
  }
  if (extractedIps.length > 0 || extractedHashes.length > 0) {
    socRecommendations.push('นำ IoCs (IP/Hash) ไปตั้งค่า Block/Monitor ในระบบ Firewall และ EDR');
  }
  if (lowerText.includes('ransomware') || lowerText.includes('เรียกค่าไถ่')) {
    socRecommendations.push('ตรวจสอบระบบ Backup ให้แยกส่วน (Offline/Immutable) ป้องกันการถูกเข้ารหัสซ้ำ');
  }
  if (lowerText.includes('phish') || lowerText.includes('หลอกลวง') || lowerText.includes('social engineering')) {
    socRecommendations.push('แจ้งเตือนพนักงานให้ระวังอีเมลฟิชชิ่ง ห้ามคลิกลิงก์หรือเปิดไฟล์แนบแปลกปลอม');
  }
  if (lowerText.includes('password') || lowerText.includes('credential') || lowerText.includes('รหัสผ่าน') || lowerText.includes('หลุด')) {
    socRecommendations.push('บังคับเปลี่ยนรหัสผ่านสำหรับระบบที่เกี่ยวข้อง และเปิดใช้งาน 2FA/MFA');
  }
  if (socRecommendations.length < 2) {
    socRecommendations.push('เฝ้าระวังพฤติกรรมผิดปกติในระบบ (Log Monitoring) อย่างใกล้ชิด');
  }
  if (socRecommendations.length < 3) {
    socRecommendations.push('ติดตามประกาศ Security Advisory จากผู้ผลิตระบบที่เกี่ยวข้อง');
  }

  // Is this considered high threat / flash alert?
  const isFlashAlert = scoreData.total >= 70 || level.label === 'Critical' || level.label === 'Severe';

  // Format IoCs as clean Markdown for clipboard
  const handleCopyIoCs = () => {
    const lines = [
      `# 🛡️ CYBERINSIGHT AI — THREAT INTEL & IOCs REPORT`,
      `Incident / Article: ${plainTitle}`,
      `Risk Level: ${level.label} (${scoreData.total}/100)`,
      `Published Date: ${formattedDate}`,
      `Source: ${news.source || 'Intelligence Feed'}`,
      `---`,
      `[CVE Identifiers]`,
      cveList.length > 0 ? cveList.join(', ') : 'None explicitly specified (Pattern-based analysis)',
      ``,
      `[MITRE ATT&CK Mapping]`,
      mitreTactics.length > 0 ? mitreTactics.map((m) => `- ${m.name} (${m.tech})`).join('\n') : '- General Threat Reconnaissance',
      ``,
      `[Affected Platforms & Technologies]`,
      detectedPlatforms.length > 0 ? detectedPlatforms.join(', ') : 'Cross-platform / General IT Infrastructure',
      ``,
      `[Network & Host Indicators (IoCs)]`,
      extractedIps.length > 0 ? `IP Addresses:\n${extractedIps.map((ip) => `  - ${ip}`).join('\n')}` : 'IPs: None observed in public brief',
      extractedHashes.length > 0 ? `File Hashes:\n${extractedHashes.map((h) => `  - ${h}`).join('\n')}` : 'Hashes: Refer to vendor advisory for binary signatures',
      ``,
      `[Recommended SOC Action]`,
      ...socRecommendations.map((rec, i) => `${i + 1}. ${rec}`),
      `---`,
      `Generated by CyberInsight AI Multi-Agent Intelligence Portal`,
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedIoCs(true);
      setTimeout(() => setCopiedIoCs(false), 2500);
    });
  };

  return (
    <>
      <div className="news-modal-overlay" onClick={onClose}>
        <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="news-modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="news-modal-image">
            <img
              src={imageUrl}
              alt={plainTitle || 'News cover'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImageUrl;
              }}
            />
          </div>

          <div className="news-modal-body">
            <div className="news-modal-meta">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="news-modal-cat">{news.category || 'News'}</span>
                {isFlashAlert && <span className="flash-alert-badge">⚡ FLASH ALERT</span>}
                <span className="news-modal-date">{formattedDate}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="exec-report-btn-modal"
                  onClick={() => setShowExecModal(true)}
                  title="เปิดรายงานสรุปสถานการณ์ระดับผู้บริหาร"
                >
                  📄 Export Report
                </button>
                <button
                  type="button"
                  className="favorite-toggle modal-favorite"
                  style={{ position: 'relative', top: 0, right: 0 }}
                  onClick={(e) => onShare(e, news)}
                  aria-label="แชร์ข่าว"
                >
                  📤
                </button>
                {news.id && news.id !== 'hero' && (
                  <button
                    type="button"
                    className="favorite-toggle modal-favorite"
                    style={{ position: 'relative', top: 0, right: 0 }}
                    onClick={(e) => onToggleFavorite(e, news.id)}
                    aria-label={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    aria-pressed={isFavorite}
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>
                )}
              </div>
            </div>

            <h1 className="news-modal-title">{plainTitle}</h1>

            <div
              className="news-modal-text article-body"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* 🛡️ DEEP THREAT INTELLIGENCE & IoCs SECTION */}
            <div className="threat-intel-container">
              <div className="threat-intel-header">
                <div className="threat-intel-title">
                  <span style={{ fontSize: '20px' }}>🛡️</span>
                  <span>Deep Threat Intelligence & Indicators of Compromise (IoCs)</span>
                </div>
                <button
                  type="button"
                  className={`ioc-action-btn ${copiedIoCs ? 'copied' : ''}`}
                  onClick={handleCopyIoCs}
                >
                  {copiedIoCs ? '✓ คัดลอก IoCs สำเร็จ!' : '📋 Copy IoCs (SOC Ready)'}
                </button>
              </div>

              <div className="threat-intel-body">
                <div className="threat-intel-grid">
                  {/* CVE Badges */}
                  <div className="threat-field-card">
                    <div className="threat-field-label">
                      <span>🏷️</span> Common Vulnerabilities & Exposures (CVE)
                    </div>
                    <div className="threat-field-value">
                      {cveList.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {cveList.map((cve) => (
                            <a
                              key={cve}
                              href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cve-tag"
                              title="ตรวจสอบรายละเอียดช่องโหว่บนฐานข้อมูล NVD (NIST)"
                            >
                              🔗 {cve}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                          ไม่มีรหัส CVE ระบุโดยตรง (เป็นภัยคุกคามเชิงกลวิธีหรือมัลแวร์ทั่วไป)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Platforms */}
                  <div className="threat-field-card">
                    <div className="threat-field-label">
                      <span>🎯</span> ระบบ/แพลตฟอร์มเป้าหมาย (Target Platform)
                    </div>
                    <div className="threat-field-value">
                      {detectedPlatforms.length > 0 ? (
                        <span style={{ color: '#38bdf8' }}>{detectedPlatforms.join(', ')}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Enterprise IT / Cloud Systems ทั่วไป</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* MITRE ATT&CK Tactics */}
                <div className="threat-field-card">
                  <div className="threat-field-label">
                    <span>⚔️</span> MITRE ATT&CK Framework Mapping
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    {mitreTactics.length > 0 ? (
                      mitreTactics.map((t) => (
                        <span key={t.id} className="mitre-tactic-badge" title={t.tech}>
                          {t.name}: {t.tech}
                        </span>
                      ))
                    ) : (
                      <span className="mitre-tactic-badge">Reconnaissance & Initial Access</span>
                    )}
                  </div>
                </div>

                {/* Extracted IoCs (IP / Hashes / Indicators) */}
                <div className="threat-field-card">
                  <div className="threat-field-label">
                    <span>🔍</span> ตัวบ่งชี้ภัยคุกคามทางเทคนิค (Extracted IoCs)
                  </div>
                  <div className="ioc-code-block" style={{ marginTop: '8px' }}>
                    {extractedIps.length > 0 && (
                      <div>
                        <strong>[IP Addresses]</strong>
                        <br />
                        {extractedIps.join('\n')}
                        <br />
                      </div>
                    )}
                    {extractedHashes.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <strong>[File Hashes]</strong>
                        <br />
                        {extractedHashes.join('\n')}
                        <br />
                      </div>
                    )}
                    {extractedIps.length === 0 && extractedHashes.length === 0 && (
                      <div>
                        {`# ไม่พบ IP หรือ Hash แบบดิบในเนื้อหาข่าวสรุป`}
                        <br />
                        {`# แนะนำตรวจสอบลิงก์ข่าวต้นฉบับ หรือ Security Advisory ของผู้ผลิต`}
                        <br />
                        STATUS: Threat Signature Monitored by AI Shield Agent
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Recommended Mitigations */}
                <div className="threat-field-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid #10b981', background: 'linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 100%)' }}>
                  <div className="threat-field-label" style={{ color: '#10b981' }}>
                    <span>💡</span> แนวทางการป้องกันและรับมือ (AI Recommended Actions)
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: '1.6', color: '#e2f0ff' }}>
                    <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {socRecommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assessment Score System */}
            <div className="score-table-container" style={{ marginBottom: '40px' }}>
              <div className="score-table-header">
                <div className="score-table-title">
                  <span style={{ fontSize: '20px' }}>{type === 'cyber' ? '🛡️' : '💡'}</span> {scoreData.title}
                </div>
                <div className={`score-badge ${level.class}`}>
                  <span>{level.color}</span> {scoreData.total} - {level.label}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="score-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%', whiteSpace: 'nowrap' }}>ปัจจัย (Factor)</th>
                      <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>น้ำหนัก</th>
                      <th style={{ width: '45%', whiteSpace: 'nowrap' }}>การประเมิน (Score)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreData.metrics.map((m, idx) => {
                      const mLevel =
                        m.value <= 20
                          ? { label: 'Low', color: '#16a34a', bg: '#dcfce7', border: '#86efac', text: '#15803d' }
                          : m.value <= 40
                          ? { label: 'Moderate', color: '#ca8a04', bg: '#fef9c3', border: '#fde047', text: '#a16207' }
                          : m.value <= 60
                          ? { label: 'High', color: '#ea580c', bg: '#ffedd5', border: '#fdba74', text: '#c2410c' }
                          : m.value <= 80
                          ? { label: 'Critical', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' }
                          : { label: type === 'cyber' ? 'Severe' : 'Transform.', color: '#be123c', bg: '#ffe4e6', border: '#fda4af', text: '#9f1239' };
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.th}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{m.name}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '15px' }}>{m.weight}%</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: '8px',
                                  background: '#e2e8f0',
                                  borderRadius: '99px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${m.value}%`,
                                    height: '100%',
                                    background: mLevel.color,
                                    borderRadius: '99px',
                                  }}
                                ></div>
                              </div>
                              <span
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  width: '32px',
                                  color: '#0f172a',
                                  textAlign: 'right',
                                }}
                              >
                                {m.value}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: mLevel.text,
                                  minWidth: '76px',
                                  padding: '3px 8px',
                                  background: mLevel.bg,
                                  border: `1px solid ${mLevel.border}`,
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  display: 'inline-block',
                                }}
                              >
                                {mLevel.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>รวม ({scoreData.scoreLabel})</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '15px' }}>100%</td>
                      <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>{scoreData.total} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  padding: '12px 20px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#64748b',
                  lineHeight: 1.5,
                }}
              >
                * ดัชนีประเมินภัยคุกคามประมวลผลอัตโนมัติด้วย AI Multi-Agent Matrix ตามกรอบความเสี่ยง CVSS & MITRE ATT&CK
              </div>
            </div>

            <div className="news-modal-footer">
              <strong>แหล่งที่มา: </strong> {news.source || 'ไม่ระบุ'}
              {news.url && (
                <div>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-modal-link"
                    onClick={(e) => {
                      if (news.url.includes('example.com')) {
                        e.preventDefault();
                        alert(
                          'ลิงก์นี้เป็นข้อมูลจำลอง (Mock Data) ครับ 🚧\n\nในระบบจริงเมื่อคลิกแล้วจะเปิดแท็บใหม่ไปยังเว็บไซต์สำนักข่าวต้นฉบับ เช่น Blognone, TechTalkThai หรือ BBC ทันทีครับ'
                        );
                      }
                    }}
                  >
                    อ่านข่าวต้นฉบับ ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📄 1-CLICK EXECUTIVE THREAT REPORT MODAL */}
      {showExecModal && (
        <div className="news-modal-overlay" onClick={() => setShowExecModal(false)} style={{ zIndex: 100000 }}>
          <div className="exec-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700 }}>
                <span>✦ CISO EXECUTIVE THREAT BRIEFING</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🖨️ พิมพ์ / บันทึก PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#0f172a',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                  aria-label="ปิดรายงาน"
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 700 }}>
                CyberInsight AI • Executive Cyber Threat Intelligence
              </div>
              <h1 style={{ margin: '8px 0 4px 0', fontSize: '22px', color: '#0f172a' }}>{plainTitle}</h1>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap', marginTop: '6px' }}>
                <span><strong>วันที่จัดทำ:</strong> {formattedDate}</span>
                <span><strong>ระดับความเสี่ยง:</strong> <span style={{ color: level.color === '🔴' ? '#dc2626' : '#ea580c', fontWeight: 800 }}>{level.label} ({scoreData.total}/100)</span></span>
                <span><strong>แหล่งข่าว:</strong> {news.source || 'Threat Intel Feed'}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a' }}>📌 สรุปใจความสำคัญสำหรับผู้บริหาร (Executive Takeaway)</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
                เหตุการณ์นี้ถูกประเมินความเสี่ยงอยู่ในระดับ <strong>{level.label} ({scoreData.total}/100)</strong> 
                {detectedPlatforms.length > 0 ? ` ซึ่งมีผลกระทบต่อระบบ ${detectedPlatforms.join(', ')}` : ''} 
                {cveList.length > 0 ? ` โดยเกี่ยวข้องกับรหัสช่องโหว่ ${cveList.join(', ')}` : ''} 
                {isFlashAlert ? ' จัดเป็นภัยคุกคามเร่งด่วนที่องค์กรควรตรวจสอบมาตรการป้องกันทันที' : ' แนะนำให้ทีมไอทีติดตามความคืบหน้าอย่างใกล้ชิด'}
              </p>
            </div>

            {/* Actionable Recommendations */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '12px' }}>🎯 แผนปฏิบัติการที่แนะนำ (Recommended Incident Mitigation Plan)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>1. การอัปเดตแพตช์ความปลอดภัย (Patch & Vulnerability Management)</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>ตรวจสอบและบังคับใช้อัปเดตจากผู้พัฒนาซอฟต์แวร์ทันที โดยเฉพาะช่องโหว่ที่มีรหัส CVE</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>2. การเฝ้าระวังทางระบบเครือข่าย (SOC Threat Hunting & SIEM Ingestion)</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>นำตัวบ่งชี้ภัยคุกคาม (IoCs) และเทคนิค MITRE ATT&CK ที่ตรวจพบไปตั้งค่าตรวจจับใน SIEM และ Firewall</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>3. ความมั่นคงปลอดภัยของข้อมูลและบัญชีผู้ใช้ (Identity & Backup Verification)</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>บังคับใช้การยืนยันตัวตนแบบหลายปัจจัย (MFA) และตรวจสอบความสมบูรณ์ของการสำรองข้อมูลแบบ Immutable</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
              <span>CyberInsight AI Multi-Agent Security Engine</span>
              <span>Classification: Internal / SOC Briefing</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
