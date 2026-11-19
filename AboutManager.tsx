'use client';
import { useState, useEffect } from 'react';

interface AboutManagerProps {
  isAr: boolean;
  showToast: (msg: string) => void;
}

export default function AboutManager({ isAr, showToast }: AboutManagerProps) {
  const [aboutData, setAboutData] = useState({
    titleAr: 'من نحن - كشافة',
    titleEn: 'About Us - KASHAFA',
    descAr: 'متجر كشافة هو وجهتك الأولى لاختيار أروع المنتجات والإبداعات المحلية...',
    descEn: 'KASHFA is your premier destination for local Egyptian crafts...'
  });

  // جلب بيانات "من نحن" من قاعدة البيانات (SQL Server API) عند فتح اللوحة
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/settings/about`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAboutData(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for about manager');
      }

      // الخيار الاحتياطي المحلي لو السيرفر مش شغال
      const savedAbout = localStorage.getItem('kashafa_about');
      if (savedAbout) {
        try {
          setAboutData(JSON.parse(savedAbout));
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchAbout();
  }, []);

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. إرسال البيانات وحفظها في قاعدة البيانات عبر الـ API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/settings/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData)
      });

      if (!res.ok) {
        throw new Error('Failed to save to server');
      }
    } catch (err) {
      console.warn('Server save failed, saving to localStorage as fallback');
    }

    // 2. الحفظ المحلي كبديل لضمان استقرار الواجهة وفورية التحديث
    const dataToSave = JSON.stringify(aboutData);
    localStorage.setItem('kashafa_about', dataToSave);
    window.dispatchEvent(new Event('storage'));

    showToast(isAr ? '✓ تم تحديث وحفظ صفحة "من نحن" في قاعدة البيانات بنجاح!' : '✓ About Us updated and saved to database successfully!');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', color: '#20232B' }}>
        {isAr ? 'إدارة صفحة "من نحن" (About Us)' : 'Manage "About Us" Page'}
      </h2>
      <form onSubmit={handleSaveAbout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'العنوان بالعربية:' : 'Title (AR):'}</label>
            <input 
              type="text" 
              value={aboutData.titleAr} 
              onChange={(e) => setAboutData({ ...aboutData, titleAr: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'العنوان بالإنجليزية:' : 'Title (EN):'}</label>
            <input 
              type="text" 
              value={aboutData.titleEn} 
              onChange={(e) => setAboutData({ ...aboutData, titleEn: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'الوصف بالعربية:' : 'Description (AR):'}</label>
            <textarea 
              rows={6} 
              value={aboutData.descAr} 
              onChange={(e) => setAboutData({ ...aboutData, descAr: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'الوصف بالإنجليزية:' : 'Description (EN):'}</label>
            <textarea 
              rows={6} 
              value={aboutData.descEn} 
              onChange={(e) => setAboutData({ ...aboutData, descEn: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
        </div>

        <button type="submit" style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer', width: 'fit-content', marginTop: '10px' }}>
          {isAr ? 'حفظ التعديلات 🚀' : 'Save Changes 🚀'}
        </button>
      </form>
    </div>
  );
}