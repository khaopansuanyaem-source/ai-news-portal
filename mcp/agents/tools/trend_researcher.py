"""
🔍 Trend Researcher Tool
ค้นหา Trending Topics จาก Google News RSS + Google Trends
เพื่อให้ Agent รู้ว่าตอนนี้คนสนใจเรื่องอะไร
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
    cutoff_time = datetime.now() - timedelta(hours=48)

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


@tool("search_trends")
def search_trends(topic: str, language: Optional[str] = "th") -> str:
    """
    ค้นหาเทรนด์และข้อมูลล่าสุดเกี่ยวกับหัวข้อที่ต้องการสร้าง Content

    Args:
        topic: หัวข้อที่ต้องการค้นหาเทรนด์ เช่น 'ร้านกาแฟ', 'ท่องเที่ยวภูเก็ต', 'เทคโนโลยี AI'
        language: ภาษาที่ต้องการค้นหา ('th' หรือ 'en') ค่าเริ่มต้น 'th'

    Returns:
        ข้อมูลเทรนด์และข่าวล่าสุดเกี่ยวกับหัวข้อที่ค้นหา
    """
    all_articles = []
    seen_titles = set()

    # ค้นหาทั้ง 2 ภาษาเพื่อให้ได้ข้อมูลครบ
    search_queries = [
        topic,
        f"{topic} trend 2026",
        f"{topic} tips",
    ]

    for query in search_queries:
        for lang in ["th", "en"]:
            articles = _fetch_google_news(query, language=lang, max_results=5)
            for article in articles:
                if article["title"] not in seen_titles:
                    seen_titles.add(article["title"])
                    all_articles.append(article)

    if not all_articles:
        return f"❌ ไม่พบข้อมูลเทรนด์เกี่ยวกับ '{topic}' — ลองใช้คำค้นอื่น"

    # สรุปผลลัพธ์
    result = f"🔥 **เทรนด์: {topic}** (พบ {len(all_articles)} บทความ)\n"
    result += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    result += "=" * 60 + "\n\n"

    for i, article in enumerate(all_articles[:10], 1):  # จำกัด 10 อัน
        result += f"**{i}. {article['title']}**\n"
        result += f"   แหล่ง: {article['source']} | {article['published']}\n"
        result += f"   🔗 {article['link']}\n"
        if article['summary']:
            result += f"   📝 {article['summary'][:150]}...\n"
        result += "\n"

    result += "\n💡 **สรุปเทรนด์:** ข้อมูลข้างต้นแสดงให้เห็นว่าหัวข้อนี้กำลังเป็นที่สนใจ "
    result += "สามารถนำมุมมองเหล่านี้มาสร้าง Content ที่ตรงกระแสได้\n"

    return result
