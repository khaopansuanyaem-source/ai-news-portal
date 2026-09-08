"""
📡 Cyber News Fetcher Tool
ดึงข่าว Cybersecurity จาก Google News RSS
"""

import feedparser
from datetime import datetime, timedelta
from typing import Optional
from crewai.tools import tool
import urllib.parse

def _fetch_google_news(query: str, language: str = "th", max_results: int = 10) -> list[dict]:
    """ดึงข่าวจาก Google News RSS ตาม keyword"""
    base_url = "https://news.google.com/rss/search"
    safe_query = urllib.parse.quote(query)
    params = f"?q={safe_query}&hl={language}&gl=TH&ceid=TH:{language}"
    url = f"{base_url}{params}"
    
    feed = feedparser.parse(url)
    articles = []
    cutoff_time = datetime.now() - timedelta(hours=72)  # ข่าวไม่เกิน 72 ชม. สำหรับ Cyber
    
    for entry in feed.entries[:max_results]:
        published = None
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])
            if published < cutoff_time:
                continue
        
        article = {
            "title": entry.get("title", "N/A"),
            "link": entry.get("link", ""),
            "source": entry.get("source", {}).get("title", "Unknown") if hasattr(entry, "source") else "Unknown",
            "published": published.strftime("%Y-%m-%d %H:%M") if published else "Unknown",
            "summary": entry.get("summary", "")[:300],
        }
        articles.append(article)
    
    return articles


@tool("fetch_cyber_news")
def fetch_cyber_news(keywords: Optional[str] = None) -> str:
    """
    ดึงข่าว Cybersecurity ล่าสุดจาก Google News RSS
    
    Args:
        keywords: คำค้นเพิ่มเติม เช่น 'Ransomware', 'Data breach', 'Zero-day', 'Cyber attack'
                  ถ้าไม่ระบุจะค้นหาข่าว Cyber โดยรวม
    
    Returns:
        สรุปข่าวความปลอดภัยไซเบอร์ล่าสุดในรูปแบบข้อความ
    """
    
    cyber_queries = [
        "Ransomware",
        "Data Breach",
        "Zero-day vulnerability",
        "Cybersecurity attack",
        "มัลแวร์ ไวรัส",
        "แฮกเกอร์ ข้อมูลหลุด",
    ]
    
    if keywords:
        if "," in keywords:
            cyber_queries = [q.strip() for q in keywords.split(",") if q.strip()]
        else:
            cyber_queries = [keywords]
    
    all_articles = []
    seen_titles = set()
    
    for query in cyber_queries:
        for lang in ["en", "th"]:  # เน้นอังกฤษสำหรับ cyber
            articles = _fetch_google_news(query, language=lang, max_results=3)
            for article in articles:
                if article["title"] not in seen_titles:
                    seen_titles.add(article["title"])
                    all_articles.append(article)
    
    if not all_articles:
        return "❌ ไม่พบข่าว Cybersecurity ล่าสุด"
    
    result = f"🔒 **ข่าว Cybersecurity ล่าสุด** (พบ {len(all_articles)} ข่าว)\n"
    result += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    result += "=" * 60 + "\n\n"
    
    for i, article in enumerate(all_articles, 1):
        result += f"### ข่าวที่ {i}\n"
        result += f"**หัวข้อ:** {article['title']}\n"
        result += f"**แหล่ง:** {article['source']}\n"
        result += f"**เผยแพร่:** {article['published']}\n"
        result += f"**ลิงก์:** {article['link']}\n"
        if article['summary']:
            result += f"**สรุป:** {article['summary']}\n"
        result += "\n---\n\n"
    
    return result
