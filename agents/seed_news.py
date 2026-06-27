import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

url = "https://gzhzweijflchlvharhsj.supabase.co"
key = "sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH"
supabase: Client = create_client(url, key)

mock_data = [
    {
        "title": "เจาะลึกอนาคต AI: เมื่อโครงสร้างพื้นฐานคือเดิมพันใหม่",
        "url": "https://example.com/ai-future",
        "source": "The Standard",
        "category": "Tech",
        "summary": "การแข่งขันด้าน AI ทวีความรุนแรงขึ้นเมื่อบริษัทเทคยักษ์ใหญ่ต่างทุ่มทุนสร้าง Data Center ใหม่ทั่วโลก ข่าวนี้ชี้ให้เห็นถึงความสำคัญของโครงสร้างพื้นฐาน AI (Infrastructure) ซึ่งเป็นหัวใจหลักในการพัฒนาเทคโนโลยีในทศวรรษหน้า การแข่งขันไม่ได้อยู่ที่ตัวโมเดล AI เพียงอย่างเดียว แต่อยู่ที่ใครมีพลังประมวลผล (Compute Power) มากกว่ากัน ผู้ลงทุนควรจับตาหุ้นกลุ่ม Semiconductor และ Cloud Provider",
        "sentiment": "Positive",
        "impact_level": "High"
    },
    {
        "title": "ตลาดหุ้นไทยดิ่งแรง กังวลปัจจัยเงินเฟ้อ",
        "url": "https://example.com/set-drop",
        "source": "Thairath",
        "category": "Finance",
        "summary": "ดัชนี SET ปิดลบ 20 จุด นักลงทุนเทขายลดความเสี่ยงก่อนการประชุม FED ความกังวลเรื่องอัตราเงินเฟ้อสหรัฐฯ ส่งผลกระทบเชิงลบต่อตลาดเกิดใหม่ (Emerging Markets) กระแสเงินทุนต่างชาติไหลออก ส่งผลให้ตลาดหุ้นไทยเผชิญแรงกดดันอย่างหนักระยะสั้น",
        "sentiment": "Negative",
        "impact_level": "High"
    },
    {
        "title": "ก้าวไกลเสนอ พ.ร.บ. สุราก้าวหน้า",
        "url": "https://example.com/politics",
        "source": "Matichon",
        "category": "Politics",
        "summary": "พรรคก้าวไกลเตรียมยื่นร่างกฎหมายสุราก้าวหน้า หวังทลายทุนผูกขาด หากร่างกฎหมายผ่าน จะเป็นจุดเปลี่ยนสำคัญของอุตสาหกรรมเครื่องดื่มไทย เปิดโอกาสให้รายย่อยเข้าสู่ตลาดได้มากขึ้น สร้างมูลค่าเพิ่มทางเศรษฐกิจระดับท้องถิ่น แต่อาจเผชิญการต่อต้านจากกลุ่มทุนเดิม",
        "sentiment": "Neutral",
        "impact_level": "Medium"
    },
    {
        "title": "ลิเวอร์พูลคว้าแชมป์พรีเมียร์ลีกสมใจ",
        "url": "https://example.com/sports-1",
        "source": "Siamsport",
        "category": "Sports",
        "summary": "หงส์แดงผงาดคว้าแชมป์ลีกสูงสุดอีกครั้ง หลังทำคะแนนทิ้งห่างคู่แข่ง ชัยชนะครั้งนี้ส่งผลดีต่อแบรนด์และมูลค่าทางการตลาดของสโมสรลิเวอร์พูล คาดว่าจะมีการรับรู้รายได้จากสปอนเซอร์และยอดขายสินค้าที่ระลึกเพิ่มขึ้นอย่างมีนัยสำคัญ",
        "sentiment": "Positive",
        "impact_level": "Low"
    },
    {
        "title": "อัปเดตราคา Bitcoin ทะลุ $80,000",
        "url": "https://example.com/crypto",
        "source": "CoinDesk",
        "category": "Business",
        "summary": "บิตคอยน์ทำสถิติสูงสุดใหม่ (All-time high) ได้แรงหนุนจากสถาบันการเงิน การยอมรับ Bitcoin ในฐานะสินทรัพย์สำรองและเครื่องมือป้องกันความเสี่ยง (Hedging) จากเงินเฟ้อชัดเจนขึ้น การที่กองทุน ETF ได้รับอนุมัติยิ่งเป็นตัวเร่งให้เงินทุนสถาบันไหลเข้ามามากขึ้น",
        "sentiment": "Positive",
        "impact_level": "High"
    },
    {
        "title": "ภาพยนตร์ไทยกวาดรางวัลเทศกาลหนังเมืองคานส์",
        "url": "https://example.com/ent-1",
        "source": "Dara Daily",
        "category": "Entertainment",
        "summary": "ผงาดบนเวทีโลก ภาพยนตร์ไทยคว้ารางวัลใหญ่ สร้างชื่อเสียงให้ประเทศ ความสำเร็จนี้ตอกย้ำศักยภาพ Soft Power ของไทยในระดับสากล จะช่วยดึงดูดเม็ดเงินลงทุนต่างชาติเข้าสู่อุตสาหกรรมภาพยนตร์และกระตุ้นการท่องเที่ยวตามรอยสถานที่ถ่ายทำ",
        "sentiment": "Positive",
        "impact_level": "Low"
    },
    {
        "title": "พบช่องโหว่ร้ายแรงในระบบปฏิบัติการ Android",
        "url": "https://example.com/tech-sec",
        "source": "Beartai",
        "category": "Tech",
        "summary": "ผู้เชี่ยวชาญเตือนผู้ใช้แอนดรอยด์รีบอัปเดตระบบด่วน หลังพบแฮกเกอร์เจาะข้อมูล ข่าวนี้ส่งผลกระทบวงกว้างต่อผู้ใช้งานสมาร์ทโฟน สะท้อนให้เห็นถึงภัยคุกคามทางไซเบอร์ที่รุนแรงขึ้น บริษัทองค์กรควรทบทวนนโยบายความปลอดภัยทางข้อมูล (Data Security) อย่างเร่งด่วน",
        "sentiment": "Negative",
        "impact_level": "Medium"
    },
    {
        "title": "กบฏในซีเรียเข้ายึดเมืองหลวงสำเร็จ",
        "url": "https://example.com/world",
        "source": "BBC Thai",
        "category": "World",
        "summary": "สถานการณ์ตึงเครียด กองกำลังฝ่ายต่อต้านสามารถบุกยึดกรุงดามัสกัสได้สำเร็จ ความขัดแย้งเชิงภูมิรัฐศาสตร์ (Geopolitics) ที่รุนแรงขึ้นนี้อาจส่งผลกระทบต่อราคาน้ำมันโลกและเสถียรภาพในตะวันออกกลาง นักลงทุนควรระมัดระวังความผันผวนของตลาดพลังงาน",
        "sentiment": "Negative",
        "impact_level": "High"
    },
    {
        "title": "เทรนด์รถยนต์ไฟฟ้า (EV) ยอดขายทะลุเป้า",
        "url": "https://example.com/auto",
        "source": "Autospinn",
        "category": "Business",
        "summary": "ผู้บริโภคหันมาใช้รถ EV มากขึ้น ค่ายรถจีนรุกหนักตลาดไทย อุตสาหกรรมยานยนต์กำลังเข้าสู่จุดเปลี่ยน (Tipping Point) ค่ายรถยนต์สันดาปเดิมกำลังเสียส่วนแบ่งตลาด ธุรกิจที่เกี่ยวข้องกับ EV Ecosystem เช่น สถานีชาร์จ และแบตเตอรี่ มีแนวโน้มเติบโตสูง",
        "sentiment": "Positive",
        "impact_level": "Medium"
    },
    {
        "title": "วิกฤตฝุ่น PM 2.5 กลับมาอีกครั้ง",
        "url": "https://example.com/social",
        "source": "Thai PBS",
        "category": "Social",
        "summary": "หลายจังหวัดภาคเหนือเผชิญปัญหาฝุ่นควันวิกฤต กระทบสุขภาพประชาชน ปัญหาสิ่งแวดล้อมที่เรื้อรังส่งผลกระทบทั้งด้านสาธารณสุขและเศรษฐกิจการท่องเที่ยว ธุรกิจที่เกี่ยวข้องกับเครื่องฟอกอากาศและหน้ากากอนามัยจะมียอดขายเพิ่มขึ้นชั่วคราว",
        "sentiment": "Negative",
        "impact_level": "Medium"
    }
]

for item in mock_data:
    item['published_at'] = datetime.now().isoformat()
    try:
        supabase.table("news_articles").insert(item).execute()
        print(f"Inserted: {item['title']}")
    except Exception as e:
        print(f"Error inserting: {e}")

print("Seeding complete.")
