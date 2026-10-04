'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../utils/supabase';
import NewsCard from '../components/NewsCard';
import NewsDetailModal from '../components/NewsDetailModal';
import { getOsClassification, POPULAR_OS_LIST, OS_CATEGORIES, OS_TAXONOMY } from '../../utils/osClassifier';

export default function AllNewsPage() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(''); // YYYY-MM-DD
  const [filterMonth, setFilterMonth] = useState(''); // 1-12
  const [filterYear, setFilterYear] = useState(''); // YYYY
  
  const [activeTag, setActiveTag] = useState('ALL');
  const [showOsFilterPanel, setShowOsFilterPanel] = useState(false);
  const [selectedOsFilters, setSelectedOsFilters] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const [favorites, setFavorites] = useState([]);

  // Fetch initial data and setup realtime subscription
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (!error && data) {
        setNewsFeed(data);
      }
      setIsLoading(false);
    };

    loadNews();

    // Supabase Real-time Subscription
    const channel = supabase
      .channel('news_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_articles' }, (payload) => {
        setNewsFeed(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news_articles' }, (payload) => {
        setNewsFeed(prev => prev.filter(item => item.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'news_articles' }, (payload) => {
        setNewsFeed(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
      })
      .subscribe();

    // Load Favorites from LocalStorage
    const savedFavs = localStorage.getItem('cyber_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(fId => fId !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('cyber_favorites', JSON.stringify(newFavs));
  };

  const toggleOsFilter = (osName) => {
    setSelectedOsFilters((prev) =>
      prev.includes(osName) ? prev.filter((o) => o !== osName) : [...prev, osName]
    );
  };

  const clearOsFilters = () => {
    setSelectedOsFilters([]);
    setSelectedCategoryFilter('');
  };

  // Filter Logic
  const filteredNews = useMemo(() => {
    return newsFeed.filter(news => {
      // 1. Search filter
      const textToSearch = `${news.title} ${news.summary} ${news.category}`.toLowerCase();
      if (searchQuery && !textToSearch.includes(searchQuery.toLowerCase())) return false;

      const pubDate = new Date(news.published_at);

      // 2. Exact Date Filter (YYYY-MM-DD)
      if (filterDate) {
        const newsDateString = pubDate.toISOString().split('T')[0];
        if (newsDateString !== filterDate) return false;
      }

      // 3. Month Filter
      if (filterMonth && pubDate.getMonth() + 1 !== parseInt(filterMonth)) return false;

      // 4. Year Filter
      if (filterYear && pubDate.getFullYear() !== parseInt(filterYear)) return false;

      // 5. OS Filter
      if (selectedOsFilters.length > 0 || selectedCategoryFilter) {
        const osData = getOsClassification(news);
        if (selectedOsFilters.length > 0) {
          const matchesOs = selectedOsFilters.some((f) => osData.os_names.includes(f));
          if (!matchesOs) return false;
        }
        if (selectedCategoryFilter) {
          const matchesCat = osData.os_categories.includes(selectedCategoryFilter);
          if (!matchesCat) return false;
        }
      }

      // 6. Active Tag Filter
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
  }, [newsFeed, searchQuery, filterDate, filterMonth, filterYear, activeTag, selectedOsFilters, selectedCategoryFilter, favorites]);

  // Generate Year Options dynamically from data
  const yearOptions = useMemo(() => {
    const years = new Set(newsFeed.map(news => new Date(news.published_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [newsFeed]);

  return (
    <div className="page-wrapper" style={{ padding: '120px 24px 80px', minHeight: '100vh', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
            🗞️ ข่าวสารทั้งหมด <span style={{ color: 'var(--color-primary)', fontSize: '20px', marginLeft: '12px', background: 'rgba(2, 132, 199, 0.1)', padding: '4px 12px', borderRadius: '99px' }}>Real-time</span>
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '16px' }}>
            อัปเดตข่าวสาร Cybersecurity และเทคโนโลยีล่าสุดทันทีเมื่อมีข่าวใหม่เข้ามา
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ 
        background: 'var(--bg-card)', 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid var(--border-gray)',
        marginBottom: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        alignItems: 'end'
      }}>
        {/* Search */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-gray)', marginBottom: '6px' }}>ค้นหาข่าว</label>
          <input 
            type="text" 
            placeholder="พิมพ์คำค้นหา..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-gray)', background: 'var(--bg-page)', color: 'var(--text-dark)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Filter Tags */}
        <div style={{ gridColumn: '1 / -1', marginTop: '12px', marginBottom: '8px' }}>
          <div className="quick-tag-pills">
            <button onClick={() => setActiveTag('ALL')} className={`tag-pill ${activeTag === 'ALL' ? 'active' : ''}`}>ทั้งหมด</button>
            <button onClick={() => setActiveTag('FLASH_ALERT')} className={`tag-pill flash-tag ${activeTag === 'FLASH_ALERT' ? 'active' : ''}`}>⚡ Flash Alerts</button>
            <button onClick={() => setActiveTag('RANSOMWARE')} className={`tag-pill ${activeTag === 'RANSOMWARE' ? 'active' : ''}`}>👾 Ransomware</button>
            <button onClick={() => setActiveTag('ZERO_DAY')} className={`tag-pill ${activeTag === 'ZERO_DAY' ? 'active' : ''}`}>⚠️ Zero-Day</button>
            <button onClick={() => setActiveTag('AI')} className={`tag-pill ${activeTag === 'AI' ? 'active' : ''}`}>🤖 AI & Tech</button>
            <button onClick={() => setActiveTag('FAVORITES')} className={`tag-pill ${activeTag === 'FAVORITES' ? 'active' : ''}`}>❤️ โปรด</button>
            <button
              onClick={() => setShowOsFilterPanel(!showOsFilterPanel)}
              className={`tag-pill os-filter-toggle ${showOsFilterPanel || selectedOsFilters.length > 0 || selectedCategoryFilter ? 'active' : ''}`}
            >
              🖥️ OS Filter{selectedOsFilters.length > 0 ? ` (${selectedOsFilters.length})` : ''}
            </button>
          </div>
        </div>

        {/* 🖥️ OS / Platform Filter Panel */}
        {showOsFilterPanel && (
          <div className="os-filter-panel" style={{ gridColumn: '1 / -1', marginTop: '-12px', marginBottom: '16px' }}>
            <div className="os-filter-panel-header">
              <h3 className="os-filter-panel-title">🖥️ Filter by Operating System / Platform</h3>
              {(selectedOsFilters.length > 0 || selectedCategoryFilter) && (
                <button className="os-filter-clear" onClick={clearOsFilters}>✕ ล้างตัวกรอง</button>
              )}
            </div>

            <div className="os-filter-section">
              <div className="os-filter-section-label">Platform Category</div>
              <div className="os-filter-category-row">
                <button
                  className={`os-filter-category-btn ${selectedCategoryFilter === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryFilter('')}
                >
                  ทั้งหมด (All)
                </button>
                {OS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`os-filter-category-btn ${selectedCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="os-filter-section">
              <div className="os-filter-section-label">Specific OS / Platform</div>
              <div className="os-filter-tags">
                {POPULAR_OS_LIST.map((os) => {
                  const isActive = selectedOsFilters.includes(os);
                  return (
                    <button
                      key={os}
                      className={`os-filter-tag ${isActive ? 'active' : ''}`}
                      onClick={() => toggleOsFilter(os)}
                    >
                      {isActive ? '✓ ' : ''}{os}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Date Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-gray)', marginBottom: '6px' }}>ระบุวันที่</label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterMonth(''); // Clear month if specific date is picked
              setFilterYear('');
            }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-gray)', background: 'var(--bg-page)', color: 'var(--text-dark)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Month Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-gray)', marginBottom: '6px' }}>เดือน</label>
          <select 
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-gray)', background: 'var(--bg-page)', color: 'var(--text-dark)', boxSizing: 'border-box' }}
          >
            <option value="">ทุกเดือน</option>
            <option value="1">มกราคม</option>
            <option value="2">กุมภาพันธ์</option>
            <option value="3">มีนาคม</option>
            <option value="4">เมษายน</option>
            <option value="5">พฤษภาคม</option>
            <option value="6">มิถุนายน</option>
            <option value="7">กรกฎาคม</option>
            <option value="8">สิงหาคม</option>
            <option value="9">กันยายน</option>
            <option value="10">ตุลาคม</option>
            <option value="11">พฤศจิกายน</option>
            <option value="12">ธันวาคม</option>
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-gray)', marginBottom: '6px' }}>ปี</label>
          <select 
            value={filterYear}
            onChange={(e) => { setFilterYear(e.target.value); setFilterDate(''); }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-gray)', background: 'var(--bg-page)', color: 'var(--text-dark)', boxSizing: 'border-box' }}
          >
            <option value="">ทุกปี</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Clear Filter */}
        <div>
          <button 
            onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterMonth(''); setFilterYear(''); setActiveTag('ALL'); clearOsFilters(); }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', fontWeight: '600', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            ✕ ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '24px', fontWeight: '600', color: 'var(--text-gray)' }}>
        แสดงผล: <span style={{ color: 'var(--color-primary)' }}>{filteredNews.length}</span> รายการ
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-gray)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        /* News Grid */
        <div className="news-cards-grid full-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredNews.length > 0 ? (
            filteredNews.map(news => {
              const pubDate = new Date(news.published_at);
              const formattedDate = pubDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
              const isFlashAlert = ['high', 'critical', 'severe'].includes((news.impact_level || '').toLowerCase());
              
              // Ensure we check title + summary for new badge
              const isNew = (new Date() - pubDate) < 24 * 60 * 60 * 1000;

              return (
                <NewsCard
                  key={news.id}
                  news={news}
                  onClick={() => setSelectedNews(news)}
                  imageUrl={news.image_url || '/placeholder-news.jpg'}
                  fallbackImageUrl="/placeholder-news.jpg"
                  isFavorite={favorites.includes(news.id)}
                  onToggleFavorite={toggleFavorite}
                  isNew={isNew}
                  confidenceScore={90 + Math.floor(Math.random() * 10)}
                  formattedDate={formattedDate}
                  plainTitle={news.title}
                  snippet={news.summary ? news.summary.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : ''}
                  isFlashAlert={isFlashAlert}
                />
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-gray)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontSize: '20px', color: 'var(--text-dark)', marginBottom: '8px' }}>ไม่พบข่าวสารที่ตรงกับเงื่อนไข</h3>
              <p style={{ color: 'var(--text-gray)' }}>ลองเปลี่ยนคำค้นหา หรือช่วงเวลาที่ต้องการดูใหม่นะครับ</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
          imageUrl={selectedNews.image_url || '/placeholder-news.jpg'}
          fallbackImageUrl="/placeholder-news.jpg"
          isFavorite={favorites.includes(selectedNews.id)}
          onToggleFavorite={toggleFavorite}
          formattedDate={new Date(selectedNews.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          plainTitle={selectedNews.title}
          isFlashAlert={['high', 'critical', 'severe'].includes((selectedNews.impact_level || '').toLowerCase())}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
