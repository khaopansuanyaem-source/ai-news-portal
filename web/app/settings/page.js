"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const ALL_CATEGORIES = [
  { id: 'business', label: '📈 ธุรกิจ (Business)' },
  { id: 'tech', label: '💻 เทคโนโลยี (Tech)' },
  { id: 'sports', label: '⚽ กีฬา (Sports)' },
  { id: 'games', label: '🎮 เกม (Games)' },
  { id: 'finance', label: '💰 การเงิน (Finance)' },
  { id: 'politics', label: '⚖️ การเมือง (Politics)' },
  { id: 'entertainment', label: '🎬 บันเทิง (Entertainment)' }
];

export default function Settings() {
  const [lineUserId, setLineUserId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ฟังก์ชันสลับการเลือกหมวดหมู่
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // โหลดข้อมูลเก่าถ้ามี (จำลองโดยใช้ LINE User ID)
  const handleLoadPreferences = async (e) => {
    e.preventDefault();
    if (!lineUserId.trim()) return;
    
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('categories')
        .eq('line_user_id', lineUserId.trim())
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSelectedCategories(data.categories || []);
        setMessage('✅ โหลดข้อมูลสำเร็จ');
      } else {
        setMessage('ℹ️ ไม่พบข้อมูลเก่า สามารถตั้งค่าใหม่ได้เลยครับ');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // บันทึกการตั้งค่าลง Supabase
  const handleSave = async () => {
    if (!lineUserId.trim()) {
      setMessage('⚠️ กรุณากรอก LINE User ID ก่อนบันทึกครับ');
      return;
    }
    
    if (selectedCategories.length === 0) {
      setMessage('⚠️ กรุณาเลือกอย่างน้อย 1 หมวดหมู่ครับ');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      // ใช้ upsert เพื่ออัปเดตหรือเพิ่มใหม่ (ต้องมี constraint ที่ line_user_id)
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { 
            line_user_id: lineUserId.trim(), 
            categories: selectedCategories,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'line_user_id' }
        );

      if (error) throw error;
      setMessage('✅ บันทึกการตั้งค่าสำเร็จ! AI จะหาข่าวตามที่คุณเลือกครับ');
    } catch (err) {
      console.error(err);
      setMessage('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Personalization</h1>
        <p className="page-subtitle">เลือกหมวดหมู่ข่าวที่คุณต้องการให้ AI สรุปส่งให้ในทุกๆ เช้า</p>
      </header>

      <div className="surface-panel" style={{ padding: '32px' }}>
        <div className="form-group">
          <label className="form-label">LINE User ID ของคุณ</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ตัวอย่าง: U7c040bcdd0854f4283c1968233e3aae7" 
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
            />
            <button className="btn-primary" onClick={handleLoadPreferences} disabled={loading}>
              โหลดข้อมูล
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            *ใช้สำหรับยืนยันตัวตนว่าข่าวนี้จะส่งไปที่แชทของคุณคนเดียว
          </p>
        </div>

        <div className="form-group" style={{ marginTop: '40px' }}>
          <label className="form-label">ความสนใจของคุณ (เลือกได้มากกว่า 1 หมวด)</label>
          <div className="category-grid">
            {ALL_CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                className={`category-pill ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', 
                        backgroundColor: message.includes('✅') ? '#e6f4ea' : (message.includes('❌') ? '#fce8e6' : '#f8f9fa'),
                        color: message.includes('✅') ? '#137333' : (message.includes('❌') ? '#c5221f' : '#3c4043') }}>
            {message}
          </div>
        )}

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'กำลังประมวลผล...' : 'บันทึกการตั้งค่า (Save Preferences)'}
        </button>
      </div>
    </div>
  );
}
