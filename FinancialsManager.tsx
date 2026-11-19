'use client';
import { useState, useEffect } from 'react';

interface Props {
  isAr: boolean;
  brands: any[];
  orders: any[];
  onSaveOrders: (updated: any[]) => void;
  showToast: (msg: string) => void;
}

export default function FinancialsManager({ isAr, brands, orders, onSaveOrders, showToast }: Props) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const currency = isAr ? 'ج.م' : 'EGP';

  const now = new Date('2026-11-16');

  // جلب الطلبات والمعاملات المالية المحدثة من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/orders`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            onSaveOrders(data);
          }
        }
      } catch (err) {
        console.warn('Using local orders state fallback for financials');
      }
    };
    fetchFinancialData();
  }, []);

  // استخراج تفاصيل العمليات لكل منتج تم بيعه من الطلبات لتكوين سجل (Transaction History)
  const allTransactions: any[] = [];
  orders.forEach((ord) => {
    const items = ord.items || [];
    items.forEach((item: any) => {
      const brandName = item.brand || ord.brand || 'Kashafa Studio';
      allTransactions.push({
        orderId: ord.id,
        customerName: ord.customerName || ord.name || 'Customer',
        productTitle: typeof item.title === 'object' ? (isAr ? item.title.AR : item.title.EN) : item.title,
        brand: brandName,
        quantity: item.quantity || 1,
        priceStr: item.price,
        itemTotal: (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) * (item.quantity || 1),
        date: ord.date || new Date().toISOString().split('T')[0],
        createdAt: ord.createdAt || ord.date || new Date().toISOString(),
        settled: ord.settled || false
      });
    });
  });

  // فلترة المعاملات حسب الفترة الزمنية
  const filteredTransactions = allTransactions.filter((tx) => {
    if (period === 'all') return true;
    const txDate = new Date(tx.date);
    const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
    if (period === 'weekly') return diffDays <= 7;
    if (period === 'monthly') return diffDays <= 30;
    return true;
  });

  // الحسابات المالية الإجمالية بناءً على العمليات
  const totalSales = filteredTransactions.reduce((sum, tx) => sum + tx.itemTotal, 0);
  
  const totalCommission = filteredTransactions.reduce((sum, tx) => {
    const brandObj = brands.find((b) => b.nameEn === tx.brand || b.nameAr === tx.brand);
    const rate = brandObj ? Number(brandObj.commissionRate) : 15;
    return sum + (tx.itemTotal * rate) / 100;
  }, 0);

  const totalBrandNet = totalSales - totalCommission;

  // تسجيل تسوية مالية (تحويل مستحقات البراند) عبر الـ API
  const handleSettleBrand = async (brandName: string) => {
    const updatedOrders = orders.map((ord) => {
      const hasBrandItem = (ord.items || []).some((i: any) => (i.brand || ord.brand || 'Kashafa Studio') === brandName);
      if (hasBrandItem) {
        return { ...ord, settled: true };
      }
      return ord;
    });

    onSaveOrders(updatedOrders);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/financials/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, orders: updatedOrders })
      });
    } catch (err) {
      console.warn('Server settle sync failed, updated locally');
    }

    showToast(isAr ? `✓ تم تسجيل تسوية حساب براند ${brandName}` : `✓ Marked ${brandName} payouts as settled!`);
  };

  // مسح سجل المعاملات المالية بالكامل عبر الـ API
  const handleClearHistory = async () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من مسح سجل العمليات المالية بالكامل؟' : 'Are you sure you want to clear financial history?')) {
      onSaveOrders([]);
      
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_BASE_URL}/orders`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Server clear failed');
      }

      showToast(isAr ? '🗑️ تم مسح السجل بنجاح' : '🗑️ History cleared successfully');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* رأس الصفحة وأزرار الفلترة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#FFFFFF', padding: '20px 25px', borderRadius: '18px', border: '1px solid #DAD8D2' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
            {isAr ? 'فترة التحصيل والتقارير المالية للبراندات' : 'Collection & Brand Financial Reports'}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
            {period === 'weekly'
              ? (isAr ? 'عرض مبيعات وعمولات آخر 7 أيام (أسبوعي)' : 'Showing sales & commissions for the last 7 days (Weekly)')
              : period === 'monthly'
              ? (isAr ? 'عرض مبيعات وعمولات آخر 30 يوم (شهري)' : 'Showing sales & commissions for the last 30 days (Monthly)')
              : (isAr ? 'عرض إجمالي المبيعات منذ الإطلاق' : 'Showing all-time financial records')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { id: 'weekly', label: isAr ? 'أسبوعي' : 'Weekly' },
            { id: 'monthly', label: isAr ? 'شهري' : 'Monthly' },
            { id: 'all', label: isAr ? 'الكل' : 'All Time' }
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setPeriod(btn.id as any)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: period === btn.id ? 'none' : '1px solid #DAD8D2',
                backgroundColor: period === btn.id ? '#2D473B' : '#F5F2EC',
                color: period === btn.id ? '#FFFFFF' : '#20232B',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}

          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {isAr ? '🗑️ مسح السجل' : '🗑️ Clear History'}
            </button>
          )}
        </div>
      </div>

      {/* ملخص الأرقام */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '700' }}>{isAr ? 'إجمالي المبيعات' : 'Period Gross Sales'}</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', marginTop: '8px' }}>{totalSales.toFixed(0)} {currency}</div>
        </div>

        <div style={{ backgroundColor: '#20232B', padding: '24px', borderRadius: '20px', color: '#F5F2EC' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: '700' }}>{isAr ? 'صافي أرباح كشافة (العمولات)' : 'Kashafa Net Profit (Commissions)'}</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#A6C96A', marginTop: '8px' }}>{totalCommission.toFixed(2)} {currency}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '700' }}>{isAr ? 'صافي المستحق للبراندات' : 'Net Payable to Brands'}</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#2D473B', marginTop: '8px' }}>{totalBrandNet.toFixed(2)} {currency}</div>
        </div>
      </div>

      {/* كشف حساب تفصيلي: مستحقات كل براند */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
          {isAr ? 'كشف مستحقات وأرباح كل براند' : 'Brand Payouts & Earnings Statement'}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #EAE6DF', color: '#666', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>{isAr ? 'البراند' : 'Brand'}</th>
                <th style={{ padding: '12px' }}>{isAr ? 'العمولة %' : 'Commission'}</th>
                <th style={{ padding: '12px' }}>{isAr ? 'المبيعات' : 'Sales'}</th>
                <th style={{ padding: '12px' }}>{isAr ? 'نصيب كشافة' : 'Kashafa Cut'}</th>
                <th style={{ padding: '12px' }}>{isAr ? 'المبلغ المستحق للبراند' : 'Due to Brand'}</th>
                <th style={{ padding: '12px' }}>{isAr ? 'التسوية' : 'Settlement'}</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => {
                const brandTxs = filteredTransactions.filter((tx) => tx.brand === b.nameEn || tx.brand === b.nameAr);
                const sales = brandTxs.reduce((s, tx) => s + tx.itemTotal, 0);
                const fee = (sales * Number(b.commissionRate || 15)) / 100;
                const due = sales - fee;
                const unsettledTxs = brandTxs.filter((tx) => !tx.settled);
                const unsettledDue = unsettledTxs.reduce((s, tx) => {
                  return s + (tx.itemTotal - (tx.itemTotal * Number(b.commissionRate || 15)) / 100);
                }, 0);

                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F0ECE3', fontSize: '0.95rem' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '800' }}>{isAr ? b.nameAr : b.nameEn}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '700' }}>{b.commissionRate || 15}%</td>
                    <td style={{ padding: '14px 12px' }}>{sales.toFixed(2)} {currency}</td>
                    <td style={{ padding: '14px 12px', color: '#2D473B', fontWeight: '800' }}>{fee.toFixed(2)} {currency}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '900', fontSize: '1rem' }}>
                      {unsettledDue.toFixed(2)} {currency}
                      {due > 0 && unsettledDue === 0 && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#2D473B', fontWeight: '600' }}>
                          {isAr ? 'تم تحويل كامل المستحقات ✓' : 'All settled'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {unsettledDue > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSettleBrand(b.nameEn)}
                          style={{ backgroundColor: '#A6C96A', color: '#20232B', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          {isAr ? 'تسجيل تحويل الفلوس ✓' : 'Mark Paid ✓'}
                        </button>
                      ) : (
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل حركات البيع التفصيلية (Transaction History) */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
          {isAr ? 'سجل تفاصيل عمليات البيع لكل منتج' : 'Detailed Item Sales History'}
        </h2>
        {filteredTransactions.length === 0 ? (
          <p style={{ color: '#777', textAlign: isAr ? 'right' : 'left', padding: '20px' }}>
            {isAr ? 'لا توجد حركات بيع مسجلة في هذه الفترة.' : 'No sales transactions recorded in this period.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #EAE6DF', color: '#666', fontSize: '0.85rem' }}>
                  <th style={{ padding: '10px' }}>{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'التاريخ والوقت' : 'Date & Time'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'المنتج' : 'Product'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'البراند' : 'Brand'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'الكمية' : 'Qty'}</th>
                  <th style={{ padding: '10px' }}>{isAr ? 'الإجمالي' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F0ECE3', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700' }}>#{tx.orderId}</td>
                    <td style={{ padding: '12px 10px', color: '#555' }}>
                      {new Date(tx.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '800' }}>{tx.productTitle}</td>
                    <td style={{ padding: '12px 10px', color: '#2D473B', fontWeight: '700' }}>{tx.brand}</td>
                    <td style={{ padding: '12px 10px' }}>{tx.quantity}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '900' }}>{tx.itemTotal} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}