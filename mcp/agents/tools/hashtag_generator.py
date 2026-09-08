"""
#️⃣ Hashtag Generator Tool
สร้าง Hashtag ที่เหมาะสมสำหรับแต่ละแพลตฟอร์ม
"""

import re
from typing import Optional
from crewai.tools import tool


# Hashtag database แบ่งตามหมวดหมู่
HASHTAG_DB = {
    "food": {
        "th": ["อาหารอร่อย", "กินเที่ยว", "ของกินอร่อย", "รีวิวอาหาร", "คาเฟ่น่านั่ง",
               "ร้านอาหารแนะนำ", "กินดื่ม", "อร่อยบอกต่อ", "สตรีทฟู้ด", "อาหารไทย"],
        "en": ["foodie", "foodstagram", "yummy", "instafood", "foodlover",
               "foodphotography", "delicious", "tasty", "cafe", "restaurant"],
    },
    "travel": {
        "th": ["เที่ยวไทย", "ท่องเที่ยว", "ที่เที่ยว", "เที่ยวทะเล", "เที่ยวภูเขา",
               "ที่พัก", "รีวิวเที่ยว", "เที่ยวไหนดี", "ทริปนี้พี่ชอบ", "ไปไหนดี"],
        "en": ["travel", "travelgram", "wanderlust", "explore", "vacation",
               "adventure", "travelphotography", "holiday", "tourism", "backpacking"],
    },
    "tech": {
        "th": ["เทคโนโลยี", "ไอที", "รีวิวมือถือ", "แกดเจ็ต", "นวัตกรรม",
               "ดิจิทัล", "โปรแกรมเมอร์", "สตาร์ทอัพ", "AI", "เทคสตาร์ทอัพ"],
        "en": ["tech", "technology", "AI", "coding", "startup",
               "developer", "innovation", "gadgets", "software", "digital"],
    },
    "beauty": {
        "th": ["สวย", "เครื่องสำอาง", "สกินแคร์", "รีวิวเครื่องสำอาง", "ผิวสวย",
               "แต่งหน้า", "ของดีบอกต่อ", "รีวิวสกินแคร์", "ลิปสติก", "ครีมหน้าใส"],
        "en": ["beauty", "skincare", "makeup", "cosmetics", "beautytips",
               "skincareroutine", "glow", "beautyreview", "selfcare", "beautyblogger"],
    },
    "lifestyle": {
        "th": ["ไลฟ์สไตล์", "แรงบันดาลใจ", "ชีวิตดีดี", "พัฒนาตัวเอง", "แฟชั่น",
               "ออกกำลังกาย", "สุขภาพดี", "ทำงานที่บ้าน", "วิถีชีวิต", "มินิมอล"],
        "en": ["lifestyle", "motivation", "inspiration", "selfimprovement", "wellness",
               "fitness", "healthylifestyle", "mindfulness", "worklifebalance", "minimalism"],
    },
    "business": {
        "th": ["ธุรกิจ", "SME", "ขายของออนไลน์", "การตลาด", "รายได้เสริม",
               "ลงทุน", "การเงิน", "ผู้ประกอบการ", "แบรนด์", "ออนไลน์มาร์เก็ตติ้ง"],
        "en": ["business", "entrepreneur", "marketing", "branding", "startup",
               "smallbusiness", "digitalmarketing", "ecommerce", "success", "money"],
    },
}


def _detect_category(topic: str) -> str:
    """ตรวจจับหมวดหมู่จากหัวข้อ"""
    topic_lower = topic.lower()

    category_keywords = {
        "food": ["อาหาร", "กิน", "ร้าน", "คาเฟ่", "กาแฟ", "เค้ก", "ชา", "food", "cafe", "restaurant", "coffee"],
        "travel": ["เที่ยว", "ท่องเที่ยว", "ทะเล", "ภูเขา", "ที่พัก", "travel", "trip", "hotel", "beach"],
        "tech": ["เทค", "ไอที", "AI", "โค้ด", "แอป", "tech", "code", "app", "software", "digital"],
        "beauty": ["สวย", "เครื่องสำอาง", "สกินแคร์", "แต่งหน้า", "beauty", "skincare", "makeup"],
        "lifestyle": ["ไลฟ์", "สุขภาพ", "ออกกำลัง", "ชีวิต", "lifestyle", "fitness", "health"],
        "business": ["ธุรกิจ", "ขาย", "การตลาด", "ลงทุน", "business", "marketing", "money"],
    }

    for category, keywords in category_keywords.items():
        if any(kw in topic_lower for kw in keywords):
            return category

    return "lifestyle"  # default


@tool("generate_hashtags")
def generate_hashtags(topic: str, platform: str = "instagram", count: Optional[int] = 15) -> str:
    """
    สร้าง Hashtag ที่เหมาะสมสำหรับ Content

    Args:
        topic: หัวข้อหลักของ Content เช่น 'ร้านกาแฟเปิดใหม่', 'รีวิวมือถือ Samsung'
        platform: แพลตฟอร์มเป้าหมาย ('instagram', 'facebook', 'tiktok', 'twitter')
        count: จำนวน Hashtag ที่ต้องการ (ค่าเริ่มต้น 15)

    Returns:
        ชุด Hashtag พร้อมใช้งาน
    """
    category = _detect_category(topic)
    hashtags = set()

    # 1. เพิ่ม hashtag จากหมวดหมู่ที่ตรวจจับได้
    if category in HASHTAG_DB:
        db = HASHTAG_DB[category]
        for tag in db.get("th", [])[:7]:
            hashtags.add(f"#{tag}")
        for tag in db.get("en", [])[:7]:
            hashtags.add(f"#{tag}")

    # 2. สร้าง hashtag จาก topic เอง
    topic_words = re.findall(r'[\u0E00-\u0E7F]+|[a-zA-Z]+', topic)
    for word in topic_words:
        if len(word) > 2:
            hashtags.add(f"#{word}")

    # 3. เพิ่ม hashtag ทั่วไปตาม platform
    platform_general = {
        "instagram": ["#ig", "#reels", "#ไอจี", "#instadaily", "#photooftheday"],
        "facebook": ["#facebook", "#เฟสบุ๊ค", "#viral"],
        "tiktok": ["#tiktok", "#ติ๊กต๊อก", "#fyp", "#foryou", "#viral"],
        "twitter": ["#trending"],
    }

    for tag in platform_general.get(platform.lower(), []):
        hashtags.add(tag)

    # จำกัดจำนวน
    hashtag_list = sorted(list(hashtags))[:count]

    # Platform-specific limits
    platform_limits = {
        "instagram": 30,
        "facebook": 5,
        "tiktok": 8,
        "twitter": 3,
    }
    limit = platform_limits.get(platform.lower(), 15)
    hashtag_list = hashtag_list[:limit]

    # สร้างผลลัพธ์
    result = f"#️⃣ **Hashtag Set — {platform.upper()}**\n"
    result += f"📂 หมวดหมู่: {category.upper()} | จำนวน: {len(hashtag_list)} อัน\n"
    result += "=" * 50 + "\n\n"

    # แสดงแบบ copy-paste ได้ทันที
    result += "📋 **Copy & Paste:**\n"
    result += " ".join(hashtag_list) + "\n\n"

    # แสดงแยกบรรทัด
    result += "📝 **รายการ:**\n"
    for i, tag in enumerate(hashtag_list, 1):
        result += f"  {i}. {tag}\n"

    return result
