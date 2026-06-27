import os
import json
import requests
from dotenv import load_dotenv
from supabase_client import supabase

load_dotenv()

LINE_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
LINE_USER_ID = os.getenv("LINE_USER_ID")
LINE_API_URL = "https://api.line.me/v2/bot/message/push"

def create_flex_message(category, summary_text):
    """สร้างโครงสร้าง JSON สำหรับ LINE Flex Message (UI สวยๆ)"""
    
    # จำกัดความยาวข้อความกัน Error (LINE รองรับประมาณ 2000 ตัวอักษรต่อช่อง)
    if len(summary_text) > 1500:
        summary_text = summary_text[:1500] + "...\n(อ่านต่อแบบเต็มได้ที่หน้าเว็บ)"

    # สีตามหมวดหมู่
    color_map = {
        "tech": "#10B981", # เขียว
        "finance": "#3B82F6", # น้ำเงิน
        "sports": "#F59E0B", # ส้ม
        "all": "#8B5CF6" # ม่วง
    }
    theme_color = color_map.get(category.lower(), "#4F46E5")

    flex_payload = {
        "type": "flex",
        "altText": f"📢 สรุปข่าวเด่นประจำวัน: {category.upper()}",
        "contents": {
            "type": "bubble",
            "size": "giga",
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "MORNING BRIEF",
                        "color": "#ffffff",
                        "weight": "bold",
                        "size": "sm"
                    },
                    {
                        "type": "text",
                        "text": f"สรุปข่าว {category.upper()}",
                        "color": "#ffffff",
                        "weight": "bold",
                        "size": "xl",
                        "margin": "md"
                    }
                ],
                "backgroundColor": theme_color,
                "paddingAll": "20px"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": summary_text,
                        "wrap": True,
                        "size": "sm",
                        "color": "#333333",
                        "margin": "md"
                    }
                ],
                "paddingAll": "20px"
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "อ่านแบบเต็มบน Dashboard",
                            "uri": "https://example.com/dashboard"
                        },
                        "style": "primary",
                        "color": theme_color
                    }
                ],
                "paddingAll": "20px"
            }
        }
    }
    return flex_payload

def send_daily_news():
    """ดึงข่าวที่ยังไม่ได้ส่งจาก Supabase แล้วส่งเข้า LINE"""
    if not LINE_TOKEN or not LINE_USER_ID:
        print("❌ ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_USER_ID ไม่ครบ")
        return

    try:
        # 1. ดึงข้อมูลล่าสุดที่ยังไม่ได้ส่ง (is_sent = FALSE)
        print("🔍 กำลังค้นหาข่าวใหม่ใน Database...")
        response = supabase.table("daily_summaries").select("*").eq("is_sent", False).order("created_at", desc=True).limit(1).execute()
        
        if not response.data:
            print("📭 ไม่มีข่าวใหม่ที่ต้องส่งในวันนี้")
            return

        news_record = response.data[0]
        record_id = news_record["id"]
        
        # โครงสร้าง data ที่เซฟไว้คือ {"category": "tech", "summary": {"tech": "..."}}
        content_json = news_record.get("content_json", {})
        category = content_json.get("category", "news")
        
        # ดึงข้อความสรุปออกมา
        summary_dict = content_json.get("summary", {})
        summary_text = summary_dict.get(category, "")

        if not summary_text:
            # Fallback หากโครงสร้างเก่า
            summary_text = str(summary_dict)
            if not summary_text or summary_text == "{}":
                print("❌ ไม่พบเนื้อหาข่าวใน Database")
                return
                
        # ลบเครื่องหมาย Markdown ที่ทำให้อ่านยากใน LINE
        summary_text = summary_text.replace("**", "").replace("*", "•").replace("### ", "").replace("---", "")

        # 2. สร้าง Flex Message
        print("🎨 กำลังสร้างการ์ดข้อความ Flex Message...")
        flex_message = create_flex_message(category, summary_text)

        payload = {
            "to": LINE_USER_ID,
            "messages": [flex_message]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LINE_TOKEN}"
        }

        # 3. ยิง API ส่งข้อความ
        print("🚀 กำลังส่งข้อความเข้า LINE...")
        res = requests.post(LINE_API_URL, headers=headers, json=payload)

        if res.status_code == 200:
            print("✅ ส่งข่าวเข้า LINE สำเร็จ!")
            # 4. อัพเดตสถานะใน Database ว่าส่งแล้ว
            supabase.table("daily_summaries").update({"is_sent": True}).eq("id", record_id).execute()
            print("✅ อัพเดตสถานะการส่งใน Database เรียบร้อย")
        else:
            print(f"❌ ส่งข้อความล้มเหลว: {res.status_code} - {res.text}")

    except Exception as e:
        print(f"⚠️ เกิดข้อผิดพลาด: {e}")

if __name__ == "__main__":
    send_daily_news()
