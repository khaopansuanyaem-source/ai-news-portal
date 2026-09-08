"""
📡 Cyber & Tech News Tools — MCP Fusion Edition
"""

import feedparser
import urllib.parse
import requests
from datetime import datetime, timedelta
from typing import Optional
from crewai.tools import tool


def _fetch_google_news(query: str, language: str = "th", max_results: int = 8) -> list[dict]:
    """ดึงข่าวจาก Google News RSS"""
    base_url = "https://news.google.com/rss/search"
    safe_query = urllib.parse.quote(query)
    params = f"?q={safe_query}&hl={language}&gl=TH&ceid=TH:{language}"
    url = f"{base_url}{params}"

    feed = feedparser.parse(url)
    articles = []
    cutoff_time = datetime.now() - timedelta(hours=72)

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
            "summary": entry.get("summary", "")[:350],
        }
        articles.append(article)

    return articles


@tool("fetch_cyber_threat_news")
def fetch_cyber_threat_news(keywords: Optional[str] = None) -> str:
    """
    ดึงข่าวภัยคุกคามไซเบอร์ล่าสุด เช่น Ransomware, Zero-day, Data Breach, Phishing

    Args:
        keywords: คำค้นเพิ่มเติม เช่น 'Ransomware', 'Zero-day', 'CVE'
    """
    queries = ["Ransomware", "Cybersecurity", "Data Breach", "Vulnerability", "แฮกเกอร์", "ภัยไซเบอร์"]
    if keywords:
        queries = [k.strip() for k in keywords.split() if len(k.strip()) > 2]

    all_articles = []
    seen = set()

    for q in queries:
        for lang in ["en", "th"]:
            for a in _fetch_google_news(q, language=lang, max_results=3):
                if a["title"] not in seen:
                    seen.add(a["title"])
                    all_articles.append(a)

    if not all_articles:
        return "❌ ไม่พบข่าวภัยคุกคามไซเบอร์ล่าสุด"

    res = f"🔒 **ข่าว Cybersecurity ล่าสุด** (พบ {len(all_articles)} ข่าว)\n"
    res += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n{'='*50}\n\n"

    for i, a in enumerate(all_articles[:8], 1):
        res += f"**{i}. {a['title']}**\n   แหล่ง: {a['source']} | {a['published']}\n   🔗 {a['link']}\n\n"

    return res


@tool("fetch_tech_ai_news")
def fetch_tech_ai_news(keywords: Optional[str] = None) -> str:
    """
    ดึงข่าวเทคโนโลยีและ AI ล่าสุด เช่น OpenAI, Gemini, Cloud, Hardware

    Args:
        keywords: คำค้นเพิ่มเติม เช่น 'Generative AI', 'Cloud', 'Nvidia'
    """
    queries = ["Technology AI", "ปัญญาประดิษฐ์", "OpenAI Gemini", "Cloud Computing"]
    if keywords:
        queries = [k.strip() for k in keywords.split(",") if k.strip()]

    all_articles = []
    seen = set()

    for q in queries:
        for lang in ["th", "en"]:
            for a in _fetch_google_news(q, language=lang, max_results=3):
                if a["title"] not in seen:
                    seen.add(a["title"])
                    all_articles.append(a)

    if not all_articles:
        return "❌ ไม่พบข่าวเทคโนโลยีและ AI ล่าสุด"

    res = f"💻 **ข่าว Tech & AI ล่าสุด** (พบ {len(all_articles)} ข่าว)\n"
    res += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n{'='*50}\n\n"

    for i, a in enumerate(all_articles[:8], 1):
        res += f"**{i}. {a['title']}**\n   แหล่ง: {a['source']} | {a['published']}\n   🔗 {a['link']}\n\n"

    return res


@tool("verify_source_credibility")
def verify_source_credibility(url: str) -> str:
    """ตรวจสอบความน่าเชื่อถือของแหล่งข่าว"""
    trusted_domains = ["reuters.com", "bleepingcomputer.com", "thehackernews.com", "darkreading.com",
                       "trendmicro.com", "thairath.co.th", "bbc.com", "techcrunch.com", "wired.com"]

    is_trusted = any(domain in url.lower() for domain in trusted_domains)
    score = 90 if is_trusted else 65

    return f"🔍 **ผลตรวจความน่าเชื่อถือ:** {url}\n  คะแนน: {score}/100\n  ความน่าเชื่อถือ: {'🟢 สูง (Trusted Source)' if is_trusted else '🟡 ปานกลาง (ทั่วไป)'}"
