"""
⚽ Sports Fetcher Tool
ดึงข่าวกีฬาจาก Google News RSS + ข้อมูลฟุตบอลโลก 2026
"""

import feedparser
import requests
from datetime import datetime, timedelta
from crewai.tools import tool


import urllib.parse


def _fetch_sports_news(query, language="th", max_results=10):
    """ดึงข่าวกีฬาจาก Google News RSS"""
    base_url = "https://news.google.com/rss/search"
    safe_query = urllib.parse.quote(query)
    url = f"{base_url}?q={safe_query}&hl={language}&gl=TH&ceid=TH:{language}"
    feed = feedparser.parse(url)
    articles = []
    cutoff = datetime.now() - timedelta(hours=72)
    
    for entry in feed.entries[:max_results]:
        published = None
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])
            if published < cutoff:
                continue
        articles.append({
            "title": entry.get("title", "N/A"),
            "link": entry.get("link", ""),
            "source": entry.get("source", {}).get("title", "Unknown") if hasattr(entry, "source") else "Unknown",
            "published": published.strftime("%Y-%m-%d %H:%M") if published else "Unknown",
            "summary": entry.get("summary", "")[:300],
        })
    return articles


@tool("fetch_sports_news")
def fetch_sports_news(sport: str = "football") -> str:
    """ดึงข่าวกีฬาล่าสุดจาก Google News RSS ตามประเภทกีฬา"""
    queries_map = {
        "football": ["ฟุตบอล ผลบอล", "football results"],
        "ฟุตบอล": ["ฟุตบอล ผลบอล", "football results"],
        "basketball": ["NBA basketball"],
        "tennis": ["tennis Grand Slam"],
        "มวย": ["boxing MMA UFC"],
    }
    queries = queries_map.get(sport.lower(), [sport])
    all_articles, seen = [], set()
    for q in queries:
        for lang in ["th", "en"]:
            for a in _fetch_sports_news(q, lang, 5):
                if a["title"] not in seen:
                    seen.add(a["title"])
                    all_articles.append(a)
    if not all_articles:
        return f"❌ ไม่พบข่าวกีฬา '{sport}'"
    result = f"⚽ **ข่าวกีฬา: {sport}** ({len(all_articles)} ข่าว)\n\n"
    for i, a in enumerate(all_articles, 1):
        result += f"**{i}. {a['title']}**\n   {a['source']} | {a['published']}\n   🔗 {a['link']}\n\n"
    return result


@tool("fetch_world_cup_2026")
def fetch_world_cup_2026() -> str:
    """ดึงข้อมูลฟุตบอลโลก 2026 — ผลการแข่ง, ตารางแข่ง, ข่าวล่าสุด"""
    news_th = _fetch_sports_news("ฟุตบอลโลก 2026 ผลบอล", "th", 8)
    news_en = _fetch_sports_news("FIFA World Cup 2026 results", "en", 8)
    result = f"🏆 **FIFA World Cup 2026**\n🕐 {datetime.now().strftime('%Y-%m-%d %H:%M')}\n{'='*50}\n\n"
    if news_th:
        result += "### 🇹🇭 ข่าวภาษาไทย\n\n"
        for i, a in enumerate(news_th[:5], 1):
            result += f"**{i}. {a['title']}**\n   {a['source']} | {a['published']}\n\n"
    if news_en:
        result += "### 🌍 International\n\n"
        for i, a in enumerate(news_en[:5], 1):
            result += f"**{i}. {a['title']}**\n   {a['source']} | {a['published']}\n\n"
    return result
