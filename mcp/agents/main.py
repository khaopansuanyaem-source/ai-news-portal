"""
🚀 Main Entry Point — Cybersecurity & Tech News (MCP Fusion Edition)
Usage:
    uv run python main.py --category cyber
    uv run python main.py --category tech
"""

import argparse
import json
import os
import time
from datetime import datetime
from dotenv import load_dotenv
from crewai import Crew, Process

from crew import create_cyber_fusion_agents
from tasks import create_cyber_fusion_tasks
from supabase_client import insert_content

load_dotenv()


def run_pipeline(category: str = "cyber"):
    """รัน Cybersecurity & Tech News MCP Fusion Pipeline"""
    print(f"\n{'='*60}")
    print(f"🛡️ Cybersecurity & Tech News Analyzer (MCP Fusion Edition)")
    print(f"📂 Category: {category.upper()}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # สร้าง Agents (5 ตัว)
    scout, tag, nova, shield, pulse = create_cyber_fusion_agents()

    start_time = time.time()

    # สร้าง Tasks
    tasks = create_cyber_fusion_tasks(
        scout, tag, nova, shield, pulse, category=category
    )

    # รัน Crew
    crew = Crew(
        agents=[scout, tag, nova, shield, pulse],
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        max_rpm=10,
    )

    result = crew.kickoff()
    duration = round(time.time() - start_time, 2)

    # แสดงผลลัพธ์
    print(f"\n{'='*60}")
    print(f"✅ วิเคราะห์ข่าวเสร็จสิ้น! (ใช้เวลา {duration} วินาที)")
    print(f"{'='*60}\n")
    print(result)

    # บันทึกลง JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "duration_seconds": duration,
        "result": str(result),
    }

    os.makedirs("output", exist_ok=True)
    filename = f"output/news_{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์: {filename}")

    # บันทึกลง Supabase (ถ้ามี config)
    insert_content(f"Security Briefing: {category}", "web_dashboard", category, str(result))

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="🛡️ Cybersecurity & Tech News Analyzer (MCP Fusion Edition)"
    )
    parser.add_argument(
        "--category", "-c",
        choices=["cyber", "tech"],
        default="cyber",
        help="หมวดหมู่ข่าว: cyber หรือ tech (default: cyber)"
    )
    args = parser.parse_args()
    run_pipeline(args.category)
