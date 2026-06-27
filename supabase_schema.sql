-- 1. ตารางสำหรับเก็บการตั้งค่าของผู้ใช้ (เช่น หมวดหมู่ข่าวที่ชอบ)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT UNIQUE NOT NULL, -- ID ของ LINE สำหรับส่งข้อความ
    categories TEXT[] NOT NULL DEFAULT '{}', -- เช่น ['tech', 'finance', 'sports']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ตารางสำหรับเก็บข่าวสดๆ ที่ AI หามาได้ (จะลบอัตโนมัติเมื่อเก่าเกินไป)
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT,
    sentiment TEXT, -- Positive, Negative, Neutral
    impact_level TEXT, -- High, Medium, Low
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ตารางสำหรับเก็บ "สรุปข่าวรายวัน" ที่ Editor เขียนเสร็จแล้ว (อันนี้เก็บถาวร)
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    content_json JSONB NOT NULL, -- เก็บโครงสร้างสำหรับทำ LINE Flex Message
    is_sent BOOLEAN DEFAULT FALSE, -- เช็คว่าส่งเข้า LINE หรือยัง
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างฟังก์ชันลบข่าวเก่าอัตโนมัติ (เกิน 14 วัน)
CREATE OR REPLACE FUNCTION delete_old_news() RETURNS void AS $$
BEGIN
  DELETE FROM news_articles WHERE created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;
