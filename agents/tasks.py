"""
📋 Task Definitions — กำหนดงานสำหรับแต่ละ Agent
Sequential Flow: Fetch → Analyze → Check → Edit
"""

from crewai import Task


def create_finance_tasks(fetcher, analyst, checker, editor):
    """สร้าง Task สำหรับวิเคราะห์ข่าวการเงิน"""

    task_fetch = Task(
        description=(
            "ดึงข่าวการเงินล่าสุดจาก Google News RSS ทั้งภาษาไทยและอังกฤษ "
            "พร้อมดึงข้อมูลตลาด — ราคาทองคำ, SET Index, USD/THB, S&P500\n"
            "รวบรวมข่าวอย่างน้อย 5 ข่าวที่สำคัญที่สุด"
        ),
        expected_output=(
            "รายการข่าวการเงินล่าสุด 5-10 ข่าว พร้อมหัวข้อ, แหล่ง, วันที่, ลิงก์ "
            "และข้อมูลตลาดการเงินปัจจุบัน"
        ),
        agent=fetcher,
    )

    task_analyze = Task(
        description=(
            "วิเคราะห์ข่าวที่ได้จากฝ่ายรวบรวม:\n"
            "1. ทำ SWOT Analysis ของสถานการณ์ตลาดปัจจุบัน\n"
            "2. ประเมิน Sentiment Score (คะแนนอารมณ์ตลาด 1-100 โดย 1=แย่สุด, 100=ดีสุด) พร้อมระบุแนวโน้ม (Bullish/Bearish/Neutral)\n"
            "3. ระบุผลกระทบต่อนักลงทุนไทย (Impact: High/Medium/Low)\n"
            "4. เชื่อมโยงข่าวกับข้อมูลตัวเลขตลาดจริง\n"
            "5. ให้คำแนะนำเบื้องต้น (ระวัง: ไม่ใช่คำแนะนำลงทุน)"
        ),
        expected_output=(
            "บทวิเคราะห์เชิงลึกพร้อม SWOT, Sentiment Score, Impact Level (High/Medium/Low), "
            "และข้อสังเกตสำคัญสำหรับนักลงทุนไทย ตอบเป็นภาษาไทย"
        ),
        agent=analyst,
        context=[task_fetch],
    )

    task_check = Task(
        description=(
            "ตรวจสอบข้อมูลจากฝ่ายวิเคราะห์:\n"
            "1. ตรวจสอบแหล่งข่าวว่าน่าเชื่อถือหรือไม่\n"
            "2. ตรวจสอบความสดใหม่ของข่าว (ไม่เกิน 48 ชม.)\n"
            "3. ให้คะแนนความน่าเชื่อถือรวม 0-100"
        ),
        expected_output=(
            "รายงานการตรวจสอบ พร้อมคะแนนความน่าเชื่อถือ "
            "และข้อสังเกตที่ควรระวัง"
        ),
        agent=checker,
        context=[task_fetch, task_analyze],
    )

    task_edit = Task(
        description=(
            "สรุปทุกอย่างเป็นบทความพร้อมใช้:\n"
            "1. หัวข้อหลักที่ดึงดูดความสนใจ\n"
            "2. สรุป 3-5 Bullet Points สั้นกระชับ\n"
            "3. ข้อมูลตลาด (ราคาทองคำ, หุ้น, ค่าเงิน)\n"
            "4. SWOT สั้นๆ\n"
            "5. ใส่บรรทัดใหม่ชื่อ: 'Sentiment Score: [ตัวเลข 1-100] ([แนวโน้ม])'\n"
            "6. ใส่บรรทัดใหม่ชื่อ: 'Impact: [High/Medium/Low]'\n"
            "7. คะแนนความน่าเชื่อถือ\n"
            "8. ใส่ Emoji ให้น่าอ่าน\n"
            "ตอบเป็นภาษาไทยทั้งหมด (ยกเว้นชื่อตัวแปร Sentiment/Impact ให้ใช้ภาษาอังกฤษเพื่อการประมวลผลต่อ)"
        ),
        expected_output=(
            "บทความสรุปข่าวการเงินวันนี้ รูปแบบ Bullet Points "
            "พร้อม Emoji ภาษาไทย กระชับอ่านง่าย และต้องมี Sentiment Score / Impact ชัดเจน"
        ),
        agent=editor,
        context=[task_analyze, task_check],
    )

    return [task_fetch, task_analyze, task_check, task_edit]


def create_tech_tasks(fetcher, analyst, checker, editor):
    """สร้าง Task สำหรับวิเคราะห์ข่าว Tech & AI"""

    task_fetch = Task(
        description=(
            "ใช้เครื่องมือ fetch_general_news ค้นหาข่าวในหัวข้อ 'Technology and AI' หรือ 'เทคโนโลยีและปัญญาประดิษฐ์' "
            "ดึงข่าวล่าสุดที่สำคัญอย่างน้อย 5 ข่าว"
        ),
        expected_output="รายการข่าว Tech & AI ล่าสุด 5-10 ข่าว พร้อมหัวข้อ, แหล่ง, วันที่, ลิงก์",
        agent=fetcher,
    )

    task_analyze = Task(
        description=(
            "วิเคราะห์ข่าว Tech & AI:\n"
            "1. สรุปเทรนด์สำคัญทางเทคโนโลยี\n"
            "2. ประเมิน Impact (ผลกระทบ) ต่อยูสเซอร์หรือธุรกิจ\n"
            "3. หากเป็นข่าวเปิดตัวสินค้าใหม่ ให้วิเคราะห์ความน่าสนใจ"
        ),
        expected_output="บทวิเคราะห์ข่าวไอทีเชิงลึก ภาษาไทย",
        agent=analyst,
        context=[task_fetch],
    )

    task_check = Task(
        description="ตรวจสอบแหล่งข่าวไอทีว่าน่าเชื่อถือและข่าวไม่เก่าเกินไป",
        expected_output="รายงานตรวจสอบ + คะแนนความน่าเชื่อถือ",
        agent=checker,
        context=[task_fetch, task_analyze],
    )

    task_edit = Task(
        description=(
            "สรุปข่าว Tech & AI เป็นบทความพร้อมใช้:\n"
            "- หัวข้อดึงดูด + Emoji ล้ำๆ 💻🚀\n"
            "- ไฮไลต์เทคโนโลยี 3-5 ข้อ\n"
            "- ใส่บรรทัดใหม่ชื่อ: 'Impact: [High/Medium/Low]'\n"
            "ตอบภาษาไทย"
        ),
        expected_output="บทความสรุปข่าวไอทีวันนี้ Bullet Points ภาษาไทย และต้องมีระบุ Impact ชัดเจน",
        agent=editor,
        context=[task_analyze, task_check],
    )

    return [task_fetch, task_analyze, task_check, task_edit]


def create_sports_tasks(fetcher, analyst, checker, editor):
    """สร้าง Task สำหรับวิเคราะห์ข่าวกีฬา"""

    task_fetch = Task(
        description=(
            "ดึงข่าวกีฬาล่าสุด โดยเน้น:\n"
            "1. ฟุตบอลโลก 2026 — ผลบอล, ตารางแข่ง\n"
            "2. ข่าวกีฬาทั่วไปที่คนไทยสนใจ"
        ),
        expected_output="รายการข่าวกีฬาล่าสุด พร้อมผลบอลโลก 2026",
        agent=fetcher,
    )

    task_analyze = Task(
        description=(
            "วิเคราะห์ข่าวกีฬา:\n"
            "1. สรุปผลการแข่งขันสำคัญ\n"
            "2. วิเคราะห์ฟอร์มทีม\n"
            "3. ไฮไลต์ที่น่าสนใจ"
        ),
        expected_output="บทวิเคราะห์กีฬาเชิงลึก ภาษาไทย",
        agent=analyst,
        context=[task_fetch],
    )

    task_check = Task(
        description="ตรวจสอบแหล่งข่าวกีฬาและความถูกต้องของผลการแข่งขัน",
        expected_output="รายงานตรวจสอบ + คะแนนความน่าเชื่อถือ",
        agent=checker,
        context=[task_fetch, task_analyze],
    )

    task_edit = Task(
        description=(
            "สรุปข่าวกีฬาเป็นบทความพร้อมใช้:\n"
            "- หัวข้อดึงดูด + Emoji\n"
            "- ผลบอลโลก + ตารางคะแนน\n"
            "- ไฮไลต์สำคัญ 3-5 ข้อ\n"
            "ตอบภาษาไทย"
        ),
        expected_output="บทความสรุปกีฬาวันนี้ Bullet Points ภาษาไทย",
        agent=editor,
        context=[task_analyze, task_check],
    )

    return [task_fetch, task_analyze, task_check, task_edit]
