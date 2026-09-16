"""
🟢 Agent Status Reporter
=========================
ไฟล์นี้ให้ import ใช้ใน crew.py และ tasks.py
เมื่อ agent เริ่มทำงาน / คิด / เสร็จ → จะเขียน status จริงลง Supabase ทันที
หน้าเว็บ Virtual Newsroom จะขยับตาม live ผ่าน Supabase Realtime
"""

import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_url = os.environ.get("SUPABASE_URL")
_key = os.environ.get("SUPABASE_KEY")
_supabase: Client = create_client(_url, _key) if _url and _key else None

# Shared pipeline run ID สำหรับรอบนี้
_current_run_id: str = None


def new_pipeline_run() -> str:
    """สร้าง run ID ใหม่สำหรับรอบการรัน pipeline ครั้งนี้"""
    global _current_run_id
    _current_run_id = str(uuid.uuid4())[:8]
    print(f"🆔 Pipeline Run ID: {_current_run_id}")
    return _current_run_id


def set_agent_working(agent_id: str, agent_name: str, task: str, thought: str = "", progress: int = 10):
    """บอกระบบว่า agent ตัวนี้กำลังทำงานอยู่"""
    _upsert_status(agent_id, agent_name, "working", task, thought or f"กำลัง {task}...", progress)
    _write_log(agent_id, "INFO", f"▶ เริ่มงาน: {task}")


def set_agent_thinking(agent_id: str, agent_name: str, thought: str, progress: int = 50):
    """บอกระบบว่า agent กำลังคิด (ระหว่าง LLM call)"""
    _upsert_status(agent_id, agent_name, "working", None, thought, progress)
    _write_log(agent_id, "LLM", f"💭 {thought}")


def set_agent_tool(agent_id: str, agent_name: str, tool_name: str, tool_input: str = ""):
    """บอกระบบว่า agent กำลังใช้ Tool"""
    msg = f"🔧 เรียกใช้ {tool_name}: {tool_input[:60]}..." if tool_input else f"🔧 เรียกใช้ {tool_name}"
    _upsert_status(agent_id, agent_name, "working", None, msg, 70)
    _write_log(agent_id, "TOOL", msg)


def set_agent_done(agent_id: str, agent_name: str, result_summary: str, progress: int = 100):
    """บอกระบบว่า agent เสร็จงานแล้ว"""
    _upsert_status(agent_id, agent_name, "done", None, f"✅ {result_summary}", progress)
    _write_log(agent_id, "DONE", f"✅ เสร็จสิ้น: {result_summary}")


def set_agent_idle(agent_id: str, agent_name: str, message: str = "พร้อมรับงาน"):
    """รีเซ็ต agent กลับสู่สถานะ idle"""
    _upsert_status(agent_id, agent_name, "idle", None, message, 0)


def set_agent_error(agent_id: str, agent_name: str, error_msg: str):
    """บอกระบบว่า agent เจอ error"""
    _upsert_status(agent_id, agent_name, "error", None, f"❌ {error_msg}", 0)
    _write_log(agent_id, "ERROR", f"❌ {error_msg}")


def _upsert_status(agent_id: str, agent_name: str, state: str,
                   task: str | None, thought: str, progress: int):
    """Upsert ลง agent_status table"""
    if not _supabase:
        print(f"[STATUS] {agent_name} ({state}): {thought}")
        return
    try:
        payload = {
            "agent_id": agent_id,
            "agent_name": agent_name,
            "state": state,
            "current_task": task,
            "current_thought": thought,
            "progress_pct": progress,
            "pipeline_run_id": _current_run_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        if state == "working" and task:
            payload["started_at"] = datetime.now(timezone.utc).isoformat()

        _supabase.table("agent_status").upsert(
            payload,
            on_conflict="agent_id"
        ).execute()
    except Exception as e:
        print(f"[StatusReporter] Error: {e}")


def _write_log(agent_id: str, level: str, message: str):
    """เขียน log ลง agent_logs table"""
    if not _supabase:
        return
    try:
        _supabase.table("agent_logs").insert({
            "pipeline_run_id": _current_run_id,
            "agent_id": agent_id,
            "level": level,
            "message": message
        }).execute()
    except Exception as e:
        print(f"[LogReporter] Error: {e}")
