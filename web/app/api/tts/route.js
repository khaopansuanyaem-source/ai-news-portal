import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Keep speech natural and remove dots/ellipses so TTS never speaks "จุด จุด จุด"
    const cleanText = text
      .replace(/https?:\/\/[^\s]+/g, 'ดูรายละเอียดในลิงก์ค่ะ')
      .replace(/\[(smile|excited|thinking|sad|laugh)\]/gi, '')
      .replace(/\.{2,}/g, ' ')
      .replace(/\./g, ' ')
      .replace(/จุด{2,}/g, ' ')
      .replace(/[\*\#\_\~\`\[\]\(\)\{\}\<\>\"\'\@\$\%\^\&\+\=\|\/\\]/g, ' ')
      .replace(/[:;!?]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Provider 1: ElevenLabs API (If ELEVENLABS_API_KEY is present)
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    if (elevenlabsKey) {
      try {
        const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel / Custom voice
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': elevenlabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.58, similarity_boost: 0.82, style: 0.25, use_speaker_boost: true }
          })
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return new Response(arrayBuffer, {
            headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' }
          });
        }
      } catch (err) {
        console.error("ElevenLabs TTS failed, falling back...", err);
      }
    }

    // Provider 2: Google Cloud Text-to-Speech API (If GOOGLE_TTS_API_KEY or Cloud Enabled Key is present)
    const gcpTtsKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
    if (gcpTtsKey) {
      try {
        const gcpRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpTtsKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: cleanText },
            voice: { languageCode: 'th-TH', name: 'th-TH-Neural2-C' }, // High-end Neural voice
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.02, pitch: 0.8 }
          })
        });

        if (gcpRes.ok) {
          const data = await gcpRes.json();
          if (data.audioContent) {
            const buffer = Buffer.from(data.audioContent, 'base64');
            return new Response(buffer, {
              headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' }
            });
          }
        }
      } catch (err) {
        console.error("GCP Cloud TTS failed, falling back...", err);
      }
    }

    // Provider 3: Universal Fallback Engine (Google Translate TTS - Pure Natural Thai)
    const encodedText = encodeURIComponent(cleanText.substring(0, 200));
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=${encodedText}`;

    const response = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Fallback TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
