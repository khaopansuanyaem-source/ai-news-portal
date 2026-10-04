-- =========================================================================
-- CyberInsight AI — OS Classification Schema Migration
-- เพิ่ม os_classification column สำหรับเก็บข้อมูลการจำแนก OS/Platform
-- =========================================================================

-- 1. เพิ่มคอลัมน์ os_classification (JSONB) ใน news_articles
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS os_classification JSONB DEFAULT NULL;

-- 2. เพิ่มคอลัมน์ image_url สำหรับรูปภาพปก (ถ้ายังไม่มี)
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- 3. สร้าง GIN Index สำหรับ JSONB query — ทำให้ filter by OS เร็ว
CREATE INDEX IF NOT EXISTS idx_news_os_classification
ON public.news_articles USING GIN (os_classification);

-- 4. สร้าง Index สำหรับ filter ตาม os_names (ใช้ jsonb_path_ops สำหรับ @> operator)
CREATE INDEX IF NOT EXISTS idx_news_os_names
ON public.news_articles USING GIN ((os_classification->'os_names') jsonb_path_ops);

-- 5. สร้าง Index สำหรับ filter ตาม os_categories
CREATE INDEX IF NOT EXISTS idx_news_os_categories
ON public.news_articles USING GIN ((os_classification->'os_categories') jsonb_path_ops);

-- =========================================================================
-- ตัวอย่าง Query ที่ใช้ได้หลัง migration
-- =========================================================================

-- ค้นหาข่าวที่เกี่ยวกับ Windows:
-- SELECT * FROM news_articles
-- WHERE os_classification->'os_names' @> '"Windows"'::jsonb;

-- ค้นหาข่าวที่เกี่ยวกับ Mobile:
-- SELECT * FROM news_articles
-- WHERE os_classification->'os_categories' @> '"Mobile"'::jsonb;

-- ค้นหาข่าวที่เกี่ยวกับ Windows หรือ Linux:
-- SELECT * FROM news_articles
-- WHERE os_classification->'os_names' @> '"Windows"'::jsonb
--    OR os_classification->'os_names' @> '"Linux"'::jsonb;

-- ค้นหาข่าวที่มี OS classification (ไม่ใช่ General):
-- SELECT * FROM news_articles
-- WHERE os_classification->>'has_os_info' = 'true';
