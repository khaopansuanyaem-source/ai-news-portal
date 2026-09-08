import os
import feedparser
import re
from bs4 import BeautifulSoup
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Setup Supabase
url = os.getenv("SUPABASE_URL", "https://gzhzweijflchlvharhsj.supabase.co")
key = os.getenv("SUPABASE_KEY", "sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH")
supabase: Client = create_client(url, key)

def clear_old_news():
    print("🗑️ Clearing old news...")
    try:
        res = supabase.table("news_articles").select("id").execute()
        if res.data:
            ids = [item['id'] for item in res.data]
            for news_id in ids:
                supabase.table("news_articles").delete().eq("id", news_id).execute()
            print(f"✅ Deleted {len(ids)} old articles.")
    except Exception as e:
        print(f"Error clearing old news: {e}")

def sanitize_html(html_content: str) -> str:
    """ทำความสะอาด HTML — เก็บแค่แท็กที่ปลอดภัยสำหรับแสดงผลข่าว"""
    soup = BeautifulSoup(html_content, "html.parser")
    
    # ลบ script, style, iframe, form ออก
    for tag in soup.find_all(['script', 'style', 'iframe', 'form', 'input', 'button', 'noscript']):
        tag.decompose()
        
    # ลบ attributes ที่ไม่ปลอดภัย (เช่น onclick, onerror) แต่เก็บ src, href, alt, class ไว้
    safe_attrs = {'img': ['src', 'alt', 'width', 'height'], 'a': ['href', 'target'], 'p': [], 'h1': [], 'h2': [], 'h3': [], 'h4': [], 'li': [], 'ul': [], 'ol': [], 'br': [], 'strong': [], 'em': [], 'b': [], 'i': [], 'blockquote': [], 'figure': [], 'figcaption': [], 'div': []}
    
    for tag in soup.find_all(True):
        if tag.name in safe_attrs:
            allowed = safe_attrs[tag.name]
            attrs = dict(tag.attrs)
            for attr in attrs:
                if attr not in allowed:
                    del tag[attr]
        else:
            # Replace unknown tags with their contents
            tag.unwrap()
    
    # ให้ img มี loading=lazy เพื่อ performance
    for img in soup.find_all('img'):
        img['loading'] = 'lazy'
        # ถ้า src เป็น relative ให้ข้ามไป
        src = img.get('src', '')
        if not src.startswith('http'):
            img.decompose()
    
    return str(soup).strip()

def fetch_direct_rss(feed_url: str, category: str, max_results: int = 5) -> list[dict]:
    """ดึงข่าวจาก RSS โดยตรง — เก็บ HTML ต้นฉบับพร้อมรูปภาพ"""
    feed = feedparser.parse(feed_url)
    articles = []
    
    for entry in feed.entries[:max_results]:
        published = datetime.now()
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])
        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
            published = datetime(*entry.updated_parsed[:6])
            
        # Get full content HTML
        content_html = ""
        if hasattr(entry, 'content'):
            content_html = entry.content[0].value
        elif hasattr(entry, 'description'):
            content_html = entry.description
        
        # Extract first image for card thumbnail
        soup_temp = BeautifulSoup(content_html, "html.parser")
        image_url = ""
        first_img = soup_temp.find('img')
        if first_img and first_img.get('src', '').startswith('http'):
            image_url = first_img['src']
            
        # Sanitize HTML for safe rendering
        clean_html = sanitize_html(content_html)
        
        # Limit to 8000 chars
        clean_html = clean_html[:8000]
        
        if not clean_html.strip():
            clean_html = f"<p>{entry.get('title', '')}</p>"
        
        # Append thumbnail image URL for card display
        if image_url:
            clean_html = clean_html + f"||IMG:{image_url}"
            
        source = "News"
        if "blognone" in feed_url.lower(): source = "Blognone"
        if "techtalkthai" in feed_url.lower(): source = "TechTalkThai"
            
        article = {
            "title": entry.get("title", "ไม่มีหัวข้อ"),
            "url": entry.get("link", ""),
            "source": source,
            "category": category,
            "summary": clean_html,
            "image_url": image_url or None,
            "published_at": published.isoformat(),
            "sentiment": "Neutral",
            "impact_level": "Medium"
        }
        articles.append(article)
        print(f"    ✓ {entry.get('title', 'N/A')[:60]}... ({len(clean_html)} chars, img: {'✅' if image_url else '❌'})")
    
    return articles

def main():
    clear_old_news()
    
    # Direct high-quality RSS feeds
    sources = {
        "Tech": "https://www.blognone.com/atom.xml",
        "Cybersecurity": "https://www.techtalkthai.com/feed/"
    }
    
    all_news = []
    print("📡 Fetching full-content news (with images) from Direct RSS...")
    for category, feed_url in sources.items():
        print(f"  -> Fetching {category} from {feed_url}...")
        news_items = fetch_direct_rss(feed_url, category, max_results=5)
        all_news.extend(news_items)
        
    print(f"\n📝 Inserting {len(all_news)} rich news articles into Supabase...")
    for item in all_news:
        try:
            supabase.table("news_articles").insert(item).execute()
        except Exception as e:
            print(f"Error inserting '{item['title']}': {e}")
            
    print("✅ Rich-content news fetched and inserted successfully!")

if __name__ == "__main__":
    main()
