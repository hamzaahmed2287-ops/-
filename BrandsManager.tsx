'use client';
import { useState, useEffect } from 'react';

interface Props {
  isAr: boolean;
  brands: any[];
  onSaveBrands: (updated: any[]) => void;
  showToast: (msg: string) => void;
}

export default function BrandsManager({ isAr, brands, onSaveBrands, showToast }: Props) {
  const [newBrand, setNewBrand] = useState({ nameEn: '', nameAr: '', slug: '', commissionRate: '15', logo: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // تحديد رابط السيرفر ديناميكياً (يدعم الكمبيوتر والموبايل عبر الشبكة المحلية)
  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
  };

  useEffect(() => {
    const fetchBrandsFromApi = async () => {
      const API_BASE_URL = getApiUrl();
      try {
        const res = await fetch(`${API_BASE_URL}/brands`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            onSaveBrands(data);
            localStorage.setItem('kashafa_admin_brands', JSON.stringify(data));
            return;
          }
        }
      } catch (err) {
        console.warn('Using local brands state fallback');
      }

      const savedLocal = localStorage.getItem('kashafa_admin_brands');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onSaveBrands(parsed);
          }
        } catch (e) {}
      }
    };
    fetchBrandsFromApi();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrand(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedBrands = [...brands];

    if (editingId) {
      updatedBrands = brands.map((b) => {
        if (b.id === editingId) {
          return {
            ...b,
            nameEn: newBrand.nameEn,
            nameAr: newBrand.nameAr,
            slug: newBrand.slug || newBrand.nameEn.toLowerCase().replace(/\s+/g, '-'),
            commissionRate: Number(newBrand.commissionRate) || 0,
            logo: newBrand.logo || b.logo
          };
        }
        return b;
      });
      setEditingId(null);
      showToast(isAr ? '✓ تم تعديل البراند بنجاح!' : '✓ Brand updated successfully!');
    } else {
      const created = {
        id: Date.now().toString(),
        nameEn: newBrand.nameEn,
        nameAr: newBrand.nameAr,
        slug: newBrand.slug || newBrand.nameEn.toLowerCase().replace(/\s+/g, '-'),
        commissionRate: Number(newBrand.commissionRate) || 0,
        logo: newBrand.logo || ''
      };
      updatedBrands = [...brands, created];
      showToast(isAr ? '✓ تم إضافة البراند واللوجو بنجاح!' : '✓ Brand & logo added!');
    }

    localStorage.setItem('kashafa_admin_brands', JSON.stringify(updatedBrands));
    window.dispatchEvent(new Event('storage'));

    const API_BASE_URL = getApiUrl();
    try {
      await fetch(`${API_BASE_URL}/brands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBrands)
      });
    } catch (err) {
      console.warn('Server sync failed, saved locally');
    }

    onSaveBrands(updatedBrands);
    setNewBrand({ nameEn: '', nameAr: '', slug: '', commissionRate: '15', logo: '' });
  };

  const handleEditClick = (brand: any) => {
    setEditingId(brand.id);
    setNewBrand({
      nameEn: brand.nameEn || '',
      nameAr: brand.nameAr || '',
      slug: brand.slug || '',
      commissionRate: String(brand.commissionRate || 15),
      logo: brand.logo || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا البراند؟' : 'Are you sure you want to delete this brand?')) {
      const filtered = brands.filter((b) => b.id !== id);
      
      localStorage.setItem('kashafa_admin_brands', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));

      const API_BASE_URL = getApiUrl();
      try {
        await fetch(`${API_BASE_URL}/brands/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Server delete failed, updated locally');
      }

      onSaveBrands(filtered);
      showToast(isAr ? '✓ تم حذف البراند بنجاح!' : '✓ Brand deleted!');
    }
  };

  const handleUpdateCommission = async (id: string, rate: number) => {
    const updated = brands.map((b) => (b.id === id ? { ...b, commissionRate: rate } : b));
    onSaveBrands(updated);
    localStorage.setItem('kashafa_admin_brands', JSON.stringify(updated));
    
    const API_BASE_URL = getApiUrl();
    try {
      await fetch(`${API_BASE_URL}/brands/${id}/commission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate })
      });
    } catch (err) {
      console.warn('Commission sync failed');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #DAD8D2',
    outline: 'none',
    fontSize: '0.95rem',
    backgroundColor: '#FFFFFF',
    color: '#20232B',
    textAlign: (isAr ? 'right' : 'left') as 'right' | 'left',
    boxSizing: 'border-box' as 'border-box'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
      
      {/* فورم الإضافة والتعديل */}
      <form onSubmit={handleAddOrUpdate} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #DAD8D2', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
          {editingId ? (isAr ? 'تعديل بيانات البراند' : 'Edit Brand') : (isAr ? 'إضافة براند مع اللوجو والعمولة' : 'Add Brand with Logo & Commission')}
        </h2>
        
        <input type="text" required placeholder={isAr ? 'اسم البراند (بالإنجليزية)' : 'Brand Name (English)'} value={newBrand.nameEn} onChange={(e) => setNewBrand({ ...newBrand, nameEn: e.target.value })} style={inputStyle} />
        <input type="text" required placeholder={isAr ? 'اسم البراند (بالعربية)' : 'Brand Name (Arabic)'} value={newBrand.nameAr} onChange={(e) => setNewBrand({ ...newBrand, nameAr: e.target.value })} style={inputStyle} />
        <input type="text" placeholder={isAr ? 'الرابط المختصر (مثال: cairo-threads)' : 'URL Slug (e.g., cairo-threads)'} value={newBrand.slug} onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })} style={inputStyle} />

        {/* رفع لوجو البراند */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>
            {isAr ? 'ارفع لوجو البراند من الجهاز:' : 'Upload Brand Logo:'}
          </label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #DAD8D2', backgroundColor: '#FFF', width: '100%', boxSizing: 'border-box' }} />
          {newBrand.logo && (
            <img src={newBrand.logo} alt="Logo Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }} />
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#2D473B' }}>
            {isAr ? 'نسبة عمولة كشافة (%)' : 'Kashafa Commission (%)'}
          </label>
          <input type="number" min="0" max="100" required value={newBrand.commissionRate} onChange={(e) => setNewBrand({ ...newBrand, commissionRate: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button type="submit" style={{ flex: 1, backgroundColor: editingId ? '#D97706' : '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem' }}>
            {editingId ? (isAr ? 'حفظ التعديلات' : 'Update Brand') : (isAr ? '+ حفظ البراند' : '+ Save Brand')}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setNewBrand({ nameEn: '', nameAr: '', slug: '', commissionRate: '15', logo: '' }); }}
              style={{ backgroundColor: '#E5E7EB', color: '#374151', border: 'none', padding: '14px 20px', borderRadius: '25px', fontWeight: '800', cursor: 'pointer' }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          )}
        </div>
      </form>

      {/* قائمة البراندات المسجلة */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #DAD8D2', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 16px 0' }}>{isAr ? 'البراندات المسجلة' : 'Registered Brands'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {brands && brands.length > 0 ? (
            brands.map((b) => (
              <div key={b.id} style={{ padding: '12px 14px', backgroundColor: '#F5F2EC', borderRadius: '14px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px', flex: 1 }}>
                  {b.logo ? (
                    <img src={b.logo} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#20232B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      {b.nameEn?.[0] || 'B'}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{isAr ? b.nameAr : b.nameEn}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>/{b.slug}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2D473B' }}>{isAr ? 'العمولة:' : 'Fee:'}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={b.commissionRate ?? 15}
                      onChange={(e) => handleUpdateCommission(b.id, Number(e.target.value))}
                      style={{ width: '45px', padding: '4px', borderRadius: '6px', border: '1px solid #DAD8D2', fontWeight: '800', textAlign: 'center', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>%</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleEditClick(b)}
                      style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleDelete(b.id)}
                      style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {isAr ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '0.9rem' }}>
              {isAr ? 'لا توجد براندات مسجلة حالياً.' : 'No registered brands currently.'}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}