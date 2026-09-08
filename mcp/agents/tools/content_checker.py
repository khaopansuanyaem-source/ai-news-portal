"""
🛡️ Content Quality Checker Tool
ตรวจสอบคุณภาพ Content ก่อนเผยแพร่
- ตรวจความยาว
- ตรวจ keyword density
- ตรวจ readability
- ตรวจ emoji usage
"""

import re
from crewai.tools import tool


def _count_words_thai(text: str) -> int:
    """นับจำนวนคำโดยประมาณ (รองรับภาษาไทย)"""
    # สำหรับภาษาอังกฤษ นับจาก space
    english_words = len(re.findall(r'[a-zA-Z]+', text))
    # สำหรับภาษาไทย ประมาณจากจำนวนตัวอักษร / 4
    thai_chars = len(re.findall(r'[\u0E00-\u0E7F]', text))
    thai_words = thai_chars // 4
    return english_words + thai_words


def _check_emoji_balance(text: str) -> dict:
    """ตรวจสอบการใช้ Emoji"""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )
    emojis = emoji_pattern.findall(text)
    emoji_count = sum(len(e) for e in emojis)
    word_count = _count_words_thai(text)

    ratio = emoji_count / max(word_count, 1)

    if ratio > 0.15:
        status = "⚠️ Emoji มากเกินไป"
    elif ratio < 0.02:
        status = "⚠️ ควรเพิ่ม Emoji ให้ดึงดูด"
    else:
        status = "✅ สมดุลดี"

    return {
        "emoji_count": emoji_count,
        "ratio": round(ratio, 3),
        "status": status
    }


@tool("check_content_quality")
def check_content_quality(content: str, platform: str = "instagram") -> str:
    """
    ตรวจสอบคุณภาพของ Content ที่สร้างขึ้น

    Args:
        content: เนื้อหา Content ที่ต้องการตรวจสอบ
        platform: แพลตฟอร์มเป้าหมาย ('instagram', 'facebook', 'tiktok', 'twitter', 'blog')

    Returns:
        รายงานคุณภาพ Content พร้อมคำแนะนำ
    """

    word_count = _count_words_thai(content)
    char_count = len(content)
    line_count = content.count("\n") + 1
    emoji_info = _check_emoji_balance(content)

    # ตรวจสอบ hashtag
    hashtags = re.findall(r'#\w+', content)
    hashtag_count = len(hashtags)

    # ข้อกำหนดตามแพลตฟอร์ม
    platform_specs = {
        "instagram": {"max_chars": 2200, "ideal_words": (100, 300), "ideal_hashtags": (5, 30), "name": "Instagram"},
        "facebook": {"max_chars": 63206, "ideal_words": (40, 200), "ideal_hashtags": (1, 5), "name": "Facebook"},
        "tiktok": {"max_chars": 4000, "ideal_words": (20, 100), "ideal_hashtags": (3, 8), "name": "TikTok"},
        "twitter": {"max_chars": 280, "ideal_words": (10, 50), "ideal_hashtags": (1, 3), "name": "Twitter/X"},
        "blog": {"max_chars": 50000, "ideal_words": (500, 2000), "ideal_hashtags": (0, 5), "name": "Blog"},
    }

    spec = platform_specs.get(platform.lower(), platform_specs["instagram"])

    # คะแนนรวม
    score = 100
    issues = []
    tips = []

    # 1. ตรวจความยาว
    if char_count > spec["max_chars"]:
        score -= 20
        issues.append(f"❌ เกินลิมิต {spec['name']} ({char_count}/{spec['max_chars']} ตัวอักษร)")
    
    min_words, max_words = spec["ideal_words"]
    if word_count < min_words:
        score -= 10
        issues.append(f"⚠️ สั้นเกินไป ({word_count} คำ, แนะนำ {min_words}-{max_words})")
    elif word_count > max_words:
        score -= 5
        tips.append(f"💡 ยาวกว่าค่าแนะนำเล็กน้อย ({word_count} คำ)")

    # 2. ตรวจ hashtag
    min_hash, max_hash = spec["ideal_hashtags"]
    if hashtag_count < min_hash:
        score -= 10
        issues.append(f"⚠️ Hashtag น้อย ({hashtag_count} อัน, แนะนำ {min_hash}-{max_hash})")
    elif hashtag_count > max_hash:
        score -= 5
        issues.append(f"⚠️ Hashtag มากเกินไป ({hashtag_count} อัน, แนะนำ {min_hash}-{max_hash})")

    # 3. ตรวจ Emoji
    if "⚠️" in emoji_info["status"]:
        score -= 5
        issues.append(emoji_info["status"])

    # 4. ตรวจ Call-to-Action
    cta_patterns = ["ติดตาม", "กดไลค์", "แชร์", "คอมเมนต์", "follow", "like", "share", "comment",
                    "สั่งซื้อ", "ดูเพิ่ม", "คลิก", "link in bio", "อ่านต่อ", "ลงทะเบียน"]
    has_cta = any(cta.lower() in content.lower() for cta in cta_patterns)
    if not has_cta:
        score -= 10
        tips.append("💡 ควรเพิ่ม Call-to-Action (เช่น 'กดติดตาม', 'แชร์ให้เพื่อน')")

    # 5. ตรวจ line breaks (readability)
    if platform.lower() != "twitter" and line_count < 3:
        score -= 5
        tips.append("💡 ควรเว้นบรรทัดให้อ่านง่ายขึ้น")

    # ระดับคะแนน
    if score >= 90:
        grade = "🟢 A — ยอดเยี่ยม"
    elif score >= 75:
        grade = "🟡 B — ดี (ปรับนิดหน่อย)"
    elif score >= 60:
        grade = "🟠 C — พอใช้ (ควรแก้ไข)"
    else:
        grade = "🔴 D — ต้องปรับปรุง"

    # สร้างรายงาน
    report = f"📊 **Content Quality Report — {spec['name']}**\n"
    report += f"{'=' * 50}\n\n"
    report += f"📏 คำ: {word_count} | ตัวอักษร: {char_count} | บรรทัด: {line_count}\n"
    report += f"# Hashtags: {hashtag_count} | 😊 Emoji: {emoji_info['emoji_count']}\n"
    report += f"🎯 Call-to-Action: {'✅ มี' if has_cta else '❌ ไม่มี'}\n\n"
    report += f"**คะแนน: {score}/100 — {grade}**\n\n"

    if issues:
        report += "⚠️ **ปัญหาที่ต้องแก้:**\n"
        for issue in issues:
            report += f"  {issue}\n"
        report += "\n"

    if tips:
        report += "💡 **คำแนะนำ:**\n"
        for tip in tips:
            report += f"  {tip}\n"
        report += "\n"

    if not issues and not tips:
        report += "✅ Content คุณภาพดีมาก พร้อมเผยแพร่!\n"

    return report
