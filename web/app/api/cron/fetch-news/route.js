import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';
import { validateCronAuth } from '../../../../utils/cronAuth';

/**
 * 📡 Cron Job: Fetch News from RSS
 * ดึงข่าวจาก Blognone + TechTalkThai → บันทึกลง Supabase
 * ใช้ upsert (ตรวจ URL ซ้ำ) แทนการลบข่าวเก่าทุกรอบ
 * 
 * Schedule: ตี 5 ทุกวัน (ก่อน send-news)
 */

// RSS Parser ง่ายๆ สำหรับ Edge Runtime
async function parseRSS(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'AI-News-Bot/1.0' }
  });
  const xml = await response.text();
  
  const items = [];
  
  // Simple XML parser for RSS/Atom feeds
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTag = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m = itemXml.match(regex);
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };
    
    // Get link (handles both RSS and Atom)
    let link = getTag('link');
    if (!link) {
      const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (linkMatch) link = linkMatch[1];
    }
    
    // Get content (try content:encoded, content, description, summary)
    let content = getTag('content:encoded') || getTag('content') || getTag('description') || getTag('summary') || '';
    
    // Get published date
    let pubDate = getTag('pubDate') || getTag('published') || getTag('updated') || '';
    
    items.push({
      title: getTag('title'),
      link: link,
      content: content,
      pubDate: pubDate
    });
  }
  
  return items;
}

function sanitizeHtml(html) {
  // ลบ script, style, iframe, form
  let clean = html.replace(/<(script|style|iframe|form|input|button|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // ลบ attributes ที่ไม่ปลอดภัย
  clean = clean.replace(/\s(on\w+|style)\s*=\s*["'][^"']*["']/gi, '');
  
  // เพิ่ม loading=lazy ให้ img
  clean = clean.replace(/<img /gi, '<img loading="lazy" ');
  
  // ลบ img ที่ src ไม่ใช่ http
  clean = clean.replace(/<img[^>]*src=["'](?!https?:\/\/)[^"']*["'][^>]*\/?>/gi, '');
  
  return clean.trim();
}

function extractFirstImage(html) {
  const match = html.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["']/i);
  return match ? match[1] : '';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

// ─────────────────────────────────────────────────────────────
// 🚨 Critical Alert — ยิงแจ้งเตือนเข้า LINE Admin ทันทีที่พบข่าวอันตราย
// ─────────────────────────────────────────────────────────────
const CRITICAL_KEYWORDS = [
  'ransomware', 'แรนซัมแวร์',
  'zero-day', 'zero day', 'ช่องโหว่วิกฤต',
  'data breach', 'ข้อมูลหลุด', 'ข้อมูลรั่วไหล',
  'critical vulnerability', 'cve-',
  'remote code execution', 'rce',
  'supply chain attack',
  'nation-state', 'apt',
  'mass exploit',
];

function isCritical(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  return CRITICAL_KEYWORDS.some(kw => text.includes(kw));
}

async function sendCriticalLineAlert(article) {
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.replace(/[\uFEFF\r\n\t\s]/g, '').trim();
  if (!lineToken) return; // ไม่มี Token ข้ามไป

  const message = {
    type: 'flex',
    altText: `🚨 [CRITICAL ALERT] ${article.title}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#DC2626',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: '🚨 CRITICAL SECURITY ALERT', color: '#ffffff', weight: 'bold', size: 'sm' },
          { type: 'text', text: 'CyberInsight AI — แจ้งเตือนด่วน', color: '#fca5a5', size: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        spacing: 'md',
        contents: [
          { type: 'text', text: article.title, wrap: true, weight: 'bold', size: 'sm', color: '#1e293b' },
          { type: 'text', text: `📰 แหล่งข่าว: ${article.source}`, size: 'xs', color: '#64748b', wrap: true },
          { type: 'text', text: `🕐 พบเมื่อ: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, size: 'xs', color: '#64748b' },
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        contents: [{
          type: 'button',
          action: { type: 'uri', label: '📖 อ่านรายละเอียดข่าวเต็ม', uri: article.url },
          style: 'primary',
          color: '#DC2626'
        }]
      }
    }
  };

  try {
    await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lineToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [message] })
    });
    console.log(`🚨 Critical Alert Sent: ${article.title}`);
  } catch (err) {
    console.error('Critical LINE Alert Error:', err.message);
  }
}

export async function GET(req) {
  const auth = validateCronAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return handleFetch();
}

export async function POST(req) {
  const auth = validateCronAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return handleFetch();
}

async function handleFetch() {
  try {
    const sources = [
      { url: 'https://www.blognone.com/atom.xml', category: 'Tech', source: 'Blognone' },
      { url: 'https://www.techtalkthai.com/feed/', category: 'Cybersecurity', source: 'TechTalkThai' }
    ];

    let totalInserted = 0;
    let totalSkipped = 0;
    const errors = [];

    for (const src of sources) {
      try {
        console.log(`📡 Fetching ${src.source}...`);
        const items = await parseRSS(src.url);
        const topItems = items.slice(0, 7); // ดึง 7 ข่าวล่าสุด

        for (const item of topItems) {
          if (!item.link || !item.title) continue;

          // ตรวจสอบว่ามี URL นี้ในฐานข้อมูลแล้วหรือไม่
          const { data: existing } = await supabase
            .from('news_articles')
            .select('id')
            .eq('url', item.link)
            .limit(1);

          if (existing && existing.length > 0) {
            totalSkipped++;
            continue; // มีแล้ว ข้ามไป
          }

          // Sanitize content
          const cleanHtml = sanitizeHtml(item.content).substring(0, 8000);
          const imageUrl = extractFirstImage(item.content);
          
          // สร้าง summary field (เก็บ HTML + thumbnail URL ไว้เป็น legacy fallback)
          let summaryField = cleanHtml || `<p>${item.title}</p>`;
          if (imageUrl) {
            summaryField += `||IMG:${imageUrl}`;
          }

          // Parse published date
          let publishedAt = new Date().toISOString();
          if (item.pubDate) {
            try {
              publishedAt = new Date(item.pubDate).toISOString();
            } catch (e) { /* use default */ }
          }

          const article = {
            title: item.title,
            url: item.link,
            source: src.source,
            category: src.category,
            summary: summaryField,
            published_at: publishedAt,
            sentiment: 'Neutral',
            impact_level: 'Medium'
          };

          const { error: insertError } = await supabase
            .from('news_articles')
            .insert(article);

          if (insertError) {
            // URL duplicate constraint
            if (insertError.code === '23505') {
              totalSkipped++;
            } else {
              errors.push(`${item.title}: ${insertError.message}`);
            }
          } else {
            totalInserted++;
            // 🚨 ถ้าเป็นข่าว Critical → แจ้งเตือน LINE Admin ทันที
            if (isCritical(article.title, article.summary || '')) {
              await sendCriticalLineAlert(article);
            }
          }
        }
      } catch (srcError) {
        errors.push(`${src.source}: ${srcError.message}`);
      }
    }

    // ลบข่าวเก่าเกิน 14 วัน
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .lt('created_at', fourteenDaysAgo);
    
    if (deleteError) {
      errors.push(`Cleanup: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      inserted: totalInserted,
      skipped: totalSkipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch News Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
