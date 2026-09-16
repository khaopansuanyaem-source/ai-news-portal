"""
🚀 Main Entry Point — Multi-Agent AI News Analyzer
Usage:
    python main.py --category tech
    python main.py --category cyber
    python main.py --category all

📡 Live Status: เขียน real-time status ลง Supabase ทุกขั้นตอน
   หน้าเว็บ Virtual Newsroom จะขยับตามจริงผ่าน Realtime subscription
"""

import argparse
import json
import os
import time
from datetime import datetime
from dotenv import load_dotenv
from crewai import Crew, Process

from crew import create_tech_agents, create_cyber_agents
from tasks import create_tech_tasks, create_cyber_tasks
from supabase_client import insert_daily_summary
from status_reporter import (
    new_pipeline_run,
    set_agent_working,
    set_agent_thinking,
    set_agent_done,
    set_agent_idle,
)

load_dotenv()

# Map ชื่อ agent ให้ตรงกับ agent_id ที่หน้าเว็บ Virtual Newsroom ใช้
AGENT_IDS = {
    "fetcher":     ("scout",  "Scout"),
    "categorizer": ("tag",    "Tag"),
    "analyst":     ("nova",   "Nova"),
    "checker":     ("shield", "Shield"),
    "editor":      ("pulse",  "Pulse"),
}

# ลำดับ Step ที่ใช้ใน step_callback
_STEP_MAP = [
    ("scout",  "Scout",  "ดึงข่าวจากแหล่งข้อมูลภายนอก",                 20),
    ("tag",    "Tag",    "คัดกรองหมวดหมู่และให้คะแนน 1-5 ดาว",          45),
    ("nova",   "Nova",   "วิเคราะห์ Impact และ Threat Level เชิงลึก",    65),
    ("shield", "Shield", "ตรวจสอบแหล่งที่มาและกรอง Fake News",           82),
    ("pulse",  "Pulse",  "เรียบเรียงบทความและเตรียม Broadcast สู่โลก",   95),
]


def _make_step_callback():
    """สร้าง step_callback ที่อัปเดต live status agent ตาม step ที่กำลังทำ"""
    counter = {"n": 0}

    def _cb(step_output):
        n = counter["n"]
        if n < len(_STEP_MAP):
            ag_id, ag_name, task_desc, pct = _STEP_MAP[n]
            set_agent_working(ag_id, ag_name, task_desc, progress=max(pct - 10, 5))
            if n > 0:
                prev_id, prev_name, _, _ = _STEP_MAP[n - 1]
                set_agent_done(prev_id, prev_name, "ส่งต่องานให้ขั้นถัดไปเรียบร้อย")
            snippet = str(step_output)[:150] if step_output else task_desc
            set_agent_thinking(ag_id, ag_name, snippet, pct)
        counter["n"] += 1

    return _cb


def _run_crew(agents, tasks, category_label):
    """รัน Crew — รองรับทั้ง crewai ที่มีและไม่มี step_callback"""
    try:
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            max_rpm=10,
            step_callback=_make_step_callback(),
        )
        return crew.kickoff()
    except TypeError:
        # fallback สำหรับ crewai version เก่า
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            max_rpm=10,
        )
        return crew.kickoff()


def run_pipeline(category="tech"):
    """รัน AI Agent Pipeline พร้อม Live Status Reporting"""
    run_id = new_pipeline_run()

    print(f"\n{'='*60}")
    print(f"📰 Multi-Agent AI News Analyzer")
    print(f"📂 Category: {category} | 🆔 Run ID: {run_id}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    if category == "cyber":
        fetcher, categorizer, analyst, checker, editor = create_cyber_agents()
    else:
        fetcher, categorizer, analyst, checker, editor = create_tech_agents()

    agents = [fetcher, categorizer, analyst, checker, editor]
    start_time = time.time()
    results = {}

    if category in ("tech", "all"):
        print("\n💻 === กำลังวิเคราะห์ข่าว Tech & AI ===\n")
        set_agent_working("scout", "Scout", "ดึงข่าว Tech & AI จาก RSS Feeds", progress=5)
        set_agent_thinking("scout", "Scout", "กำลังสแกน TechCrunch, Blognone, The Verge...", 15)

        tasks = create_tech_tasks(fetcher, categorizer, analyst, checker, editor)
        tech_result = _run_crew(agents, tasks, "Tech & AI")
        results["tech"] = str(tech_result)

        set_agent_done("pulse", "Pulse", "เผยแพร่ข่าว Tech & AI สำเร็จ!")
        print("\n✅ วิเคราะห์ข่าว Tech & AI เสร็จสิ้น!")

    if category in ("cyber", "all"):
        print("\n🚨 === กำลังวิเคราะห์ข่าว Cybersecurity ===\n")
        set_agent_working("scout", "Scout", "ดึงข่าวภัยคุกคามจาก Threat Intel Feeds", progress=5)
        set_agent_thinking("scout", "Scout", "ตรวจจับสัญญาณจาก BleepingComputer, CISA, HackerNews...", 15)

        tasks = create_cyber_tasks(fetcher, categorizer, analyst, checker, editor)
        cyber_result = _run_crew(agents, tasks, "Cybersecurity")
        results["cyber"] = str(cyber_result)

        set_agent_done("pulse", "Pulse", "เผยแพร่รายงาน Cybersecurity สำเร็จ!")
        print("\n✅ วิเคราะห์ข่าว Cybersecurity เสร็จสิ้น!")

    # รีเซ็ต agent ทุกตัวกลับ idle
    for _, (ag_id, ag_name) in AGENT_IDS.items():
        set_agent_idle(ag_id, ag_name, "รอบนี้เสร็จแล้ว พร้อมรับงานใหม่ ✅")

    duration = round(time.time() - start_time, 2)
    print(f"\n{'='*60}")
    print(f"📊 ผลลัพธ์ (ใช้เวลา {duration} วินาที)")
    print(f"{'='*60}\n")
    for cat, result in results.items():
        print(f"\n--- {cat.upper()} ---\n")
        print(result)

    output = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "pipeline_run_id": run_id,
        "duration_seconds": duration,
        "results": results,
    }
    os.makedirs("output", exist_ok=True)
    filename = f"output/analysis_{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์: {filename}")

    print(f"\n☁️ กำลังบันทึกผลลัพธ์ลง Supabase Database...")
    insert_daily_summary(category, results)
    print(f"✅ บันทึกลง Supabase สำเร็จ!")

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-Agent AI News Analyzer")
    parser.add_argument(
        "--category", "-c",
        choices=["tech", "cyber", "all"],
        default="tech",
        help="ประเภทข่าว: tech, cyber, all"
    )
    args = parser.parse_args()
    run_pipeline(args.category)
