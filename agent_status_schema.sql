-- =========================================================================
-- agent_status: ตารางที่ Python Agents เขียน live status ลงตลอดเวลา
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.agent_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL,           -- 'scout' | 'tag' | 'nova' | 'shield' | 'pulse'
    agent_name TEXT NOT NULL,          -- ชื่อ agent
    state TEXT NOT NULL DEFAULT 'idle', -- 'idle' | 'working' | 'done' | 'error'
    current_task TEXT,                  -- งานที่กำลังทำอยู่
    current_thought TEXT,               -- ข้อความล่าสุดที่ agent คิด
    progress_pct INTEGER DEFAULT 0,     -- 0-100 เปอร์เซ็นต์ความคืบหน้า
    pipeline_run_id TEXT,               -- id ของรอบการรันที่กำลังทำ
    started_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads" ON public.agent_status
    FOR SELECT USING (true);

CREATE POLICY "Allow all inserts" ON public.agent_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates" ON public.agent_status
    FOR UPDATE USING (true);

-- =========================================================================
-- agent_logs: บันทึก log ย่อยทุก event ของ agent (สำหรับ Terminal view)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_run_id TEXT,
    agent_id TEXT NOT NULL,
    level TEXT DEFAULT 'INFO',       -- 'INFO' | 'TOOL' | 'LLM' | 'ERROR' | 'DONE'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads on logs" ON public.agent_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow all inserts on logs" ON public.agent_logs
    FOR INSERT WITH CHECK (true);

-- =========================================================================
-- Enable Realtime for both tables (run in Supabase Dashboard > Realtime)
-- =========================================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_status;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;

-- =========================================================================
-- Initialize default idle status for all 5 agents
-- =========================================================================
INSERT INTO public.agent_status (agent_id, agent_name, state, current_thought, progress_pct)
VALUES
    ('scout',  'Scout',  'idle', 'พร้อมดักจับสัญญาณข่าว...', 0),
    ('tag',    'Tag',    'idle', 'พร้อมคัดกรองและให้คะแนน...', 0),
    ('nova',   'Nova',   'idle', 'พร้อมวิเคราะห์เชิงลึก...', 0),
    ('shield', 'Shield', 'idle', 'พร้อมตรวจสอบข้อเท็จจริง...', 0),
    ('pulse',  'Pulse',  'idle', 'พร้อมเรียบเรียงบทความ...', 0)
ON CONFLICT DO NOTHING;
