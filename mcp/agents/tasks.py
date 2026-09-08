"""
📋 Task Definitions — Cybersecurity & Tech News Pipeline
✨ MCP Fusion Strict Architecture Guardrails (Pydantic Type-Enforcement)
"""

from crewai import Task
from pydantic import BaseModel, Field
from typing import Optional, List


# ==========================================
# 🛡️ Pydantic Guardrails (Single Source of Truth)
# ==========================================

class NewsArticleItem(BaseModel):
    title: str = Field(description="หัวข้อข่าว")
    source: str = Field(description="สำนักข่าว/แหล่งอ้างอิง")
    url: str = Field(description="ลิงก์ข่าว")
    category: str = Field(description="หมวดหมู่ข่าว เช่น Ransomware, Zero-day, AI, Cloud")
    severity_stars: int = Field(description="คะแนนความสำคัญ/ความรุนแรง 1-5 ดาว")
    risk_level: str = Field(description="ระดับความเสี่ยง: Critical, High, Medium, Low, Informational")
    summary: str = Field(description="สรุปข่าวสั้นๆ 2-3 บรรทัด")
    impact: str = Field(description="ผลกระทบต่อองค์กรหรือผู้ใช้งาน")
    recommendation: List[str] = Field(description="ข้อแนะนำในการป้องกัน/รับมือ 2-3 ข้อ")


class SecurityBriefingOutput(BaseModel):
    briefing_date: str = Field(description="วันที่สรุปข่าว YYYY-MM-DD")
    category_mode: str = Field(description="ประเภทรายงาน: cyber หรือ tech")
    total_articles: int = Field(description="จำนวนข่าวทั้งหมด")
    overall_risk_status: str = Field(description="สถานะความเสี่ยงรวม เช่น Critical, High, Normal")
    articles: List[NewsArticleItem] = Field(description="รายการข่าวที่ผ่านการตรวจสอบแล้ว")
    executive_summary: str = Field(description="สรุปภาพรวมสำหรับผู้บริหาร (Executive Summary)")


# ==========================================
# 📋 Task Definitions
# ==========================================

def create_cyber_fusion_tasks(scout, tag, nova, shield, pulse, category: str = "cyber"):
    """
    สร้าง Task 5 ขั้นสำหรับ Cybersecurity & Tech News
    """

    task_fetch = Task(
        description=(
            f"ดึงข่าวสารล่าสุดในหัวข้อ '{category}'\n"
            f"- ถ้าเป็น 'cyber': ใช้ fetch_cyber_threat_news ดึงข่าวภัยคุกคาม เช่น Ransomware, Zero-day, Leak\n"
            f"- ถ้าเป็น 'tech': ใช้ fetch_tech_ai_news ดึงข่าวเทคโนโลยีและ AI ล่าสุด\n"
            f"ดึงข่าวสำคัญมาอย่างน้อย 3-5 ข่าว"
        ),
        expected_output="รายการข่าวล่าสุดพร้อมหัวข้อ แหล่งข่าว และลิงก์",
        agent=scout,
    )

    task_categorize = Task(
        description=(
            "นำข่าวทั้งหมดมาจัดหมวดหมู่และประเมินความรุนแรง:\n"
            "1. ระบุประเภทหมวดหมู่ข่าว (Ransomware, Data Breach, Zero-day, Phishing, AI, Cloud)\n"
            "2. กำหนดคะแนนความสำคัญ 1-5 ดาว (⭐)\n"
            "3. กำหนด Risk Level: 'Critical', 'High', 'Medium', 'Low', 'Informational'"
        ),
        expected_output="รายการข่าวที่ระบุหมวดหมู่ คะแนนดาว และ Risk Level ชัดเจน",
        agent=tag,
        context=[task_fetch],
    )

    task_analyze = Task(
        description=(
            "วิเคราะห์ผลกระทบ (Impact Assessment) ของแต่ละข่าว:\n"
            "1. ประเมินว่าส่งผลกระทบต่อใคร ระบบใด หรือผู้ใช้อย่างไร\n"
            "2. วิเคราะห์ความเสี่ยงเชิงลึก"
        ),
        expected_output="บทวิเคราะห์ผลกระทบและความเสี่ยงของแต่ละข่าว",
        agent=nova,
        context=[task_fetch, task_categorize],
    )

    task_check = Task(
        description=(
            "ตรวจสอบความน่าเชื่อถือของข่าว:\n"
            "1. ใช้ verify_source_credibility ตรวจสอบ URL/แหล่งข่าว\n"
            "2. คัดกรองเอาเฉพาะข่าวที่น่าเชื่อถือและไม่เก่าเกินไป"
        ),
        expected_output="รายงานการตรวจสอบความถูกต้อง + ข่าวที่ผ่านการคัดกรอง",
        agent=shield,
        context=[task_fetch, task_analyze],
    )

    task_report = Task(
        description=(
            "รวมรวมข้อมูลทั้งหมดและสร้าง Security Briefing Report ในรูปแบบ Pydantic Schema:\n"
            "1. เขียน Executive Summary สรุปภาพรวมสำหรับผู้บริหาร\n"
            "2. รวบรวมแต่ละข่าวพร้อมใส่ Recommendation วิธีรับมือ 2-3 ข้อ\n"
            "3. จัดส่งผลลัพธ์เป็นโครงสร้าง SecurityBriefingOutput เพื่อใช้แสดงบน Web Dashboard และส่งเข้า LINE"
        ),
        expected_output="รายงาน Security Briefing ฉบับสมบูรณ์ในรูปแบบ Pydantic Structured Data",
        agent=pulse,
        context=[task_categorize, task_analyze, task_check],
        output_pydantic=SecurityBriefingOutput,
    )

    return [task_fetch, task_categorize, task_analyze, task_check, task_report]
