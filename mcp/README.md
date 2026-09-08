# ✨ AI Content Creator Pipeline

> สร้าง Content อัตโนมัติด้วย Multi-Agent AI — ใช้ MCP Fusion Architecture

## 🧠 Architecture: MCP Fusion Pattern

```
สั่งงาน 1 ครั้ง → AI 5 ตัวทำงานต่อกัน → ได้ Content สำเร็จรูป!

📡 Scout (Research) → 🎯 Angle (Strategy) → ✍️ Pen (Write) → 🛡️ Shield (QA) → 🚀 Boost (Publish)
```

### Agent ทั้ง 5 ตัว:

| # | Agent | หน้าที่ | Tools |
|---|---|---|---|
| 1 | **Scout** | ค้นหา trending topics | `search_trends` |
| 2 | **Angle** | วางแผน content strategy | — |
| 3 | **Pen** | เขียน content | — |
| 4 | **Shield** | ตรวจคุณภาพ + แก้ไข | `check_content_quality` |
| 5 | **Boost** | สร้าง hashtag + จัดรูปแบบ | `generate_hashtags` |

## 🚀 Quick Start

### 1. ตั้งค่า

```bash
cd agents
cp .env.example .env
# แก้ไข .env ใส่ GEMINI_API_KEY
```

### 2. ติดตั้ง

```bash
pip install -r requirements.txt
```

### 3. รัน

```bash
# สร้าง Content สำหรับ Instagram
python main.py --topic "ร้านกาแฟเปิดใหม่ย่านหาดใหญ่" --platform instagram --tone casual

# สร้าง Content สำหรับ Blog แบบมืออาชีพ
python main.py --topic "เทคโนโลยี AI 2026" --platform blog --tone professional

# สร้าง Content สำหรับ TikTok แบบสนุก
python main.py --topic "ลดน้ำหนักง่ายๆ" --platform tiktok --tone fun

# สร้าง Content สำหรับ Twitter แบบทางการ
python main.py --topic "ประกาศเปิดตัวสินค้าใหม่" --platform twitter --tone formal
```

### 4. ตั้งเวลาอัตโนมัติ (Scheduler)

```bash
# สร้าง Content ทุก 60 นาที
python scheduler.py --interval 60 --topic "เทรนด์ AI" --platform instagram --tone casual
```

## 📱 Platforms

| Platform | ลิมิต | Hashtag | Best For |
|---|---|---|---|
| Instagram | 2,200 chars | 15-30 | Visual content, carousel |
| Facebook | 63,206 chars | 1-5 | Long-form, engagement |
| TikTok | 4,000 chars | 3-8 | Short, catchy, hook-first |
| Twitter/X | 280 chars | 1-3 | News, opinions |
| Blog | ∞ | 0-5 | SEO, long articles |

## 🎨 Tones

| Tone | ลักษณะ |
|---|---|
| `casual` | เป็นกันเอง สบายๆ เหมือนคุยกับเพื่อน |
| `professional` | มืออาชีพ น่าเชื่อถือ เหมาะกับแบรนด์ |
| `fun` | สนุกสนาน Emoji เยอะ มีลูกเล่น |
| `formal` | ทางการ เหมาะกับองค์กร |

## 🔌 Optional Integrations

### Supabase (เก็บ Content)
1. สร้าง Project ที่ [supabase.com](https://supabase.com)
2. รัน `supabase_schema.sql` ใน SQL Editor
3. ใส่ `SUPABASE_URL` และ `SUPABASE_KEY` ใน `.env`

### LINE (ส่ง Content เข้า LINE)
1. สร้าง LINE Bot ที่ [developers.line.biz](https://developers.line.biz)
2. ใส่ `LINE_CHANNEL_ACCESS_TOKEN` และ `LINE_USER_ID` ใน `.env`

## 📁 Project Structure

```
mcp/
├── agents/
│   ├── crew.py              ← 5 Agent Personas
│   ├── tasks.py             ← 5 Tasks + Pydantic Output
│   ├── main.py              ← CLI Entry Point
│   ├── scheduler.py         ← Auto-loop Scheduler
│   ├── supabase_client.py   ← Database Client
│   ├── line_sender.py       ← LINE Notification
│   ├── requirements.txt
│   ├── .env.example
│   └── tools/
│       ├── trend_researcher.py    ← ค้นหาเทรนด์
│       ├── content_checker.py     ← ตรวจคุณภาพ
│       └── hashtag_generator.py   ← สร้าง Hashtag
├── output/                        ← ผลลัพธ์ JSON
├── supabase_schema.sql
└── README.md
```

## ⚡ MCP Fusion Features

- ✅ **5 Specialist Agents** — แต่ละตัวเชี่ยวชาญเฉพาะด้าน
- ✅ **Pydantic Output Schema** — บังคับ output format (Guardrails)
- ✅ **Auto-Loop** — สั่งครั้งเดียว AI วิ่งเองจนจบ
- ✅ **3 Custom Tools** — Trend Research, Quality Check, Hashtag Gen
- ✅ **Multi-Platform** — IG, FB, TikTok, Twitter, Blog
- ✅ **Multi-Tone** — casual, professional, fun, formal
- ✅ **Scheduler** — สร้าง Content อัตโนมัติตามเวลา
- ✅ **LINE Integration** — ส่ง Content เข้า LINE ได้
- ✅ **Supabase Storage** — เก็บ Content ลง DB
