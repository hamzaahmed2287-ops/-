'use client';
import { useState, useEffect } from 'react';

interface OrdersManagerProps {
  isAr: boolean;
  orders: any[];
  onSaveOrders: (updated: any[]) => void;
  showToast: (msg: string) => void;
}

export default function OrdersManager({ isAr, orders, onSaveOrders, showToast }: OrdersManagerProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // جلب الطلبات المحدثة من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchOrdersFromApi = async () => {
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
        console.warn('Using local orders state fallback');
      }
    };
    fetchOrdersFromApi();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onSaveOrders(updated);

    // تحديث التخزين المحلي المحلي
    const customerOrders = JSON.parse(localStorage.getItem('kashafa_orders') || '[]');
    const updatedCustomer = customerOrders.map((o: any) => (o.id === orderId ? { ...o, status: newStatus } : o));
    localStorage.setItem('kashafa_orders', JSON.stringify(updatedCustomer));

    // إرسال التحديث لقاعدة البيانات عبر الـ API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Server status update failed, updated locally');
    }

    showToast(isAr ? '✓ تم تحديث حالة الطلب' : '✓ Order status updated');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this order?')) {
      const updated = orders.filter((o) => o.id !== orderId);
      onSaveOrders(updated);

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_BASE_URL}/orders/${orderId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Server order delete failed');
      }

      showToast(isAr ? '🗑️ تم حذف الطلب' : '🗑️ Order deleted');
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
        {isAr ? `طلبات العملاء (${orders.length})` : `Customer Orders (${orders.length})`}
      </h2>

      {orders.length === 0 ? (
        <p style={{ color: '#777', textAlign: isAr ? 'right' : 'left', padding: '30px' }}>
          {isAr ? 'لا توجد طلبات حتى الآن.' : 'No orders yet.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const isCancelled = order.status === 'Cancelled' || order.status === 'ملغي';
            const receiptImg = order.receiptImage || order.paymentReceipt || order.receipt || order.screenshot;
            const orderBrand = order.brand || (order.items?.[0]?.brand) || 'Kashafa Studio';

            return (
              <div
                key={order.id}
                style={{
                  border: isCancelled ? '2px solid #DC2626' : '1px solid #DAD8D2',
                  borderRadius: '16px',
                  padding: '20px',
                  backgroundColor: isCancelled ? '#FEF2F2' : '#FAF9F6',
                }}
              >
                {isCancelled && (
                  <div style={{ backgroundColor: '#DC2626', color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px', fontWeight: '900', marginBottom: '15px', display: 'inline-block', fontSize: '0.9rem' }}>
                    {isAr ? '⚠️ تم إلغاء هذا الطلب بواسطة العميل' : '⚠️ Cancelled by Customer'}
                    {order.cancelReason ? ` — (${order.cancelReason})` : ''}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>
                        #{order.id} — {order.customerName || order.name || 'Customer'}
                      </span>
                      <span style={{ backgroundColor: '#20232B', color: '#A6C96A', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                        🏷️ {orderBrand}
                      </span>
                    </div>
                    
                    <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        📞 <strong style={{ color: '#20232B' }}>{isAr ? 'الأساسي:' : 'Primary:'}</strong> {order.phone}
                      </div>
                      {order.altPhone && (
                        <div style={{ color: '#B45309', fontWeight: '700' }}>
                          📱 <strong style={{ color: '#92400E' }}>{isAr ? 'البديل:' : 'Alt:'}</strong> {order.altPhone}
                        </div>
                      )}
                      <div style={{ marginTop: '2px' }}>
                        📍 {order.governorate} - {order.address}
                      </div>
                    </div>

                    {order.targetWallet && (
                      <div style={{ color: '#B45309', fontSize: '0.88rem', fontWeight: '800', marginTop: '6px' }}>
                        💳 {isAr ? 'تم التحويل على رقم/حساب:' : 'Transferred to Account/Number:'} {order.targetWallet}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #DAD8D2',
                        fontWeight: '800',
                        backgroundColor: isCancelled ? '#FEE2E2' : '#FFFFFF',
                        color: isCancelled ? '#DC2626' : '#20232B',
                      }}
                    >
                      <option value="Pending">{isAr ? 'قيد المراجعة (Pending)' : 'Pending'}</option>
                      <option value="Packed">{isAr ? 'تم التجهيز (Packed)' : 'Packed'}</option>
                      <option value="Shipped">{isAr ? 'تم الشحن (Shipped)' : 'Shipped'}</option>
                      <option value="Delivered">{isAr ? 'تم التسليم (Delivered)' : 'Delivered'}</option>
                      <option value="Cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      {isAr ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: receiptImg ? '1fr 220px' : '1fr', gap: '20px', alignItems: 'start', borderTop: '1px solid #E5E2DC', paddingTop: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '800', marginBottom: '8px', fontSize: '0.95rem' }}>
                      {isAr ? 'المنتجات المطلوبة والبراندات:' : 'Order Items & Brands:'}
                    </div>
                    {(order.items || []).map((item: any, idx: number) => {
                      const itemTitle = 
                        typeof item.title === 'string' ? item.title :
                        isAr ? (item.title?.AR || item.nameAr || item.name || item.title?.EN || 'منتج بدون اسم') :
                        (item.title?.EN || item.nameEn || item.name || item.title?.AR || 'Unnamed Product');

                      return (
                        <div key={idx} style={{ fontSize: '0.9rem', color: '#333', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px dashed #EAE6DF' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{ fontWeight: '800' }}>
                              - {itemTitle} × {item.quantity || 1}
                            </span>
                            <span style={{ backgroundColor: '#E2E8F0', color: '#1E293B', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                              {item.brand || orderBrand}
                            </span>
                          </div>
                          
                          <div style={{ display: 'inline-flex', gap: '8px', margin: '4px 0 0 0', flexWrap: 'wrap' }}>
                            {item.selectedSize && (
                              <span style={{ color: '#B45309', fontWeight: '800', fontSize: '0.85rem' }}>
                                ({isAr ? 'المقاس:' : 'Size:'} {item.selectedSize})
                              </span>
                            )}
                            {item.selectedColor && (
                              <span style={{ color: '#2D473B', fontWeight: '800', fontSize: '0.85rem' }}>
                                ({isAr ? 'اللون:' : 'Color:'} {item.selectedColor})
                              </span>
                            )}
                          </div>
                          <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#666' }}>({item.price})</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: '12px', fontWeight: '900', fontSize: '1.05rem', color: '#20232B' }}>
                      {isAr ? 'الإجمالي النهائي:' : 'Total:'} {order.total} EGP — ({order.paymentMethod || 'COD'})
                    </div>
                  </div>

                  {receiptImg && (
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '12px', border: '1px solid #DAD8D2', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', color: '#2D473B' }}>
                        📸 {isAr ? 'إيصال التحويل:' : 'Payment Receipt:'}
                      </div>
                      <img
                        src={receiptImg}
                        alt="Payment Receipt"
                        onClick={() => setSelectedReceipt(receiptImg)}
                        style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in', border: '1px solid #EEE' }}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(receiptImg)}
                        style={{ marginTop: '6px', background: 'none', border: 'none', color: '#2563EB', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isAr ? 'تكبير الصورة 🔍' : 'View Full Image 🔍'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={selectedReceipt} alt="Full Receipt" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '14px' }} />
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#FFF', color: '#000', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontWeight: '900', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}