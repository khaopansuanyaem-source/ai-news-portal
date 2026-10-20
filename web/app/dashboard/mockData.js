export const overviewMockData = {
  kpis: [
    { id: 'total-news', label: 'ข่าวที่วิเคราะห์ทั้งหมด', value: '12,450', trend: 12.5, status: 'up' },
    { id: 'tech-news', label: 'ข่าวเทคโนโลยี', value: '8,240', trend: 8.2, status: 'up' },
    { id: 'cyber-news', label: 'ข่าวความปลอดภัยไซเบอร์', value: '4,210', trend: 24.1, status: 'up' },
    { id: 'high-risk', label: 'ความเสี่ยงระดับ วิกฤต/สูง', value: '342', trend: -5.4, status: 'down' },
  ],
  newsTrend: [
    { date: '10/01', tech: 240, cyber: 120 },
    { date: '10/02', tech: 280, cyber: 150 },
    { date: '10/03', tech: 210, cyber: 110 },
    { date: '10/04', tech: 350, cyber: 220 },
    { date: '10/05', tech: 310, cyber: 190 },
    { date: '10/06', tech: 420, cyber: 280 },
    { date: '10/07', tech: 380, cyber: 250 },
  ],
  newsDistribution: [
    { name: 'เทคโนโลยี', value: 65, fill: '#0284c7' },
    { name: 'ความปลอดภัยไซเบอร์', value: 35, fill: '#ef4444' }
  ],
  topTopics: [
    { name: 'ปัญญาประดิษฐ์ (AI)', count: 1240, fill: '#0ea5e9' },
    { name: 'แรนซัมแวร์', count: 850, fill: '#f43f5e' },
    { name: 'ความปลอดภัยคลาวด์', count: 620, fill: '#8b5cf6' },
    { name: 'ข้อมูลรั่วไหล', count: 540, fill: '#ec4899' },
    { name: 'ช่องโหว่ซอฟต์แวร์', count: 480, fill: '#f59e0b' },
  ],
  latestHighRiskNews: [
    {
      id: 1,
      headline: 'พบช่องโหว่ Zero-Day ร้ายแรงในโปรโตคอล SMB ของ Windows 11',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'ช่องโหว่',
      riskScore: 94,
      severity: 'วิกฤต',
      source: 'The Hacker News',
      publishedAt: '2 ชั่วโมงที่แล้ว',
      daysAgo: 0,
      os: 'Windows'
    },
    {
      id: 2,
      headline: 'แรนซัมแวร์สายพันธุ์ใหม่มุ่งเป้าโจมตีคลัสเตอร์ Kubernetes ที่ตั้งค่าผิดพลาด',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'แรนซัมแวร์',
      riskScore: 88,
      severity: 'สูง',
      source: 'BleepingComputer',
      publishedAt: '5 ชั่วโมงที่แล้ว',
      daysAgo: 0,
      os: 'Linux'
    },
    {
      id: 3,
      headline: 'ผู้ให้บริการสาธารณสุขรายใหญ่ถูกแฮก ข้อมูลผู้ป่วยรั่วไหลกว่า 5 ล้านรายการ',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'ข้อมูลรั่วไหล',
      riskScore: 82,
      severity: 'สูง',
      source: 'CyberScoop',
      publishedAt: '8 ชั่วโมงที่แล้ว',
      daysAgo: 0,
      os: 'หลายแพลตฟอร์ม'
    },
    {
      id: 4,
      headline: 'โทรจันการเงิน Anatsa ระบาดบน Google Play Store มุ่งเป้าผู้ใช้ Android ในไทย',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'มัลแวร์',
      riskScore: 92,
      severity: 'วิกฤต',
      source: 'ThreatFabric',
      publishedAt: '1 วันที่แล้ว',
      daysAgo: 1,
      os: 'Android'
    },
    {
      id: 5,
      headline: 'สปายแวร์ Pegasus สายพันธุ์ใหม่เจาะระบบ iOS ผ่าน iMessage Zero-Click',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'สปายแวร์',
      riskScore: 96,
      severity: 'วิกฤต',
      source: 'Citizen Lab',
      publishedAt: '2 วันที่แล้ว',
      daysAgo: 2,
      os: 'iOS'
    },
    {
      id: 6,
      headline: 'มัลแวร์เจาะ macOS Gatekeeper แฝงตัวในตัวติดตั้งโปรแกรมตัดต่อวิดีโอชื่อดัง',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'มัลแวร์',
      riskScore: 78,
      severity: 'สูง',
      source: 'SentinelOne',
      publishedAt: '2 วันที่แล้ว',
      daysAgo: 2,
      os: 'macOS'
    },
    {
      id: 7,
      headline: 'ช่องโหว่ Linux Kernel 6.x ช่วยให้ผู้โจมตียกระดับสิทธิ์สู่ระดับ Root (CVE-2026-3819)',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'ช่องโหว่',
      riskScore: 91,
      severity: 'วิกฤต',
      source: 'Openwall',
      publishedAt: '3 วันที่แล้ว',
      daysAgo: 3,
      os: 'Linux'
    },
    {
      id: 8,
      headline: 'Microsoft ออกอัปเดต Copilot Studio เพิ่มฟังก์ชัน AI Agent อัตโนมัติในระดับองค์กร',
      category: 'เทคโนโลยี',
      topic: 'ปัญญาประดิษฐ์ (AI)',
      riskScore: 35,
      severity: 'ต่ำ',
      source: 'Microsoft Blog',
      publishedAt: '1 วันที่แล้ว',
      daysAgo: 1,
      os: 'Windows'
    },
    {
      id: 9,
      headline: 'Google เปิดตัว Android 16 Developer Preview ปรับปรุงสถาปัตยกรรมความปลอดภัยระดับเคอร์เนล',
      category: 'เทคโนโลยี',
      topic: 'ระบบปฏิบัติการ',
      riskScore: 42,
      severity: 'ต่ำ',
      source: 'Android Developers',
      publishedAt: '4 วันที่แล้ว',
      daysAgo: 4,
      os: 'Android'
    },
    {
      id: 10,
      headline: 'Apple เปิดตัวชิปเซ็ต M4 Max และเตรียมอัปเกรดระบบ Secure Enclave ใน macOS',
      category: 'เทคโนโลยี',
      topic: 'ฮาร์ดแวร์ & ชิปเซ็ต',
      riskScore: 28,
      severity: 'ต่ำ',
      source: 'Apple Newsroom',
      publishedAt: '3 วันที่แล้ว',
      daysAgo: 3,
      os: 'macOS'
    },
    {
      id: 11,
      headline: 'Active Directory Kerberos ถูกแฮกเกอร์ใช้เทคนิค Silver Ticket แทรกซึมระบบราชการ',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'การเจาะระบบ',
      riskScore: 86,
      severity: 'สูง',
      source: 'Dark Reading',
      publishedAt: '5 วันที่แล้ว',
      daysAgo: 5,
      os: 'Windows'
    },
    {
      id: 12,
      headline: 'Red Hat และ IBM เปิดตัว OpenShift AI 2.15 รองรับการเทรนโมเดลบน Linux On-Premise',
      category: 'เทคโนโลยี',
      topic: 'คลาวด์ & AI',
      riskScore: 30,
      severity: 'ต่ำ',
      source: 'Red Hat',
      publishedAt: '6 วันที่แล้ว',
      daysAgo: 6,
      os: 'Linux'
    },
    {
      id: 13,
      headline: 'การโจมตี DDoS สถิติใหม่ 3.8 Tbps พุ่งเป้าโครงสร้างพื้นฐานอินเทอร์เน็ตระหว่างประเทศ',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'DDoS',
      riskScore: 89,
      severity: 'สูง',
      source: 'Cloudflare',
      publishedAt: '6 วันที่แล้ว',
      daysAgo: 6,
      os: 'หลายแพลตฟอร์ม'
    },
    {
      id: 14,
      headline: 'แคมเปญฟิชชิงแนบไฟล์ SVG ปลอมตัวเป็นใบแจ้งหนี้ หลอกขโมย Token บัญชี Microsoft 365',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'ฟิชชิง',
      riskScore: 68,
      severity: 'ปานกลาง',
      source: 'BleepingComputer',
      publishedAt: '12 วันที่แล้ว',
      daysAgo: 12,
      os: 'Windows'
    },
    {
      id: 15,
      headline: 'ช่องโหว่ใน Safari WebKit บน iOS และ macOS ส่งผลให้เกิดหน่วยความจำเสียหาย',
      category: 'ความปลอดภัยไซเบอร์',
      topic: 'ช่องโหว่',
      riskScore: 74,
      severity: 'ปานกลาง',
      source: 'SecurityWeek',
      publishedAt: '15 วันที่แล้ว',
      daysAgo: 15,
      os: 'iOS'
    },
    {
      id: 16,
      headline: 'Linux Foundation ประกาศมาตรฐานความปลอดภัยใหม่สำหรับ Open Source Supply Chain',
      category: 'เทคโนโลยี',
      topic: 'ซัพพลายเชน',
      riskScore: 45,
      severity: 'ปานกลาง',
      source: 'Linux Foundation',
      publishedAt: '18 วันที่แล้ว',
      daysAgo: 18,
      os: 'Linux'
    }
  ]
};

export const riskAnalysisMockData = {
  currentRiskScore: 84,
  severityLevel: 'สูง', // ต่ำ, ปานกลาง, สูง, วิกฤต
  riskFactors: [
    { subject: 'ความรุนแรง', A: 90, fullMark: 100 },
    { subject: 'ผลกระทบ', A: 85, fullMark: 100 },
    { subject: 'ความง่ายในการโจมตี', A: 80, fullMark: 100 },
    { subject: 'จำนวนผู้ได้รับผลกระทบ', A: 70, fullMark: 100 },
    { subject: 'ความน่าเชื่อถือแหล่งข่าว', A: 90, fullMark: 100 },
  ],
  aiExplanation: "ข่าวนี้มีระดับความเสี่ยงสูง (High Risk) เนื่องจากเกี่ยวข้องกับช่องโหว่ประเภท Zero-Day ที่ยังไม่มีแพตช์แก้ไข ซึ่งอาจส่งผลกระทบโดยตรงต่อผู้ใช้งานระบบปฏิบัติการ Windows จำนวนมาก นอกจากนี้แหล่งข่าวที่รายงานมีความน่าเชื่อถือสูงมาก ทำให้ความน่าจะเป็นในการถูกโจมตี (Exploitability) อยู่ในเกณฑ์วิกฤต แนะนำให้เฝ้าระวังและเตรียมแผนรับมืออย่างเร่งด่วน",
  riskHistory: [
    { date: '10/01', score: 45 },
    { date: '10/02', score: 52 },
    { date: '10/03', score: 48 },
    { date: '10/04', score: 76 },
    { date: '10/05', score: 84 },
  ]
};

export const threatIntelligenceMockData = {
  malwareFamilies: [
    { name: 'LockBit 3.0', count: 320, fill: '#ef4444' },
    { name: 'ALPHV (BlackCat)', count: 210, fill: '#f97316' },
    { name: 'Cl0p', count: 180, fill: '#f59e0b' },
    { name: 'Play Ransomware', count: 140, fill: '#eab308' },
    { name: 'Lazarus APT', count: 95, fill: '#8b5cf6' },
  ],
  attackVectors: [
    { name: 'ฟิชชิง', value: 45, fill: '#3b82f6' },
    { name: 'เจาะช่องโหว่', value: 30, fill: '#ef4444' },
    { name: 'ขโมยรหัสผ่าน', value: 15, fill: '#f59e0b' },
    { name: 'ซัพพลายเชน', value: 10, fill: '#8b5cf6' },
  ],
  targetedIndustries: [
    { industry: 'สาธารณสุข', attacks: 120 },
    { industry: 'การเงิน', attacks: 98 },
    { industry: 'หน่วยงานรัฐ', attacks: 85 },
    { industry: 'การศึกษา', attacks: 64 },
    { industry: 'ค้าปลีก', attacks: 45 },
  ],
  recentAlerts: [
    { id: 1, threat: 'แคมเปญโจมตี LockBit 3.0', type: 'แรนซัมแวร์', severity: 'วิกฤต', date: '2 ชั่วโมงที่แล้ว' },
    { id: 2, threat: 'ฟิชชิงผ่านแอป Teams ปลอม', type: 'ฟิชชิง', severity: 'สูง', date: '5 ชั่วโมงที่แล้ว' },
    { id: 3, threat: 'การโจมตี DDoS ในภาคการเงิน', type: 'DDoS', severity: 'ปานกลาง', date: '1 วันที่แล้ว' },
  ]
};

export const techIntelligenceMockData = {
  vendorVulns: [
    { name: 'Microsoft', count: 145, fill: '#3b82f6' },
    { name: 'Apple', count: 82, fill: '#94a3b8' },
    { name: 'Google', count: 110, fill: '#ef4444' },
    { name: 'Linux Kernel', count: 65, fill: '#eab308' },
    { name: 'Cisco', count: 45, fill: '#06b6d4' },
  ],
  vulnSeverity: [
    { name: 'วิกฤต (9.0-10.0)', value: 15, fill: '#ef4444' },
    { name: 'สูง (7.0-8.9)', value: 35, fill: '#f97316' },
    { name: 'ปานกลาง (4.0-6.9)', value: 40, fill: '#eab308' },
    { name: 'ต่ำ (0.1-3.9)', value: 10, fill: '#22c55e' },
  ],
  osAffected: [
    { name: 'Windows', value: 45, fill: '#00a4ef' },
    { name: 'macOS', value: 20, fill: '#999999' },
    { name: 'Linux', value: 25, fill: '#f5a900' },
    { name: 'Android', value: 10, fill: '#3ddc84' },
  ]
};

export const trendForecastMockData = {
  predictiveTrend: [
    { month: 'ต.ค.', actual: 400, predicted: 400 },
    { month: 'พ.ย.', actual: 450, predicted: 460 },
    { month: 'ธ.ค.', actual: null, predicted: 510 },
    { month: 'ม.ค.', actual: null, predicted: 590 },
    { month: 'ก.พ.', actual: null, predicted: 680 },
    { month: 'มี.ค.', actual: null, predicted: 750 },
  ],
  emergingThreats: [
    { name: 'ฟิชชิงที่ขับเคลื่อนด้วย AI', growth: '+145%', color: '#ef4444' },
    { name: 'เครือข่ายบอตเน็ต IoT', growth: '+85%', color: '#f97316' },
    { name: 'การโจมตีซัพพลายเชน', growth: '+60%', color: '#f59e0b' },
    { name: 'การหลอกลวงด้วย Deepfake', growth: '+40%', color: '#eab308' },
  ]
};

export const aiCenterMockData = {
  dailySummary: "วันนี้ระบบตรวจพบความพยายามในการโจมตีเพิ่มขึ้น 12% เมื่อเทียบกับสัปดาห์ที่แล้ว โดยมีกลุ่มเป้าหมายหลักเป็นอุตสาหกรรมการเงินและสาธารณสุข แนะนำให้ตรวจสอบระบบคลาวด์และยกระดับการยืนยันตัวตนแบบ 2FA",
  recentQueries: [
    { q: "วันนี้ระบบปฏิบัติการไหนถูกโจมตีบ่อยที่สุด?", a: "ในขณะนี้ Windows Server 2022 มีความพยายามในการเจาะระบบมากที่สุด" },
    { q: "ขอดูแนวโน้มของแรนซัมแวร์ในเอเชีย", a: "กิจกรรมแรนซัมแวร์ในเอเชียเพิ่มสูงขึ้น 24% ในช่วง 30 วันที่ผ่านมา" },
    { q: "ตอนนี้มีช่องโหว่แบบ zero-day ใน Chrome ไหม?", a: "มีครับ CVE-2026-1029 เป็นช่องโหว่แบบ zero-day ระดับวิกฤตที่กำลังถูกโจมตีอยู่ในขณะนี้" }
  ]
};
