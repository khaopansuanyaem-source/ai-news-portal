"""
⏰ Scheduler — ตั้งเวลาวิเคราะห์ข่าวอัตโนมัติ (MCP Fusion)
Usage:
    python scheduler.py --interval 60 --category cyber
"""

import time
import schedule
import argparse
from datetime import datetime
from main import run_pipeline


def job(category):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n[{ts}] ⏰ เริ่มระบบวิเคราะห์ข่าวอัตโนมัติ...")
    try:
        run_pipeline(category=category)
        print(f"[{ts}] ✅ วิเคราะห์ข่าวสำเร็จและบันทึกผลแล้ว!")
    except Exception as e:
        print(f"[{ts}] ❌ Error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scheduler for Cyber & Tech News")
    parser.add_argument("--interval", type=int, default=60, help="ช่วงเวลา (นาที)")
    parser.add_argument("--category", "-c", default="cyber",
                        choices=["cyber", "tech"])
    args = parser.parse_args()

    print(f"{'='*50}")
    print(f"⏳ Scheduler: รันตรวจสอบข่าวทุก {args.interval} นาที")
    print(f"📂 Category: {args.category.upper()}")
    print(f"{'='*50}")

    schedule.every(args.interval).minutes.do(
        job, args.category
    )

    # รันรอบแรกทันที
    job(args.category)

    while True:
        schedule.run_pending()
        time.sleep(1)
