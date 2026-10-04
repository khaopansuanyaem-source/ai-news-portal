"""
🖥️ OS / Platform Classification Engine
ระบบจำแนกระบบปฏิบัติการจากเนื้อหาข่าว — Multi-label, Evidence-based

ใช้ rule-based keyword matching เพื่อ:
1. ตรวจจับ OS/Platform จาก title + summary + content
2. แยก category (Desktop, Mobile, Server, IoT, ...)
3. ดึง version ที่ระบุในข่าว
4. คำนวณ confidence score
5. เก็บ evidence (ข้อความต้นทางที่ใช้จำแนก)

ออกแบบให้เพิ่ม OS ใหม่ได้ง่าย — แค่เพิ่ม entry ใน OS_TAXONOMY
"""

import re
from typing import Optional


# ══════════════════════════════════════════════════════════
# 📚 OS TAXONOMY — Extensible Classification Registry
# เพิ่ม OS ใหม่ได้โดยไม่ต้องแก้ logic หลัก
# ══════════════════════════════════════════════════════════

OS_TAXONOMY = {
    # ─── Desktop / Laptop ───
    "Windows": {
        "category": "Desktop/Laptop",
        "keywords": ["windows 10", "windows 11", "windows desktop", "microsoft windows", "win10", "win11"],
        "version_patterns": [r"windows\s*(1[01])\b", r"windows\s*(xp|vista|7|8|8\.1)\b", r"win(1[01])\b"],
        "icon": "🪟",
    },
    "macOS": {
        "category": "Desktop/Laptop",
        "keywords": ["macos", "mac os", "os x", "osx", "macbook", "imac", "mac mini", "mac pro", "mac studio", "apple mac"],
        "version_patterns": [r"macos\s*(sonoma|ventura|monterey|big sur|catalina|sequoia|tahoe)", r"macos\s*(\d+(?:\.\d+)*)"],
        "icon": "🍎",
    },
    "Linux": {
        "category": "Desktop/Laptop",
        "keywords": ["linux desktop", "linux kernel", "linux systems", "gnu/linux", "linux-based"],
        "version_patterns": [r"linux\s*kernel\s*(\d+\.\d+(?:\.\d+)?)", r"linux\s*(\d+\.\d+)"],
        "icon": "🐧",
    },
    "ChromeOS": {
        "category": "Desktop/Laptop",
        "keywords": ["chromeos", "chrome os", "chromebook", "chromebox"],
        "version_patterns": [r"chrome\s*os\s*(\d+)"],
        "icon": "💻",
    },

    # ─── Mobile ───
    "Android": {
        "category": "Mobile",
        "keywords": ["android phone", "android mobile", "android smartphone", "android device", "google android"],
        "version_patterns": [r"android\s*(\d+(?:\.\d+)?)", r"android\s*(pie|oreo|nougat|marshmallow|lollipop|kitkat)"],
        "icon": "🤖",
    },
    "iOS": {
        "category": "Mobile",
        "keywords": ["ios", "iphone", "apple ios"],
        "version_patterns": [r"ios\s*(\d+(?:\.\d+)*)", r"iphone\s*os\s*(\d+)"],
        "icon": "📱",
    },

    # ─── Tablet ───
    "iPadOS": {
        "category": "Tablet",
        "keywords": ["ipados", "ipad os", "ipad"],
        "version_patterns": [r"ipados\s*(\d+(?:\.\d+)*)"],
        "icon": "📱",
    },

    # ─── Server ───
    "Windows Server": {
        "category": "Server",
        "keywords": ["windows server", "win server", "microsoft server"],
        "version_patterns": [r"windows\s*server\s*(\d{4}(?:\s*r2)?)", r"server\s*(2016|2019|2022|2025)"],
        "icon": "🖥️",
    },
    "Linux Server": {
        "category": "Server",
        "keywords": ["linux server", "linux vps", "linux hosting"],
        "version_patterns": [],
        "icon": "🐧",
    },
    "Unix": {
        "category": "Server",
        "keywords": ["unix", "solaris", "hp-ux", "aix"],
        "version_patterns": [],
        "icon": "🖥️",
    },
    "BSD": {
        "category": "Server",
        "keywords": ["freebsd", "openbsd", "netbsd", "bsd"],
        "version_patterns": [r"freebsd\s*(\d+(?:\.\d+)?)", r"openbsd\s*(\d+\.\d+)"],
        "icon": "😈",
    },

    # ─── Linux Distributions ───
    "Ubuntu": {
        "category": "Linux Distribution",
        "keywords": ["ubuntu"],
        "version_patterns": [r"ubuntu\s*(\d+\.\d+(?:\.\d+)?)", r"ubuntu\s*(noble|jammy|focal|bionic|lunar|mantic)"],
        "icon": "🟠",
    },
    "Debian": {
        "category": "Linux Distribution",
        "keywords": ["debian"],
        "version_patterns": [r"debian\s*(\d+(?:\.\d+)?)", r"debian\s*(bookworm|bullseye|buster|trixie)"],
        "icon": "🔴",
    },
    "Fedora": {
        "category": "Linux Distribution",
        "keywords": ["fedora"],
        "version_patterns": [r"fedora\s*(\d+)"],
        "icon": "🔵",
    },
    "Red Hat Enterprise Linux (RHEL)": {
        "category": "Linux Distribution",
        "keywords": ["rhel", "red hat enterprise", "redhat enterprise", "red hat linux"],
        "version_patterns": [r"rhel\s*(\d+(?:\.\d+)?)", r"red\s*hat\s*(?:enterprise\s*linux\s*)?(\d+)"],
        "icon": "🎩",
    },
    "CentOS": {
        "category": "Linux Distribution",
        "keywords": ["centos", "cent os"],
        "version_patterns": [r"centos\s*(?:stream\s*)?(\d+)"],
        "icon": "🟢",
    },
    "Rocky Linux": {
        "category": "Linux Distribution",
        "keywords": ["rocky linux", "rockylinux"],
        "version_patterns": [r"rocky\s*(?:linux\s*)?(\d+(?:\.\d+)?)"],
        "icon": "🪨",
    },
    "AlmaLinux": {
        "category": "Linux Distribution",
        "keywords": ["almalinux", "alma linux"],
        "version_patterns": [r"alma\s*linux\s*(\d+(?:\.\d+)?)"],
        "icon": "🟣",
    },
    "Amazon Linux": {
        "category": "Linux Distribution",
        "keywords": ["amazon linux", "amzn linux", "al2023", "al2"],
        "version_patterns": [r"amazon\s*linux\s*(\d+(?:\.\d+)?)", r"al(\d+)"],
        "icon": "🟡",
    },
    "Kali Linux": {
        "category": "Linux Distribution",
        "keywords": ["kali linux", "kali"],
        "version_patterns": [r"kali\s*(?:linux\s*)?(\d+\.\d+)"],
        "icon": "🐉",
    },
    "Arch Linux": {
        "category": "Linux Distribution",
        "keywords": ["arch linux", "archlinux", "arch-based", "manjaro"],
        "version_patterns": [],
        "icon": "🏗️",
    },
    "SUSE Linux Enterprise (SLES)": {
        "category": "Linux Distribution",
        "keywords": ["sles", "suse linux enterprise", "suse enterprise"],
        "version_patterns": [r"sles\s*(\d+(?:\s*sp\d+)?)", r"suse\s*(?:linux\s*)?enterprise\s*(\d+)"],
        "icon": "🦎",
    },
    "openSUSE": {
        "category": "Linux Distribution",
        "keywords": ["opensuse", "open suse"],
        "version_patterns": [r"opensuse\s*(leap|tumbleweed)?\s*(\d+(?:\.\d+)?)"],
        "icon": "🦎",
    },

    # ─── Smart TV / TV Platform ───
    "Android TV": {
        "category": "Smart TV",
        "keywords": ["android tv", "google tv"],
        "version_patterns": [r"android\s*tv\s*(\d+)"],
        "icon": "📺",
    },
    "Google TV": {
        "category": "Smart TV",
        "keywords": ["google tv"],
        "version_patterns": [],
        "icon": "📺",
    },
    "tvOS": {
        "category": "Smart TV",
        "keywords": ["tvos", "apple tv"],
        "version_patterns": [r"tvos\s*(\d+(?:\.\d+)?)"],
        "icon": "📺",
    },
    "Tizen": {
        "category": "Smart TV",
        "keywords": ["tizen", "samsung tv", "samsung smart tv"],
        "version_patterns": [r"tizen\s*(\d+(?:\.\d+)?)"],
        "icon": "📺",
    },
    "webOS": {
        "category": "Smart TV",
        "keywords": ["webos", "lg tv", "lg smart tv"],
        "version_patterns": [r"webos\s*(\d+(?:\.\d+)?)"],
        "icon": "📺",
    },
    "Roku OS": {
        "category": "Smart TV",
        "keywords": ["roku", "roku os"],
        "version_patterns": [r"roku\s*os\s*(\d+)"],
        "icon": "📺",
    },

    # ─── Wearable ───
    "watchOS": {
        "category": "Wearable",
        "keywords": ["watchos", "apple watch"],
        "version_patterns": [r"watchos\s*(\d+(?:\.\d+)?)"],
        "icon": "⌚",
    },
    "Wear OS": {
        "category": "Wearable",
        "keywords": ["wear os", "wearos", "android wear", "google wear"],
        "version_patterns": [r"wear\s*os\s*(\d+(?:\.\d+)?)"],
        "icon": "⌚",
    },

    # ─── Gaming ───
    "SteamOS": {
        "category": "Gaming",
        "keywords": ["steamos", "steam os", "steam deck"],
        "version_patterns": [r"steamos\s*(\d+(?:\.\d+)?)"],
        "icon": "🎮",
    },
    "PlayStation OS": {
        "category": "Gaming",
        "keywords": ["playstation", "ps4", "ps5", "psn", "playstation network"],
        "version_patterns": [r"ps(\d)", r"playstation\s*(\d)"],
        "icon": "🎮",
    },
    "Xbox OS": {
        "category": "Gaming",
        "keywords": ["xbox", "xbox one", "xbox series"],
        "version_patterns": [r"xbox\s*(one|series\s*[xs]|360)"],
        "icon": "🎮",
    },
    "Nintendo Switch OS": {
        "category": "Gaming",
        "keywords": ["nintendo switch", "switch firmware", "nintendo"],
        "version_patterns": [],
        "icon": "🎮",
    },

    # ─── Network / IoT / Embedded ───
    "OpenWrt": {
        "category": "IoT/Embedded",
        "keywords": ["openwrt", "open wrt", "lede"],
        "version_patterns": [r"openwrt\s*(\d+(?:\.\d+)*)"],
        "icon": "🌐",
    },
    "Embedded Linux": {
        "category": "IoT/Embedded",
        "keywords": ["embedded linux", "busybox", "yocto", "buildroot"],
        "version_patterns": [],
        "icon": "🔌",
    },
    "FreeRTOS": {
        "category": "IoT/Embedded",
        "keywords": ["freertos", "free rtos", "aws iot rtos"],
        "version_patterns": [r"freertos\s*(\d+(?:\.\d+)*)"],
        "icon": "🔌",
    },

    # ─── Automotive ───
    "Android Automotive OS": {
        "category": "Automotive",
        "keywords": ["android automotive", "aaos", "android auto"],
        "version_patterns": [r"android\s*automotive\s*(\d+)"],
        "icon": "🚗",
    },
    "Automotive Linux": {
        "category": "Automotive",
        "keywords": ["automotive linux", "automotive grade linux", "agl"],
        "version_patterns": [],
        "icon": "🚗",
    },
}

# ══════════════════════════════════════════════════════════
# 🔍 CORE CLASSIFICATION LOGIC
# ══════════════════════════════════════════════════════════


def _extract_context(text: str, keyword: str, window: int = 120) -> str:
    """ดึงข้อความรอบๆ keyword เพื่อใช้เป็น evidence"""
    idx = text.lower().find(keyword.lower())
    if idx == -1:
        return ""
    start = max(0, idx - window // 2)
    end = min(len(text), idx + len(keyword) + window // 2)
    snippet = text[start:end].strip()
    # ตัดให้ลงท้ายที่ประโยค ถ้าเป็นไปได้
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."
    return snippet


def _extract_versions(text: str, patterns: list[str]) -> list[str]:
    """ดึงเวอร์ชันจากข้อความโดยใช้ regex patterns"""
    versions = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            ver = m if isinstance(m, str) else m[0] if isinstance(m, tuple) else str(m)
            ver = ver.strip()
            if ver and ver not in versions:
                versions.append(ver)
    return versions


def _calculate_confidence(
    title_match: bool,
    content_match: bool,
    keyword_count: int,
    has_version: bool,
) -> float:
    """คำนวณความมั่นใจในการจำแนก OS
    - เจอใน title → confidence สูง
    - เจอหลายที่ → confidence สูงขึ้น
    - มี version ระบุ → confidence สูงขึ้น
    """
    score = 0.0

    if title_match:
        score += 0.55  # เจอใน title = หลักฐานแข็ง
    if content_match:
        score += 0.25  # เจอใน content

    # keyword ยิ่งเจอมาก ยิ่งมั่นใจ
    score += min(keyword_count * 0.05, 0.15)

    if has_version:
        score += 0.05  # มี version = ข้อมูลเฉพาะเจาะจง

    return round(min(score, 0.99), 2)


def classify_os(
    title: str = "",
    summary: str = "",
    content: str = "",
    source: str = "",
) -> dict:
    """
    จำแนก OS/Platform จากข้อมูลข่าว — Multi-label, Evidence-based

    Returns:
        {
            "os_classifications": [
                {
                    "os_name": "Windows",
                    "os_category": "Desktop/Laptop",
                    "os_version": "Windows 11",
                    "affected_versions": ["22H2", "23H2"],
                    "affected_platform": "PC",
                    "confidence_score": 0.97,
                    "evidence": "Microsoft Windows 11 systems are affected...",
                    "icon": "🪟"
                }
            ],
            "primary_os": "Windows",
            "primary_category": "Desktop/Laptop",
            "os_names": ["Windows"],
            "os_categories": ["Desktop/Laptop"],
            "has_os_info": True
        }
    """
    title_lower = (title or "").lower()
    summary_lower = (summary or "").lower()
    content_lower = (content or "").lower()
    full_text = f"{title_lower} {summary_lower} {content_lower}"
    full_text_raw = f"{title or ''} {summary or ''} {content or ''}"

    classifications = []
    detected_os_names = set()

    # ─── Priority order matters ───
    # Specific OS first (e.g., "Windows Server" before "Windows")
    # Linux distros before generic "Linux"
    priority_order = [
        # Server variants first
        "Windows Server",
        # Linux distros before generic Linux
        "Ubuntu", "Debian", "Fedora", "Red Hat Enterprise Linux (RHEL)",
        "CentOS", "Rocky Linux", "AlmaLinux", "Amazon Linux", "Kali Linux",
        "Arch Linux", "SUSE Linux Enterprise (SLES)", "openSUSE",
        # TV variants before generic Android
        "Android TV", "Google TV",
        # Automotive before generic Android
        "Android Automotive OS", "Automotive Linux",
        # Specific Apple OSes
        "iPadOS", "tvOS", "watchOS",
        # Specific Android variants
        "Wear OS",
        # Gaming
        "SteamOS", "PlayStation OS", "Xbox OS", "Nintendo Switch OS",
        # Smart TV
        "Tizen", "webOS", "Roku OS",
        # IoT/Embedded
        "OpenWrt", "Embedded Linux", "FreeRTOS",
        # Desktop (generic — matched after specific variants)
        "Windows", "macOS", "ChromeOS",
        # Mobile (generic — matched after TV/Auto/Wearable variants)
        "Android", "iOS",
        # Server (generic)
        "Linux Server", "Linux", "Unix", "BSD",
    ]

    for os_name in priority_order:
        if os_name not in OS_TAXONOMY:
            continue

        entry = OS_TAXONOMY[os_name]
        keywords = entry["keywords"]
        version_patterns = entry.get("version_patterns", [])

        # ─── Check for keyword matches ───
        title_match = False
        content_match = False
        keyword_count = 0
        matched_keyword = ""

        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower in title_lower:
                title_match = True
                keyword_count += 1
                if not matched_keyword:
                    matched_keyword = kw
            if kw_lower in summary_lower or kw_lower in content_lower:
                content_match = True
                keyword_count += 1
                if not matched_keyword:
                    matched_keyword = kw

        # Also check OS name itself as a keyword
        os_name_lower = os_name.lower()
        # For compound names like "Red Hat Enterprise Linux (RHEL)", check the short form too
        simple_names = [os_name_lower]
        if "(" in os_name:
            # Extract abbreviation from parentheses
            abbrev = os_name.split("(")[-1].replace(")", "").strip().lower()
            simple_names.append(abbrev)

        for sn in simple_names:
            if sn in title_lower:
                title_match = True
                keyword_count += 1
                if not matched_keyword:
                    matched_keyword = sn
            if sn in summary_lower or sn in content_lower:
                content_match = True
                keyword_count += 1
                if not matched_keyword:
                    matched_keyword = sn

        if not title_match and not content_match:
            continue  # ไม่พบ OS นี้ในข่าว

        # ─── Disambiguation: ป้องกันชื่อ OS ที่ซ้ำกัน ───
        # เช่น ถ้าเจอ "Android TV" แล้ว ไม่ควรเพิ่ม "Android" ซ้ำ
        # ยกเว้นถ้า context ชัดเจนว่าพูดถึงทั้งสองแบบ

        # Rule: ถ้า Android TV ถูก detect แล้ว, "android" keyword ต้องเช็คว่ามี
        # context ที่พูดถึง android mobile โดยเฉพาะ
        skip = False
        if os_name == "Android" and "Android TV" in detected_os_names:
            # ต้องมี keyword เฉพาะ mobile
            mobile_keywords = ["android phone", "android mobile", "android smartphone"]
            if not any(mk in full_text for mk in mobile_keywords):
                skip = True
        if os_name == "Android" and "Android Automotive OS" in detected_os_names:
            mobile_keywords = ["android phone", "android mobile", "android smartphone"]
            if not any(mk in full_text for mk in mobile_keywords):
                skip = True
        if os_name == "Linux" and any(n in detected_os_names for n in [
            "Ubuntu", "Debian", "Fedora", "Red Hat Enterprise Linux (RHEL)",
            "CentOS", "Rocky Linux", "AlmaLinux", "Amazon Linux", "Kali Linux",
            "Arch Linux", "SUSE Linux Enterprise (SLES)", "openSUSE",
            "Embedded Linux", "Automotive Linux", "Linux Server",
        ]):
            # ถ้าเจอ distro เฉพาะแล้ว ไม่เพิ่ม generic "Linux"
            # ยกเว้นถ้า text มี "linux" ในบริบทกว้าง เช่น "linux kernel"
            generic_keywords = ["linux kernel", "linux systems", "linux-based"]
            if not any(gk in full_text for gk in generic_keywords):
                skip = True
        if os_name == "Windows" and "Windows Server" in detected_os_names:
            # ถ้าเจอ Windows Server แล้ว ให้เช็คว่ามี desktop windows ด้วยไหม
            desktop_keywords = ["windows 10", "windows 11", "windows desktop", "win10", "win11"]
            if not any(dk in full_text for dk in desktop_keywords):
                skip = True

        if skip:
            continue

        # ─── Extract versions ───
        versions = _extract_versions(full_text_raw, version_patterns)

        # ─── Build version string ───
        os_version = None
        if versions:
            os_version = f"{os_name} {versions[0]}" if versions else None

        # ─── Extract evidence ───
        evidence = _extract_context(full_text_raw, matched_keyword)

        # ─── Calculate confidence ───
        confidence = _calculate_confidence(
            title_match=title_match,
            content_match=content_match,
            keyword_count=keyword_count,
            has_version=bool(versions),
        )

        # ─── Determine affected platform ───
        platform_map = {
            "Desktop/Laptop": "PC/Mac",
            "Mobile": "Smartphone",
            "Tablet": "Tablet",
            "Server": "Server/Cloud",
            "Linux Distribution": "Server/Workstation",
            "Smart TV": "Smart TV",
            "Wearable": "Wearable Device",
            "Gaming": "Gaming Console/PC",
            "IoT/Embedded": "IoT/Embedded Device",
            "Automotive": "Vehicle/Infotainment",
        }
        affected_platform = platform_map.get(entry["category"], "General")

        # ─── Detect vulnerability type from context ───
        vuln_type = None
        vuln_keywords = {
            "remote code execution": "Remote Code Execution (RCE)",
            "rce": "Remote Code Execution (RCE)",
            "privilege escalation": "Privilege Escalation",
            "denial of service": "Denial of Service (DoS)",
            "ddos": "Distributed Denial of Service (DDoS)",
            "buffer overflow": "Buffer Overflow",
            "sql injection": "SQL Injection",
            "cross-site scripting": "Cross-Site Scripting (XSS)",
            "xss": "Cross-Site Scripting (XSS)",
            "zero-day": "Zero-Day",
            "ransomware": "Ransomware",
            "malware": "Malware",
            "phishing": "Phishing",
            "data breach": "Data Breach",
            "information disclosure": "Information Disclosure",
            "authentication bypass": "Authentication Bypass",
        }
        for vk, vt in vuln_keywords.items():
            if vk in full_text:
                vuln_type = vt
                break

        classification = {
            "os_name": os_name,
            "os_category": entry["category"],
            "os_version": os_version,
            "affected_versions": versions if versions else None,
            "vulnerability_type": vuln_type,
            "affected_platform": affected_platform,
            "confidence_score": confidence,
            "evidence": evidence,
            "icon": entry.get("icon", "🖥️"),
        }
        classifications.append(classification)
        detected_os_names.add(os_name)

    # ─── Default: No OS found ───
    if not classifications:
        return {
            "os_classifications": [{
                "os_name": "General / Not Specified",
                "os_category": "General",
                "os_version": None,
                "affected_versions": None,
                "vulnerability_type": None,
                "affected_platform": "General",
                "confidence_score": 1.0,
                "evidence": "ไม่พบข้อมูลระบบปฏิบัติการในเนื้อหาข่าว",
                "icon": "🌐",
            }],
            "primary_os": "General / Not Specified",
            "primary_category": "General",
            "os_names": ["General / Not Specified"],
            "os_categories": ["General"],
            "has_os_info": False,
        }

    # Sort by confidence descending
    classifications.sort(key=lambda x: x["confidence_score"], reverse=True)

    # Unique lists
    os_names = list(dict.fromkeys(c["os_name"] for c in classifications))
    os_categories = list(dict.fromkeys(c["os_category"] for c in classifications))

    return {
        "os_classifications": classifications,
        "primary_os": classifications[0]["os_name"],
        "primary_category": classifications[0]["os_category"],
        "os_names": os_names,
        "os_categories": os_categories,
        "has_os_info": True,
    }


# ══════════════════════════════════════════════════════════
# 🧪 Self-test
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    import json

    tests = [
        {
            "title": "Critical vulnerability affects Windows, macOS and Linux systems",
            "summary": "A new zero-day vulnerability has been discovered affecting multiple operating systems.",
            "content": "",
        },
        {
            "title": "Critical Remote Code Execution Vulnerability Discovered",
            "summary": "",
            "content": "The vulnerability affects Ubuntu 24.04 and Debian 12 systems.",
        },
        {
            "title": "Android Malware Found in Play Store",
            "summary": "New malware targeting Android phones discovered in Google Play Store.",
            "content": "",
        },
        {
            "title": "iPhone Security Vulnerability Allows Remote Access",
            "summary": "Apple iOS 18.1 has a critical security flaw.",
            "content": "",
        },
        {
            "title": "New AI Model Released by OpenAI",
            "summary": "OpenAI has released a new AI model with improved capabilities.",
            "content": "",
        },
        {
            "title": "Windows Server 2022 Patch Tuesday Update",
            "summary": "Microsoft releases security patches for Windows Server 2022 and Windows 11.",
            "content": "",
        },
    ]

    for test in tests:
        result = classify_os(**test)
        print(f"\n{'='*60}")
        print(f"📰 Title: {test['title']}")
        print(f"🖥️ OS: {', '.join(result['os_names'])}")
        print(f"📂 Categories: {', '.join(result['os_categories'])}")
        for c in result['os_classifications']:
            print(f"   → {c['icon']} {c['os_name']} ({c['os_category']}) — confidence: {c['confidence_score']}")
            if c.get('os_version'):
                print(f"     Version: {c['os_version']}")
            if c.get('evidence'):
                print(f"     Evidence: {c['evidence'][:80]}...")
