"""
📡 News Fetcher Tool
ดึงข่าวจาก Google News RSS — ทั้งข่าวการเงินและทั่วไป
"""

import feedparser
from datetime import datetime, timedelta
from typing import Optional
from crewai.tools import tool


import urllib.parse

def _fetch_google_news(query: str, language: str = "th", max_results: int = 10) -> list[dict]:
    """ดึงข่าวจาก Google News RSS ตาม keyword"""
    
    # Google News RSS endpoint
    base_url = "https://news.google.com/rss/search"
    safe_query = urllib.parse.quote(query)
    params = f"?q={safe_query}&hl={language}&gl=TH&ceid=TH:{language}"
    url = f"{base_url}{params}"
    
    feed = feedparser.parse(url)
    
    articles = []
    cutoff_time = datetime.now() - timedelta(hours=48)  # ข่าวไม่เกิน 48 ชม.
    
    for entry in feed.entries[:max_results]:
        # Parse วันที่ข่าว
        published = None
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])
            # กรองข่าวเก่า
            if published < cutoff_time:
                continue
        
        article = {
            "title": entry.get("title", "N/A"),
            "link": entry.get("link", ""),
            "source": entry.get("source", {}).get("title", "Unknown") if hasattr(entry, "source") else "Unknown",
            "published": published.strftime("%Y-%m-%d %H:%M") if published else "Unknown",
            "summary": entry.get("summary", "")[:300],  # ตัดเหลือ 300 ตัวอักษร
        }
        articles.append(article)
    
    return articles


@tool("fetch_finance_news")
def fetch_finance_news(keywords: Optional[str] = None) -> str:
    """
    ดึงข่าวการเงินล่าสุดจาก Google News RSS
    
    Args:
        keywords: คำค้นเพิ่มเติม เช่น 'ทองคำ', 'หุ้น SET', 'เศรษฐกิจไทย'
                  ถ้าไม่ระบุจะค้นหาข่าวการเงินทั่วไป
    
    Returns:
        สรุปข่าวการเงินล่าสุดในรูปแบบข้อความ
    """
    
    # Keyword sets สำหรับข่าวการเงิน
    finance_queries = [
        "ราคาทองคำ วันนี้",
        "หุ้นไทย SET Index",
        "เศรษฐกิจไทย 2026",
        "ค่าเงินบาท USD",
    ]
    
    if keywords:
        if "," in keywords:
            finance_queries = [q.strip() for q in keywords.split(",") if q.strip()]
        elif ";" in keywords:
            finance_queries = [q.strip() for q in keywords.split(";") if q.strip()]
        else:
            finance_queries = [keywords]
    
    all_articles = []
    seen_titles = set()
    
    for query in finance_queries:
        # ดึงข่าวทั้งภาษาไทยและอังกฤษ
        for lang in ["th", "en"]:
            articles = _fetch_google_news(query, language=lang, max_results=5)
            for article in articles:
                if article["title"] not in seen_titles:
                    seen_titles.add(article["title"])
                    all_articles.append(article)
    
    if not all_articles:
        return "❌ ไม่พบข่าวการเงินล่าสุด กรุณาลองคำค้นอื่น"
    
    # Format ผลลัพธ์
    result = f"📰 **ข่าวการเงินล่าสุด** (พบ {len(all_articles)} ข่าว)\n"
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


@tool("fetch_general_news")
def fetch_general_news(topic: str) -> str:
    """
    ดึงข่าวทั่วไปจาก Google News RSS ตามหัวข้อที่ต้องการ
    
    Args:
        topic: หัวข้อข่าวที่ต้องการค้นหา เช่น 'เทคโนโลยี', 'การเมือง', 'สิ่งแวดล้อม'
    
    Returns:
        สรุปข่าวล่าสุดในหัวข้อที่ระบุ
    """
    
    all_articles = []
    
    for lang in ["th", "en"]:
        articles = _fetch_google_news(topic, language=lang, max_results=8)
        all_articles.extend(articles)
    
    if not all_articles:
        return f"❌ ไม่พบข่าวเกี่ยวกับ '{topic}'"
    
    # ตัด duplicate
    seen = set()
    unique = []
    for a in all_articles:
        if a["title"] not in seen:
            seen.add(a["title"])
            unique.append(a)
    
    result = f"📰 **ข่าว: {topic}** (พบ {len(unique)} ข่าว)\n"
    result += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    result += "=" * 60 + "\n\n"
    
    for i, article in enumerate(unique, 1):
        result += f"**{i}. {article['title']}**\n"
        result += f"   แหล่ง: {article['source']} | {article['published']}\n"
        result += f"   🔗 {article['link']}\n\n"
    
    return result
