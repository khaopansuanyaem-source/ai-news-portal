import os
from supabase import create_client, Client
from datetime import datetime

url = "https://gzhzweijflchlvharhsj.supabase.co"
key = "sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH"
supabase: Client = create_client(url, key)

mock_data = [
    {
        "title": "อัปเดตตารางการแข่งขันฟุตบอลโลก 2026 (รอบแบ่งกลุ่ม)",
        "url": "https://example.com/wc2026-schedule",
        "source": "FIFA Official",
        "category": "Sports",
        "summary": "ประกาศตารางการแข่งขันฟุตบอลโลก 2026 อย่างเป็นทางการ คู่เปิดสนามเป็นการพบกันระหว่าง สหรัฐอเมริกา vs เม็กซิโก ในวันที่ 11 มิถุนายน 2026 ตามด้วย นัดหยุดโลก อาร์เจนตินา vs โปรตุเกส ในวันที่ 15 มิถุนายน 2026 แฟนบอลสามารถติดตามตารางแข่งและผลการแข่งขันได้ที่นี่",
        "sentiment": "Positive",
        "impact_level": "High"
    },
    {
        "title": "เจาะลึก 3 ประเทศเจ้าภาพฟุตบอลโลก 2026: สหรัฐฯ, เม็กซิโก, แคนาดา",
        "url": "https://example.com/wc2026-hosts",
        "source": "BBC Sport",
        "category": "Sports",
        "summary": "ครั้งแรกในประวัติศาสตร์ฟุตบอลโลกที่มีเจ้าภาพร่วมถึง 3 ประเทศ ได้แก่ สหรัฐอเมริกา, เม็กซิโก และ แคนาดา พร้อมกับเพิ่มจำนวนทีมที่เข้าร่วมแข่งขันเป็น 48 ทีม ทำให้ฟุตบอลโลก 2026 จะเป็นทัวร์นาเมนต์ที่ยิ่งใหญ่และมีจำนวนแมตช์การแข่งขันมากที่สุดเท่าที่เคยมีมา",
        "sentiment": "Neutral",
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

print("Seeding World Cup 2026 news complete.")
