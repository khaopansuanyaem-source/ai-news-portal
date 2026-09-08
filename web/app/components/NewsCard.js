'use client';

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
}) {
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
        <button
          type="button"
          className="favorite-toggle card-favorite"
          onClick={(e) => onToggleFavorite(e, news.id)}
          aria-label={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '❤️' : '♡'}
        </button>
      </div>
      <div className="news-card-content">
        <div className="card-meta">
          <span>{news.category || 'General'}</span>
          {isNew && <span className="new-badge">🔥 ข่าวใหม่</span>}
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
