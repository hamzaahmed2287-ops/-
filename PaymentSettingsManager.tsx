'use client';
import { useState, useEffect } from 'react';

interface PaymentSettingsManagerProps {
  isAr: boolean;
  showToast: (msg: string) => void;
}

export default function PaymentSettingsManager({ isAr, showToast }: PaymentSettingsManagerProps) {
  const [paymentData, setPaymentData] = useState({
    vodafoneCash1: '01012345678',
    vodafoneCash2: '01098765432',
    instapayHandle: 'kashafa@instapay'
  });

  // جلب إعدادات الدفع من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/settings/payment`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPaymentData(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for payment settings');
      }

      // البديل المحلي في حال عدم اتصال السيرفر
      const saved = localStorage.getItem('kashafa_payment_settings');
      if (saved) {
        try { setPaymentData(JSON.parse(saved)); } catch (e) {}
      }
    };

    fetchPaymentSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // إرسال البيانات وحفظها في قاعدة البيانات عبر الـ API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/settings/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!res.ok) {
        throw new Error('Failed to save payment settings to server');
      }
    } catch (err) {
      console.warn('Server save failed, saving to localStorage as fallback');
    }

    // التخزين المحلي الاحتياطي الفوري
    localStorage.setItem('kashafa_payment_settings', JSON.stringify(paymentData));
    window.dispatchEvent(new Event('storage'));

    showToast(isAr ? '✓ تم حفظ أرقام الدفع في قاعدة البيانات بنجاح!' : '✓ Payment numbers saved to database successfully!');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2', marginBottom: '25px' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', color: '#20232B' }}>
        {isAr ? 'إدارة أرقام الدفع (فودافون كاش / إنستا باي)' : 'Manage Payment Numbers'}
      </h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رقم فودافون كاش الأول:' : 'Vodafone Cash #1:'}</label>
            <input 
              type="text" 
              value={paymentData.vodafoneCash1} 
              onChange={(e) => setPaymentData({ ...paymentData, vodafoneCash1: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'رقم فودافون كاش الثاني:' : 'Vodafone Cash #2:'}</label>
            <input 
              type="text" 
              value={paymentData.vodafoneCash2} 
              onChange={(e) => setPaymentData({ ...paymentData, vodafoneCash2: e.target.value })} 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>{isAr ? 'حساب إنستا باي (InstaPay Handle):' : 'InstaPay Handle:'}</label>
          <input 
            type="text" 
            value={paymentData.instapayHandle} 
            onChange={(e) => setPaymentData({ ...paymentData, instapayHandle: e.target.value })} 
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
          />
        </div>
        <button type="submit" style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '12px 24px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer', width: 'fit-content' }}>
          {isAr ? 'حفظ الأرقام 💳' : 'Save Payment Info 💳'}
        </button>
      </form>
    </div>
  );
}