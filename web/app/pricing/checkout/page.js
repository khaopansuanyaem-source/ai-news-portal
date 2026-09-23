"use client";
import React from 'react';
import './checkout.css';

export default function CheckoutPage() {
  const handleSubscribe = () => {
    alert("จำลองการสมัครสมาชิกสำเร็จ! (นี่คือหน้า Mockup)");
  };

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        
        {/* Left Column: Payment Input */}
        <div>
          <h1 className="checkout-title">เริ่มใช้ CyberInsight AI Plus</h1>
          
          <div className="payment-section">
            <div className="payment-label">ชำระเงินด้วย</div>
            
            <button className="apple-pay-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
                <path d="M16.3 14.4c-.1-.8.2-1.6.8-2.1.8-.7 1.2-1.6 1-2.6-.2-1.1-1-1.9-2-2.3-1.1-.4-2.2-.2-3.1.3-.4.2-.8.3-1.2.3-.4 0-.8-.1-1.2-.3-.9-.5-2-.7-3.1-.3-1 .4-1.8 1.2-2 2.3-.3 1.5.3 3.1 1.4 4.3 1 1.2 2.2 2 3.5 2.1h.3c.4 0 .9-.2 1.3-.4.4-.2.8-.2 1.2-.2.4 0 .8.1 1.2.2.4.2.9.4 1.3.4h.3c1.3-.1 2.5-.9 3.5-2.1.4-.4.6-.9.8-1.5-.6-.2-1.1-.7-1.1-1.3zM12 7.2c.7 0 1.4-.3 1.9-.8.5-.5.8-1.2.8-1.9 0-.2 0-.4-.1-.5-.7.1-1.4.4-1.9.9-.5.5-.8 1.2-.8 1.9 0 .2 0 .4.1.5z"></path>
              </svg>
              Pay
            </button>
            
            <div className="divider">หรือ</div>
            
            <div className="card-input-container">
              <div className="input-group">
                <input type="text" className="input-field" placeholder="หมายเลขบัตร" />
                <div className="card-icons">
                  <span style={{background:'#1a1f71', color:'white', fontSize:'9px', padding:'2px 4px', borderRadius:'2px', fontWeight:'bold'}}>VISA</span>
                  <span style={{background:'#eb001b', color:'white', fontSize:'9px', padding:'2px 4px', borderRadius:'2px', fontWeight:'bold'}}>Mastercard</span>
                  <span style={{background:'#007bc1', color:'white', fontSize:'9px', padding:'2px 4px', borderRadius:'2px', fontWeight:'bold'}}>AMEX</span>
                </div>
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="วันหมดอายุ" />
                </div>
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="รหัสความปลอดภัย" />
                </div>
              </div>
            </div>
            
            <label className="checkbox-group">
              <input type="checkbox" defaultChecked />
              <span className="checkbox-text">
                บันทึกรายละเอียดการชำระเงินไปยัง CyberInsight เพื่อการซื้อในอนาคต
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-summary-card">
          <h2 className="summary-title">CyberInsight AI Plus</h2>
          
          <div className="summary-section-label">คุณสมบัติ</div>
          
          <div className="summary-features">
            <div className="summary-feature">
              <span>ยกเลิกได้ทุกเมื่อ</span>
            </div>
            <div className="summary-feature">
              <span>เราจะแจ้งเตือนก่อนช่วงทดลองใช้งานจะสิ้นสุดลง</span>
            </div>
            <div className="summary-feature">
              <span>พูดคุยและอัปโหลดได้มากขึ้นอีก</span>
            </div>
            <div className="summary-feature">
              <span>สร้างรูปภาพได้มากขึ้นและเร็วขึ้น</span>
            </div>
            <div className="summary-feature">
              <span>การหาข้อมูลเชิงลึกและโหมดเอเจนต์ที่ฉลาดขึ้นอีก</span>
            </div>
          </div>
          
          <div className="summary-breakdown">
            <div className="summary-row">
              <span>บริการสมาชิก ทุกเดือน</span>
              <span>199.00</span>
            </div>
            <div className="summary-row">
              <span>โปรโมชัน</span>
              <span>0.00</span>
            </div>
            <div className="summary-row">
              <span>ภาษีโดยประมาณ</span>
              <span>0.00</span>
            </div>
            <div className="summary-total">
              <span>ครบกำหนดชำระวันนี้</span>
              <span>199.00</span>
            </div>
          </div>
          
          <button className="subscribe-btn" onClick={handleSubscribe}>
            สมัครสมาชิก
          </button>
          
          <div className="disclaimer-text">
            199.00 บาท / เดือน ราคานี้จะเรียกเก็บเงินทุกเดือนจนกว่าจะยกเลิก
            คุณสามารถยกเลิกได้ทุกเมื่อในการตั้งค่าก่อนช่วงทดลองใช้สิ้นสุดลงเพื่อไม่ให้เกิดค่าใช้จ่าย
            การสมัครสมาชิกหมายความว่าคุณยอมรับข้อตกลงการใช้งาน เงื่อนไขโปรโมชัน
            และข้อตกลงการรับบริการ คุณได้อ่านนโยบายความเป็นส่วนตัวของเราแล้ว
            และอนุญาตให้ CyberInsight จัดเก็บและเรียกเก็บเงินตามวิธีการชำระเงินของคุณ
          </div>
        </div>

      </div>
    </div>
  );
}
