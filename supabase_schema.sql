-- =========================================================================
-- CyberInsight AI - Complete Supabase Database Schema
-- =========================================================================

-- 0. เปิดใช้งาน Extension สำหรับ UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. ตาราง members (สำหรับสมาชิกที่ติดตาม LINE OA / LIFF)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
    line_uid TEXT PRIMARY KEY,
    display_name TEXT,
    picture_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิด Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON public.members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON public.members
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.members
    FOR UPDATE USING (true);

-- -------------------------------------------------------------------------
-- 2. ตาราง user_preferences (การตั้งค่าหมวดหมู่ข่าวและระดับความเสี่ยงแจ้งเตือน)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT UNIQUE NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}', -- e.g. ['tech', 'cyber']
    alert_level TEXT NOT NULL DEFAULT 'ALL',  -- ALL, MODERATE, HIGH, CRITICAL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index สำหรับค้นหาผู้ใช้ตาม line_user_id รวดเร็ว
CREATE INDEX IF NOT EXISTS idx_user_preferences_line ON public.user_preferences(line_user_id);

-- -------------------------------------------------------------------------
-- 3. ตาราง news_articles (บทความข่าวสดที่ AI กวาดมาได้)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT,
    image_url TEXT,                        -- ลิงก์รูปภาพปกข่าวโดยตรง
    sentiment TEXT DEFAULT 'Neutral',     -- Positive, Negative, Neutral
    impact_level TEXT DEFAULT 'Medium',   -- Low, Medium, High, Critical
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes สำหรับเร่งความเร็วในการกรองและดึงข่าวล่าสุด
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_articles(category);

-- -------------------------------------------------------------------------
-- 4. ตาราง daily_summaries (สรุปข่าวรายวันสำหรับส่งเข้า LINE Flex Message)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    content_json JSONB NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 5. Stored Procedure & Trigger Functions
-- -------------------------------------------------------------------------
-- ฟังก์ชันลบข่าวเก่าอัตโนมัติ (เกิน 14 วัน) เพื่อประหยัดพื้นที่ Database
CREATE OR REPLACE FUNCTION delete_old_news() RETURNS void AS $$
BEGIN
    DELETE FROM public.news_articles WHERE created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;
