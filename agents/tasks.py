"""
📋 Task Definitions — กำหนดงานสำหรับแต่ละ Agent (5 ตัว)
Sequential Flow: Fetch → Categorize → Analyze → Check → Edit
"""

from crewai import Task


def create_tech_tasks(fetcher, categorizer, analyst, checker, editor):
    """สร้าง Task 5 ขั้นสำหรับวิเคราะห์ข่าว Tech & AI"""

    task_fetch = Task(
        description=(
            "ใช้เครื่องมือ fetch_general_news ค้นหาข่าวในหัวข้อ 'Technology and AI' หรือ 'เทคโนโลยีและปัญญาประดิษฐ์' "
            "ดึงข่าวล่าสุดที่สำคัญอย่างน้อย 5 ข่าว"
        ),
        expected_output="รายการข่าว Tech & AI ล่าสุด 5-10 ข่าว พร้อมหัวข้อ, แหล่ง, วันที่, ลิงก์",
        agent=fetcher,
    )

    task_categorize = Task(
        description=(
            "จัดหมวดหมู่ข่าวที่ได้มาทั้งหมด:\n"
            "1. กำหนดหมวดหมู่หลัก (AI, Cloud, IoT, Startup, Hardware, Software)\n"
            "2. ให้คะแนนความสำคัญ 1-5 ดาว (⭐):\n"
            "   - 5 ดาว: ข่าวสำคัญระดับโลก\n"
            "   - 4 ดาว: สำคัญระดับประเทศ\n"
            "   - 3 ดาว: น่าสนใจทั่วไป\n"
            "   - 2 ดาว: ข่าวรอง\n"
            "   - 1 ดาว: ข่าวเบาๆ"
        ),
        expected_output="รายการข่าวพร้อมหมวดหมู่และคะแนนดาว 1-5 (ภาษาไทย)",
        agent=categorizer,
        context=[task_fetch],
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
        context=[task_fetch, task_categorize],
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

    return [task_fetch, task_categorize, task_analyze, task_check, task_edit]

def create_cyber_tasks(fetcher, categorizer, analyst, checker, editor):
    """สร้าง Task 5 ขั้นสำหรับวิเคราะห์ข่าว Cybersecurity"""

    task_fetch = Task(
        description=(
            "ใช้เครื่องมือ fetch_cyber_news ดึงข่าวภัยคุกคามไซเบอร์ล่าสุด เช่น Ransomware, Data Breach, Zero-day "
            "ดึงข่าวที่สำคัญที่สุดอย่างน้อย 3 ข่าว"
        ),
        expected_output="รายการข่าว Cybersecurity ล่าสุด พร้อมหัวข้อ, แหล่ง, วันที่, ลิงก์",
        agent=fetcher,
    )

    task_categorize = Task(
        description=(
            "จัดหมวดหมู่ภัยคุกคามที่ได้มา:\n"
            "1. กำหนดประเภท (Ransomware, Data Breach, Zero-day, Phishing, DDoS, Malware, APT)\n"
            "2. ให้คะแนนความรุนแรง 1-5 ดาว (⭐):\n"
            "   - 5 ดาว: Critical — กระทบวงกว้าง เร่งด่วนสุด\n"
            "   - 4 ดาว: High — อันตรายมาก ต้องเฝ้าระวัง\n"
            "   - 3 ดาว: Medium — ระวังแต่ไม่เร่งด่วน\n"
            "   - 2 ดาว: Low — มีผลกระทบน้อย\n"
            "   - 1 ดาว: Informational — รับรู้ไว้"
        ),
        expected_output="รายการข่าวพร้อมประเภทภัยคุกคามและคะแนนดาว 1-5 (ภาษาไทย)",
        agent=categorizer,
        context=[task_fetch],
    )

    task_analyze = Task(
        description=(
            "วิเคราะห์ข่าวภัยคุกคามที่ได้:\n"
            "1. ประเมินความรุนแรงของภัยคุกคาม (Risk Level: Critical, High, Medium, Low)\n"
            "2. ระบุผลกระทบหากองค์กรโดนโจมตี (Impact Assessment)\n"
            "3. วิเคราะห์เทคนิคที่แฮกเกอร์ใช้ (ถ้ามี)"
        ),
        expected_output="บทวิเคราะห์ความเสี่ยงภัยคุกคามไซเบอร์เชิงลึก ระบุ Risk Level และ Impact (ภาษาไทย)",
        agent=analyst,
        context=[task_fetch, task_categorize],
    )

    task_check = Task(
        description="ตรวจสอบแหล่งข่าวว่าน่าเชื่อถือหรือไม่ เป็นข่าวปลอมหรือข่าวเก่าเกินไปหรือไม่",
        expected_output="รายงานตรวจสอบข้อเท็จจริงข่าวภัยคุกคาม + คะแนนความน่าเชื่อถือ",
        agent=checker,
        context=[task_fetch, task_analyze],
    )

    task_edit = Task(
        description=(
            "สรุปข่าวภัยคุกคามเป็น Alert Message สำหรับผู้ดูแลระบบ (Admin/SOC):\n"
            "- หัวข้อแจ้งเตือน + Emoji 🚨🛡️\n"
            "- สรุปเหตุการณ์ช่องโหว่/ภัยคุกคามสั้นๆ 3 ข้อ\n"
            "- ใส่บรรทัดใหม่ชื่อ: 'Risk Level: [Critical/High/Medium/Low]'\n"
            "- เสนอแนะวิธีรับมือ (Recommendation) 2-3 ข้อ เพื่อป้องกันหรือแก้ไข\n"
            "ตอบภาษาไทยให้เข้าใจง่าย ไม่ใช้ศัพท์เทคนิคที่ลึกเกินไปถ้าไม่จำเป็น"
        ),
        expected_output="รายงานแจ้งเตือนภัยคุกคามรูปแบบ Bullet Points ภาษาไทย ต้องระบุ Risk Level และคำแนะนำในการรับมือชัดเจน",
        agent=editor,
        context=[task_analyze, task_check],
    )

    return [task_fetch, task_categorize, task_analyze, task_check, task_edit]
