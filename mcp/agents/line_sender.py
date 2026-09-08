"""
📲 LINE Sender — ส่ง Content สำเร็จรูปเข้า LINE
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

LINE_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
LINE_USER_ID = os.getenv("LINE_USER_ID", "")
LINE_API_URL = "https://api.line.me/v2/bot/message/push"


def create_content_flex(topic: str, platform: str, content: str):
    """สร้าง LINE Flex Message สำหรับ Content"""

    # ตัดความยาว
    if len(content) > 1500:
        content = content[:1500] + "\n...(อ่านต่อแบบเต็มที่หน้าเว็บ)"

    # สีตาม platform
    color_map = {
        "instagram": "#E1306C",
        "facebook": "#1877F2",
        "tiktok": "#000000",
        "twitter": "#1DA1F2",
        "blog": "#FF6600",
    }
    theme_color = color_map.get(platform.lower(), "#6366F1")

    # ลบ markdown
    content = content.replace("**", "").replace("*", "•").replace("### ", "").replace("---", "")

    flex_payload = {
        "type": "flex",
        "altText": f"✨ Content ใหม่: {topic}",
        "contents": {
            "type": "bubble",
            "size": "giga",
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "AI CONTENT CREATOR", "color": "#ffffff",
                     "weight": "bold", "size": "sm"},
                    {"type": "text", "text": f"📝 {topic}", "color": "#ffffff",
                     "weight": "bold", "size": "xl", "margin": "md", "wrap": True},
                    {"type": "text", "text": f"📱 {platform.upper()}", "color": "#ffffffCC",
                     "size": "sm", "margin": "sm"},
                ],
                "backgroundColor": theme_color,
                "paddingAll": "20px"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": content, "wrap": True,
                     "size": "sm", "color": "#333333", "margin": "md"}
                ],
                "paddingAll": "20px"
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "button", "action": {"type": "uri", "label": "📋 Copy Content",
                     "uri": "https://example.com/dashboard"}, "style": "primary", "color": theme_color}
                ],
                "paddingAll": "20px"
            }
        }
    }
    return flex_payload


def send_content_to_line(topic: str, platform: str, content: str):
    """ส่ง Content เข้า LINE"""
    if not LINE_TOKEN or not LINE_USER_ID:
        print("⚠️ LINE credentials ไม่ครบ — ข้ามการส่ง LINE")
        return

    try:
        flex_message = create_content_flex(topic, platform, content)
        payload = {"to": LINE_USER_ID, "messages": [flex_message]}
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LINE_TOKEN}"
        }

        res = requests.post(LINE_API_URL, headers=headers, json=payload)

        if res.status_code == 200:
            print("✅ ส่ง Content เข้า LINE สำเร็จ!")
        else:
            print(f"❌ ส่ง LINE ล้มเหลว: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"⚠️ Error sending LINE: {e}")


if __name__ == "__main__":
    send_content_to_line("ทดสอบ", "instagram", "นี่คือ Content ทดสอบ 🎉")
