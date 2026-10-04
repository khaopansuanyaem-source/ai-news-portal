/**
 * 🖥️ OS / Platform Classification Engine (Client-Side)
 * 
 * Client-side version ของ OS Classifier สำหรับ:
 * 1. Fallback เมื่อ backend ยังไม่ได้ classify
 * 2. Real-time classification สำหรับข่าวที่ยังไม่มี os_classification ใน DB
 * 3. ใช้ OS Taxonomy เดียวกับ Python version
 * 
 * Multi-label, Evidence-based, Extensible
 */

// ══════════════════════════════════════════════════════════
// 📚 OS TAXONOMY — เพิ่ม OS ใหม่ได้โดยไม่ต้องแก้ logic
// ══════════════════════════════════════════════════════════

export const OS_TAXONOMY = {
  // ─── Desktop / Laptop ───
  'Windows':        { category: 'Desktop/Laptop', keywords: ['windows 10','windows 11','windows desktop','microsoft windows','win10','win11'], icon: '🪟', color: '#0078d4' },
  'macOS':          { category: 'Desktop/Laptop', keywords: ['macos','mac os','os x','osx','macbook','imac','mac mini','mac pro','mac studio','apple mac'], icon: '🍎', color: '#a3aaae' },
  'Linux':          { category: 'Desktop/Laptop', keywords: ['linux desktop','linux kernel','linux systems','gnu/linux','linux-based'], icon: '🐧', color: '#fcc624' },
  'ChromeOS':       { category: 'Desktop/Laptop', keywords: ['chromeos','chrome os','chromebook','chromebox'], icon: '💻', color: '#4285f4' },

  // ─── Mobile ───
  'Android':        { category: 'Mobile', keywords: ['android phone','android mobile','android smartphone','android device','google android'], icon: '🤖', color: '#3ddc84' },
  'iOS':            { category: 'Mobile', keywords: ['ios','iphone','apple ios'], icon: '📱', color: '#007aff' },

  // ─── Tablet ───
  'iPadOS':         { category: 'Tablet', keywords: ['ipados','ipad os','ipad'], icon: '📱', color: '#007aff' },

  // ─── Server ───
  'Windows Server': { category: 'Server', keywords: ['windows server','win server','microsoft server'], icon: '🖥️', color: '#0078d4' },
  'Linux Server':   { category: 'Server', keywords: ['linux server','linux vps','linux hosting'], icon: '🐧', color: '#fcc624' },
  'Unix':           { category: 'Server', keywords: ['unix','solaris','hp-ux','aix'], icon: '🖥️', color: '#6c757d' },
  'BSD':            { category: 'Server', keywords: ['freebsd','openbsd','netbsd','bsd'], icon: '😈', color: '#ab1100' },

  // ─── Linux Distribution ───
  'Ubuntu':         { category: 'Linux Distribution', keywords: ['ubuntu'], icon: '🟠', color: '#e95420' },
  'Debian':         { category: 'Linux Distribution', keywords: ['debian'], icon: '🔴', color: '#a80030' },
  'Fedora':         { category: 'Linux Distribution', keywords: ['fedora'], icon: '🔵', color: '#3c6eb4' },
  'RHEL':           { category: 'Linux Distribution', keywords: ['rhel','red hat enterprise','redhat enterprise','red hat linux'], icon: '🎩', color: '#ee0000' },
  'CentOS':         { category: 'Linux Distribution', keywords: ['centos','cent os'], icon: '🟢', color: '#932279' },
  'Rocky Linux':    { category: 'Linux Distribution', keywords: ['rocky linux','rockylinux'], icon: '🪨', color: '#10b981' },
  'AlmaLinux':      { category: 'Linux Distribution', keywords: ['almalinux','alma linux'], icon: '🟣', color: '#0f4266' },
  'Amazon Linux':   { category: 'Linux Distribution', keywords: ['amazon linux','amzn linux','al2023','al2'], icon: '🟡', color: '#ff9900' },
  'Kali Linux':     { category: 'Linux Distribution', keywords: ['kali linux','kali'], icon: '🐉', color: '#2e7bcf' },
  'Arch Linux':     { category: 'Linux Distribution', keywords: ['arch linux','archlinux','arch-based','manjaro'], icon: '🏗️', color: '#1793d1' },
  'SLES':           { category: 'Linux Distribution', keywords: ['sles','suse linux enterprise','suse enterprise'], icon: '🦎', color: '#73ba25' },
  'openSUSE':       { category: 'Linux Distribution', keywords: ['opensuse','open suse'], icon: '🦎', color: '#73ba25' },

  // ─── Smart TV ───
  'Android TV':     { category: 'Smart TV', keywords: ['android tv','google tv'], icon: '📺', color: '#3ddc84' },
  'tvOS':           { category: 'Smart TV', keywords: ['tvos','apple tv'], icon: '📺', color: '#007aff' },
  'Tizen':          { category: 'Smart TV', keywords: ['tizen','samsung tv','samsung smart tv'], icon: '📺', color: '#1428a0' },
  'webOS':          { category: 'Smart TV', keywords: ['webos','lg tv','lg smart tv'], icon: '📺', color: '#a50034' },
  'Roku OS':        { category: 'Smart TV', keywords: ['roku','roku os'], icon: '📺', color: '#6c3c97' },

  // ─── Wearable ───
  'watchOS':        { category: 'Wearable', keywords: ['watchos','apple watch'], icon: '⌚', color: '#007aff' },
  'Wear OS':        { category: 'Wearable', keywords: ['wear os','wearos','android wear','google wear'], icon: '⌚', color: '#4285f4' },

  // ─── Gaming ───
  'SteamOS':        { category: 'Gaming', keywords: ['steamos','steam os','steam deck'], icon: '🎮', color: '#1b2838' },
  'PlayStation OS': { category: 'Gaming', keywords: ['playstation','ps4','ps5','psn','playstation network'], icon: '🎮', color: '#003791' },
  'Xbox OS':        { category: 'Gaming', keywords: ['xbox','xbox one','xbox series'], icon: '🎮', color: '#107c10' },
  'Nintendo Switch OS': { category: 'Gaming', keywords: ['nintendo switch','switch firmware','nintendo'], icon: '🎮', color: '#e60012' },

  // ─── IoT / Embedded ───
  'OpenWrt':        { category: 'IoT/Embedded', keywords: ['openwrt','open wrt','lede'], icon: '🌐', color: '#00a3e0' },
  'Embedded Linux': { category: 'IoT/Embedded', keywords: ['embedded linux','busybox','yocto','buildroot'], icon: '🔌', color: '#fcc624' },
  'FreeRTOS':       { category: 'IoT/Embedded', keywords: ['freertos','free rtos','aws iot rtos'], icon: '🔌', color: '#ff9900' },

  // ─── Automotive ───
  'Android Automotive OS': { category: 'Automotive', keywords: ['android automotive','aaos','android auto'], icon: '🚗', color: '#3ddc84' },
  'Automotive Linux':      { category: 'Automotive', keywords: ['automotive linux','automotive grade linux','agl'], icon: '🚗', color: '#fcc624' },
};

// All available OS categories for filter UI
export const OS_CATEGORIES = [
  { id: 'Desktop/Laptop', label: 'Desktop/Laptop', icon: '💻' },
  { id: 'Mobile',         label: 'Mobile',         icon: '📱' },
  { id: 'Tablet',         label: 'Tablet',         icon: '📱' },
  { id: 'Server',         label: 'Server',         icon: '🖥️' },
  { id: 'Linux Distribution', label: 'Linux Distro', icon: '🐧' },
  { id: 'Smart TV',       label: 'Smart TV',       icon: '📺' },
  { id: 'Wearable',       label: 'Wearable',       icon: '⌚' },
  { id: 'Gaming',         label: 'Gaming',         icon: '🎮' },
  { id: 'IoT/Embedded',   label: 'IoT/Embedded',   icon: '🔌' },
  { id: 'Automotive',     label: 'Automotive',      icon: '🚗' },
];

// Quick-access OS list for filter UI (most commonly referenced)
export const POPULAR_OS_LIST = [
  'Windows', 'macOS', 'Linux', 'Android', 'iOS',
  'Ubuntu', 'Debian', 'Windows Server', 'ChromeOS', 'RHEL',
];

// ══════════════════════════════════════════════════════════
// 🔍 CLASSIFICATION LOGIC
// ══════════════════════════════════════════════════════════

// Priority order for disambiguation (specific → generic)
const PRIORITY_ORDER = [
  'Windows Server',
  'Ubuntu', 'Debian', 'Fedora', 'RHEL', 'CentOS', 'Rocky Linux', 'AlmaLinux',
  'Amazon Linux', 'Kali Linux', 'Arch Linux', 'SLES', 'openSUSE',
  'Android TV', 'Android Automotive OS', 'Automotive Linux',
  'iPadOS', 'tvOS', 'watchOS', 'Wear OS',
  'SteamOS', 'PlayStation OS', 'Xbox OS', 'Nintendo Switch OS',
  'Tizen', 'webOS', 'Roku OS',
  'OpenWrt', 'Embedded Linux', 'FreeRTOS',
  'Windows', 'macOS', 'ChromeOS',
  'Android', 'iOS',
  'Linux Server', 'Linux', 'Unix', 'BSD',
];

/**
 * Extract a short evidence snippet around the matched keyword
 */
function extractEvidence(text, keyword, window = 120) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - Math.floor(window / 2));
  const end = Math.min(text.length, idx + keyword.length + Math.floor(window / 2));
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

/**
 * Calculate confidence score based on where the OS was found
 */
function calcConfidence(titleMatch, contentMatch, keywordCount, hasVersion) {
  let score = 0;
  if (titleMatch) score += 0.55;
  if (contentMatch) score += 0.25;
  score += Math.min(keywordCount * 0.05, 0.15);
  if (hasVersion) score += 0.05;
  return Math.min(parseFloat(score.toFixed(2)), 0.99);
}

/**
 * Classify OS/Platform from news text — client-side fallback
 * 
 * @param {Object} newsItem - { title, summary, content }
 * @returns {Object} OS classification result
 */
export function classifyOS(newsItem = {}) {
  const title = (newsItem.title || '').toLowerCase();
  const summary = (newsItem.summary || '').toLowerCase();
  const content = (newsItem.content || '').toLowerCase();
  const fullText = `${title} ${summary} ${content}`;
  const fullTextRaw = `${newsItem.title || ''} ${newsItem.summary || ''} ${newsItem.content || ''}`;

  const classifications = [];
  const detectedNames = new Set();

  for (const osName of PRIORITY_ORDER) {
    const entry = OS_TAXONOMY[osName];
    if (!entry) continue;

    let titleMatch = false;
    let contentMatch = false;
    let keywordCount = 0;
    let matchedKeyword = '';

    // Check keywords
    for (const kw of entry.keywords) {
      if (title.includes(kw)) { titleMatch = true; keywordCount++; if (!matchedKeyword) matchedKeyword = kw; }
      if (summary.includes(kw) || content.includes(kw)) { contentMatch = true; keywordCount++; if (!matchedKeyword) matchedKeyword = kw; }
    }

    // Check OS name itself
    const osLower = osName.toLowerCase();
    if (title.includes(osLower)) { titleMatch = true; keywordCount++; if (!matchedKeyword) matchedKeyword = osLower; }
    if (summary.includes(osLower) || content.includes(osLower)) { contentMatch = true; keywordCount++; if (!matchedKeyword) matchedKeyword = osLower; }

    if (!titleMatch && !contentMatch) continue;

    // ─── Disambiguation rules ───
    let skip = false;
    if (osName === 'Android' && (detectedNames.has('Android TV') || detectedNames.has('Android Automotive OS'))) {
      if (!['android phone', 'android mobile', 'android smartphone'].some(k => fullText.includes(k))) skip = true;
    }
    if (osName === 'Linux') {
      const distros = ['Ubuntu','Debian','Fedora','RHEL','CentOS','Rocky Linux','AlmaLinux','Amazon Linux','Kali Linux','Arch Linux','SLES','openSUSE','Embedded Linux','Automotive Linux','Linux Server'];
      if (distros.some(d => detectedNames.has(d))) {
        if (!['linux kernel', 'linux systems', 'linux-based'].some(k => fullText.includes(k))) skip = true;
      }
    }
    if (osName === 'Windows' && detectedNames.has('Windows Server')) {
      if (!['windows 10', 'windows 11', 'windows desktop', 'win10', 'win11'].some(k => fullText.includes(k))) skip = true;
    }
    if (skip) continue;

    // Extract version (simple pattern matching)
    let versions = [];
    const versionPatterns = [
      new RegExp(osLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*(\\d+(?:\\.\\d+)*)', 'gi'),
    ];
    for (const vp of versionPatterns) {
      const matches = [...fullTextRaw.matchAll(vp)];
      for (const m of matches) {
        if (m[1] && !versions.includes(m[1])) versions.push(m[1]);
      }
    }

    const evidence = extractEvidence(fullTextRaw, matchedKeyword);
    const confidence = calcConfidence(titleMatch, contentMatch, keywordCount, versions.length > 0);

    classifications.push({
      os_name: osName,
      os_category: entry.category,
      os_version: versions.length > 0 ? `${osName} ${versions[0]}` : null,
      affected_versions: versions.length > 0 ? versions : null,
      confidence_score: confidence,
      evidence,
      icon: entry.icon,
      color: entry.color,
    });
    detectedNames.add(osName);
  }

  // Default: No OS
  if (classifications.length === 0) {
    return {
      os_classifications: [{
        os_name: 'General / Not Specified',
        os_category: 'General',
        os_version: null,
        affected_versions: null,
        confidence_score: 1.0,
        evidence: 'ไม่พบข้อมูลระบบปฏิบัติการในเนื้อหาข่าว',
        icon: '🌐',
        color: '#64748b',
      }],
      primary_os: 'General / Not Specified',
      primary_category: 'General',
      os_names: ['General / Not Specified'],
      os_categories: ['General'],
      has_os_info: false,
    };
  }

  classifications.sort((a, b) => b.confidence_score - a.confidence_score);

  return {
    os_classifications: classifications,
    primary_os: classifications[0].os_name,
    primary_category: classifications[0].os_category,
    os_names: [...new Set(classifications.map(c => c.os_name))],
    os_categories: [...new Set(classifications.map(c => c.os_category))],
    has_os_info: true,
  };
}

/**
 * Get OS classification from a news article — uses DB data if available, falls back to client-side
 */
export function getOsClassification(newsItem) {
  // If the news item already has os_classification from the database, use it
  if (newsItem?.os_classification?.os_classifications?.length > 0) {
    // Enrich with icon/color from taxonomy if missing
    const enriched = { ...newsItem.os_classification };
    enriched.os_classifications = enriched.os_classifications.map(c => ({
      ...c,
      icon: c.icon || OS_TAXONOMY[c.os_name]?.icon || '🖥️',
      color: c.color || OS_TAXONOMY[c.os_name]?.color || '#64748b',
    }));
    return enriched;
  }

  // Fallback: classify on the client
  return classifyOS({
    title: newsItem?.title || '',
    summary: newsItem?.summary || '',
    content: newsItem?.analysis || newsItem?.content || '',
  });
}
