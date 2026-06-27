import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing Supabase credentials in .env file.")

supabase: Client = create_client(url, key)

def insert_daily_summary(category: str, results_json: dict):
    """
    บันทึกสรุปข่าวรายวันลง Supabase
    """
    try:
        data, count = supabase.table("daily_summaries").insert({
            "content_json": {
                "category": category,
                "summary": results_json
            }
        }).execute()
        return data
    except Exception as e:
        print(f"Error inserting daily summary: {e}")
        return None
