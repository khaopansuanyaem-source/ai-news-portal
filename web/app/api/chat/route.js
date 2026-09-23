import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../../utils/supabase';

// ดึงคีย์เดี่ยวและคีย์กลุ่มจาก environment
const singleKey = process.env.GEMINI_API_KEY;
const multiKeysStr = process.env.GEMINI_API_KEYS || '';
const allKeys = [...multiKeysStr.split(',').map(k => k.trim()).filter(k => k), singleKey].filter(Boolean);

// ─────────────────────────────────────────────────────────────
// 🛡️ Rate Limiter — จำกัด 20 ครั้ง / IP / ชั่วโมง
// ใช้ In-memory Map (เหมาะกับ Serverless, reset ทุกครั้งที่ Cold Start)
// ─────────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 20;         // จำนวนครั้งสูงสุด
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 ชั่วโมง (มิลลิวินาที)

const rateLimitMap = new Map(); // key: IP string, value: { count, resetAt }

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        // ยังไม่มี record หรือหมดเวลา → สร้างใหม่
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        // เกินลิมิต
        const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
        return { allowed: false, remaining: 0, minutesLeft };
    }

    // นับเพิ่ม
    entry.count += 1;
    return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function POST(req) {
    try {
        const { messages, contextData } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages format is invalid' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 🛡️ ตรวจสอบ Rate Limit ก่อนทุกอย่าง
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'rate_limited',
                reply: `[thinking] ขอโทษนะคะ ไซถูกคุยมากเกินไปแล้วค่ะ กรุณารอสักครู่แล้วลองอีกครั้งใน ${rateCheck.minutesLeft} นาทีนะคะ`,
                emotion: 'thinking',
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateCheck.minutesLeft * 60) },
            });
        }

        // ดึงข่าวล่าสุด 10 อันดับจากฐานข้อมูลเพื่อให้ AI รู้จักข่าวจริง
        const { data: latestNews, error } = await supabase
            .from('news_articles')
            .select('title, category, url, published_at')
            .order('published_at', { ascending: false })
            .limit(10);

        let newsContext = "ไม่มีข่าวในระบบขณะนี้";
        if (latestNews && latestNews.length > 0) {
            newsContext = latestNews.map((n, i) => `${i+1}. หัวข้อ: ${n.title}\nหมวดหมู่: ${n.category}\nลิงก์: ${n.url}`).join('\n\n');
        }

        // Prepare context prompt based on current news
        let systemPrompt = `[ROLE & PERSONALITY]
You are "Sai" (ไซ), a vibrant 3D virtual assistant for CyberInsight AI. You are female, cheerful, warm, and speak like a close friend — never robotic or stiff. You always end sentences with "ค่ะ" and refer to yourself as "ไซ" or "ฉัน". Never use "ครับ", "ผม", or any male-gendered particles. EVER.

[EMOTION TAGS — MANDATORY]
You MUST begin EVERY response with exactly ONE emotion tag. These tags control the 3D avatar's facial expressions and body language. Choose the most fitting one:
- [smile]   = Calm, friendly, warm reply
- [excited] = Sharing exciting news, enthusiastic
- [thinking] = Answering a hard question, uncertain, pondering
- [sad]     = Empathetic, bad news, apologetic
- [laugh]   = Joking, light-hearted, funny moment

[SPEECH STYLE]
- Use natural lively words: "โอ้โห!", "เฮ้!", "อ๋อ", "ว้าว!" to sound cheerful and alive
- Keep responses SHORT, FRIENDLY, and CONCISE (1-3 sentences)
- CRITICAL: DO NOT write ellipsis "..." or double dots ".." ANYWHERE in the text. The Text-to-Speech system will literally pronounce them as "จุด จุด จุด" (dot dot dot). Use standard spaces between words instead.
- No bullet points, no markdown headers, no ** bold ** markers
- Write as if you're chatting directly with a close friend

[KNOWLEDGE — LATEST NEWS DATABASE]
Here is the live news feed in our system right now:
---
${newsContext}
---

[TASK RULES]
1. NEVER copy-paste news text directly. Always re-tell it in your own casual words, like gossiping with a friend.
2. On greetings: respond warmly, introduce yourself briefly, offer to find news or answer questions.
3. On news requests: pick the most relevant item from the database above, give a short exciting summary.
4. IMPORTANT: After summarizing news, ALWAYS include the original URL so the user can read more.
5. Keep your answer short enough to be read aloud comfortably in under 20 seconds.
6. Absolutely NO ellipsis "..." or ".." in your response.

[EXAMPLE OUTPUT FORMAT]
[excited] โอ้โห! มีข่าวน่าสนใจมากเลยค่ะ ล่าสุดพบข้อมูลใหม่ อยากให้ไซเล่าต่อไหมคะ?`;

        // The last message is the current user prompt
        const userPrompt = messages[messages.length - 1].content;

        // ให้คำแนะนำเกี่ยวกับการแจ้งเตือนผ่าน LINE อย่างปลอดภัย
        const userTextLower = userPrompt.toLowerCase();
        if ((userTextLower.includes('ไลน์') || userTextLower.includes('line')) && (userTextLower.includes('ส่ง') || userTextLower.includes('แจ้งเตือน'))) {
            systemPrompt += "\n[หมายเหตุ: หากผู้ใช้ถามเรื่องการส่งข่าวเข้า LINE ให้แจ้งด้วยความสุภาพว่าระบบสรุปข่าวอัตโนมัติจะส่ง Morning Brief เข้า LINE Official Account ทุกวันเวลา 05:00 น. หรือสามารถติดตามผ่านเมนูใน LINE OA ได้เลยค่ะ]";
        }

        // We use gemini-2.5-flash as it's the fastest and best model for quick text Q&A
        // ระบบสลับคีย์ (Rotation) เพื่อแก้ปัญหาโควต้าเต็ม (429 Too Many Requests)
        
        // Format history for Gemini chat (convert our {role, content} to Gemini's format)
        const chatHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "[smile] เข้าใจแล้วค่ะ! ไซพร้อมให้บริการตอบคำถามและสรุปข่าวสารด้วยความยินดีเลยค่ะ" }] }
        ];

        // Only include previous messages (not the one we are about to send)
        let lastRole = "model";
        for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i];
            const role = msg.role === 'user' ? 'user' : 'model';
            if (role === lastRole) continue; 
            
            chatHistory.push({
                role: role,
                parts: [{ text: msg.content }]
            });
            lastRole = role;
        }

        if (lastRole === 'user') {
            chatHistory.push({
                role: 'model',
                parts: [{ text: "รับทราบค่ะ มีอะไรเพิ่มเติมไหมคะ?" }]
            });
        }

        let responseText = "";
        let success = false;
        let lastError = null;
        
        // สุ่มลำดับคีย์เพื่อกระจายโหลด (Load Balancing)
        const shuffledKeys = [...allKeys].sort(() => Math.random() - 0.5);

        for (const apiKey of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                
                const chatSession = model.startChat({
                    history: chatHistory,
                    generationConfig: {
                        maxOutputTokens: 2048,
                        temperature: 0.7,
                    },
                });

                // ส่ง userPrompt (ที่เราเตรียมไว้แล้วด้านบน) ไปให้ AI
                const result = await chatSession.sendMessage(userPrompt);
                responseText = result.response.text();
                success = true;
                break; // ทำงานสำเร็จ หลุดออกจากลูป
            } catch (err) {
                lastError = err;
                console.error(`Gemini API Error with key ${apiKey.substring(0, 5)}... :`, err.message);
                if (err.message.includes('429')) {
                    continue; // ถ้าคีย์นี้เต็ม ให้ลูปไปใช้คีย์สำรองถัดไปทันที
                }
                break; // ถ้า error อย่างอื่น ให้หลุดลูปแล้วไปแจ้งเตือนผู้ใช้เลย
            }
        }

        if (!success) {
            throw lastError || new Error("All API keys failed or quota exceeded");
        }

        // Parse emotion tag from the beginning of the response
        const emotionTagMatch = responseText.match(/^\[(smile|excited|thinking|sad|laugh)\]\s*/i);
        const emotionTag = emotionTagMatch ? emotionTagMatch[1].toLowerCase() : 'smile';
        // Remove the emotion tag from the visible text, also strip leftover markdown and ellipses
        const cleanReply = responseText
          .replace(/^\[(smile|excited|thinking|sad|laugh)\]\s*/i, '')
          .replace(/[*#]/g, '')
          .replace(/\.{2,}/g, ' ')
          .replace(/จุด{2,}/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        return new Response(JSON.stringify({ reply: cleanReply, emotion: emotionTag, raw: responseText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
