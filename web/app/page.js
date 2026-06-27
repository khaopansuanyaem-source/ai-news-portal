"use client";
import { useEffect, useState, Suspense, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useSearchParams } from 'next/navigation';

const categoryImages = {
  sports: [
    'https://images.unsplash.com/photo-1518605368461-1e1e38ce8058',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20'
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
  ],
  finance: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f'
  ],
  business: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    'https://images.unsplash.com/photo-1507679622778-430b05b33100'
  ],
  politics: [
    'https://images.unsplash.com/photo-1526470608518-cb826c5f32b8',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f'
  ],
  world: [
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56'
  ]
};

const getImageUrl = (newsItem, isThumbnail = false, forceFallback = false) => {
    // Check if we embedded an actual image URL in the summary
    if (!forceFallback && newsItem.summary && newsItem.summary.includes('||IMG:')) {
        return newsItem.summary.split('||IMG:')[1];
    }

    const cat = (newsItem.category || 'general').toLowerCase();
    
    let mappedCat = 'general';
    if (cat.includes('sport') || cat.includes('กีฬา')) mappedCat = 'sports';
    else if (cat.includes('tech') || cat.includes('เทคโนโลยี')) mappedCat = 'tech';
    else if (cat.includes('finance') || cat.includes('business') || cat.includes('เศรษฐกิจ')) mappedCat = 'finance';
    else if (cat.includes('politic') || cat.includes('การเมือง')) mappedCat = 'politics';
    else if (cat.includes('world') || cat.includes('ต่างประเทศ')) mappedCat = 'world';
    else if (cat.includes('domestic') || cat.includes('ในประเทศ')) mappedCat = 'domestic';
    else if (cat.includes('ent') || cat.includes('บันเทิง')) mappedCat = 'entertainment';
    else if (cat.includes('social') || cat.includes('สังคม')) mappedCat = 'social';

    const fallbackPools = {
        sports: ['46798','1884576','274422','2529147','114296','358042','841130','187329','209977','248547'],
        tech: ['546819','5380642','19050634','2599244','1181675','3861969','3153198','325153','1714208','2004161'],
        finance: ['159888','187041','210607','4386404','534216','1252890','259027','164527','730564','128867'],
        politics: ['1550337','466685','1202723','3274295','2291873','1550339','3777622','305821','4308092','1181438'],
        world: ['163427','104975','20787','3401403','733036','87651','3225528','2413238','1252814','2228723'],
        social: ['2253818','1089930','1122409','3184405','1181681','1009927','1722128','1054048','1595391','1181414'],
        domestic: ['4199122','3184338','2237803','3184418','3184287','1181391','1009922','1595385','1054018','1181423'],
        entertainment: ['33129','1117132','1782146','3171837','33125','2774556','374710','1386604','2510428','109669']
    };

    const imgs = fallbackPools[mappedCat] || fallbackPools.tech;

    // Use article ID to reliably pick a unique image from the expanded array
    let hash = 0;
    const hashStr = (newsItem.id || "") + (newsItem.title || "");
    for (let i = 0; i < hashStr.length; i++) {
        hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % imgs.length;
    
    // Add a unique salt based on ID to avoid browser caching same images if they repeat
    const width = isThumbnail ? 400 : 800;
    return `https://images.pexels.com/photos/${imgs[index]}/pexels-photo-${imgs[index]}.jpeg?auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
}

const getFallbackImageUrl = (newsItem) => {
    return 'https://images.pexels.com/photos/3944688/pexels-photo-3944688.jpeg?auto=compress&w=800';
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [dailySummary, setDailySummary] = useState(null);
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null); // State for Modal
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, isChatLoading]);

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = { role: 'user', content: chatInput };
      setChatMessages(prev => [...prev, userMsg]);
      setChatInput("");
      setIsChatLoading(true);

      // Pass context: latest 5 news titles and summaries
      const contextData = newsFeed.slice(0, 5).map(n => `- ${n.title}: ${n.summary ? n.summary.substring(0, 100) : ''}`).join('\n');

      try {
          const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  messages: [...chatMessages, userMsg],
                  contextData: contextData
              })
          });
          const data = await res.json();
          if (data.reply) {
              setChatMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
          } else {
              setChatMessages(prev => [...prev, { role: 'ai', content: 'ขออภัย เกิดข้อผิดพลาดในการตอบกลับครับ' }]);
          }
      } catch (err) {
          setChatMessages(prev => [...prev, { role: 'ai', content: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้' }]);
      } finally {
          setIsChatLoading(false);
      }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch Daily Summary (Hero / Featured) - Only if no filter
        if (!categoryFilter) {
            const { data: summaryData } = await supabase
              .from('daily_summaries')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1);

            if (summaryData && summaryData.length > 0) {
              setDailySummary(summaryData[0]);
            }
        } else {
            setDailySummary(null);
        }

        // 2. Fetch News Articles
        let query = supabase
            .from('news_articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }

        const { data: feedData } = await query;

            
        if (feedData && feedData.length > 0) {
          setNewsFeed(feedData);
        } else {
            // Mock data if table is empty
            setNewsFeed([
                { id: '1', source: 'Thairath', category: 'Tech', title: 'ยุคใหม่ของ AI เริ่มต้นขึ้นแล้ว บริษัทใหญ่ต่างปรับตัว', summary: 'รายละเอียดข่าว 1', created_at: new Date().toISOString() },
                { id: '2', source: 'Droidsans', category: 'Gadget', title: 'เปิดตัวชิปเซ็ตรุ่นใหม่ ประสิทธิภาพแรงขึ้น 40%', summary: 'รายละเอียดข่าว 2', created_at: new Date().toISOString() },
                { id: '3', source: 'The Standard', category: 'Business', title: 'ตลาดหุ้นเอเชียผันผวนหนัก นักลงทุนจับตาเงินเฟ้อ', summary: 'รายละเอียดข่าว 3', created_at: new Date().toISOString() }
            ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Format Hero Text
  let heroTitle = "บทวิเคราะห์ประจำวัน";
  let heroText = "กำลังรวบรวมสรุปข่าวประจำวันให้คุณ...";
  let heroCat = "Daily Brief";
  
  if (dailySummary) {
    const c = dailySummary.content_json?.category || "news";
    const s = dailySummary.content_json?.summary || {};
    let txt = s[c] || s;
    if (typeof txt === 'string') {
        txt = txt.replace(/\*\*/g, '').replace(/### /g, '');
        txt = txt.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        
        if (txt.includes('---')) {
            const parts = txt.split('---');
            const rawContent = parts.slice(1).join('---').trim();
            if (rawContent.includes(':')) {
                const titleParts = rawContent.split(':');
                heroTitle = titleParts[0].trim();
                heroText = titleParts.slice(1).join(':').trim();
            } else {
                heroText = rawContent;
            }
        } else {
             heroText = txt;
        }
    }
    heroCat = c.toUpperCase();
  }

  // Format Date Helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  const closeModal = () => setSelectedNews(null);

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>กำลังโหลดข้อมูลข่าว...</div>
      ) : (
        <div>
          <div className="portal-grid">
          
          {/* Left Column: Featured News & Grid */}
          <div className="main-news-col">
            
            <h2 className="section-heading">ข่าวพาดหัวหลัก</h2>
            
            {dailySummary && (
                <div className="featured-news" onClick={() => setSelectedNews({
                    title: heroTitle,
                    category: heroCat,
                    summary: heroText,
                    created_at: dailySummary.created_at,
                    source: "AI Summary",
                    id: "hero"
                })}>
                    <div className="featured-image-container">
                        <img 
                            src={getImageUrl({category: heroCat, title: heroTitle, id: 'hero', summary: heroText})} 
                            alt="Featured News" 
                            onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl({category: heroCat, title: heroTitle, id: 'hero'}, false, true); }}
                        />
                        <span className="featured-tag">{heroCat}</span>
                    </div>
                    <div className="featured-content">
                        <h1 className="featured-title">{heroTitle}</h1>
                        <div className="featured-summary">
                            {heroText.substring(0, 300)}...
                        </div>
                    </div>
                </div>
            )}

            </div>

          {/* Right Column: Sidebar */}
          <div className="sidebar-col">
            <h2 className="section-heading">ข่าวด่วนรอบวัน</h2>
            <div className="sidebar-list">
                {newsFeed.slice(0, 5).map((news, idx) => (
                    <div key={'side-'+(news.id || idx)} className="sidebar-item" onClick={() => setSelectedNews(news)} style={{cursor: 'pointer'}}>
                        <div className="sidebar-item-img">
                            <img 
                                src={getImageUrl(news, true)} 
                                alt="thumbnail" 
                                onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(news, true, true); }}
                            />
                        </div>
                        <div className="sidebar-item-title">
                            {news.title}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Full Width Section: Latest News */}
        <div className="latest-news-section" style={{marginTop: '40px'}}>
            <h2 className="section-heading">ข่าวล่าสุด</h2>
            
            <div className="news-cards-grid full-width">
                {newsFeed.map((news, idx) => (
                    <div key={news.id || idx} className="news-card" onClick={() => setSelectedNews(news)} style={{cursor: 'pointer'}}>
                        <div className="news-card-image">
                            <img 
                                src={getImageUrl(news, true)} 
                                alt={news.title} 
                                onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(news, true, true); }}
                            />
                        </div>
                        <div className="news-card-content">
                            <div className="card-meta">
                                <span>{news.category || 'General'}</span>
                                <span className="card-date">{formatDate(news.created_at)}</span>
                            </div>
                            <h3 className="card-title">{news.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
          {/* Modal Overlay */}
          {selectedNews && (
            <div className="news-modal-overlay" onClick={closeModal}>
              <div className="news-modal-content" onClick={e => e.stopPropagation()}>
                <button className="news-modal-close" onClick={closeModal}>✕</button>
                
                <div className="news-modal-image">
                    <img 
                        src={getImageUrl(selectedNews)} 
                        alt="News cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(selectedNews, false, true); }}
                    />
                </div>
                
                <div className="news-modal-body">
                    <div className="news-modal-meta">
                        <span className="news-modal-cat">{selectedNews.category || 'News'}</span>
                        <span className="news-modal-date">{formatDate(selectedNews.created_at)}</span>
                    </div>
                    
                    <h1 className="news-modal-title">{selectedNews.title}</h1>
                    
                    <div className="news-modal-text">
                        {selectedNews.summary ? selectedNews.summary.split('||IMG:')[0] : (selectedNews.analysis || 'ไม่มีรายละเอียดข่าว')}
                    </div>

                    <div className="news-modal-footer">
                        <strong>แหล่งที่มา: </strong> {selectedNews.source || 'ไม่ระบุ'}
                        {selectedNews.url && (
                           <div>
                             <a 
                               href={selectedNews.url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="news-modal-link"
                               onClick={(e) => {
                                 if (selectedNews.url.includes('example.com')) {
                                    e.preventDefault();
                                    alert('ลิงก์นี้เป็นข้อมูลจำลอง (Mock Data) ครับ 🚧\n\nในระบบจริงเมื่อคลิกแล้วจะเปิดแท็บใหม่ไปยังเว็บไซต์สำนักข่าวต้นฉบับ เช่น Thairath, Siamsport หรือ BBC ทันทีครับ');
                                 }
                               }}
                             >
                               อ่านข่าวต้นฉบับ
                             </a>
                           </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Chatbot Widget */}
          <div className="chat-widget-container">
            {isChatOpen && (
              <div className="chat-window">
                <div className="chat-header">
                  <div className="chat-header-icon">🤖</div>
                  <div className="chat-header-title">AI News Assistant</div>
                  <button onClick={() => setIsChatOpen(false)} style={{marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px'}}>✕</button>
                </div>
                
                <div className="chat-body">
                  {chatMessages.length === 0 && (
                      <div style={{textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '14px'}}>
                        สวัสดีครับ! ผมคือผู้ช่วย AI 👋<br/>มีเรื่องอะไรเกี่ยวกับข่าววันนี้ให้ผมช่วยสรุปไหมครับ?
                      </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-bubble ${msg.role}`}>
                          {msg.content}
                      </div>
                  ))}
                  {isChatLoading && (
                      <div className="chat-typing">
                          <span></span><span></span><span></span>
                      </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <form className="chat-footer" onSubmit={handleSendMessage}>
                  <input 
                      type="text" 
                      className="chat-input" 
                      placeholder="พิมพ์ถามข่าวสาร..." 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={isChatLoading}
                  />
                  <button type="submit" className="chat-send-btn" disabled={isChatLoading || !chatInput.trim()}>
                    ➤
                  </button>
                </form>
              </div>
            )}
            
            {!isChatOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsChatOpen(true)}>
                  💬
                </button>
            )}
          </div>
          
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}>กำลังโหลดเนื้อหา...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
