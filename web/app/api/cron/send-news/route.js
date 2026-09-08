import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';
import { validateCronAuth } from '../../../../utils/cronAuth';

/**
 * 📬 Cron Job: Daily Morning Brief → LINE OA
 * 
 * Flow:
 * 1. เรียก /api/cron/fetch-news ดึงข่าวใหม่ก่อน
 * 2. ดึง 6 ข่าวล่าสุดจาก Supabase  
 * 3. ใช้ Gemini AI สรุปข่าวรายวัน
 * 4. สร้าง Premium Flex Message Carousel
 * 5. Broadcast ไป LINE OA
 * 
 * Schedule: 05:00 AM Bangkok (UTC 22:00)
 */

export async function GET(req) {
  const auth = validateCronAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return handleCron(req);
}

export async function POST(req) {
  const auth = validateCronAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return handleCron(req);
}

// ─── Utility Functions ───

function stripHtml(html) {
  if (!html) return '';
  return html
    // ลบ ||IMG:url ก่อน
    .replace(/\|\|IMG:[^\s]*/g, '')
    // ลบ HTML tags ทั้งหมด
    .replace(/<[^>]*>/g, ' ')
    // ลบ HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    // ลบ whitespace ซ้ำ
    .replace(/\s+/g, ' ')
    .trim();
}

function getCleanSummary(article) {
  if (!article.summary) return '';
  
  let text = stripHtml(article.summary);
  
  // ตรวจสอบว่าเนื้อหาสะอาดพอไหม (ไม่มี HTML artifacts เหลืออยู่)
  // ถ้ายังมี class=, style=, div, span ซ้อนอยู่ = ไม่สะอาด → ใช้แค่ title
  if (text.includes('class=') || text.includes('field--') || text.includes('style=')) {
    return ''; // ส่งกลับว่างเปล่า ให้ใช้ fallback
  }
  
  // ตัดให้สั้นพอดี
  if (text.length > 160) {
    text = text.substring(0, 160) + '...';
  }
  
  return text;
}

function getTimeGreeting() {
  const hour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false });
  const h = parseInt(hour);
  if (h >= 5 && h < 12) return '🌅 สวัสดีตอนเช้า';
  if (h >= 12 && h < 17) return '☀️ สวัสดีตอนบ่าย';
  if (h >= 17 && h < 21) return '🌆 สวัสดีตอนเย็น';
  return '🌙 สวัสดีตอนค่ำ';
}

function getThaiDate() {
  const now = new Date();
  return now.toLocaleDateString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    weekday: 'long'
  });
}

function getShortDate() {
  const now = new Date();
  return now.toLocaleDateString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'เมื่อสักครู่';
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return '';
}

// ─── Gemini AI Summary ───

async function generateDailySummary(articles) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  // สร้าง context จากข่าวทั้งหมด
  const newsContext = articles.map((a, i) => {
    const cleanText = stripHtml(a.summary || '').substring(0, 200);
    return `${i + 1}. [${a.category}] ${a.title} — ${cleanText}`;
  }).join('\n');

  const prompt = `จากข่าวเทคโนโลยีและไซเบอร์ซีเคียวริตี้วันนี้ ${articles.length} ข่าว:

${newsContext}

สรุปภาพรวมข่าวเด่นวันนี้ให้กระชับ 3-5 บรรทัด เขียนเป็นภาษาไทย ใช้โทนเป็นกันเอง อ่านง่าย ห้ามใช้ Markdown (ห้ามใช้ **, *, #) ห้ามใช้หัวข้อย่อย ให้เป็นย่อหน้าเดียวต่อเนื่องกัน ปิดท้ายด้วยวิเคราะห์สั้นๆ ว่าข่าวเหล่านี้บ่งบอกแนวโน้มอะไร`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
      })
    });

    const json = await response.json();
    if (json.candidates && json.candidates.length > 0) {
      let text = json.candidates[0].content.parts[0].text;
      // ลบ Markdown artifacts ที่ AI อาจใส่มา
      text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/###?\s/g, '').replace(/---/g, '');
      return text.trim();
    }
  } catch (err) {
    console.error('Gemini summary error:', err);
  }
  return null;
}

// ─── Main Handler ───

async function handleCron(req) {
  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const lineToken = rawToken ? rawToken.replace(/[\uFEFF\r\n\t\s]/g, '').trim() : null;

  if (!lineToken) {
    return NextResponse.json({ error: "Missing LINE_TOKEN" }, { status: 500 });
  }

  try {
    // ─── Step 1: Fetch ข่าวใหม่ก่อน ───
    console.log('📡 Step 1: Fetching fresh news...');
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    try {
      const fetchRes = await fetch(`${baseUrl}/api/cron/fetch-news`, { method: 'GET' });
      const fetchResult = await fetchRes.json();
      console.log('📡 Fetch result:', fetchResult);
    } catch (fetchErr) {
      console.warn('⚠️ Fetch news step failed (continuing anyway):', fetchErr.message);
    }

    // ─── Step 2: ดึงข่าวล่าสุดจาก Supabase ───
    console.log('📋 Step 2: Loading articles from Supabase...');
    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (fetchError) throw fetchError;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "No news articles available." }, { status: 200 });
    }

    // แยกข่าวตาม category
    const techArticles = articles.filter(a => a.category === 'Tech');
    const cyberArticles = articles.filter(a => a.category === 'Cybersecurity');

    // ─── Step 3: AI สรุปข่าวรายวัน ───
    console.log('🤖 Step 3: Generating AI daily summary...');
    const aiSummary = await generateDailySummary(articles);

    // ─── Step 4: สร้าง Premium Flex Message ───
    console.log('🎨 Step 4: Building premium Flex Message...');

    const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-mu-two-44.vercel.app/';
    const greeting = getTimeGreeting();
    const thaiDate = getThaiDate();
    const shortDate = getShortDate();

    // ══════════════════════════════════════════
    // 🎯 Bubble 1: Hero Cover Card
    // ══════════════════════════════════════════
    const heroBubble = {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "AI NEWS PORTAL",
                color: "#ffffff",
                size: "xs",
                weight: "bold"
              }
            ],
            backgroundColor: "#ffffff20",
            cornerRadius: "xl",
            paddingAll: "8px",
            paddingStart: "14px",
            paddingEnd: "14px",
            width: "130px"
          },
          {
            type: "text",
            text: greeting,
            color: "#ffffff",
            size: "xl",
            weight: "bold",
            margin: "xl"
          },
          {
            type: "text",
            text: thaiDate,
            color: "#ffffffaa",
            size: "xs",
            margin: "sm"
          },
          {
            type: "separator",
            color: "#ffffff30",
            margin: "xl"
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${articles.length}`,
                    color: "#ffffff",
                    size: "xxl",
                    weight: "bold",
                    align: "center"
                  },
                  {
                    type: "text",
                    text: "ข่าววันนี้",
                    color: "#ffffffaa",
                    size: "xxs",
                    align: "center"
                  }
                ],
                flex: 1
              },
              {
                type: "separator",
                color: "#ffffff30"
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${techArticles.length}`,
                    color: "#4ade80",
                    size: "xxl",
                    weight: "bold",
                    align: "center"
                  },
                  {
                    type: "text",
                    text: "Tech & AI",
                    color: "#ffffffaa",
                    size: "xxs",
                    align: "center"
                  }
                ],
                flex: 1
              },
              {
                type: "separator",
                color: "#ffffff30"
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${cyberArticles.length}`,
                    color: "#f87171",
                    size: "xxl",
                    weight: "bold",
                    align: "center"
                  },
                  {
                    type: "text",
                    text: "Cyber",
                    color: "#ffffffaa",
                    size: "xxs",
                    align: "center"
                  }
                ],
                flex: 1
              }
            ],
            margin: "xl",
            spacing: "md"
          }
        ],
        backgroundColor: "#0f172a",
        paddingAll: "24px",
        paddingBottom: "24px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🔔 สรุปข่าวเด่นที่ AI คัดมาให้วันนี้",
            size: "sm",
            color: "#64748b",
            wrap: true
          },
          {
            type: "text",
            text: "เลื่อนดูการ์ดถัดไปเพื่ออ่านข่าว →",
            size: "xs",
            color: "#94a3b8",
            margin: "sm"
          }
        ],
        paddingAll: "20px",
        backgroundColor: "#f8fafc"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#4f46e5",
            height: "sm",
            action: {
              type: "uri",
              label: "🌐 เปิด Dashboard อ่านแบบเต็ม",
              uri: dashboardUrl
            }
          }
        ],
        paddingAll: "16px",
        backgroundColor: "#f8fafc"
      }
    };

    // ══════════════════════════════════════════
    // 🤖 Bubble 2: AI Daily Summary (วิเคราะห์รายวัน)
    // ══════════════════════════════════════════
    let summaryBubble = null;
    if (aiSummary) {
      // ตัดให้ไม่เกิน 800 ตัวอักษร (LINE limit)
      const truncatedSummary = aiSummary.length > 800 
        ? aiSummary.substring(0, 800) + '...' 
        : aiSummary;

      summaryBubble = {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "🤖 AI วิเคราะห์ข่าวประจำวัน",
              color: "#ffffff",
              size: "sm",
              weight: "bold",
              flex: 1
            },
            {
              type: "text",
              text: shortDate,
              color: "#ffffffaa",
              size: "xxs",
              align: "end",
              gravity: "center",
              flex: 0
            }
          ],
          backgroundColor: "#7c3aed",
          paddingAll: "18px"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "📝 สรุปภาพรวมจาก AI",
              size: "sm",
              weight: "bold",
              color: "#4c1d95",
              margin: "none"
            },
            {
              type: "separator",
              color: "#e2e8f0",
              margin: "md"
            },
            {
              type: "text",
              text: truncatedSummary,
              wrap: true,
              size: "sm",
              color: "#374151",
              margin: "lg",
              lineSpacing: "6px"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: `📊 วิเคราะห์จากข่าว ${articles.length} ข่าว`,
                  size: "xxs",
                  color: "#9ca3af"
                }
              ],
              margin: "xl"
            }
          ],
          paddingAll: "20px",
          backgroundColor: "#faf5ff"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#7c3aed",
              height: "sm",
              action: {
                type: "message",
                label: "💬 ถาม AI เพิ่มเติม",
                text: "วิเคราะห์เจาะลึกข่าวเทคโนโลยีวันนี้ให้หน่อย"
              }
            }
          ],
          paddingAll: "16px",
          backgroundColor: "#faf5ff"
        }
      };
    }

    // ══════════════════════════════════════════
    // 📰 Bubble 3+: News Article Cards
    // ══════════════════════════════════════════
    const newsBubbles = articles.map((article, index) => {
      // ดึง thumbnail
      let imageUrl = null;
      if (article.summary && article.summary.includes('||IMG:')) {
        imageUrl = article.summary.split('||IMG:')[1];
      }

      // ดึง plain text สรุป (ใช้ฟังก์ชันใหม่ที่สะอาดกว่า)
      let summaryText = getCleanSummary(article);
      
      // ถ้าไม่มีเนื้อหาสะอาด → ใช้ title ซ้ำเป็น fallback
      if (!summaryText) {
        summaryText = `อ่านรายละเอียดเพิ่มเติมของ "${article.title}" ได้ที่เว็บไซต์`;
        if (summaryText.length > 160) {
          summaryText = 'กดปุ่มด้านล่างเพื่ออ่านรายละเอียดข่าวฉบับเต็ม';
        }
      }

      const isTech = article.category === 'Tech';
      const catEmoji = isTech ? '💻' : '🛡️';
      const catLabel = isTech ? 'TECHNOLOGY' : 'CYBERSECURITY';
      const accentColor = isTech ? '#10b981' : '#ef4444';
      const headerBg = isTech ? '#065f46' : '#991b1b';
      const timeAgo = getRelativeTime(article.published_at || article.created_at);

      const bubble = {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `${catEmoji} ${catLabel}`,
                  color: "#ffffff",
                  size: "xxs",
                  weight: "bold"
                }
              ],
              backgroundColor: accentColor,
              cornerRadius: "md",
              paddingAll: "6px",
              paddingStart: "12px",
              paddingEnd: "12px"
            },
            {
              type: "text",
              text: `#${index + 1}`,
              color: "#ffffffaa",
              size: "sm",
              weight: "bold",
              align: "end",
              gravity: "center",
              flex: 0
            }
          ],
          backgroundColor: headerBg,
          paddingAll: "16px"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            // Title
            {
              type: "text",
              text: article.title || 'ไม่มีหัวข้อ',
              weight: "bold",
              size: "md",
              wrap: true,
              maxLines: 3,
              color: "#1e293b"
            },
            // Source + Time
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: `📰 ${article.source || 'News'}`,
                  size: "xxs",
                  color: "#94a3b8",
                  flex: 0
                },
                ...(timeAgo ? [{
                  type: "text",
                  text: `⏱️ ${timeAgo}`,
                  size: "xxs",
                  color: "#94a3b8",
                  align: "end"
                }] : [])
              ],
              margin: "md"
            },
            // Divider
            {
              type: "separator",
              color: "#e2e8f0",
              margin: "lg"
            },
            // Summary
            {
              type: "text",
              text: summaryText,
              size: "sm",
              color: "#475569",
              wrap: true,
              maxLines: 5,
              margin: "lg"
            }
          ],
          paddingAll: "20px",
          backgroundColor: "#ffffff"
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "button",
              style: "primary",
              color: accentColor,
              height: "sm",
              flex: 2,
              action: {
                type: "uri",
                label: "📖 อ่านข่าวเต็ม",
                uri: `${dashboardUrl}?article=${article.id}`
              }
            },
            {
              type: "button",
              style: "secondary",
              height: "sm",
              flex: 1,
              action: {
                type: "uri",
                label: "ต้นฉบับ",
                uri: article.url || dashboardUrl
              }
            }
          ],
          spacing: "sm",
          paddingAll: "16px"
        }
      };

      // เพิ่ม Hero Image ถ้ามีรูป
      if (imageUrl) {
        bubble.hero = {
          type: "image",
          url: imageUrl,
          size: "full",
          aspectRatio: "20:10",
          aspectMode: "cover"
        };
      }

      return bubble;
    });

    // ══════════════════════════════════════════
    // 📊 Bubble สุดท้าย: CTA
    // ══════════════════════════════════════════
    const ctaBubble = {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📊",
            size: "3xl",
            align: "center"
          },
          {
            type: "text",
            text: "อ่านข่าวทั้งหมดได้ที่",
            size: "lg",
            weight: "bold",
            color: "#1e293b",
            align: "center",
            margin: "xl"
          },
          {
            type: "text",
            text: "AI News Dashboard",
            size: "md",
            color: "#4f46e5",
            weight: "bold",
            align: "center",
            margin: "sm"
          },
          {
            type: "text",
            text: "พร้อมฟีเจอร์ค้นหา กรองหมวดหมู่\nและอ่านข่าวฉบับเต็มพร้อมรูปภาพ",
            size: "xs",
            color: "#94a3b8",
            align: "center",
            wrap: true,
            margin: "lg"
          },
          {
            type: "separator",
            color: "#e2e8f0",
            margin: "xl"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "💬 พิมพ์ถามน้องนักข่าวได้เลย!",
                size: "xs",
                color: "#64748b",
                align: "center",
                wrap: true
              },
              {
                type: "text",
                text: 'เช่น "สรุปข่าวเด่นวันนี้" หรือ "ข่าวไซเบอร์ล่าสุด"',
                size: "xxs",
                color: "#94a3b8",
                align: "center",
                wrap: true,
                margin: "sm"
              }
            ],
            margin: "xl"
          }
        ],
        paddingAll: "30px",
        justifyContent: "center",
        backgroundColor: "#f8fafc"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#4f46e5",
            action: {
              type: "uri",
              label: "🌐 เปิด AI News Dashboard",
              uri: dashboardUrl
            }
          },
          {
            type: "button",
            style: "secondary",
            margin: "sm",
            action: {
              type: "message",
              label: "💬 ถาม AI สรุปข่าววันนี้",
              text: "สรุปข่าวเด่นวันนี้ให้หน่อย"
            }
          }
        ],
        paddingAll: "16px",
        backgroundColor: "#f8fafc"
      }
    };

    // ── รวม Carousel (max 12 bubbles ตาม LINE limit) ───
    const carouselBubbles = [heroBubble];
    if (summaryBubble) carouselBubbles.push(summaryBubble);
    carouselBubbles.push(...newsBubbles);
    carouselBubbles.push(ctaBubble);

    // LINE Carousel limit = 12 bubbles
    const finalBubbles = carouselBubbles.slice(0, 12);

    const flexMessage = {
      type: "flex",
      altText: `📢 AI NEWS — สรุปข่าวเด่น ${shortDate} (${articles.length} ข่าว)`,
      contents: {
        type: "carousel",
        contents: finalBubbles
      }
    };

    // ─── Step 5: Multicast ไปหา VIP Members ใน LINE OA ───
    console.log('🚀 Step 5: Fetching members and sending multicast...');
    
    // ประเมินระดับภัยคุกคามประจำวัน (Daily Threat Level)
    let maxThreatWeight = 0; // 0=ALL, 1=MODERATE, 2=HIGH, 3=CRITICAL
    articles.forEach(a => {
      const text = (a.title + ' ' + (a.summary || '')).toLowerCase();
      if (text.includes('ransomware') || text.includes('zero-day') || text.includes('critical') || text.includes('breach') || text.includes('รั่วไหล')) {
        maxThreatWeight = Math.max(maxThreatWeight, 3);
      } else if (text.includes('vulnerability') || text.includes('hack') || text.includes('cve') || text.includes('attack') || text.includes('โจมตี')) {
        maxThreatWeight = Math.max(maxThreatWeight, 2);
      } else if (text.includes('patch') || text.includes('update') || text.includes('security') || text.includes('อัปเดต')) {
        maxThreatWeight = Math.max(maxThreatWeight, 1);
      }
    });

    console.log(`🛡️ Daily Threat Level evaluated to weight: ${maxThreatWeight}`);

    // ดึงรายชื่อคนที่เป็นสมาชิกจากฐานข้อมูล
    const { data: members, error: memberError } = await supabase.from('members').select('line_uid');
    
    if (memberError) {
      console.warn("⚠️ Failed to fetch members, falling back to broadcast:", memberError);
    }

    // ดึง User Preferences สำหรับเช็ก Alert Threshold
    const { data: prefs } = await supabase.from('user_preferences').select('line_user_id, alert_level');
    const prefMap = {};
    if (prefs) {
      prefs.forEach(p => { prefMap[p.line_user_id] = p.alert_level || 'ALL'; });
    }
    
    const levelWeight = { 'ALL': 0, 'MODERATE': 1, 'HIGH': 2, 'CRITICAL': 3 };

    let res;
    let recipientCount = 0;
    let sendMethod = 'multicast';
    
    if (members && members.length > 0) {
      // คัดกรอง User ตาม Alert Threshold ที่ตั้งไว้ใน LIFF
      const userIds = members.map(m => m.line_uid).filter(uid => {
        if (!uid) return false;
        const userLevel = prefMap[uid] || 'ALL';
        const userWeight = levelWeight[userLevel] || 0;
        // ส่งให้ถ้า ความรุนแรงของข่าว (maxThreatWeight) >= ความคาดหวังของ User (userWeight)
        return maxThreatWeight >= userWeight;
      });
      recipientCount = userIds.length;
      
      // 🛡️ ป้องกันบั๊ก: หากไม่มี User คนไหนเข้าเงื่อนไขเลย (0 คน) ห้ามส่ง [] ไปให้ LINE Multicast เด็ดขาด
      if (userIds.length === 0) {
        console.log('ℹ️ No users match the current threat criteria for today. Skipping LINE dispatch.');
        return NextResponse.json({
          success: true,
          message: 'No recipients matched the threat threshold for today. Skipped sending to prevent empty LINE dispatch error.',
          recipientCount: 0,
          timestamp: new Date().toISOString()
        }, { status: 200 });
      }

      // 🛡️ LINE Multicast allows up to 500 userIds per request - Chunk if needed
      const chunkSize = 500;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        res = await fetch("https://api.line.me/v2/bot/message/multicast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lineToken}`
          },
          body: JSON.stringify({ to: chunk, messages: [flexMessage] })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`LINE Multicast API Error (Chunk ${Math.floor(i / chunkSize) + 1}): ${errorText}`);
        }
      }
    } else {
      // ถ้ายังไม่มีสมาชิกเลยใน Database (ตารางใหม่เอี่ยม) ให้ Broadcast ไปก่อน
      sendMethod = 'broadcast';
      res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lineToken}`
        },
        body: JSON.stringify({ messages: [flexMessage] })
      });
      recipientCount = "All Subscribers";

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`LINE Broadcast API Error: ${errorText}`);
      }
    }

    console.log(`✅ Morning brief sent successfully! (Method: ${sendMethod}, Recipients: ${recipientCount})`);

    return NextResponse.json({
      success: true,
      message: `Morning brief sent! ${articles.length} articles sent to ${recipientCount} members via ${sendMethod}.`,
      breakdown: {
        tech: techArticles.length,
        cyber: cyberArticles.length,
        total: articles.length,
        recipients: recipientCount,
        hasSummary: !!aiSummary
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
