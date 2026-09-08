"""
🚀 Main Entry Point — Multi-Agent AI News Analyzer
Usage:
    python main.py --category tech
    python main.py --category cyber
    python main.py --category all
"""

import argparse
import json
import os
import time
import requests
from datetime import datetime
from dotenv import load_dotenv
from crewai import Crew, Process

from crew import create_tech_agents, create_cyber_agents
from tasks import create_tech_tasks, create_cyber_tasks

from supabase_client import insert_daily_summary

load_dotenv()


def run_pipeline(category="tech"):
    """รัน AI Agent Pipeline"""
    print(f"\n{'='*60}")
    print(f"📰 Multi-Agent AI News Analyzer")
    print(f"📂 Category: {category}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # สร้าง Agents (5 ตัว)
    if category == "cyber":
        fetcher, categorizer, analyst, checker, editor = create_cyber_agents()
    else:
        fetcher, categorizer, analyst, checker, editor = create_tech_agents()
        
    start_time = time.time()
    results = {}


    if category in ("tech", "all"):
        print("\n💻 === กำลังวิเคราะห์ข่าว Tech & AI ===\n")
        tasks = create_tech_tasks(fetcher, categorizer, analyst, checker, editor)
        crew = Crew(
            agents=[fetcher, categorizer, analyst, checker, editor],
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            max_rpm=10,
        )
        tech_result = crew.kickoff()
        results["tech"] = str(tech_result)
        print("\n✅ วิเคราะห์ข่าว Tech & AI เสร็จสิ้น!")

    if category in ("cyber", "all"):
        print("\n🚨 === กำลังวิเคราะห์ข่าว Cybersecurity ===\n")
        tasks = create_cyber_tasks(fetcher, categorizer, analyst, checker, editor)
        crew = Crew(
            agents=[fetcher, categorizer, analyst, checker, editor],
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            max_rpm=10,
        )
        cyber_result = crew.kickoff()
        results["cyber"] = str(cyber_result)
        print("\n✅ วิเคราะห์ข่าว Cybersecurity เสร็จสิ้น!")

    duration = round(time.time() - start_time, 2)

    # แสดงผลลัพธ์
    print(f"\n{'='*60}")
    print(f"📊 ผลลัพธ์ (ใช้เวลา {duration} วินาที)")
    print(f"{'='*60}\n")

    for cat, result in results.items():
        print(f"\n--- {cat.upper()} ---\n")
        print(result)

    # บันทึกลง JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "duration_seconds": duration,
        "results": results,
    }

    os.makedirs("output", exist_ok=True)
    filename = f"output/analysis_{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์: {filename}")

    # บันทึกลง Supabase
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
