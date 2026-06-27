"""
🔍 Fact-Checker Tool
ตรวจสอบความน่าเชื่อถือของแหล่งข่าวและข้อมูล
"""

import requests
from datetime import datetime, timedelta
from urllib.parse import urlparse
from crewai.tools import tool

# แหล่งข่าวที่น่าเชื่อถือ (Whitelist)
TRUSTED_SOURCES = {
    "reuters.com": 95, "bbc.com": 95, "bloomberg.com": 95,
    "cnbc.com": 90, "ft.com": 95, "thairath.co.th": 80,
    "bangkokpost.com": 85, "nationtv.tv": 80, "prachachat.net": 80,
    "settrade.com": 90, "bot.or.th": 95, "sec.or.th": 95,
    "fifa.com": 95, "goal.com": 80, "espn.com": 85,
    "investing.com": 85, "marketwatch.com": 85,
}


@tool("check_source_credibility")
def check_source_credibility(url: str) -> str:
    """ตรวจสอบความน่าเชื่อถือของ URL แหล่งข่าว"""
    try:
        domain = urlparse(url).netloc.replace("www.", "")
    except Exception:
        return f"❌ URL ไม่ถูกต้อง: {url}"

    score = TRUSTED_SOURCES.get(domain, 50)
    
    # ลองเข้าถึง URL
    accessible = False
    try:
        resp = requests.head(url, timeout=5, allow_redirects=True)
        accessible = resp.status_code < 400
    except Exception:
        accessible = False

    level = "🟢 สูง" if score >= 85 else "🟡 ปานกลาง" if score >= 60 else "🔴 ต่ำ"
    result = f"🔍 **ตรวจสอบ: {domain}**\n"
    result += f"  คะแนน: {score}/100 ({level})\n"
    result += f"  เข้าถึงได้: {'✅' if accessible else '❌'}\n"
    result += f"  ใน Whitelist: {'✅' if domain in TRUSTED_SOURCES else '❌'}\n"
    return result


@tool("check_news_freshness")
def check_news_freshness(published_date: str, max_hours: int = 48) -> str:
    """ตรวจสอบว่าข่าวยังใหม่อยู่หรือไม่ จาก published_date (YYYY-MM-DD HH:MM)"""
    try:
        pub = datetime.strptime(published_date.strip(), "%Y-%m-%d %H:%M")
    except ValueError:
        try:
            pub = datetime.strptime(published_date.strip(), "%Y-%m-%d")
        except ValueError:
            return f"❌ ไม่สามารถ parse วันที่: {published_date}"

    age = datetime.now() - pub
    hours = age.total_seconds() / 3600
    fresh = hours <= max_hours
    
    return (
        f"🕐 **ตรวจสอบความสด**\n"
        f"  เผยแพร่: {published_date}\n"
        f"  อายุ: {hours:.1f} ชม.\n"
        f"  สถานะ: {'🟢 ใหม่' if fresh else '🔴 เก่าเกิน ' + str(max_hours) + ' ชม.'}\n"
    )
