"""
🤖 Crew Definition — กำหนด Agent 5 ตัว
Scout (Fetcher) → Tag (Categorizer) → Nova (Analyst) → Shield (Checker) → Pulse (Editor)
"""

import os
from dotenv import load_dotenv
from crewai import Agent, LLM

from tools.news_fetcher import fetch_general_news
from tools.fact_checker import check_source_credibility, check_news_freshness
from tools.cyber_fetcher import fetch_cyber_news

load_dotenv()

# ==========================================
# 🧠 LLM Setup — Gemini API
# ==========================================

gemini_llm = LLM(
    model="gemini/gemini-flash-lite-latest",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.3,
    is_litellm=True,
    num_retries=5,
    fallbacks=["gemini/gemini-2.5-flash-lite"]
)

# ==========================================
# 👥 Agent Definitions
# ==========================================

def create_tech_agents():
    """สร้าง Agent 5 ตัว สำหรับวิเคราะห์ข่าว Tech & AI"""

    fetcher = Agent(
        role="ผู้รวบรวมข่าวสารเทคโนโลยี (Tech News Fetcher)",
        goal="ดึงข่าวเทคโนโลยีและ AI ล่าสุดจากแหล่งที่น่าเชื่อถือ",
        backstory=(
            "คุณเป็นนักข่าวอาวุโสสายไอที เชี่ยวชาญการค้นหาข่าว Tech & AI จากหลายแหล่ง "
            "คุณรู้ว่าข่าวเปิดตัวเทคโนโลยีไหนสำคัญและมีประโยชน์"
        ),
        tools=[fetch_general_news],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    analyst = Agent(
        role="นักวิเคราะห์เทรนด์ไอที (Tech Trend Analyst)",
        goal="วิเคราะห์ข่าวเทคโนโลยีเชิงลึก และหาผลกระทบต่อผู้ใช้งานทั่วไป",
        backstory=(
            "คุณเป็นผู้เชี่ยวชาญด้านเทคโนโลยีที่ติดตามวงการ AI และไอทีอย่างใกล้ชิด "
            "คุณสามารถอธิบายความซับซ้อนให้เห็นภาพว่ามันจะเปลี่ยนโลกได้อย่างไร"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    checker = Agent(
        role="ฝ่ายตรวจสอบข้อเท็จจริง (Fact-Checker)",
        goal="ตรวจสอบความถูกต้อง ความน่าเชื่อถือ และความสดใหม่ของข่าวไอที",
        backstory=(
            "คุณเป็นนักตรวจสอบข้อเท็จจริงจากเว็บไซต์สายไอทีชั้นนำ "
            "ยึดหลัก 'ไม่เชื่อจนกว่าจะพิสูจน์ได้' คุณตรวจสอบทุกแหล่งอ้างอิง"
        ),
        tools=[check_source_credibility, check_news_freshness],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    editor = Agent(
        role="บรรณาธิการข่าวไอที (Chief IT Editor)",
        goal="สรุปเนื้อหาข่าวเทคโนโลยีให้กระชับ เข้าใจง่าย พร้อมใช้งาน",
        backstory=(
            "คุณเป็นบรรณาธิการบริหารข่าวไอที "
            "เชี่ยวชาญในการสรุปข่าวซับซ้อนให้เป็นภาษาที่คนทั่วไปเข้าใจ "
            "คุณจัดรูปแบบเป็น Bullet Points สวยงาม พร้อมใส่ emoji ล้ำๆ "
            "คุณตอบเป็นภาษาไทยเสมอ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=2,
    )

    categorizer = Agent(
        role="ผู้จัดหมวดหมู่ข่าว (News Categorizer & Scorer — Tag)",
        goal="จัดหมวดหมู่ข่าวเทคโนโลยีและให้คะแนนความสำคัญ 1-5 ดาว",
        backstory=(
            "คุณชื่อ Tag เป็นบรรณาธิการข่าวอาวุโสที่เชี่ยวชาญการจัดหมวดหมู่ข่าวเทคโนโลยี "
            "คุณสามารถวิเคราะห์ว่าข่าวควรอยู่หมวดไหน (AI, Cloud, IoT, Startup, Hardware, Software) "
            "และให้คะแนนดาว 1-5 โดยพิจารณาจากผลกระทบ ความเร่งด่วน และจำนวนคนที่ได้รับผลกระทบ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    return fetcher, categorizer, analyst, checker, editor

def create_cyber_agents():
    """สร้าง Agent 5 ตัว สำหรับ CyberInsight AI"""

    fetcher = Agent(
        role="ผู้รวบรวมข่าวภัยคุกคาม (Cyber Threat Collector)",
        goal="ดึงข่าว Cybersecurity ล่าสุดที่สำคัญที่สุด เช่น Ransomware, Zero-day",
        backstory=(
            "คุณเป็นนักวิจัยด้าน Cybersecurity เชี่ยวชาญการตามล่าข่าวภัยคุกคามใหม่ๆ "
            "คุณรู้ว่าช่องโหว่แบบไหนอันตรายและควรแจ้งเตือนด่วน"
        ),
        tools=[fetch_cyber_news],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    analyst = Agent(
        role="นักวิเคราะห์ความเสี่ยง (Threat Analyst & Risk Assessor)",
        goal="วิเคราะห์ข่าวและประเมินระดับความเสี่ยง (Risk Level: Critical, High, Medium, Low)",
        backstory=(
            "คุณคือผู้เชี่ยวชาญด้าน Security Operations Center (SOC) "
            "สามารถระบุผลกระทบ (Impact) ของการโจมตีหรือช่องโหว่ที่มีต่อองค์กรได้แม่นยำ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    checker = Agent(
        role="ฝ่ายตรวจสอบข้อเท็จจริง (Fact-Checker)",
        goal="ตรวจสอบความถูกต้องของข่าวช่องโหว่ แหล่งที่มา และความน่าเชื่อถือ",
        backstory=(
            "คุณคือ IT Security Auditor ยึดหลักตรวจสอบก่อนเชื่อเสมอ "
            "ช่วยกรองข่าวปลอม (Hallucination) และเช็กความน่าเชื่อถือของสำนักข่าว"
        ),
        tools=[check_source_credibility, check_news_freshness],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    editor = Agent(
        role="ผู้แนะนำและบรรณาธิการ (Security Recommender & Editor)",
        goal="สรุปรายงานภัยคุกคาม และเสนอแนวทางรับมือ (Recommendation) แบบกระชับ เข้าใจง่าย",
        backstory=(
            "คุณคือ CISO (Chief Information Security Officer) ที่รายงานให้ผู้บริหารและทีม IT "
            "จัดรูปแบบให้อ่านง่ายเป็น Bullet Points พร้อม Emoji และตอบเป็นภาษาไทยเสมอ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=2,
    )

    categorizer = Agent(
        role="ผู้จัดหมวดหมู่ภัยคุกคาม (Threat Categorizer & Scorer — Tag)",
        goal="จัดหมวดหมู่ภัยคุกคามไซเบอร์และให้คะแนนความรุนแรง 1-5 ดาว",
        backstory=(
            "คุณชื่อ Tag เป็นผู้เชี่ยวชาญจัดหมวดหมู่ภัยคุกคามไซเบอร์ "
            "คุณสามารถแยกแยะว่าข่าวเป็น Ransomware, Data Breach, Zero-day, Phishing, DDoS หรืออื่นๆ "
            "และให้คะแนนดาว 1-5 โดยพิจารณาจากระดับความเสี่ยง (CVSS-like) ผลกระทบ และความเร่งด่วน"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    return fetcher, categorizer, analyst, checker, editor
