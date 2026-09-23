"use client";
import React from 'react';
import Link from 'next/link';
import './pricing.css';

export default function PricingPage() {
  return (
    <div className="pricing-container">
      <div className="pricing-cards">
        
        {/* FREE TIER */}
        <div className="pricing-card">
          <div className="pricing-tier-name">CyberInsight AI FREE</div>
          <h2 className="pricing-title">ลองใช้ CyberInsight AI</h2>
          <p className="pricing-desc">
            เพื่อดูว่า CyberInsight AI ช่วยคุณในเรื่องข่าวสารเกี่ยวกับ Cyber Security และ Technology มากแค่ไหน
          </p>
          <div className="pricing-price">0 บาท / เดือน</div>
          <button className="pricing-btn pricing-btn-gray">แพ็กเกจปัจจุบันของคุณ</button>
          
          <div className="pricing-features">
            <div className="pricing-feature-item">
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>!</span>
              <span>ระบบแจ้งเตือนผ่าน LINE OA</span>
            </div>
            <div className="pricing-feature-item">
              <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a5 5 0 0 1 5 5v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a5 5 0 0 1 5-5h1V5.73A2 2 0 1 1 12 2zm-3 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
              </svg>
              <span>ผู้ช่วยสรุปข่าว</span>
            </div>
          </div>
        </div>

        {/* PLUS TIER */}
        <div className="pricing-card plus">
          <div className="pricing-tier-name">CyberInsight AI Plus</div>
          <h2 className="pricing-title">ผู้ช่วยอ่านข่าวของคุณ</h2>
          <p className="pricing-desc pricing-plus-desc">
            ปลดล็อกการอ่านข่าวของคุณ ด้วยระบบการคัดกรองข่าว แยกประเภท ประเมินวัดระดับความเสี่ยงและผลกระทบของข่าว
          </p>
          <div className="pricing-price">199 บาท / เดือน</div>
          <Link href="/pricing/checkout" style={{ width: '100%', textDecoration: 'none' }}>
            <button className="pricing-btn pricing-btn-white">สมัครแพ็กเกจ Plus</button>
          </Link>
          
          <div className="pricing-features">
            <div className="pricing-feature-item">
              <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm9 11a1 1 0 0 1-2 0c0-2.76-2.69-5-7-5s-7 2.24-7 5a1 1 0 0 1-2 0c0-3.87 3.58-7 9-7s9 3.13 9 7z"/>
              </svg>
              <span>AI ผู้ช่วยอ่านข่าวและเสนอแนวทางในการแก้ปัญหา</span>
            </div>
            <div className="pricing-feature-item">
              <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>ระบบแยกประเภทข่าวสาร</span>
            </div>
            <div className="pricing-feature-item">
              <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 19h14v2H3v-2h2zm2-8h2v6H7v-6zm4-5h2v11h-2V6zm4 3h2v8h-2V9z"/>
              </svg>
              <span>ระบบประเมินความเสี่ยงและผลกระทบ</span>
            </div>
            <div className="pricing-feature-item">
              <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <span>ระบบค้นหาข่าว</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
