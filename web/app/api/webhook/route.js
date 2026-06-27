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

        // Run the async processing without awaiting it here, 
        // so we can return 200 OK to LINE immediately.
        // Note: In some serverless environments, background tasks might be killed.
        // For local development or standard Node.js, this works fine.
        processLineMessage(userMessage, replyToken).catch(console.error);
      }
    }

    // LINE expects a 200 OK immediately
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function processLineMessage(userMessage, replyToken) {
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("--> Received message from LINE:", userMessage);

  if (!lineToken || !geminiKey) {
    console.error("❌ ERROR: Missing LINE_TOKEN or GEMINI_API_KEY in environment variables!");
    console.error("Please restart your 'npm run dev' server so it can read the updated .env.local file.");
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
      .select('title, category, analysis')
      .order('created_at', { ascending: false })
      .limit(5);

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
      recent_news: newsData || []
    };

    // 2. Call Gemini API
    const aiReply = await callGeminiAPI(userMessage, geminiKey, JSON.stringify(contextData));

    // 3. Reply to LINE
    await replyToLINE(replyToken, aiReply, lineToken);

  } catch (error) {
    console.error("Error processing message:", error);
    await replyToLINE(replyToken, "ขออภัยครับ ระบบประมวลผลมีปัญหาชั่วคราว ขัดข้องทางเทคนิค 🛠️", lineToken);
  }
}

async function callGeminiAPI(prompt, apiKey, context) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = 
    "คุณคือ 'น้องนักข่าว (AI News Assistant)' ผู้เชี่ยวชาญด้านการข่าว (การเมือง เทคโนโลยี กีฬา การเงิน) " +
    "ตอบคำถามด้วยความเป็นมิตร กระชับ อ่านง่าย ใช้ Emoji บ้าง " +
    "นี่คือข้อมูลข่าวสารล่าสุดที่คุณสามารถนำไปใช้อ้างอิงได้ (ถ้าผู้ใช้ถามถึง): " + context;

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
      { type: "action", action: { type: "message", label: "⚽ ข่าวกีฬา", text: "มีข่าวกีฬาอะไรน่าสนใจบ้าง" } }
    ]
  };

  const payload = {
    replyToken: replyToken,
    messages: [{ 
      type: "text", 
      text: messageText,
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
