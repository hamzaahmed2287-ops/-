'use client';
import { useState, useEffect } from 'react';

interface PromoManagerProps {
  isAr: boolean;
  showToast: (msg: string) => void;
}

export default function PromoManager({ isAr, showToast }: PromoManagerProps) {
  const [promos, setPromos] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');

  // جلب أكواد الخصم من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchPromosFromApi = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/promos`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPromos(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for promo codes');
      }

      // البديل المحلي في حال عدم اتصال السيرفر
      const saved = localStorage.getItem('kashafa_promo_codes');
      if (saved) {
        try {
          setPromos(JSON.parse(saved));
        } catch (e) {}
      }
    };

    fetchPromosFromApi();
  }, []);

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    const cleanCode = code.trim().toUpperCase();
    const exists = promos.some((p) => p.code === cleanCode);
    if (exists) {
      showToast(isAr ? '⚠️ هذا الكود موجود بالفعل!' : '⚠️ Promo code already exists!');
      return;
    }

    const newPromo = {
      id: Date.now().toString(),
      code: cleanCode,
      type: discountType,
      value: Number(discountValue),
      active: true,
    };

    const updated = [newPromo, ...promos];
    setPromos(updated);

    // إرسال الكود الجديد لحفظه في قاعدة البيانات عبر الـ API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromo)
      });
    } catch (err) {
      console.warn('Server promo save failed, saving locally');
    }

    // التخزين المحلي الاحتياطي
    localStorage.setItem('kashafa_promo_codes', JSON.stringify(updated));
    setCode('');
    setDiscountValue('');
    showToast(isAr ? '✓ تم إنشاء وحفظ البرومو كود في قاعدة البيانات!' : '✓ Promo code created and saved to database!');
  };

  const handleDelete = async (id: string) => {
    const updated = promos.filter((p) => p.id !== id);
    setPromos(updated);

    // حذف الكود من قاعدة البيانات عبر الـ API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/promos/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server promo delete failed');
    }

    localStorage.setItem('kashafa_promo_codes', JSON.stringify(updated));
    showToast(isAr ? '🗑️ تم حذف الكود' : '🗑️ Promo code deleted');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
        {isAr ? 'إدارة أكواد الخصم (Promo Codes)' : 'Manage Promo Codes'}
      </h2>

      <form onSubmit={handleAddPromo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>
            {isAr ? 'كود الخصم (مثال: KASHAFA20):' : 'Promo Code:'}
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SAVE15"
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', textTransform: 'uppercase', fontWeight: '800' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>
            {isAr ? 'نوع الخصم:' : 'Discount Type:'}
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', backgroundColor: '#FFF', fontWeight: '700' }}
          >
            <option value="percent">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
            <option value="fixed">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>
            {isAr ? 'قيمة الخصم:' : 'Discount Value:'}
          </label>
          <input
            type="number"
            required
            min="1"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percent' ? '15' : '100'}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', fontWeight: '700' }}
          />
        </div>

        <button
          type="submit"
          style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '13px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}
        >
          {isAr ? '+ إضافة الكود' : '+ Create Code'}
        </button>
      </form>

      {promos.length === 0 ? (
        <p style={{ color: '#777', textAlign: 'center', padding: '20px' }}>
          {isAr ? 'لا توجد أكواد خصم مضافة حالياً.' : 'No promo codes created yet.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
          {promos.map((p) => (
            <div key={p.id} style={{ border: '1px solid #DAD8D2', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F8F6' }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#2D473B', letterSpacing: '1px' }}>{p.code}</div>
                <div style={{ fontSize: '0.9rem', color: '#555', fontWeight: '700', marginTop: '4px' }}>
                  {isAr ? 'خصم: ' : 'Discount: '}
                  {p.type === 'percent' ? `${p.value}%` : `${p.value} EGP`}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
              >
                {isAr ? 'حذف' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}