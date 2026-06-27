import os
from supabase import create_client, Client
from datetime import datetime

url = "https://gzhzweijflchlvharhsj.supabase.co"
key = "sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH"
supabase: Client = create_client(url, key)

mock_data = [
    {
        "title": "สรุปผลบอลโลกเมื่อคืน: ทีมเต็งร่วงตกรอบแบบช็อกโลก!",
        "url": "https://example.com/world-cup-upset",
        "source": "Siamsport",
        "category": "Sports",
        "summary": "เกิดการพลิกล็อกครั้งใหญ่ในศึกฟุตบอลโลก เมื่อทีมชาติบราซิลพ่ายแพ้ต่อม้ามืดอย่างโมร็อกโก ทำให้กระเด็นตกรอบ 8 ทีมสุดท้ายไปอย่างน่าเสียดาย แฟนบอลทั่วโลกต่างตกตะลึงกับผลการแข่งขันนัดนี้ รูปเกมโมร็อกโกเน้นตั้งรับและสวนกลับอย่างเฉียบคมจนได้ประตูชัยในนาทีที่ 85",
        "sentiment": "Negative",
        "impact_level": "High"
    },
    {
        "title": "เจาะลึกแทคติก: แผนการเล่นที่พาทีมชาติอังกฤษเข้าชิงฟุตบอลโลก",
        "url": "https://example.com/world-cup-england",
        "source": "Goal Thailand",
        "category": "Sports",
        "summary": "วิเคราะห์เจาะลึกแผนการเล่นของทีมชาติอังกฤษ หรือทัพสิงโตคำราม ที่โชว์ฟอร์มโหดทะลุเข้าสู่รอบชิงชนะเลิศฟุตบอลโลกได้สำเร็จ การผสมผสานระหว่างดาวรุ่งและนักเตะตัวเก๋า รวมถึงการปรับแทคติกของกุนซือ ทำให้พวกเขากลายเป็นทีมที่เสียประตูน้อยที่สุดในทัวร์นาเมนต์นี้",
        "sentiment": "Positive",
        "impact_level": "High"
    },
    {
        "title": "เปิดรายได้ลิขสิทธิ์ถ่ายทอดสดฟุตบอลโลก โกยเงินมหาศาล",
        "url": "https://example.com/world-cup-revenue",
        "source": "Thairath Sport",
        "category": "Sports",
        "summary": "ฟีฟ่าเปิดเผยตัวเลขรายได้จากการขายลิขสิทธิ์ถ่ายทอดสดฟุตบอลโลกปีนี้ พุ่งสูงเป็นประวัติการณ์แตะระดับแสนล้านบาท สะท้อนให้เห็นถึงความนิยมที่ยังคงเติบโตอย่างต่อเนื่อง ไม่ว่าแพลตฟอร์มสตรีมมิ่งจะเข้ามามีบทบาทแค่ไหน แต่ฟุตบอลโลกก็ยังเป็นมหกรรมกีฬาอันดับหนึ่งของมวลมนุษยชาติ",
        "sentiment": "Positive",
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

print("Seeding World Cup news complete.")
