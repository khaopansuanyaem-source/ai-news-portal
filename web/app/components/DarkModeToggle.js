'use client';
// 🌙 Dark Mode Toggle — Hacker Terminal Style
// บันทึกค่าใน localStorage เพื่อจำ theme เมื่อ reload หน้า

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false);

    // โหลดค่าจาก localStorage เมื่อ Mount
    useEffect(() => {
        const saved = localStorage.getItem('cyberinsight-theme');
        if (saved === 'dark') {
            setIsDark(true);
            document.body.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('cyberinsight-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('cyberinsight-theme', 'light');
        }
    };

    return (
        <button
            id="dark-mode-toggle"
            onClick={toggle}
            aria-label={isDark ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด (Hacker Mode)'}
            title={isDark ? 'Light Mode' : 'Dark Mode 🖥️'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isDark
                    ? 'rgba(0, 255, 136, 0.1)'
                    : 'rgba(10, 25, 47, 0.06)',
                border: isDark
                    ? '1px solid rgba(0, 255, 136, 0.4)'
                    : '1px solid rgba(10, 25, 47, 0.15)',
                borderRadius: '20px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#00ff88' : '#0a192f',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}
        >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>
                {isDark ? '☀️' : '🌙'}
            </span>
            <span style={{ display: 'none' }} className="dark-toggle-label">
                {isDark ? 'Light' : 'Dark'}
            </span>
        </button>
    );
}
