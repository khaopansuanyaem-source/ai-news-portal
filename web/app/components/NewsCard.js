'use client';

import { useState } from 'react';

export default function NewsCard({
  news,
  onClick,
  onKeyDown,
  imageUrl,
  fallbackImageUrl,
  isFavorite,
  onToggleFavorite,
  isNew,
  confidenceScore,
  formattedDate,
  plainTitle,
  snippet,
  isFlashAlert,
  cveList = [],
}) {
  const [shareToast, setShareToast] = useState(false);

  // Extract CVEs from title or summary if not explicitly provided
  const detectedCves = cveList && cveList.length > 0
    ? cveList
    : Array.from(new Set(`${plainTitle || ''} ${snippet || ''} ${news?.summary || ''}`.match(/(?:CVE|cve)-\d{4}-\d{4,7}/gi) || [])).slice(0, 2);

  // 🔗 ฟังก์ชัน Share — ใช้ Web Share API (มือถือ) หรือ Copy Clipboard (เดสก์ท็อป)
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // ป้องกันเปิด Modal
    const shareUrl = news?.url || window.location.href;
    const shareTitle = plainTitle || news?.title || 'ข่าวจาก CyberInsight AI';

    if (navigator.share) {
      // Mobile: Web Share API
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch (_) { /* user cancelled share */ }
    } else {
      // Desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 1500);
      } catch (_) {
        // Fallback: prompt
        window.prompt('คัดลอกลิงก์ข่าว:', shareUrl);
      }
    }
  };

  return (
    <div
      className="news-card"
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      style={{ position: 'relative' }}
    >
      <div className="news-card-image">
        <img
          src={imageUrl}
          alt={plainTitle || 'ข่าวล่าสุด'}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImageUrl;
          }}
        />
        {/* ❤️ Favorite Button */}
        <button
          type="button"
          className="favorite-toggle card-favorite"
          onClick={(e) => onToggleFavorite(e, news.id)}
          aria-label={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '❤️' : '♡'}
        </button>

        {/* 🔗 Share Button */}
        <button
          type="button"
          id={`share-btn-${news?.id}`}
          onClick={handleShare}
          aria-label="แชร์ข่าวนี้"
          title="แชร์หรือคัดลอกลิงก์"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 5,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,200,100,0.7)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
        >
          {shareToast ? '✓' : '🔗'}
        </button>

        {/* Toast Notification */}
        {shareToast && (
          <div style={{
            position: 'absolute',
            bottom: '48px',
            right: '8px',
            background: 'rgba(0,200,100,0.92)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
            animation: 'fadeInUp 0.2s ease',
          }}>
            คัดลอกแล้ว! ✓
          </div>
        )}
      </div>
      <div className="news-card-content">
        <div className="card-meta">
          <span className="category-tag">{news.category || 'General'}</span>
          {isFlashAlert && <span className="flash-alert-badge">⚡ FLASH ALERT</span>}
          {isNew && !isFlashAlert && <span className="new-badge">🔥 ข่าวใหม่</span>}
          {detectedCves.map((cve) => (
            <span key={cve} className="cve-tag">
              {cve.toUpperCase()}
            </span>
          ))}
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            🛡️ AI Verified: {confidenceScore}%
          </span>
          <span className="card-date">{formattedDate}</span>
        </div>
        <h3 className="card-title">{plainTitle}</h3>
        {snippet && <div className="card-summary">{snippet}</div>}
      </div>
    </div>
  );
}
