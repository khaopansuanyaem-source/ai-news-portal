import os
import feedparser
import urllib.parse
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Setup Supabase
url = os.getenv("SUPABASE_URL", "https://gzhzweijflchlvharhsj.supabase.co")
key = os.getenv("SUPABASE_KEY", "sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH")
supabase: Client = create_client(url, key)

def clear_old_news():
    print("🗑️ Clearing old mock news...")
    try:
        # Fetch all IDs first to delete them safely
        res = supabase.table("news_articles").select("id").execute()
        if res.data:
            ids = [item['id'] for item in res.data]
            for news_id in ids:
                supabase.table("news_articles").delete().eq("id", news_id).execute()
            print(f"✅ Deleted {len(ids)} old articles.")
    except Exception as e:
        print(f"Error clearing old news: {e}")

def fetch_google_news(query: str, category: str, max_results: int = 5) -> list[dict]:
    """ดึงข่าวจาก Google News RSS ตาม keyword"""
    base_url = "https://news.google.com/rss/search"
    safe_query = urllib.parse.quote(query)
    params = f"?q={safe_query}&hl=th&gl=TH&ceid=TH:th"
    url = f"{base_url}{params}"
    
    feed = feedparser.parse(url)
    
    articles = []
    
    for entry in feed.entries[:max_results]:
        published = datetime.now()
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])
            
        summary = entry.get("summary", "")
        
        # Extract Image URL from Google News RSS summary HTML
        import re
        image_url = ""
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', summary)
        if img_match:
            image_url = img_match.group(1)
            
        # Remove basic HTML tags from summary if present, or just keep raw text
        summary = re.sub(r'<[^>]+>', '', summary)[:500]
        if not summary.strip():
            summary = entry.get("title", "")
            
        # Append Image URL as a hidden token in the summary string so frontend can use it
        if image_url:
            summary = summary + f"||IMG:{image_url}"
            
        source = entry.get("source", {}).get("title", "Unknown") if hasattr(entry, "source") else "Google News"
        if type(source) != str:
            source = str(source)
            
        article = {
            "title": entry.get("title", "ไม่มีหัวข้อ"),
            "url": entry.get("link", ""),
            "source": source,
            "category": category,
            "summary": summary,
            "published_at": published.isoformat(),
            "sentiment": "Neutral",
            "impact_level": "Medium"
        }
        articles.append(article)
    
    return articles

def main():
    clear_old_news()
    
    queries = {
        "Politics": "การเมือง รัฐบาล",
        "Finance": "เศรษฐกิจ ตลาดหุ้น การเงิน",
        "Sports": "กีฬา ฟุตบอล",
        "Tech": "เทคโนโลยี ไอที AI",
        "Entertainment": "บันเทิง ดารา",
        "World": "ข่าวต่างประเทศ",
        "Social": "สังคม กระแสโซเชียล"
    }
    
    all_news = []
    print("📡 Fetching real news from Google News RSS...")
    for category, query in queries.items():
        print(f"  -> Fetching {category}...")
        news_items = fetch_google_news(query, category, max_results=3)
        all_news.extend(news_items)
        
    print(f"📝 Inserting {len(all_news)} real news articles into Supabase...")
    for item in all_news:
        try:
            supabase.table("news_articles").insert(item).execute()
        except Exception as e:
            print(f"Error inserting '{item['title']}': {e}")
            
    print("✅ Real news fetched and inserted successfully!")

if __name__ == "__main__":
    main()
