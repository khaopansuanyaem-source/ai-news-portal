import { useState, useRef, useEffect } from 'react';

const formatMessage = (text) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline', marginLeft: '4px', wordBreak: 'break-all' }}>
          [อ่านข่าวฉบับเต็มคลิก]
        </a>
      );
    }
    return part;
  });
};

const TypewriterText = ({ content, isLast, onContentChange }) => {
  const [length, setLength] = useState(isLast ? 0 : content.length);
  
  useEffect(() => {
    if (!isLast) {
      return;
    }
    const interval = setInterval(() => {
      setLength(prev => {
        if (prev >= content.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [content, isLast]);

  useEffect(() => {
    if (onContentChange) onContentChange();
  }, [length, onContentChange]);

  const revealedText = isLast ? content.slice(0, length) : content;
  return <>{formatMessage(revealedText)}</>;
};

export default function ChatInterface({ messages, onSendMessage, isSpeaking, speechEnergy = 0, voiceEnabled = true, onToggleVoice, onClearChat }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const voiceLevel = Math.max(0.16, Math.min(1, speechEnergy));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative', padding: '24px' }}>
      <div className="chat-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', letterSpacing: '0.5px' }}>
          คุยกับ Sai
        </h2>
        <div className="voice-controls">
          <button
            type="button"
            onClick={onClearChat}
            className="voice-toggle"
            style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
            title="ลบประวัติการแชท"
          >
            🗑️ ลบแชท
          </button>
          <div className={`voice-status ${isSpeaking ? 'is-speaking' : ''}`}>
            <span className="voice-meter" style={{ transform: `scaleX(${voiceLevel})` }} />
            <span>{isSpeaking ? 'กำลังพูด' : 'พร้อมตอบ'}</span>
          </div>
          <button
            type="button"
            className="voice-toggle"
            onClick={onToggleVoice}
            disabled={isSpeaking}
            aria-pressed={voiceEnabled}
            aria-label={voiceEnabled ? 'ปิดเสียง Sai' : 'เปิดเสียง Sai'}
            title={isSpeaking ? 'รอให้ Sai พูดจบก่อน' : voiceEnabled ? 'ปิดเสียง Sai' : 'เปิดเสียง Sai'}
          >
            {voiceEnabled ? 'เสียงเปิด' : 'เสียงปิด'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }} className="custom-scrollbar" suppressHydrationWarning>
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.8, gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(56, 189, 248, 0.2))', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '32px', height: '32px', color: '#38bdf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              สวัสดีค่ะ! ฉันคือ ไซ (Sai) ผู้ช่วย AI ของคุณ<br/>
              พิมพ์ถามเกี่ยวกับข่าวไอทีหรือไซเบอร์ได้เลยค่ะ
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '85%',
                  marginLeft: msg.role === 'user' ? 'auto' : '0',
                  marginRight: msg.role === 'user' ? '0' : 'auto',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {msg.role === 'user' ? 'You' : 'Sai'}
                </span>
                <div 
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    background: msg.role === 'user' ? 'linear-gradient(to right, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.1)',
                    color: msg.role === 'user' ? 'white' : '#f3f4f6',
                    borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {msg.role === 'user' ? (
                    formatMessage(msg.content)
                  ) : (
                    <TypewriterText 
                      content={msg.content} 
                      isLast={index === messages.length - 1} 
                      onContentChange={scrollToBottom}
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative', marginTop: 'auto' }} suppressHydrationWarning>
        <input
          suppressHydrationWarning
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความที่นี่..."
          style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '16px 56px 16px 24px', color: 'white', outline: 'none', fontSize: '16px' }}
        />
        <button 
          type="submit"
          aria-label="ส่งข้อความ"
          disabled={!inputText.trim()}
          suppressHydrationWarning
          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: inputText.trim() ? 'pointer' : 'default', opacity: inputText.trim() ? 1 : 0.5 }}
        >
          <svg style={{ width: '16px', height: '16px', transform: 'translateX(1px)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>

      <style jsx>{`
        .voice-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .voice-status {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 88px;
          min-height: 32px;
          overflow: hidden;
          border-radius: 999px;
          border: 1px solid rgba(56, 189, 248, 0.22);
          background: rgba(56, 189, 248, 0.08);
          color: #bae6fd;
          font-size: 12px;
          font-weight: 700;
        }

        .voice-meter {
          position: absolute;
          inset: 0;
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(56, 189, 248, 0.22), rgba(6, 199, 85, 0.28));
          transition: transform 90ms linear;
        }

        .voice-status span:last-child {
          position: relative;
          z-index: 1;
        }

        .voice-status.is-speaking {
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.14);
        }

        .voice-toggle {
          min-height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .voice-toggle:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 768px) {
          .chat-header {
            margin-bottom: 14px !important;
            gap: 12px;
          }

          .chat-header h2 {
            font-size: 16px !important;
          }

          .voice-controls {
            gap: 6px;
          }

          .voice-status {
            min-width: 76px;
            min-height: 30px;
            font-size: 11px;
          }

          .voice-toggle {
            min-height: 30px;
            padding: 0 10px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
