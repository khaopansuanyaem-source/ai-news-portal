-- ตารางสำหรับเก็บ Content ที่ AI สร้าง
CREATE TABLE IF NOT EXISTS generated_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_json JSONB NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ฟังก์ชันลบ Content เก่าอัตโนมัติ (เกิน 30 วัน)
CREATE OR REPLACE FUNCTION delete_old_contents() RETURNS void AS $$
BEGIN
  DELETE FROM generated_contents WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
