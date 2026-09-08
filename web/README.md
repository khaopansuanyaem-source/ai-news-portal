# 🛡️ CyberInsight AI — Next.js Intelligence Portal

> แพลตฟอร์มรวบรวม วิเคราะห์ และสรุปข่าวกรองภัยคุกคามไซเบอร์และเทคโนโลยีสารสนเทศอัตโนมัติด้วย AI พร้อมระบบส่งแจ้งเตือนผ่าน LINE Official Account และ 3D Interactive Virtual Assistant

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- **📰 Real-Time News & Threat Intelligence**:
  - ดึงข่าวอัตโนมัติจาก RSS แหล่งข่าวไอทีชั้นนำ (Blognone, TechTalkThai)
  - กรองข่าวสารและจัดหมวดหมู่ (Ransomware, Zero-Day, AI & Tech)
  - ระบบค้นหาแบบเรียลไทม์ และระบบบันทึกข่าวโปรด (Favorites)
- **🎯 AI Threat & Significance Assessment**:
  - ประเมินคะแนนความเสี่ยงและความรุนแรงของภัยคุกคาม (Danger Score Matrix)
  - แยกมิติวิเคราะห์: Threat Severity, Data Impact, System Impact, Scope, Exploitability, Urgency
- **🤖 3D Interactive Virtual Assistant (น้องไซ - Sai)**:
  - โมเดล 3D Avatar (Three.js + VRM) ขยับปากตามเสียง (Lip-sync), กะพริบตา และหันตามเคอร์เซอร์
  - ระบบอ่านออกเสียงภาษาไทยหลายระดับ (ElevenLabs → Google Cloud TTS → Fallback)
  - สนทนาถาม-ตอบสรุปข่าวสารด้วยสมองกล Google Gemini 2.5 Flash
- **📲 LINE Official Integration & LIFF**:
  - Morning Brief: ส่ง Flex Message Carousel สรุปข่าวรอบเช้าทุกวันเวลา 05:00 น.
  - ระบบคัดกรองการแจ้งเตือนตามระดับความเสี่ยงที่ผู้ใช้เลือก (ALL, MODERATE, HIGH, CRITICAL)
  - หน้า LINE Front-end Framework (LIFF) ให้ผู้ใช้ปรับแต่งความสนใจได้เองบนมือถือ
- **📊 Admin Analytics Dashboard**:
  - สรุปสถิติบทความข่าว, จำนวนสมาชิก LINE, การกระจายตัวของประเภทภัยคุกคาม, และสถานะการแจ้งเตือน

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนของระบบ | เทคโนโลยีที่เลือกใช้ |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **Styling & UI** | Vanilla CSS + Tailwind CSS v4, Glassmorphism, GSAP Animations |
| **3D Engine** | Three.js, `@pixiv/three-vrm` |
| **AI / LLM** | Google Gemini API (Gemini 2.5 Flash), Google Generative AI SDK |
| **Database** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Messaging & Mobile** | LINE Messaging API (Multicast/Broadcast Flex Messages), LINE LIFF SDK |
| **Voice & Speech** | ElevenLabs API, Google Cloud Text-to-Speech |

---

## ⚙️ การตั้งค่า Environment Variables (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEYS=key1,key2,key3 # Optional: Multi-key rotation

# LINE Official Account
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
NEXT_PUBLIC_LIFF_ID=your-liff-id

# Security & Cron
CRON_SECRET=your-random-cron-secret-token
ADMIN_USER=admin
ADMIN_PASSWORD=your-secure-admin-password
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 💻 การรันโปรเจค (Commands)

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด Development
npm run dev

# ตรวจสอบความถูกต้องของโค้ด (Linting)
npm run lint

# บิลด์สำหรับ Production
npm run build

# สตาร์ท Production Server
npm run start
```
