'use client';
import { useState, useEffect } from 'react';

interface Props {
  isAr: boolean;
  banner: any;
  setBanner: (b: any) => void;
  onSaveBanner: (e: React.FormEvent) => void;
  brands: any[];      // قائمة البراندات المسجلة
  products: any[];    // قائمة المنتجات المسجلة في المتجر
}

export default function BannerManager({ isAr, banner, setBanner, onSaveBanner, brands = [], products = [] }: Props) {
  
  // جلب بيانات البانر الحالي من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/banner/weekly`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setBanner(data);
          }
        }
      } catch (err) {
        console.warn('Using local banner state fallback');
      }
    };
    fetchBannerData();
  }, [setBanner]);

  // رفع صورة خلفية البانر من الجهاز
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBanner({ ...banner, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  // رفع فيديو البراند من الجهاز
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBanner({ ...banner, videoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  // دالة الحفظ المحدثة لترسل التعديلات لقاعدة البيانات عبر الـ API
  const handleSaveWithApi = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/banner/weekly`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner)
      });

      if (!res.ok) {
        throw new Error('Failed to save banner to server');
      }
    } catch (err) {
      console.warn('Server save failed, relying on local handler');
    }

    // استدعاء دالة الحفظ الأصلية لتحديث الواجهة والتخزين المحلي
    onSaveBanner(e);
  };

  // تصفية المنتجات التابعة للبراند المختار حالياً
  const selectedBrandName = banner.brandNameEn || brands[0]?.nameEn || '';
  const brandProducts = products.filter((p: any) => 
    String(p.brand || '').toLowerCase() === String(selectedBrandName).toLowerCase()
  );

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #DAD8D2',
    outline: 'none',
    fontSize: '0.95rem',
    backgroundColor: '#FFFFFF',
    color: '#20232B',
    textAlign: (isAr ? 'right' : 'left') as 'right' | 'left'
  };

  return (
    <form onSubmit={handleSaveWithApi} style={{ maxWidth: '800px', backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '20px', border: '1px solid #DAD8D2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>
        {isAr ? '✨ إدارة براند الأسبوع والبانر التفاعلي' : '✨ Weekly Brand & Banner Manager'}
      </h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 0 }}>
        {isAr ? 'اختر البراند، ارفع الفيديو والصورة، وحدد المنتجات بكل سهولة.' : 'Select brand, upload video/image, and pick products.'}
      </p>

      {/* اختيار البراند من القائمة المسجلة */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
          {isAr ? 'اختر البراند (Brand of the Week):' : 'Select Weekly Brand:'}
        </label>
        <select
          value={banner.brandNameEn || ''}
          onChange={(e) => {
            const found = brands.find((b: any) => b.nameEn === e.target.value);
            if (found) {
              setBanner({
                ...banner,
                brandNameEn: found.nameEn,
                brandNameAr: found.nameAr,
                productId1: '',
                productId2: ''
              });
            }
          }}
          style={{ ...inputStyle, fontWeight: '700', cursor: 'pointer' }}
        >
          <option value="" disabled>{isAr ? '-- اختر براند من القائمة --' : '-- Select a brand --'}</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.nameEn}>
              {isAr ? b.nameAr : b.nameEn}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'عنوان البانر (بالإنجليزية)' : 'Banner Headline (EN)'}</label>
          <input type="text" required value={banner.titleEn || ''} onChange={(e) => setBanner({ ...banner, titleEn: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'عنوان البانر (بالعربية)' : 'Banner Headline (AR)'}</label>
          <input type="text" required value={banner.titleAr || ''} onChange={(e) => setBanner({ ...banner, titleAr: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'النص الفرعي (بالإنجليزية)' : 'Subtitle (EN)'}</label>
          <input type="text" value={banner.subtitleEn || ''} onChange={(e) => setBanner({ ...banner, subtitleEn: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'النص الفرعي (بالعربية)' : 'Subtitle (AR)'}</label>
          <input type="text" value={banner.subtitleAr || ''} onChange={(e) => setBanner({ ...banner, subtitleAr: e.target.value })} style={inputStyle} />
        </div>
      </div>

      {/* قصة البراند */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>{isAr ? '📖 قصة البراند (Brand Story)' : '📖 Brand Story'}</label>
        <textarea rows={3} value={banner.story || ''} onChange={(e) => setBanner({ ...banner, story: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder={isAr ? 'اكتب قصة ملهمة عن البراند...' : 'Write inspiring brand story...'} />
      </div>

      {/* رفع فيديو البراند من الجهاز */}
      <div style={{ border: '2px dashed #DAD8D2', borderRadius: '14px', padding: '20px', textAlign: 'center', backgroundColor: '#FAF9F6' }}>
        <label style={{ cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', color: '#20232B', display: 'block' }}>
          {isAr ? '🎥 رفع فيديو البراند من الجهاز (MP4)' : '🎥 Upload Brand Video from Device (MP4)'}
          <input type="file" accept="video/mp4,video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
        </label>
        {banner.videoUrl && (
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#059669', fontWeight: '800' }}>
            ✓ {isAr ? 'تم رفع الفيديو بنجاح' : 'Video uploaded successfully'}
          </div>
        )}
      </div>

      {/* اختيار منتجات البراند من القائمة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
            {isAr ? 'المنتج الأول للبراند' : 'Featured Product 1'}
          </label>
          <select
            value={banner.productId1 || ''}
            onChange={(e) => setBanner({ ...banner, productId1: e.target.value })}
            style={inputStyle}
          >
            <option value="">{isAr ? '-- اختر منتج --' : '-- Select Product --'}</option>
            {brandProducts.map((p: any) => (
              <option key={p.id} value={p.id}>
                {isAr ? (p.nameAr || p.title?.AR) : (p.nameEn || p.title?.EN)} ({p.price} ج.م)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
            {isAr ? 'المنتج الثاني للبراند' : 'Featured Product 2'}
          </label>
          <select
            value={banner.productId2 || ''}
            onChange={(e) => setBanner({ ...banner, productId2: e.target.value })}
            style={inputStyle}
          >
            <option value="">{isAr ? '-- اختر منتج --' : '-- Select Product --'}</option>
            {brandProducts.map((p: any) => (
              <option key={p.id} value={p.id}>
                {isAr ? (p.nameAr || p.title?.AR) : (p.nameEn || p.title?.EN)} ({p.price} ج.م)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* رفع صورة خلفية البانر */}
      <div style={{ border: '2px dashed #DAD8D2', borderRadius: '14px', padding: '20px', textAlign: 'center', backgroundColor: '#FAF9F6' }}>
        <label style={{ cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', color: '#20232B', display: 'block' }}>
          {isAr ? '🖼️ رفع خلفية وبانر البراند من الجهاز' : '🖼️ Upload Brand Banner Image'}
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
        {banner.image && (
          <img src={banner.image} alt="Banner Preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', marginTop: '14px' }} />
        )}
      </div>

      <button type="submit" style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '15px', borderRadius: '25px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
        {isAr ? 'حفظ وتحديث بانر وبراند الأسبوع 🚀' : 'Save & Update Weekly Brand Banner 🚀'}
      </button>
    </form>
  );
}