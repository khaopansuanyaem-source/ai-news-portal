import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function POST(req) {
  try {
    const body = await req.json();

    // Verify if it's a LINE webhook event
    if (body.events && body.events.length > 0) {
      const event = body.events[0];
      
      // We only care about text messages
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        const replyToken = event.replyToken;
        const lineUserId = event.source.userId;

        // Must await in Serverless environment (like Vercel) otherwise the function is killed immediately before replying
        await processLineMessage(userMessage, replyToken, lineUserId).catch(console.error);
      }
    }

    // LINE expects a 200 OK immediately
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function processLineMessage(userMessage, replyToken, lineUserId) {
  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const lineToken = rawToken ? rawToken.replace(/[\uFEFF\r\n\t\s]/g, '').trim() : null;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("--> Received message from LINE:", userMessage, "User:", lineUserId);

  if (!lineToken || !geminiKey) {
    console.error("❌ ERROR: Missing LINE_TOKEN or GEMINI_API_KEY in environment variables!");
    return;
  }

  try {
    // 1. Fetch Latest Context from Supabase
    // Get latest daily summary
    const { data: summaryData } = await supabase
      .from('daily_summaries')
      .select('content_json')
      .order('created_at', { ascending: false })
      .limit(1);

    // Get 5 latest news articles
    const { data: newsData } = await supabase
      .from('news_articles')
      .select('title, category, summary, source')
      .order('created_at', { ascending: false })
      .limit(5);

    // Strip HTML for clean context
    const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\|\|IMG:[^\s]*/g, '').trim() : '';


    let summaryText = "";
    if (summaryData && summaryData.length > 0) {
       const cat = summaryData[0].content_json?.category;
       if (cat) {
           const s = summaryData[0].content_json?.summary;
           summaryText = s[cat] || s;
           if (typeof summaryText === 'object') summaryText = JSON.stringify(summaryText);
       }
    }

    const contextData = {
      daily_brief: summaryText,
      recent_news: (newsData || []).map(n => ({
        title: n.title,
        category: n.category,
        source: n.source,
        excerpt: stripHtml(n.summary || '').substring(0, 300)
      }))
    };

    // 1.5 Fetch User Preferences from Supabase
    let userPrefText = "";
    if (lineUserId) {
      const { data: prefData } = await supabase
        .from('user_preferences')
        .select('categories')
        .eq('line_user_id', lineUserId)
        .single();
      
      if (prefData && prefData.categories && prefData.categories.length > 0) {
        userPrefText = `ผู้ใช้นี้มีความสนใจในข่าวหมวดหมู่: ${prefData.categories.join(', ')} ให้คุณเน้นการนำเสนอข่าว หรือยกตัวอย่างที่เกี่ยวข้องกับหมวดหมู่นี้เป็นพิเศษหากเป็นไปได้`;
      }
    }

    // 2. Call Gemini API
    const aiReply = await callGeminiAPI(userMessage, geminiKey, JSON.stringify(contextData), userPrefText);

    // 3. Reply to LINE
    await replyToLINE(replyToken, aiReply, lineToken);

  } catch (error) {
    console.error("Error processing message:", error);
    await replyToLINE(replyToken, "ขออภัยครับ ระบบประมวลผลมีปัญหาชั่วคราว ขัดข้องทางเทคนิค 🛠️", lineToken);
  }
}

async function callGeminiAPI(prompt, apiKey, context, userPrefText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  let systemInstruction = 
    "คุณคือ 'น้องนักข่าว (AI News Assistant)' ผู้เชี่ยวชาญด้านการข่าว (การเมือง เทคโนโลยี กีฬา การเงิน) " +
    "ตอบคำถามด้วยความเป็นมิตร กระชับ อ่านง่าย ใช้ Emoji บ้าง " +
    "ข้อควรระวัง: ห้ามใช้ Markdown (ห้ามใช้เครื่องหมาย **, *, #) ในการจัดรูปแบบข้อความเด็ดขาด ให้พิมพ์ข้อความธรรมดาและเว้นบรรทัดให้สวยงามเท่านั้น " +
    "นี่คือข้อมูลข่าวสารล่าสุดที่คุณสามารถนำไปใช้อ้างอิงได้ (ถ้าผู้ใช้ถามถึง): " + context;

  if (userPrefText) {
    systemInstruction += "\n\nคำแนะนำพิเศษเกี่ยวกับผู้ใช้: " + userPrefText;
  }

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    systemInstruction: {
      role: "system",
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.5
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  if (json.candidates && json.candidates.length > 0) {
    return json.candidates[0].content.parts[0].text;
  }
  
  if (json.error) {
     console.error("Gemini API Error:", json.error);
     return `ขออภัยค่ะ API Error: ${json.error.message}`;
  }
  return "ขออภัยครับ ไม่สามารถสร้างคำตอบได้";
}

async function replyToLINE(replyToken, messageText, lineToken) {
  const url = "https://api.line.me/v2/bot/message/reply";
  
  // Create Quick Reply buttons
  const quickReply = {
    items: [
      { type: "action", action: { type: "message", label: "📰 สรุปข่าวเด่น", text: "สรุปข่าวเด่นวันนี้ให้หน่อย" } },
      { type: "action", action: { type: "message", label: "💻 ข่าวเทคโนโลยี", text: "มีข่าวไอทีอะไรน่าสนใจบ้าง" } },
      { type: "action", action: { type: "message", label: "🛡️ ข่าวไซเบอร์", text: "มีข่าวไซเบอร์ซีเคียวริตี้อะไรน่าสนใจบ้าง" } }
    ]
  };

  const payload = {
    replyToken: replyToken,
    messages: [{ 
      type: "flex", 
      altText: "น้องนักข่าวส่งสรุปข่าวมาให้ครับ",
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#4f46e5",
          paddingAll: "16px",
          contents: [
            {
              type: "text",
              text: "✨ AI News Assistant",
              weight: "bold",
              color: "#ffffff",
              size: "md"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          paddingAll: "20px",
          contents: [
            {
              type: "text",
              text: messageText,
              wrap: true,
              size: "sm",
              color: "#334155"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          paddingAll: "16px",
          contents: [
            {
              type: "button",
              style: "secondary",
              height: "sm",
              action: {
                type: "uri",
                label: "อ่านข่าวทั้งหมดบนเว็บไซต์",
                uri: "https://web-mu-two-44.vercel.app/"
              }
            }
          ]
        }
      },
      quickReply: quickReply
    }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lineToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
     const text = await response.text();
     console.error("LINE Reply Error:", text);
  }
}
