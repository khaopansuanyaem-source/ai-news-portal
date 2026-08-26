import time
import schedule
import argparse
import os
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
from main import run_pipeline

# ═══ DUMMY SERVER FOR RENDER HEALTH CHECK ═══
class DummyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"Scheduler is running!")

def run_dummy_server():
    port = int(os.environ.get('PORT', 10000))
    server = HTTPServer(('0.0.0.0', port), DummyHandler)
    print(f"🌐 Started dummy web server on port {port} for Render health checks")
    server.serve_forever()

# ═══ SCHEDULER LOGIC ═══
def job():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ⏰ เริ่มรันรอบอัตโนมัติ: หมวดหมู่ Tech & Cyber...")
    try:
        run_pipeline("all")
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ รันรอบอัตโนมัติสำเร็จ!")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ เกิดข้อผิดพลาดในการรัน: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scheduler for AI News Pipeline")
    parser.add_argument("--interval", type=int, default=30, help="ช่วงเวลา (นาที) ในการรัน")
    args = parser.parse_args()

    interval = args.interval

    print(f"==================================================")
    print(f"⏳ เริ่มระบบ Scheduler: รันวิเคราะห์ข่าว Tech & Cyber ทุก {interval} นาที")
    print(f"==================================================")

    # Start dummy server in a background thread
    threading.Thread(target=run_dummy_server, daemon=True).start()

    # ตั้งเวลาทำงาน
    schedule.every(interval).minutes.do(job)

    # วนลูปทำงานตลอดเวลา
    while True:
        schedule.run_pending()
        time.sleep(1)
