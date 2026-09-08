"""
🤖 MCP Fusion Agents — Cybersecurity & Tech News Architecture
"""

import os
from dotenv import load_dotenv
from crewai import Agent, LLM

from tools.cyber_tools import (
    fetch_cyber_threat_news,
    fetch_tech_ai_news,
    verify_source_credibility
)

load_dotenv()

# ==========================================
# 🧠 LLM Setup — Gemini 3.5 Flash Lite
# ==========================================

gemini_llm = LLM(
    model="gemini/gemini-3.6-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2,
)

# ==========================================
# 👥 Specialist Personas (ผู้คุมงาน + ผู้เชี่ยวชาญ)
# ==========================================

def create_cyber_fusion_agents():
    """
    สร้าง Agents 5 ตัวสำหรับ Cybersecurity & Tech News MCP Pipeline
    """

    # 1. Scout (Fetcher)
    scout = Agent(
        role="ผู้รวบรวมข่าวภัยคุกคามและไอที (Threat & Tech News Fetcher — Scout)",
        goal="ดึงข่าวสารภัยคุกคามไซเบอร์ และข่าวเทคโนโลยี AI ล่าสุดจากแหล่งข่าวที่น่าเชื่อถือ",
        backstory=(
            "คุณคือ Scout นักวิจัยภัยคุกคามไซเบอร์และนักข่าวไอทีอาวุโส "
            "เชี่ยวชาญการค้นหาข่าว Ransomware, Zero-day, Data Breach และนวัตกรรม AI "
            "คุณดึงเฉพาะข่าวสำคัญที่มีผลกระทบจริงเท่านั้น"
        ),
        tools=[fetch_cyber_threat_news, fetch_tech_ai_news],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    # 2. Tag (Categorizer & Scorer)
    tag = Agent(
        role="ผู้ประเมินและจัดหมวดหมู่ภัยคุกคาม (Threat Categorizer & Scorer — Tag)",
        goal="จำแนกประเภทข่าว ให้คะแนนความรุนแรง 1-5 ดาว และกำหนด Risk Level ให้แม่นยำ",
        backstory=(
            "คุณชื่อ Tag เป็นผู้เชี่ยวชาญด้าน Security Incident Classification "
            "คุณประเมินข่าวทุกข่าวและจำแนกว่าเป็น Ransomware, Zero-day, Phishing, AI, Cloud ฯลฯ "
            "พร้อมให้คะแนนความสำคัญ 1-5 ดาว (⭐) และกำหนด Risk Level: Critical, High, Medium, Low"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    # 3. Nova (Threat & Tech Analyst)
    nova = Agent(
        role="นักวิเคราะห์ความเสี่ยงและผลกระทบ (Risk & Impact Analyst — Nova)",
        goal="วิเคราะห์เจาะลึกผลกระทบ (Impact Assessment) เทคนิคการโจมตี หรือประโยชน์ของเทคโนโลยีใหม่",
        backstory=(
            "คุณคือ Nova หัวหน้าทีม SOC (Security Operations Center) "
            "สามารถวิเคราะห์ว่าภัยคุกคามนี้กระทบกับใคร ระบบไหน "
            "และองค์กรหรือผู้ใช้ทั่วไปจะได้รับผลกระทบอย่างไรบ้าง"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    # 4. Shield (Fact Checker & Auditor)
    shield = Agent(
        role="ฝ่ายตรวจสอบข้อเท็จจริงและความสดใหม่ (Fact-Checker & Auditor — Shield)",
        goal="ตรวจสอบความน่าเชื่อถือของแหล่งข่าว กรองข่าวปลอม และตรวจเช็กว่าข่าวยังใหม่อยู่",
        backstory=(
            "คุณคือ Shield เป็น IT Security Auditor ผู้ยึดหลัก 'ไม่เชื่อจนกว่าจะพิสูจน์ได้' "
            "คุณใช้เครื่องมือ verify_source_credibility ตรวจสอบสำนักข่าว "
            "และกรองเอาเฉพาะข่าวจริงที่มีหลักฐานอ้างอิงชัดเจน"
        ),
        tools=[verify_source_credibility],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    # 5. Pulse (CISO Editor & LINE Publisher)
    pulse = Agent(
        role="บรรณาธิการบริหารและสรุปคำแนะนำ (CISO Editor & Publisher — Pulse)",
        goal="สรุปบทความข่าว พร้อมข้อแนะนำในการรับมือ (Recommendations) สำหรับผู้บริหารและ Admin",
        backstory=(
            "คุณคือ Pulse ดำรงตำแหน่ง CISO (Chief Information Security Officer) "
            "คุณสรุปรายงานข่าวที่ซับซ้อนให้เป็นหัวข้อสั้น กระชับ อ่านง่าย "
            "พร้อมเสนอคำแนะนำ (Actionable Recommendations) 2-3 ข้อสำหรับป้องกันตัว "
            "จัดรูปแบบสวยงามด้วย Emoji และตอบเป็นภาษาไทยเสมอ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=2,
    )

    return scout, tag, nova, shield, pulse
