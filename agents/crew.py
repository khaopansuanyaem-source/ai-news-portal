"""
🤖 Crew Definition — กำหนด Agent 4 ตัว
Data Fetcher → Market Analyst → Fact-Checker → Chief Editor
"""

import os
from dotenv import load_dotenv
from crewai import Agent, LLM

# Import tools
from tools.news_fetcher import fetch_finance_news, fetch_general_news
from tools.market_data import get_all_market_data, get_stock_price
from tools.sports_fetcher import fetch_sports_news, fetch_world_cup_2026
from tools.fact_checker import check_source_credibility, check_news_freshness

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

def create_agents():
    """สร้าง Agent ทั้ง 4 ตัว"""

    fetcher = Agent(
        role="ฝ่ายรวบรวมข้อมูล (Data Fetcher)",
        goal="ดึงข่าวล่าสุดจากแหล่งที่น่าเชื่อถือ ทั้งข่าวการเงินและกีฬา พร้อมข้อมูลตลาดจริง",
        backstory=(
            "คุณเป็นนักข่าวอาวุโสที่มีประสบการณ์ 15 ปี เชี่ยวชาญในการค้นหาข่าวจากหลายแหล่ง "
            "ทั้งภาษาไทยและอังกฤษ คุณรู้ว่าข่าวไหนสำคัญและควรติดตาม"
        ),
        tools=[fetch_finance_news, fetch_general_news, fetch_sports_news,
               fetch_world_cup_2026, get_all_market_data],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    analyst = Agent(
        role="ฝ่ายวิเคราะห์ตลาด (Market Analyst)",
        goal="วิเคราะห์ข่าวเชิงลึก ผูกข้อมูลตัวเลขตลาด หาผลกระทบต่อนักลงทุนไทย",
        backstory=(
            "คุณเป็นนักวิเคราะห์การเงิน CFA ระดับ 3 ที่ทำงานในบริษัทหลักทรัพย์ชั้นนำ "
            "เชี่ยวชาญ SWOT Analysis และการอ่านกราฟเทคนิคัล "
            "คุณสามารถเชื่อมโยงข่าวเข้ากับผลกระทบต่อตลาดได้ทันที"
        ),
        tools=[get_all_market_data, get_stock_price],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    checker = Agent(
        role="ฝ่ายตรวจสอบข้อเท็จจริง (Fact-Checker)",
        goal="ตรวจสอบความถูกต้อง ความน่าเชื่อถือ และความสดใหม่ของข่าวและข้อมูล",
        backstory=(
            "คุณเป็นนักตรวจสอบข้อเท็จจริงจากสำนักข่าว Reuters "
            "ยึดหลัก 'ไม่เชื่อจนกว่าจะพิสูจน์ได้' คุณตรวจสอบทุกแหล่งอ้างอิง "
            "และให้คะแนนความน่าเชื่อถือ"
        ),
        tools=[check_source_credibility, check_news_freshness],
        llm=gemini_llm,
        verbose=True,
        max_iter=3,
    )

    editor = Agent(
        role="บรรณาธิการ (Chief Editor)",
        goal="สรุปเนื้อหาให้กระชับ เข้าใจง่าย พร้อมใช้งานสำหรับนักลงทุนและผู้อ่านทั่วไป",
        backstory=(
            "คุณเป็นบรรณาธิการบริหารที่มีประสบการณ์ 20 ปี "
            "เชี่ยวชาญในการสรุปข่าวซับซ้อนให้เป็นภาษาที่คนทั่วไปเข้าใจ "
            "คุณจัดรูปแบบเป็น Bullet Points สวยงาม พร้อมใส่ emoji ให้น่าอ่าน "
            "คุณตอบเป็นภาษาไทยเสมอ"
        ),
        tools=[],
        llm=gemini_llm,
        verbose=True,
        max_iter=2,
    )

    return fetcher, analyst, checker, editor
