import { GoogleGenerativeAI } from '@google/generative-ai';

// Retrieve API key from environment variable (will fallback if not found)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDCazvZXEZB5Vl9cgSPN_CbpvZ0qEnITgE');

export async function POST(req) {
    try {
        const { messages, contextData } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages format is invalid' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Prepare context prompt based on current news
        let systemPrompt = `คุณคือ "AI News Assistant" ผู้ช่วยอัจฉริยะประจำเว็บไซต์ข่าว AI News Portal
หน้าที่ของคุณคือตอบคำถามผู้ใช้เกี่ยวกับข่าวสาร สรุปข่าว และให้ข้อมูลอย่างเป็นมิตร สุภาพ และเป็นมืออาชีพ

นี่คือข้อมูลข่าวล่าสุดบนหน้าเว็บขณะนี้เพื่อใช้ประกอบการตอบคำถาม:
${contextData}

ถ้าผู้ใช้ถามเรื่องที่อยู่ในข้อมูลข่าวนี้ ให้ตอบโดยอ้างอิงจากข้อมูลนี้ 
แต่ถ้าถามเรื่องทั่วไปหรือเรื่องอื่นๆ ก็สามารถตอบตามความรู้ของคุณได้เลย พยายามตอบให้กระชับและอ่านง่าย`;

        // We use gemini-2.5-flash as it's the fastest and best model for quick text Q&A
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Format history for Gemini chat (convert our {role, content} to Gemini's format)
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
        
        const chatHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "เข้าใจแล้วครับ ฉันพร้อมให้บริการตอบคำถามและสรุปข่าวสารแล้วครับ" }] }
        ];

        // Only include previous messages (not the one we are about to send)
        for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i];
            chatHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        const chatSession = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        // The last message is the current user prompt
        const userPrompt = messages[messages.length - 1].content;
        const result = await chatSession.sendMessage(userPrompt);
        const responseText = result.response.text();

        return new Response(JSON.stringify({ reply: responseText }), {
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
