import time
import schedule
import argparse
from datetime import datetime
from main import run_pipeline

def job():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ⏰ เริ่มรันรอบอัตโนมัติ: หมวดหมู่ Finance...")
    try:
        run_pipeline("finance")
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ รันรอบอัตโนมัติสำเร็จ!")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ เกิดข้อผิดพลาดในการรัน: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scheduler for AI News Pipeline")
    parser.add_argument("--interval", type=int, default=30, help="ช่วงเวลา (นาที) ในการรัน")
    args = parser.parse_args()

    interval = args.interval

    print(f"==================================================")
    print(f"⏳ เริ่มระบบ Scheduler: รันวิเคราะห์ข่าว Finance ทุก {interval} นาที")
    print(f"==================================================")

    # ตั้งเวลาทำงาน
    schedule.every(interval).minutes.do(job)

    # วนลูปทำงานตลอดเวลา
    while True:
        schedule.run_pending()
        time.sleep(1)
