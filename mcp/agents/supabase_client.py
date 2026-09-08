"""
☁️ Supabase Client — บันทึก Content ลง Database
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

supabase: Client = None

if url and key:
    supabase = create_client(url, key)
else:
    print("⚠️ Supabase credentials not found — running in offline mode")


def insert_content(topic: str, platform: str, tone: str, content: str):
    """บันทึก Content ลง Supabase"""
    if not supabase:
        print("⚠️ Supabase ไม่ได้ตั้งค่า — ข้ามการบันทึก")
        return None

    try:
        data, count = supabase.table("generated_contents").insert({
            "content_json": {
                "topic": topic,
                "platform": platform,
                "tone": tone,
                "content": content
            }
        }).execute()
        return data
    except Exception as e:
        print(f"⚠️ Error inserting content: {e}")
        return None


def get_recent_contents(limit: int = 10):
    """ดึง Content ล่าสุดจาก Supabase"""
    if not supabase:
        return []

    try:
        response = supabase.table("generated_contents") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return response.data
    except Exception as e:
        print(f"⚠️ Error fetching contents: {e}")
        return []
