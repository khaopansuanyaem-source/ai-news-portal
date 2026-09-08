'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ChatInterface = dynamic(() => import('../components/ChatInterface'), { ssr: false });
const AvatarScene = dynamic(() => import('../components/AvatarScene'), { ssr: false });

const SPEECH_RATE = 1.08;
const SPEECH_PAUSE_MS = 140;
const SPEECH_CHUNK_LIMIT = 165;
const PHONEMES = ['aa', 'ih', 'ou', 'E', 'oh'];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeSpeechText = (text) => text
  .replace(/https?:\/\/[^\s]+/g, 'สามารถดูรายละเอียดได้ที่ลิงก์ด้านล่างค่ะ')
  .replace(/\[(smile|excited|thinking|sad|laugh)\]/gi, '')
  .replace(/\.{2,}/g, ' ')
  .replace(/\./g, ' ')
  .replace(/จุด{2,}/g, ' ')
  .replace(/[\*\#\_\~\`\[\]\(\)\{\}\<\>\"\'\@\$\%\^\&\+\=\|\/\\]/g, ' ')
  .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
  .replace(/\s*([,!?])\s*/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const splitSpeechText = (text) => {
  const normalized = normalizeSpeechText(text);
  if (!normalized) return [];

  const sentences = normalized
    .replace(/(ค่ะ|ครับ|นะคะ|นะครับ)(\s+)/g, '$1|')
    .split('|')
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks = [];
  for (const sentence of sentences) {
    if (sentence.length <= SPEECH_CHUNK_LIMIT) {
      chunks.push(sentence);
      continue;
    }

    const parts = sentence.match(new RegExp(`.{1,${SPEECH_CHUNK_LIMIT}}(?:\\s|,|$)`, 'g')) || [sentence];
    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed) chunks.push(trimmed);
    });
  }

  return chunks;
};

const getEmotionForText = (text) => {
  if (/ขอบคุณ|สวัสดี|ดีใจ|ยินดี|เยี่ยม|ดีมาก|น่ารัก/.test(text)) return 'happy';
  if (/ภัยคุกคาม|อันตราย|ระวัง|เตือน|รั่วไหล|โจมตี|มัลแวร์|phishing|ฟิชชิง/i.test(text)) return 'angry';
  if (/เสียใจ|ขออภัย|ล้มเหลว|ผิดพลาด/.test(text)) return 'sad';
  return 'relaxed';
};

// Map emotion tag from AI → AvatarScene emotion state
const mapEmotionTag = (tag) => {
  switch (tag) {
    case 'excited':  return 'happy';   // enthusiastic, warm bright smile
    case 'laugh':    return 'happy';   // cheerful, radiant open-eyed smile
    case 'smile':    return 'relaxed'; // calm friendly smile
    case 'thinking': return 'neutral'; // head-tilt, calm but focused
    case 'sad':      return 'sad';     // drooped brows, empathetic
    default:         return 'relaxed';
  }
};

const getAudioEnergy = (analyser, dataArray) => {
  analyser.getByteTimeDomainData(dataArray);
  let sum = 0;
  for (const value of dataArray) {
    const centered = (value - 128) / 128;
    sum += centered * centered;
  }

  const rms = Math.sqrt(sum / dataArray.length);
  return Math.min(1, Math.max(0, (rms - 0.015) * 7));
};

export default function CharacterPage() {
  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentPhoneme, setCurrentPhoneme] = useState('aa'); // 'aa', 'ih', 'ou', 'E', 'oh', 'sil'
  const [emotion, setEmotion] = useState('relaxed'); // neutral, happy, angry, sad, relaxed
  const [speechEnergy, setSpeechEnergy] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Load chat history safely on client after mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('sai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (e) {}
    setHistoryLoaded(true);
  }, []);

  // Save chat history
  useEffect(() => {
    if (historyLoaded) {
      if (messages.length > 0) {
        window.localStorage.setItem('sai_chat_history', JSON.stringify(messages));
      } else {
        window.localStorage.removeItem('sai_chat_history');
      }
    }
  }, [messages, historyLoaded]);

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('sai_chat_history');
    }
  };

  const sharedAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const voiceEnabledRef = useRef(true);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => () => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.src = '';
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  }, []);

  const unlockAudioOnMobile = () => {
    try {
      if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
      if (!sharedAudioRef.current) {
        sharedAudioRef.current = new Audio();
      }
      const audio = sharedAudioRef.current;
      if (!audio.src || audio.src === window.location.href) {
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audio.pause();
        }).catch((e) => console.log('Audio unlock:', e.message));
      }
    } catch (err) {
      console.warn("Audio unlock skipped:", err);
    }
  };

  const prepareAudioAnalyzer = async (audio) => {
    try {
      if (typeof window === 'undefined') return null;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.62;
        audioDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }

      if (!audioSourceRef.current) {
        audioSourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        audioSourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      return analyserRef.current;
    } catch (err) {
      console.warn('Audio analyzer unavailable:', err);
      return null;
    }
  };

  // --- Authentication State ---
  const [isLiffInitialized, setIsLiffInitialized] = useState(false);
  const [liffProfile, setLiffProfile] = useState(null);

  // Initialize LINE LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = (await import('@line/liff')).default;
        await liffModule.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2010531662-Vw7creFG' });

        if (liffModule.isLoggedIn()) {
          try {
            const profile = await liffModule.getProfile();
            setLiffProfile(profile);

            // Auto register / update user in Supabase
            fetch('/api/members/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                line_uid: profile.userId,
                display_name: profile.displayName,
                picture_url: profile.pictureUrl
              })
            }).catch(console.error);
          } catch (profileErr) {
            console.error("Failed to get profile", profileErr);
            alert("ไม่สามารถดึงข้อมูลโปรไฟล์ได้: " + profileErr.message);
          }
        }
      } catch (err) {
        console.error("LIFF Init failed:", err);
        alert("การเชื่อมต่อระบบ LINE ล้มเหลว: " + err.message);
      } finally {
        setIsLiffInitialized(true); 
      }
    };
    initLiff();
  }, []);

  const handleLogin = async () => {
    try {
      const liffModule = (await import('@line/liff')).default;
      if (!liffModule.isLoggedIn()) {
        liffModule.login({ redirectUri: window.location.href });
      }
    } catch (e) {
      console.error(e);
      alert("Login failed: " + e.message);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Unlock audio context on mobile during user interaction
    unlockAudioOnMobile();

    // Add user message + temporary AI thinking placeholder immediately
    const userMsg = { role: 'user', content: text };
    const loadingMsg = { role: 'model', content: 'กำลังค้นหาและประมวลผลคำตอบค่ะ... 💭' };
    
    const updatedWithUser = [...messages, userMsg];
    const updatedWithLoading = [...updatedWithUser, loadingMsg];
    
    setMessages(updatedWithLoading);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedWithUser,
          contextData: "AI News Portal: ข่าวเทคโนโลยีและไซเบอร์อัปเดตล่าสุด" 
        }),
      });

      let errorMessage = 'API Error';
      if (!response.ok) {
        try {
          const errData = await response.json();
          errorMessage = errData.details || errData.error || 'API Error';
        } catch(e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiReply = data.reply || 'ไซรับทราบแล้วค่ะ มีอะไรให้ช่วยเพิ่มเติมไหมคะ?';
      const aiEmotionTag = data.emotion || 'smile';
      
      // Replace loading message with actual AI response
      setMessages([...updatedWithUser, { role: 'model', content: aiReply }]);
      
      // Speak response out loud, passing emotion from AI tag
      speakText(aiReply, aiEmotionTag);

    } catch (error) {
      console.error('Error:', error);
      setMessages([...updatedWithUser, { role: 'model', content: `ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล: ${error.message}` }]);
    }
  };

  const speakText = async (text, emotionTag = 'smile') => {
    const nextEmotion = mapEmotionTag(emotionTag);
    const allChunks = splitSpeechText(text);

    setEmotion(nextEmotion);
    setSpeechEnergy(0);
    setCurrentPhoneme('sil');

    if (!voiceEnabledRef.current || allChunks.length === 0) {
      await wait(900);
      setEmotion('relaxed');
      return;
    }

    setIsSpeaking(true);

    let syncInterval;

    try {
      for (const chunk of allChunks) {
        if (!voiceEnabledRef.current) break;

        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunk })
        });
        if (!res.ok) continue;

        const blob = await res.blob();
        if (blob.size < 100) continue; 
        
        const url = URL.createObjectURL(blob);
        if (!sharedAudioRef.current) {
          sharedAudioRef.current = new Audio();
        }
        const audio = sharedAudioRef.current;
        audio.src = url;
        audio.playbackRate = SPEECH_RATE;
        audio.preservesPitch = true;

        const analyser = await prepareAudioAnalyzer(audio);
        let lastPhonemeChange = 0;
        syncInterval = setInterval(() => {
          const energy = analyser && audioDataRef.current
            ? getAudioEnergy(analyser, audioDataRef.current)
            : (audio.paused ? 0 : 0.30 + Math.random() * 0.25);

          setSpeechEnergy(energy);

          const now = Date.now();
          if (energy > 0.05) {
            // Natural syllable pacing: hold each mouth shape for ~160ms instead of flickering
            if (now - lastPhonemeChange > 160) {
              setCurrentPhoneme(PHONEMES[Math.floor(Math.random() * PHONEMES.length)]);
              lastPhonemeChange = now;
            }
          } else {
            setCurrentPhoneme('sil');
          }
        }, 40);

        await new Promise((resolve) => {
          audio.onended = resolve;
          audio.onerror = resolve;
          audio.play().catch(resolve);
        });

        clearInterval(syncInterval);
        setCurrentPhoneme('sil');
        setSpeechEnergy(0);
        URL.revokeObjectURL(url);
        await wait(SPEECH_PAUSE_MS);
      }
    } catch (error) {
      console.error("TTS playback error:", error);
    } finally {
      if (syncInterval) clearInterval(syncInterval);
    }

    setIsSpeaking(false);
    setCurrentPhoneme('sil');
    setSpeechEnergy(0);
    setEmotion('relaxed');
  };

  useEffect(() => {
    // Component mounted
  }, []);

  return (
    <div className="page-wrapper sai-page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#0a0b10', color: 'white', overflow: 'hidden', position: 'relative' }}>
      
      <nav className="desktop-only-nav" style={{ position: 'absolute', top: 0, left: 0, width: 'calc(100% - 480px)', padding: '20px', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <Link href="/" style={{ fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            AI
          </span>
          CyberInsight
        </Link>
        <div style={{ color: liffProfile ? '#06C755' : '#38bdf8', fontSize: '14px', border: `1px solid ${liffProfile ? 'rgba(6,199,85,0.3)' : 'rgba(56,189,248,0.3)'}`, background: liffProfile ? 'rgba(6,199,85,0.1)' : 'rgba(56,189,248,0.1)', padding: '6px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {liffProfile && (
            <img src={liffProfile.pictureUrl} alt="profile" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
          )}
          {liffProfile ? liffProfile.displayName : 'Sai (ไซ) - Online'}
        </div>
      </nav>
      {!liffProfile && isLiffInitialized && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, background: 'rgba(10, 11, 16, 0.88)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px', margin: '20px', padding: '36px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>เฉพาะสมาชิก LINE เท่านั้น 👑</h1>
            <p style={{ color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6', fontSize: '14px' }}>
              ฟีเจอร์พูดคุยโต้ตอบกับ AI ไซ (Sai) สำหรับสมาชิกผู้ติดตาม <b>LINE Official</b> ของเราค่ะ
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleLogin}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#06C755', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', transition: '0.2s', boxShadow: '0 4px 14px rgba(6,199,85,0.3)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}>
                  <path d="M22.5 10.4c0-4.3-4.5-7.8-10.1-7.8s-10.1 3.5-10.1 7.8c0 3.9 3.5 7.2 8.3 7.7.3.1.8.2 1 .7.1.3 0 .8-.1 1.2l-.2 1.4c-.1.3 0 .8.6.5 1.7-1 6.1-3.6 8.3-6.5 1.5-1.4 2.3-3.2 2.3-5z" />
                </svg>
                เข้าสู่ระบบด้วย LINE
              </button>
              <button 
                onClick={() => setLiffProfile({ displayName: 'Guest User', pictureUrl: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: '#38bdf8', fontWeight: '600', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer', fontSize: '14px' }}
              >
                ⚡ ทดลองใช้งานทั่วไป (Guest Presentation Mode)
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>* เชื่อมต่อระบบสมาชิกฟรี! เพียง 1 คลิก</p>
          </div>
        </div>
      )}

      <div className="main-layout" style={{ display: 'flex', flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        
        <div className="avatar-container" style={{ flex: 1, position: 'relative', height: '100%' }}>
          <AvatarScene 
            isSpeaking={isSpeaking} 
            currentPhoneme={currentPhoneme}
            emotion={emotion}
            speechEnergy={speechEnergy}
          />
        </div>

        <div className="chat-container">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isSpeaking={isSpeaking}
            speechEnergy={speechEnergy}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled((enabled) => !enabled)}
            onClearChat={clearChat}
          />
        </div>
      </div>

      <style jsx>{`
        /* Desktop Default */
        .chat-container {
          width: 480px;
          height: 100%;
          background: rgba(12, 14, 20, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .desktop-only-nav {
            display: none !important;
          }
          .main-layout {
            display: flex !important;
            flex-direction: column !important;
          }
          .avatar-container {
            position: relative !important;
            width: 100% !important;
            height: 38vh !important;
            z-index: 1;
          }
          .chat-container {
            position: relative !important;
            width: 100% !important;
            height: 62vh !important;
            background: rgba(10, 11, 16, 0.98) !important;
            border-left: none !important;
            border-top: 1px solid rgba(56, 189, 248, 0.3) !important;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            padding-bottom: 70px !important;
            z-index: 10 !important;
          }
        }
      `}</style>
    </div>
  );
}
