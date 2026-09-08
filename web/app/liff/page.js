"use client";

import { useEffect, useState } from 'react';
import liff from '@line/liff';

const AVAILABLE_CATEGORIES = [
  { id: 'tech', label: '💻 ข่าวเทคโนโลยี (Tech)' },
  { id: 'cyber', label: '🛡️ ความปลอดภัยไซเบอร์ (Cybersecurity)' }
];

const ALERT_LEVELS = [
  { id: 'ALL', label: '🟢 รับแจ้งเตือนข่าวทั้งหมด' },
  { id: 'MODERATE', label: '🟡 รับเฉพาะข่าวมีความเสี่ยงขึ้นไป (Moderate+)' },
  { id: 'HIGH', label: '🟠 รับเฉพาะข่าวความเสี่ยงสูง (High+)' },
  { id: 'CRITICAL', label: '🔴 รับเฉพาะข่าวฉุกเฉิน (Critical)' }
];

export default function LiffPreferencesPage() {
  const [profile, setProfile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [alertLevel, setAlertLevel] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize LIFF
    const initializeLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2010531662-Vw7creFG';
        if (!liffId) {
          throw new Error("Missing NEXT_PUBLIC_LIFF_ID environment variable.");
        }

        await liff.init({ liffId });

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
          
          try {
            const res = await fetch(`/api/user/preferences?userId=${userProfile.userId}`);
            if (res.ok) {
              const { data } = await res.json();
              if (data) {
                if (data.categories) setSelectedCategories(data.categories);
                if (data.alert_level) setAlertLevel(data.alert_level);
              }
            }
          } catch (e) {
            console.error('Failed to fetch existing preferences', e);
          }
        } else {
          // If running in LINE app, this shouldn't happen. In external browser, redirect to login
          liff.login();
        }
      } catch (err) {
        console.error('LIFF init failed', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeLiff();
  }, []);

  const handleCheckboxChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: profile.userId,
          categories: selectedCategories,
          alert_level: alertLevel
        })
      });

      if (!response.ok) {
        throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      }

      // Success, close the LIFF window
      liff.closeWindow();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4 shadow-inner">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">เลือกหมวดหมู่ที่ใช่</h1>
          <p className="text-gray-500 text-sm">ให้บอท AI คัดกรองข่าวที่ตรงใจคุณมากที่สุด</p>
        </div>

        {profile && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100/50">
             {profile.pictureUrl ? (
               <img src={profile.pictureUrl} alt={profile.displayName} className="w-10 h-10 rounded-full shadow-sm" />
             ) : (
               <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">👤</div>
             )}
             <div>
               <p className="text-xs text-indigo-500 font-medium">บัญชีของคุณ</p>
               <p className="text-sm font-semibold text-gray-800">{profile.displayName}</p>
             </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {AVAILABLE_CATEGORIES.map(category => (
            <label 
              key={category.id} 
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedCategories.includes(category.id) 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100' 
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <span className={`text-base font-medium ${selectedCategories.includes(category.id) ? 'text-indigo-900' : 'text-gray-700'}`}>
                {category.label}
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                selectedCategories.includes(category.id) ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                {selectedCategories.includes(category.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCheckboxChange(category.id)}
              />
            </label>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-800 mb-3">⚠️ ระดับการแจ้งเตือนภัยคุกคาม</h2>
          <div className="space-y-2">
            {ALERT_LEVELS.map(level => (
              <label 
                key={level.id}
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  alertLevel === level.id 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="alertLevel" 
                  value={level.id} 
                  checked={alertLevel === level.id} 
                  onChange={(e) => setAlertLevel(e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
            ${saving 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200/50 hover:-translate-y-0.5'
            }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            'บันทึกและเริ่มใช้งาน 🚀'
          )}
        </button>

      </div>
    </div>
  );
}
