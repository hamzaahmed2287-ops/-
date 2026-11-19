'use client';
import { useState, useEffect } from 'react';

interface ShippingManagerProps {
  isAr: boolean;
  governorates: any[];
  onSaveGovernorates: (updated: any[]) => void;
  showToast: (msg: string) => void;
}

export default function ShippingManager({ isAr, governorates, onSaveGovernorates, showToast }: ShippingManagerProps) {
  const [list, setList] = useState<any[]>([]);

  // جلب أسعار الشحن والمحافظات من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchShippingFromApi = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/shipping`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setList(data.map((g: any) => ({
              ...g,
              deliveryDaysAr: g.deliveryDaysAr || '2 - 4 أيام عمل',
              deliveryDaysEn: g.deliveryDaysEn || '2 - 4 Business Days',
            })));
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to props/local storage for shipping');
      }

      // البديل باستخدام البروبس القادمة في حال عدم اتصال السيرفر
      setList(
        governorates.map((g) => ({
          ...g,
          deliveryDaysAr: g.deliveryDaysAr || '2 - 4 أيام عمل',
          deliveryDaysEn: g.deliveryDaysEn || '2 - 4 Business Days',
        }))
      );
    };

    fetchShippingFromApi();
  }, [governorates]);

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGovernorates(list);

    // إرسال أسعار الشحن المحدثة لقاعدة البيانات عبر الـ API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
    } catch (err) {
      console.warn('Server shipping save failed, saved locally');
    }

    showToast(isAr ? '✓ تم حفظ أسعار الشحن ومدة التوصيل في قاعدة البيانات!' : '✓ Shipping rates & delivery days saved to database!');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
          {isAr ? 'إدارة أسعار الشحن ومدة التوصيل للمحافظات' : 'Manage Shipping Rates & Delivery Days'}
        </h2>
        <button
          onClick={handleSave}
          style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '12px 26px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer' }}
        >
          {isAr ? 'حفظ التعديلات 🚀' : 'Save Changes 🚀'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #DAD8D2', color: '#666', fontSize: '0.9rem' }}>
              <th style={{ padding: '12px' }}>{isAr ? 'المحافظة' : 'Governorate'}</th>
              <th style={{ padding: '12px' }}>{isAr ? 'تكلفة الشحن (ج.م)' : 'Shipping Fee (EGP)'}</th>
              <th style={{ padding: '12px' }}>{isAr ? 'مدة التوصيل (عربي)' : 'Delivery Time (AR)'}</th>
              <th style={{ padding: '12px' }}>{isAr ? 'مدة التوصيل (إنجليزي)' : 'Delivery Time (EN)'}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((gov, idx) => (
              <tr key={gov.id || idx} style={{ borderBottom: '1px solid #F0EDE6' }}>
                <td style={{ padding: '12px', fontWeight: '700' }}>
                  {isAr ? gov.nameAr : gov.nameEn}
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="number"
                    value={gov.shippingCost ?? gov.price ?? 50}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleChange(idx, 'shippingCost', val);
                      handleChange(idx, 'price', val);
                    }}
                    style={{ width: '100px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #DAD8D2', fontWeight: '700' }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={gov.deliveryDaysAr}
                    onChange={(e) => handleChange(idx, 'deliveryDaysAr', e.target.value)}
                    placeholder="مثال: 2 - 3 أيام"
                    style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #DAD8D2' }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={gov.deliveryDaysEn}
                    onChange={(e) => handleChange(idx, 'deliveryDaysEn', e.target.value)}
                    placeholder="e.g. 2 - 3 Days"
                    style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #DAD8D2' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}