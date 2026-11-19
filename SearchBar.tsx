'use client';
import { useState, useEffect, useRef } from 'react';
import { useLang } from '@/app/layout';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function SearchBar() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ products: any[]; brands: any[] }>({ products: [], brands: [] });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // البحث اللحظي في قاعدة البيانات (SQL Server عبر API) والـ localStorage كبديل
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults({ products: [], brands: [] });
        setIsOpen(false);
        return;
      }

      const searchTerm = query.toLowerCase();
      let allProducts: any[] = [];
      let allBrands: any[] = [];

      // 1. محاولة جلب المنتجات والبراندات من قاعدة البيانات عبر الـ API
      try {
        const dbProducts = await api.getProducts();
        if (Array.isArray(dbProducts)) {
          allProducts = dbProducts;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const brandRes = await fetch(`${API_BASE_URL}/brands`);
        if (brandRes.ok) {
          const brandJson = await brandRes.json();
          if (Array.isArray(brandJson)) {
            allBrands = brandJson;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for search');
      }

      // 2. الخيار الاحتياطي المحلي لو السيرفر مش شغال
      if (allProducts.length === 0) {
        allProducts = JSON.parse(
          localStorage.getItem('kashafa_admin_products') || 
          localStorage.getItem('kashafa_products') || '[]'
        );
      }
      if (allBrands.length === 0) {
        allBrands = JSON.parse(localStorage.getItem('kashafa_admin_brands') || '[]');
      }

      // فلترة المنتجات
      const matchedProducts = allProducts.filter((p: any) => {
        const nameAr = String(p.nameAr || p.title?.AR || '').toLowerCase();
        const nameEn = String(p.nameEn || p.title?.EN || '').toLowerCase();
        const brand = String(p.brand || '').toLowerCase();
        return nameAr.includes(searchTerm) || nameEn.includes(searchTerm) || brand.includes(searchTerm);
      }).slice(0, 5);

      // فلترة البراندات
      const matchedBrands = allBrands.filter((b: any) => {
        const nameAr = String(b.nameAr || '').toLowerCase();
        const nameEn = String(b.nameEn || '').toLowerCase();
        const slug = String(b.slug || '').toLowerCase();
        return nameAr.includes(searchTerm) || nameEn.includes(searchTerm) || slug.includes(searchTerm);
      }).slice(0, 3);

      setResults({ products: matchedProducts, brands: matchedBrands });
      setIsOpen(matchedProducts.length > 0 || matchedBrands.length > 0);
    };

    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300); // تأخير بسيط (Debounce) لتحسين الأداء أثناء الكتابة

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // إغلاق القائمة المنسدلة عند النقر خارج شريط البحث
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '450px', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <span style={{ 
        position: 'absolute', top: '50%', transform: 'translateY(-50%)', 
        [isAr ? 'right' : 'left']: '16px', color: '#666', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 2
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.trim()) setIsOpen(true); }}
        placeholder={isAr ? 'ابحث عن منتج أو براند...' : 'Search for a product or brand...'}
        style={{
          width: '100%',
          padding: isAr ? '10px 48px 10px 16px' : '10px 16px 10px 48px',
          borderRadius: '25px',
          border: '1px solid #DAD8D2',
          backgroundColor: '#FFFFFF',
          fontSize: '0.95rem',
          outline: 'none',
          color: '#20232B',
          boxSizing: 'border-box'
        }}
      />

      {/* قائمة النتائج المنسدلة التفاعلية */}
      {isOpen && (results.products.length > 0 || results.brands.length > 0) && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #DAD8D2',
          boxShadow: '0 10px 25px rgba(32, 35, 43, 0.1)',
          zIndex: 99,
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '10px'
        }}>
          {/* قسم البراندات المطابقة */}
          {results.brands.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', padding: '4px 8px', textTransform: 'uppercase' }}>
                {isAr ? 'البراندات المقترحة' : 'Brands'}
              </div>
              {results.brands.map((b: any) => {
                const bName = isAr ? (b.nameAr || b.nameEn) : (b.nameEn || b.nameAr);
                const bSlug = b.slug || b.nameEn?.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div 
                    key={b.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      router.push(`/brands/${bSlug}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F2EC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', overflow: 'hidden' }}>
                      {b.logo ? <img src={b.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : bName.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#20232B' }}>{bName}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* قسم المنتجات المطابقة */}
          {results.products.length > 0 && (
            <div>
              {results.brands.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '6px 0' }} />}
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', padding: '4px 8px', textTransform: 'uppercase' }}>
                {isAr ? 'المنتجات' : 'Products'}
              </div>
              {results.products.map((p: any) => {
                const pName = isAr ? (p.nameAr || p.title?.AR || p.nameEn) : (p.nameEn || p.title?.EN || p.nameAr);
                const pImage = p.images?.[0] || p.image || '';
                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      router.push(`/products/${p.id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F2EC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img src={pImage} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #DAD8D2' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#20232B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pName}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2D473B' }}>{p.price} {isAr ? 'ج.م' : 'EGP'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}