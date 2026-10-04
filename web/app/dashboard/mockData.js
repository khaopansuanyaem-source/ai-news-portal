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
      os: 'หลายแพลตฟอร์ม'
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
