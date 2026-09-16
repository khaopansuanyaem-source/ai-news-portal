'use client';

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
  if (!news) return null;

  // Determine category type and scoring
  const catStr = (news.category || '').toLowerCase();
  const titleStr = (news.title || '').toLowerCase();
  const articleText = (searchableText || '').toLowerCase();

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

  return (
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="news-modal-cat">{news.category || 'News'}</span>
              <span className="news-modal-date">{formattedDate}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                    <th style={{ width: '40%' }}>ปัจจัย (Factor)</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>น้ำหนัก</th>
                    <th style={{ width: '45%' }}>การประเมิน (Score)</th>
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
              * คะแนนประเมินเบื้องต้นจากคำสำคัญและบริบทในข่าว ใช้เพื่อช่วยจัดลำดับความสำคัญ ไม่ใช่ค่าความเสี่ยงเชิงพิสูจน์ทางเทคนิค
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
                        'ลิงก์นี้เป็นข้อมูลจำลอง (Mock Data) ครับ 🚧\n\nในระบบจริงเมื่อคลิกแล้วจะเปิดแท็บใหม่ไปยังเว็บไซต์สำนักข่าวต้นฉบับ เช่น Thairath, Siamsport หรือ BBC ทันทีครับ'
                      );
                    }
                  }}
                >
                  อ่านข่าวต้นฉบับ
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
