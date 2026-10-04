export const overviewMockData = {
  kpis: [
    { id: 'total-news', label: 'Total News Analyzed', value: '12,450', trend: 12.5, status: 'up' },
    { id: 'tech-news', label: 'Technology Focus', value: '8,240', trend: 8.2, status: 'up' },
    { id: 'cyber-news', label: 'Cybersecurity Focus', value: '4,210', trend: 24.1, status: 'up' },
    { id: 'high-risk', label: 'Critical / High Risk', value: '342', trend: -5.4, status: 'down' },
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
    { name: 'Technology', value: 65, fill: '#0284c7' },
    { name: 'Cybersecurity', value: 35, fill: '#ef4444' }
  ],
  topTopics: [
    { name: 'Artificial Intelligence', count: 1240, fill: '#0ea5e9' },
    { name: 'Ransomware', count: 850, fill: '#f43f5e' },
    { name: 'Cloud Security', count: 620, fill: '#8b5cf6' },
    { name: 'Data Breach', count: 540, fill: '#ec4899' },
    { name: 'Vulnerability', count: 480, fill: '#f59e0b' },
  ],
  latestHighRiskNews: [
    {
      id: 1,
      headline: 'Critical Zero-Day Vulnerability Discovered in Windows 11 SMB Protocol',
      category: 'Cybersecurity',
      topic: 'Vulnerability',
      riskScore: 94,
      severity: 'Critical',
      source: 'The Hacker News',
      publishedAt: '2 hours ago',
      os: 'Windows'
    },
    {
      id: 2,
      headline: 'New Ransomware Variant Targeting Misconfigured Kubernetes Clusters',
      category: 'Cybersecurity',
      topic: 'Ransomware',
      riskScore: 88,
      severity: 'High',
      source: 'BleepingComputer',
      publishedAt: '5 hours ago',
      os: 'Linux'
    },
    {
      id: 3,
      headline: 'Major Healthcare Provider Suffers Data Breach Exposing 5M Records',
      category: 'Cybersecurity',
      topic: 'Data Breach',
      riskScore: 82,
      severity: 'High',
      source: 'CyberScoop',
      publishedAt: '8 hours ago',
      os: 'Multiple'
    }
  ]
};

export const riskAnalysisMockData = {
  currentRiskScore: 84,
  severityLevel: 'High', // Low, Medium, High, Critical
  riskFactors: [
    { subject: 'Severity', A: 90, fullMark: 100 },
    { subject: 'Impact', A: 85, fullMark: 100 },
    { subject: 'Exploitability', A: 80, fullMark: 100 },
    { subject: 'Affected Users', A: 70, fullMark: 100 },
    { subject: 'Source Credibility', A: 90, fullMark: 100 },
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
    { name: 'Phishing', value: 45, fill: '#3b82f6' },
    { name: 'Exploited Vuln', value: 30, fill: '#ef4444' },
    { name: 'Stolen Credentials', value: 15, fill: '#f59e0b' },
    { name: 'Supply Chain', value: 10, fill: '#8b5cf6' },
  ],
  targetedIndustries: [
    { industry: 'Healthcare', attacks: 120 },
    { industry: 'Finance', attacks: 98 },
    { industry: 'Government', attacks: 85 },
    { industry: 'Education', attacks: 64 },
    { industry: 'Retail', attacks: 45 },
  ],
  recentAlerts: [
    { id: 1, threat: 'LockBit 3.0 Campaign', type: 'Ransomware', severity: 'Critical', date: '2 hours ago' },
    { id: 2, threat: 'Phishing via Fake Teams App', type: 'Phishing', severity: 'High', date: '5 hours ago' },
    { id: 3, threat: 'DDoS on Financial Sector', type: 'DDoS', severity: 'Medium', date: '1 day ago' },
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
    { name: 'Critical (9.0-10.0)', value: 15, fill: '#ef4444' },
    { name: 'High (7.0-8.9)', value: 35, fill: '#f97316' },
    { name: 'Medium (4.0-6.9)', value: 40, fill: '#eab308' },
    { name: 'Low (0.1-3.9)', value: 10, fill: '#22c55e' },
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
    { month: 'Oct', actual: 400, predicted: 400 },
    { month: 'Nov', actual: 450, predicted: 460 },
    { month: 'Dec', actual: null, predicted: 510 },
    { month: 'Jan', actual: null, predicted: 590 },
    { month: 'Feb', actual: null, predicted: 680 },
    { month: 'Mar', actual: null, predicted: 750 },
  ],
  emergingThreats: [
    { name: 'AI-Powered Phishing', growth: '+145%', color: '#ef4444' },
    { name: 'IoT Botnets', growth: '+85%', color: '#f97316' },
    { name: 'Supply Chain Attacks', growth: '+60%', color: '#f59e0b' },
    { name: 'Deepfake Fraud', growth: '+40%', color: '#eab308' },
  ]
};

export const aiCenterMockData = {
  dailySummary: "วันนี้ระบบตรวจพบความพยายามในการโจมตีเพิ่มขึ้น 12% เมื่อเทียบกับสัปดาห์ที่แล้ว โดยมีกลุ่มเป้าหมายหลักเป็นอุตสาหกรรมการเงินและสาธารณสุข แนะนำให้ตรวจสอบระบบคลาวด์และยกระดับการยืนยันตัวตนแบบ 2FA",
  recentQueries: [
    { q: "What is the most targeted OS today?", a: "Windows Server 2022 is currently seeing the most exploit attempts." },
    { q: "Show me trends for Ransomware in Asia", a: "Ransomware activity in Asia has spiked by 24% over the last 30 days." },
    { q: "Are there any zero-days in Chrome?", a: "Yes, CVE-2026-1029 is a critical zero-day currently being exploited in the wild." }
  ]
};
