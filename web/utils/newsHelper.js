// Shared News Helper Utility
// Provides robust image fallbacks, HTML sanitization, decoding, and snippet extraction

export const stripImageMarker = (value = '') => String(value || '').split('||IMG:')[0];

export const decodeHtml = (html = '') => {
  if (!html) return '';
  let str = String(html);
  
  // Handle double encoded entities (e.g., &amp;lt; -> &lt; -> <)
  for (let i = 0; i < 2; i++) {
    const prev = str;
    str = str
      .replace(/&#038;/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8216;/g, '‘')
      .replace(/&#8217;/g, '’')
      .replace(/&#8220;/g, '“')
      .replace(/&#8221;/g, '”')
      .replace(/&#8230;/g, '…');
    if (str === prev) break;
  }
  return str;
};

const ALLOWED_RICH_TEXT_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote'
]);

export const sanitizeRichText = (value, fallback = 'ไม่มีรายละเอียดข่าว') => {
  if (!value && !fallback) return '';
  const decoded = decodeHtml(stripImageMarker(value || fallback));
  const cleaned = decoded
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|svg|math)[^>]*\/?\s*>/gi, '')
    .replace(/<\s*(\/?)\s*([a-z0-9-]+)(?:\s[^>]*)?>/gi, (_match, closingSlash, tagName) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_RICH_TEXT_TAGS.has(tag)) return '';
      if (tag === 'br') return '<br>';
      return `<${closingSlash ? '/' : ''}${tag}>`;
    })
    .trim();

  // If after cleaning it has no tags, wrap in <p>
  if (cleaned && !cleaned.startsWith('<')) {
    return `<p>${cleaned}</p>`;
  }

  return cleaned || `<p>${fallback}</p>`;
};

export const toPlainText = (value, fallback = '') => {
  if (!value && !fallback) return '';
  return sanitizeRichText(value, fallback)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|h2|h3|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const createSnippet = (value, maxLength = 120, fallback = '') => {
  const text = toPlainText(value, fallback);
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const fallbackPools = {
  tech: ['546819', '5380642', '19050634', '2599244', '1181675', '3861969', '3153198', '325153', '1714208', '2004161'],
  cyber: ['5380642', '60504', '5473298', '5380590', '5241470', '6963098', '6462662', '5380664']
};

export const getImageUrl = (newsItem, isThumbnail = false, forceFallback = false) => {
  if (!newsItem) return getFallbackImageUrl();

  // Check if the database record has direct image_url (and it's not our placeholder string)
  if (!forceFallback && newsItem.image_url && !newsItem.image_url.includes('placeholder-news')) {
    return newsItem.image_url;
  }

  // Check if we embedded an actual image URL in the summary (legacy fallback)
  if (!forceFallback && newsItem.summary && newsItem.summary.includes('||IMG:')) {
    const extracted = newsItem.summary.split('||IMG:')[1];
    if (extracted && extracted.startsWith('http')) return extracted;
  }

  const cat = (newsItem.category || 'general').toLowerCase();
  const title = (newsItem.title || '').toLowerCase();
  
  let mappedCat = 'tech';
  if (
    cat.includes('cyber') || 
    cat.includes('ransomware') || 
    cat.includes('แฮก') || 
    cat.includes('มัลแวร์') ||
    title.includes('ransomware') ||
    title.includes('cve-') ||
    title.includes('zero-day') ||
    title.includes('ช่องโหว่')
  ) {
    mappedCat = 'cyber';
  }

  const imgs = fallbackPools[mappedCat] || fallbackPools.tech;

  // Use article ID or title to reliably pick a unique image
  let hash = 0;
  const hashStr = (newsItem.id || '') + (newsItem.title || '');
  for (let i = 0; i < hashStr.length; i++) {
    hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % imgs.length;
  
  const width = isThumbnail ? 400 : 800;
  return `https://images.pexels.com/photos/${imgs[index]}/pexels-photo-${imgs[index]}.jpeg?auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
};

export const getFallbackImageUrl = () => {
  return '/images/tech_news.png';
};

export const getConfidenceScore = (id) => {
  if (!id) return 95;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return 88 + (Math.abs(hash) % 12);
};

export const getSearchableNewsText = (news) => {
  if (!news) return '';
  return [
    news.title,
    news.summary,
    news.analysis,
    news.category,
    news.source
  ].map(part => toPlainText(part)).filter(Boolean).join(' ').toLowerCase();
};
