"use client";
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../utils/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import NewsCard from './components/NewsCard';
import NewsDetailModal from './components/NewsDetailModal';

// Dynamic import prevents @react-three/fiber Canvas from SSR — avoids hydration mismatch
const HeroAmbient3D = dynamic(() => import('./components/HeroAmbient3D'), { ssr: false });

const categoryImages = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
  ],
  cyber: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1614064641913-6b71a2a4b870'
  ]
};

const getImageUrl = (newsItem, isThumbnail = false, forceFallback = false) => {
    if (!newsItem) return getFallbackImageUrl();

    // Check if the database record has direct image_url
    if (!forceFallback && newsItem.image_url) {
        return newsItem.image_url;
    }

    // Check if we embedded an actual image URL in the summary (legacy fallback)
    if (!forceFallback && newsItem.summary && newsItem.summary.includes('||IMG:')) {
        return newsItem.summary.split('||IMG:')[1];
    }

    const cat = (newsItem.category || 'general').toLowerCase();
    
    let mappedCat = 'general';
    if (cat.includes('tech') || cat.includes('เทคโนโลยี') || cat.includes('ai')) mappedCat = 'tech';
    else if (cat.includes('cyber') || cat.includes('ransomware') || cat.includes('แฮก') || cat.includes('มัลแวร์')) mappedCat = 'cyber';

    const fallbackPools = {
        tech: ['546819','5380642','19050634','2599244','1181675','3861969','3153198','325153','1714208','2004161'],
        cyber: ['5380642', '60504', '5473298', '5380590', '5241470', '6963098', '6462662', '5380664']
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

const stripImageMarker = (value = '') => String(value || '').split('||IMG:')[0];

const decodeHtml = (html = '') => String(html || '')
  .replace(/&#038;/g, '&')
  .replace(/&amp;/g, '&')
  .replace(/&#039;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

const ALLOWED_RICH_TEXT_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote'
]);

const sanitizeRichText = (value, fallback = 'ไม่มีรายละเอียดข่าว') => {
  const decoded = decodeHtml(stripImageMarker(value || fallback));
  const cleaned = decoded
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|svg|math)[^>]*\/?\s*>/gi, '')
    .replace(/<\s*(\/?)\s*([a-z0-9-]+)(?:\s[^>]*)?>/gi, (_match, closingSlash, tagName) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_RICH_TEXT_TAGS.has(tag)) return '';
      if (tag === 'br') return '<br>';
      return `<${closingSlash ? '/' : ''}${tag}>`;
    })
    .trim();

  return cleaned || `<p>${fallback}</p>`;
};

const toPlainText = (value, fallback = '') => sanitizeRichText(value, fallback)
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<\/(p|li|h2|h3|blockquote)>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const createSnippet = (value, maxLength, fallback = '') => {
  const text = toPlainText(value, fallback);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const getConfidenceScore = (id) => {
  if (!id) return 95;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return 85 + (Math.abs(hash) % 15);
};

const getSearchableNewsText = (news) => [
  news?.title,
  news?.summary,
  news?.analysis,
  news?.category
].map(part => toPlainText(part)).join(' ').toLowerCase();

const readSavedFavorites = () => {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem('favorite_news');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [clientNow, setClientNow] = useState(0);
  const articleId = searchParams.get('article');
  
  const navCategories = [
      { id: '', label: 'ทั้งหมด' },
      { id: 'Tech', label: 'เทคโนโลยี' },
      { id: 'Cybersecurity', label: 'ไซเบอร์ซีเคียวริตี้' }
  ];
  
  const [dailySummary, setDailySummary] = useState(null);
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null); // State for Modal
  const [favorites, setFavorites] = useState([]);
  const queryParam = searchParams.get('q') || '';
  const [userQuery, setUserQuery] = useState(null);
  const searchQuery = userQuery !== null ? userQuery : queryParam;
  const setSearchQuery = (val) => setUserQuery(val);
  const [activeTag, setActiveTag] = useState('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState({ text: '', show: false, fading: false });

  const showToast = (text) => {
    setToast({ text, show: true, fading: false });
    setTimeout(() => {
      setToast(prev => ({ ...prev, fading: true }));
      setTimeout(() => setToast({ text: '', show: false, fading: false }), 300);
    }, 2700);
  };

  // Dynamic Cyber Threat Metrics Calculation
  const threatMetrics = {
    ransomware: newsFeed.filter(n => {
      const text = getSearchableNewsText(n);
      return text.includes('ransomware') || text.includes('เรียกไถ่');
    }).length,
    zeroDay: newsFeed.filter(n => {
      const text = getSearchableNewsText(n);
      return text.includes('zero-day') || text.includes('ช่องโหว่') || text.includes('vulnerability');
    }).length,
    dataBreach: newsFeed.filter(n => {
      const text = getSearchableNewsText(n);
      return text.includes('leak') || text.includes('หลุด') || text.includes('แฮก') || text.includes('breach');
    }).length,
    aiSecurity: newsFeed.filter(n => {
      const text = getSearchableNewsText(n);
      return text.includes('ai') || text.includes('ปัญญาประดิษฐ์') || text.includes('machine learning');
    }).length,
  };

  const getDashboardLevel = (count) => {
    if (count === 0) return { label: 'Safe', color: '#4ade80' };
    if (count <= 2) return { label: 'Low', color: '#facc15' };
    if (count <= 5) return { label: 'High', color: '#fb923c' };
    return { label: 'Critical', color: '#f87171' };
  };

  const totalCriticalIncidents = threatMetrics.ransomware + threatMetrics.zeroDay + threatMetrics.dataBreach;
  
  let threatLevel = { status: 'LOW', class: 'low', score: 18, icon: '🟢' };
  if (totalCriticalIncidents >= 8) threatLevel = { status: 'CRITICAL', class: 'critical', score: 92, icon: '🔴' };
  else if (totalCriticalIncidents >= 4) threatLevel = { status: 'HIGH RISK', class: 'high', score: 78, icon: '🟠' };
  else if (totalCriticalIncidents >= 1) threatLevel = { status: 'MODERATE', class: 'medium', score: 45, icon: '🟡' };

  // Real-time filtered news feed
  const filteredNewsFeed = newsFeed.filter(news => {
    const textToSearch = getSearchableNewsText(news);
    const matchesQuery = !searchQuery || textToSearch.includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (activeTag === 'RANSOMWARE') return textToSearch.includes('ransomware') || textToSearch.includes('แฮก') || textToSearch.includes('เรียกไถ่');
    if (activeTag === 'ZERO_DAY') return textToSearch.includes('zero-day') || textToSearch.includes('ช่องโหว่') || textToSearch.includes('vulnerability');
    if (activeTag === 'AI') return textToSearch.includes('ai') || textToSearch.includes('เทคโนโลยี') || textToSearch.includes('ปัญญาประดิษฐ์');
    if (activeTag === 'FLASH_ALERT') {
      const isHighOrCritical = ['high', 'critical', 'severe'].includes((news.impact_level || '').toLowerCase());
      return isHighOrCritical || textToSearch.includes('zero-day') || textToSearch.includes('cve-') || textToSearch.includes('วิกฤต') || textToSearch.includes('critical') || textToSearch.includes('ransomware');
    }
    if (activeTag === 'FAVORITES') return favorites.includes(news.id);
    return true;
  });
  
  // Load client-only state after mount to avoid SSR hydration mismatch
  useEffect(() => {
    setClientNow(Date.now());
    setFavorites(readSavedFavorites());
  }, []);

  useEffect(() => {
    // Handle LINE login callback if redirected to home page
    if (typeof window !== 'undefined' && window.location.search.includes('liff.state=')) {
      import('@line/liff').then((liffModule) => {
        liffModule.default.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2010531662-Vw7creFG' })
          .catch(console.error);
      });
    }
  }, []);

  const toggleFavorite = (e, newsId) => {
    e.stopPropagation();
    if (!newsId || newsId === 'hero') return;
    let updated;
    if (favorites.includes(newsId)) {
        updated = favorites.filter(id => id !== newsId);
        showToast('❌ นำออกจากรายการโปรดแล้ว');
    } else {
        updated = [...favorites, newsId];
        showToast('❤️ บันทึกลงรายการโปรดแล้ว');
    }
    setFavorites(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('favorite_news', JSON.stringify(updated));
    }
  };

  const shareNews = (e, news) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?article=${news.id}`;
    if (navigator.share) {
      navigator.share({
        title: toPlainText(news.title),
        text: 'อ่านข่าวนี้บน CyberInsight AI:',
        url: shareUrl,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('🔗 คัดลอกลิงก์ข่าวแล้ว');
    }
  };
  // Deep link: auto-open article from URL param ?article=UUID
  useEffect(() => {
    if (articleId) {
      async function fetchArticle() {
        try {
          const { data } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', articleId)
            .single();
          if (data) {
            setSelectedNews(data);
          }
        } catch (err) {
          console.error('Error fetching article by ID:', err);
        }
      }
      fetchArticle();
    }
  }, [articleId]);

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
            
        if (categoryFilter === 'Favorites') {
            const favIds = readSavedFavorites();
            if (favIds.length === 0) {
                 setNewsFeed([]);
                 setLoading(false);
                 return;
            }
            query = supabase.from('news_articles').select('*').in('id', favIds).order('created_at', { ascending: false });
        } else if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }

        const { data: feedData } = await query;

            
        if (feedData && feedData.length > 0) {
          setNewsFeed(feedData);
        } else {
            setNewsFeed([]); // Empty state
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoryFilter]);

  // Safe GSAP Animations Effect (Guarantees 100% Page Visibility)
  useEffect(() => {
    if (loading) return;

    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const ctx = gsap.context(() => {
        // Hero Section entrance
        gsap.fromTo('.trionn-badge', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'all' });
        gsap.fromTo('.trionn-hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out', clearProps: 'all' });
        gsap.fromTo('.trionn-hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out', clearProps: 'all' });



        // Featured News
        gsap.fromTo('.featured-news', { opacity: 0, y: 30 }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.15,
          ease: 'power2.out',
          clearProps: 'all'
        });

        // News Cards Grid (Wipe inline opacity after animation to guarantee 100% uniform color & contrast)
        gsap.fromTo('.news-card', { opacity: 0, y: 25 }, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all'
        });

        // Sidebar Items
        gsap.fromTo('.sidebar-item', { opacity: 0, x: 20 }, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all'
        });

        // Category Pills
        gsap.fromTo('.category-navbar a', { opacity: 0, y: -10 }, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'all'
        });
      });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => ctx.revert();
    }
  }, [loading, newsFeed]);

  // Format Hero Text
  let heroTitle = "บทวิเคราะห์ประจำวัน";
  let heroText = "กำลังรวบรวมสรุปข่าวประจำวันให้คุณ...";
  let heroCat = "Daily Brief";
  let heroDate = new Date().toISOString();
  let heroId = "hero";
  let heroRawNews = null;
  
  if (dailySummary && dailySummary.content_json) {
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
    heroDate = dailySummary.created_at;
  } else if (newsFeed && newsFeed.length > 0) {
    // Fallback to latest news if no daily summary (e.g. category view)
    const featured = newsFeed[0];
    heroTitle = featured.title;
    heroText = featured.summary;
    heroCat = featured.category || categoryFilter || 'News';
    heroDate = featured.created_at || featured.published_at;
    heroId = featured.id;
    heroRawNews = featured;
  }

  // Format Date Helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  // 24-Hour Fresh News Helper (Returns true if news was created/published within 24 hours)
  const isNewArticle = (dateString) => {
    if (!clientNow || !dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const diffHours = (clientNow - date.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  };

  const closeModal = () => setSelectedNews(null);

  const openNews = (news) => setSelectedNews(news);

  const handleOpenNewsKeyDown = (event, news) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openNews(news);
    }
  };

  // เมื่อ Modal เปิด: scroll ขึ้นบนสุด + ล็อค body ไม่ให้ scroll ด้านหลัง
  useEffect(() => {
    if (selectedNews) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedNews]);

  return (
    <>
      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.fading ? 'fade-out' : ''}`}>
            {toast.text}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
          <div className="skeleton" style={{ height: '300px', width: '100%', marginBottom: '40px', borderRadius: '16px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="skeleton" style={{ height: '220px', borderRadius: '12px' }}></div>
                <div className="skeleton" style={{ height: '24px', width: '80%' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '100%' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* TRIONN Hero Section (Professional News Editorial with Cyber Threat Dashboard) */}
          <section className="trionn-hero">
            <HeroAmbient3D />
            <div className="hero-content-container">
              <div className="hero-header-top">
                <div className="trionn-badge">✦ AI NEWS PORTAL • INTELLIGENCE ENGINE</div>
                <button 
                  onClick={() => setShowReportModal(true)} 
                  className="exec-report-btn"
                >
                  📄 ออกรายงานสรุปข่าวประจำวัน <span className="desktop-only-text">(Executive Report)</span>
                </button>
              </div>

              <h1 className="trionn-hero-title">
                CYBERINSIGHT <span className="trionn-hero-accent">INTELLIGENCE</span><br />
                DESK
              </h1>
              <p className="trionn-hero-sub">
                ระบบรวบรวม วิเคราะห์ และสรุปข่าวเทคโนโลยีและไซเบอร์ซิเคียวริตี้ด้วย <strong className="text-white" style={{ whiteSpace: 'nowrap' }}>AI Agents 5 ตัว</strong> ตลอด 24 ชั่วโมง
              </p>

              {/* 🛡️ Cyber Threat Level Dashboard */}
              <div className="cyber-threat-dashboard">
                <div className="threat-dashboard-header">
                  <div className="threat-header-title-wrapper">
                    <span className="threat-header-icon">🛡️</span>
                    <div className="threat-header-text">
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>CYBER THREAT INDEX (ดัชนีภัยคุกคามประจำวัน)</h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>ประมวลผลการวิเคราะห์โดย AI Scout & Shield Agents</span>
                    </div>
                  </div>
                  <div className={`threat-level-badge ${threatLevel.class}`}>
                    <span>{threatLevel.icon}</span> STATUS: {threatLevel.status} ({threatLevel.score}/100)
                  </div>
                </div>

                <div className="threat-metrics-grid">
                  <div className="threat-metric-card" style={{ borderTop: `2px solid ${getDashboardLevel(threatMetrics.ransomware).color}` }}>
                    <span className="threat-metric-icon">👾</span>
                    <div className="threat-metric-value" style={{ color: getDashboardLevel(threatMetrics.ransomware).color }}>{threatMetrics.ransomware}</div>
                    <div className="threat-metric-label">Ransomware</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: getDashboardLevel(threatMetrics.ransomware).color, marginTop: '6px', background: `${getDashboardLevel(threatMetrics.ransomware).color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                       {getDashboardLevel(threatMetrics.ransomware).label} Risk
                    </div>
                  </div>
                  <div className="threat-metric-card" style={{ borderTop: `2px solid ${getDashboardLevel(threatMetrics.zeroDay).color}` }}>
                    <span className="threat-metric-icon">⚠️</span>
                    <div className="threat-metric-value" style={{ color: getDashboardLevel(threatMetrics.zeroDay).color }}>{threatMetrics.zeroDay}</div>
                    <div className="threat-metric-label">Zero-Day / ช่องโหว่</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: getDashboardLevel(threatMetrics.zeroDay).color, marginTop: '6px', background: `${getDashboardLevel(threatMetrics.zeroDay).color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                       {getDashboardLevel(threatMetrics.zeroDay).label} Risk
                    </div>
                  </div>
                  <div className="threat-metric-card" style={{ borderTop: `2px solid ${getDashboardLevel(threatMetrics.dataBreach).color}` }}>
                    <span className="threat-metric-icon">🔓</span>
                    <div className="threat-metric-value" style={{ color: getDashboardLevel(threatMetrics.dataBreach).color }}>{threatMetrics.dataBreach}</div>
                    <div className="threat-metric-label">Data Breach / หลุด</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: getDashboardLevel(threatMetrics.dataBreach).color, marginTop: '6px', background: `${getDashboardLevel(threatMetrics.dataBreach).color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                       {getDashboardLevel(threatMetrics.dataBreach).label} Risk
                    </div>
                  </div>
                  <div className="threat-metric-card" style={{ borderTop: `2px solid ${getDashboardLevel(threatMetrics.aiSecurity).color}` }}>
                    <span className="threat-metric-icon">🤖</span>
                    <div className="threat-metric-value" style={{ color: getDashboardLevel(threatMetrics.aiSecurity).color }}>{threatMetrics.aiSecurity}</div>
                    <div className="threat-metric-label">AI & Tech News</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: getDashboardLevel(threatMetrics.aiSecurity).color, marginTop: '6px', background: `${getDashboardLevel(threatMetrics.aiSecurity).color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                       {getDashboardLevel(threatMetrics.aiSecurity).label} Activity
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-diagonal-bottom"></div>
          </section>

          <div className="homepage-container">
            {/* Category Sub-nav bar */}
            <div className="category-navbar">
            <div className="navbar-container">
              {navCategories.map(c => (
                  <Link 
                      key={c.id || 'all'} 
                      href={c.id ? `/?category=${c.id}` : '/'}
                      className={(!categoryFilter && !c.id) || categoryFilter === c.id ? 'active' : ''}
                  >
                      {c.label}
                  </Link>
              ))}
            </div>
          </div>

          <div className="portal-grid">
          
          {/* Left Column: Featured News & Grid */}
          <div className="main-news-col">
            <h2 className="section-heading">ข่าวพาดหัวหลัก</h2>
            
            {(dailySummary || newsFeed.length > 0) && (
                <button type="button" className="featured-news news-action-card" onClick={() => {
                  if (heroRawNews) {
                    openNews(heroRawNews);
                  } else {
                    openNews({
                        title: heroTitle,
                        category: heroCat,
                        summary: heroText,
                        created_at: heroDate,
                        source: "AI Summary",
                        id: heroId
                    });
                  }
                }}>
                    <div className="featured-image-container">
                        <img 
                            src={getImageUrl(heroRawNews || {category: heroCat, title: heroTitle, id: heroId, summary: heroText}, false)} 
                            alt={toPlainText(heroTitle, 'Featured News')}
                            fetchPriority="high"
                            decoding="async"
                            onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(heroRawNews || {category: heroCat, title: heroTitle, id: heroId}, false, true); }}
                        />
                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 10 }}>
                          <span className="featured-tag">{heroCat}</span>
                          {isNewArticle(heroDate) && <span className="new-badge">🔥 ข่าวใหม่</span>}
                        </div>
                    </div>
                    <div className="featured-content">
                        <h1 className="featured-title">{toPlainText(heroTitle)}</h1>
                        <div className="featured-summary">{createSnippet(heroText, 300)}</div>
                    </div>
                </button>
            )}

            </div>

          {/* Right Column: Sidebar */}
          <div className="sidebar-col">
            <h2 className="section-heading">ข่าวด่วนรอบวัน</h2>
            <div className="sidebar-list">
                {newsFeed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        ไม่พบข่าวด่วนในหมวดหมู่นี้
                    </div>
                ) : (
                    newsFeed.slice(0, 5).map((news, idx) => (
                        <div
                            key={'side-'+(news.id || idx)}
                            className="sidebar-item"
                            onClick={() => openNews(news)}
                            onKeyDown={(event) => handleOpenNewsKeyDown(event, news)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="sidebar-item-img">
                                <img 
                                    src={getImageUrl(news, true)} 
                                    alt={toPlainText(news.title, 'ข่าวด่วน')}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(news, true, true); }}
                                />
                            </div>
                            <div className="sidebar-item-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="sidebar-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    {isNewArticle(news.created_at || news.published_at) ? (
                                        <span className="new-badge" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'linear-gradient(90deg, #ff4b2b, #ff416c)', color: 'white', fontWeight: 'bold' }}>🔥 ข่าวใหม่</span>
                                    ) : <div></div>}
                                    <button
                                        type="button"
                                        className="favorite-toggle sidebar-favorite"
                                        onClick={(e) => toggleFavorite(e, news.id)}
                                        aria-label={favorites.includes(news.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                                        aria-pressed={favorites.includes(news.id)}
                                        style={{ position: 'relative', top: 0, right: 0, border: 'none', background: 'var(--bg-card)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        {favorites.includes(news.id) ? '❤️' : '🤍'}
                                    </button>
                                </div>
                                <div className="sidebar-item-title" style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: '600', color: 'var(--text-dark)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {toPlainText(news.title)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>

        {/* Full Width Section: Latest News with Real-time Search & Filter Tags */}
        <div className="latest-news-section" style={{marginTop: '40px'}}>
            <div className="search-filter-section">
              <h2 className="section-heading" style={{ margin: 0 }}>ข่าวล่าสุด ({filteredNewsFeed.length})</h2>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="live-search-box">
                  <span style={{ marginRight: '8px', color: 'var(--color-primary)' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="พิมพ์เพื่อค้นหาข่าว Real-time..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suppressHydrationWarning
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>✕</button>
                  )}
                </div>

                <div className="quick-tag-pills">
                  <button onClick={() => setActiveTag('ALL')} className={`tag-pill ${activeTag === 'ALL' ? 'active' : ''}`}>ทั้งหมด</button>
                  <button onClick={() => setActiveTag('FLASH_ALERT')} className={`tag-pill flash-tag ${activeTag === 'FLASH_ALERT' ? 'active' : ''}`}>⚡ Flash Alerts</button>
                  <button onClick={() => setActiveTag('RANSOMWARE')} className={`tag-pill ${activeTag === 'RANSOMWARE' ? 'active' : ''}`}>👾 Ransomware</button>
                  <button onClick={() => setActiveTag('ZERO_DAY')} className={`tag-pill ${activeTag === 'ZERO_DAY' ? 'active' : ''}`}>⚠️ Zero-Day</button>
                  <button onClick={() => setActiveTag('AI')} className={`tag-pill ${activeTag === 'AI' ? 'active' : ''}`}>🤖 AI & Tech</button>
                  <button onClick={() => setActiveTag('FAVORITES')} className={`tag-pill ${activeTag === 'FAVORITES' ? 'active' : ''}`}>❤️ โปรด</button>
                </div>
              </div>
            </div>
            
            <div className="news-cards-grid full-width">
                {filteredNewsFeed.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)', background: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-gray)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-dark)' }}>ขออภัย ไม่พบข่าวที่ค้นหา</h3>
                        <p>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ภัยคุกคามอื่นเพิ่มเติม</p>
                    </div>
                ) : (
                    filteredNewsFeed.map((news, idx) => {
                        const text = getSearchableNewsText(news);
                        const isFlashAlert = (news.impact_level || '').toLowerCase() === 'critical' ||
                          (news.category && news.category.toLowerCase().includes('cyber') && (
                            text.includes('zero-day') || text.includes('cve-') || text.includes('ransomware') || text.includes('critical') || text.includes('วิกฤต')
                          ));
                        return (
                          <NewsCard
                              key={news.id || idx}
                              news={news}
                              onClick={() => openNews(news)}
                              onKeyDown={(event) => handleOpenNewsKeyDown(event, news)}
                              imageUrl={getImageUrl(news, true)}
                              fallbackImageUrl={getImageUrl(news, true, true)}
                              isFavorite={favorites.includes(news.id)}
                              onToggleFavorite={toggleFavorite}
                              isNew={isNewArticle(news.created_at || news.published_at)}
                              confidenceScore={getConfidenceScore(news.id)}
                              formattedDate={formatDate(news.created_at)}
                              plainTitle={toPlainText(news.title)}
                              snippet={news.summary ? createSnippet(news.summary, 150) : null}
                              isFlashAlert={isFlashAlert}
                          />
                        );
                    })
                )}
            </div>

            {/* Footer / End of News Section */}
            <div style={{
                marginTop: '60px',
                padding: '40px 20px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--border-gray)',
                color: 'var(--text-gray)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✦</div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                    คุณอ่านถึงข่าวล่าสุดแล้ว
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>
                    ระบบ Multi-Agent AI คอยอัปเดตและวิเคราะห์ข่าวสารใหม่ๆ ตลอด 24 ชั่วโมง
                </p>
            </div>
          </div>
        </div>

        {/* 📄 Printable Executive Daily Report Modal */}
        {showReportModal && (
          <div className="news-modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="exec-report-modal" onClick={e => e.stopPropagation()}>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <span>✦ EXECUTIVE INTELLIGENCE REPORT</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => window.print()} 
                    style={{ background: 'var(--color-accent)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🖨️ พิมพ์ / บันทึก PDF
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)} 
                    style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '50%', cursor: 'pointer' }}
                    aria-label="ปิดรายงาน"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '16px', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--color-primary)' }}>รายงานสรุปสถานการณ์ภัยคุกคามไซเบอร์ประจำวัน</h1>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-gray)', fontSize: '13px' }}>
                  จัดทำโดย: CyberInsight AI Multi-Agent Intelligence Engine • วันที่: {new Date(clientNow).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-gray)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--color-primary)' }}>📊 สรุปดัชนีภัยคุกคาม (Threat Overview)</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
                  ดัชนีภัยคุกคามรวมอยู่ในระดับ <strong>{threatLevel.status} ({threatLevel.score}/100)</strong> โดยตรวจพบเหตุการณ์การโจมตีแบบ Ransomware รวม {threatMetrics.ransomware} รายการ, ช่องโหว่ Zero-Day {threatMetrics.zeroDay} รายการ และข่าวสารความเสี่ยงด้านปัญญาประดิษฐ์ {threatMetrics.aiSecurity} รายการ
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '16px' }}>📌 สรุปข่าวสำคัญประจำวัน (Top Intelligence Highlights)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {newsFeed.slice(0, 5).map((n, idx) => (
                    <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', borderLeft: '3px solid var(--color-accent)' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-dark)', fontSize: '14px' }}>{idx + 1}. {toPlainText(n.title)}</h4>
                      <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '13px', lineHeight: 1.5 }}>
                        {createSnippet(n.summary, 180, 'สรุปวิเคราะห์ข้อมูลโดยระบบ AI')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
          {/* Modal Overlay */}
          {selectedNews && (
            <NewsDetailModal
              news={selectedNews}
              onClose={closeModal}
              imageUrl={getImageUrl(selectedNews)}
              fallbackImageUrl={getImageUrl(selectedNews, false, true)}
              isFavorite={favorites.includes(selectedNews.id)}
              onToggleFavorite={toggleFavorite}
              onShare={shareNews}
              formattedDate={formatDate(selectedNews.created_at)}
              plainTitle={toPlainText(selectedNews.title)}
              sanitizedHtml={sanitizeRichText(selectedNews.summary || selectedNews.analysis)}
              searchableText={getSearchableNewsText(selectedNews)}
            />
          )}
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
