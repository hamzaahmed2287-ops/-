'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import WeeklyBrandBannerSlide1 from './WeeklyBrandBannerSlide1';
import WeeklyBrandBannerSlide2 from './WeeklyBrandBannerSlide2';
import { api } from '@/utils/api';

export default function WeeklyBrandBanner() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [currentSlide, setCurrentSlide] = useState(0); 
  const [viewMode, setViewMode] = useState<'story' | 'video'>('story');

  const [adminBanner, setAdminBanner] = useState<any>(null);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [registeredBrands, setRegisteredBrands] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbProducts = await api.getProducts();
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          setStoreProducts(dbProducts);
        } else {
          throw new Error();
        }
      } catch (err) {
        setStoreProducts(JSON.parse(localStorage.getItem('kashafa_admin_products') || localStorage.getItem('kashafa_products') || '[]'));
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');
        
        const bannerRes = await fetch(`${API_BASE_URL}/settings/weekly-banner`);
        if (bannerRes.ok) {
          const bannerJson = await bannerRes.json();
          if (bannerJson) setAdminBanner(bannerJson);
        }

        const brandRes = await fetch(`${API_BASE_URL}/brands`);
        if (brandRes.ok) {
          const brandJson = await brandRes.json();
          if (Array.isArray(brandJson)) setRegisteredBrands(brandJson);
        }
      } catch (err) {
        console.warn('Fallback to local storage for banner and brands');
      }

      if (!adminBanner) {
        const savedBanner = localStorage.getItem('kashafa_weekly_banner');
        if (savedBanner) {
          try { setAdminBanner(JSON.parse(savedBanner)); } catch (e) {}
        }
      }

      if (registeredBrands.length === 0) {
        const savedBrands = localStorage.getItem('kashafa_admin_brands');
        if (savedBrands) {
          try { setRegisteredBrands(JSON.parse(savedBrands)); } catch (e) {}
        }
      }
    };

    fetchData();

    const handleStorageChange = () => {
      const savedBanner = localStorage.getItem('kashafa_weekly_banner');
      if (savedBanner) {
        try { setAdminBanner(JSON.parse(savedBanner)); } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const brandNameRaw = adminBanner?.brandNameEn || adminBanner?.brandNameAr || 'Kashafa Studio';
  const brandTitle = isAr ? (adminBanner?.titleAr || 'اكتشاف الأسبوع: إبداعات مصرية محلية') : (adminBanner?.titleEn || 'Weekly Discovery: Local Egyptian Craft');
  const brandSubtitle = isAr ? (adminBanner?.subtitleAr || 'براندات مصرية ناشئة مختارة بعناية خصيصاً لك.') : (adminBanner?.subtitleEn || 'Handpicked emerging brands curated just for you.');
  const brandStory = adminBanner?.story || (isAr ? 'جودة تصنيع يدوية وتصميمات مستدامة مصممة لمغامراتك اليومية.' : 'Handcrafted quality and sustainable designs made for daily adventures.');
  const brandVideo = adminBanner?.videoUrl || '';
  const brandImage = adminBanner?.image || '';

  const currentBrandObj = registeredBrands.find(
    (b: any) => String(b.nameEn).toLowerCase() === String(brandNameRaw).toLowerCase() ||
                String(b.nameAr).toLowerCase() === String(brandNameRaw).toLowerCase()
  );
  
  const brandName = isAr ? (currentBrandObj?.nameAr || brandNameRaw) : (currentBrandObj?.nameEn || brandNameRaw);
  const brandLogo = currentBrandObj?.logo || '';
  const brandSlug = currentBrandObj?.slug || brandNameRaw.toLowerCase().replace(/\s+/g, '-');

  const linkedProd1 = storeProducts.find((p: any) => String(p.id) === String(adminBanner?.productId1) || String(p._id) === String(adminBanner?.productId1));
  const linkedProd2 = storeProducts.find((p: any) => String(p.id) === String(adminBanner?.productId2) || String(p._id) === String(adminBanner?.productId2));

  const fallbackProds = storeProducts.filter((p: any) => 
    String(p.brand || '').toLowerCase() === String(brandNameRaw).toLowerCase()
  );

  const displayProducts = [
    linkedProd1 || fallbackProds[0] || storeProducts[0] || { id: 1, nameAr: 'منتج تجريبي 1', nameEn: 'Sample Item 1', price: 500, images: [''] },
    linkedProd2 || fallbackProds[1] || storeProducts[1] || { id: 2, nameAr: 'منتج تجريبي 2', nameEn: 'Sample Item 2', price: 650, images: [''] }
  ];

  const handleNext = () => setCurrentSlide(prev => (prev === 0 ? 1 : 0));
  const handlePrev = () => setCurrentSlide(prev => (prev === 0 ? 1 : 0));

  return (
    <>
      <style>{`
        .banner-container {
          width: 100%;
          position: relative;
          margin-bottom: 40px;
          overflow: hidden;
        }

        .banner-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: #FFFFFF;
          color: #20232B;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 10;
          transition: background-color 0.2s, transform 0.2s;
        }

        .banner-arrow:hover {
          background-color: #F5F2EC;
          transform: translateY(-50%) scale(1.05);
        }

        .banner-arrow.right {
          right: 25px;
        }

        .banner-arrow.left {
          left: 25px;
        }

        /* تصغير حجم ومسافات الأزرار على الموبايل لتجنب تداخلها مع محتوى الكروت */
        @media (max-width: 640px) {
          .banner-arrow {
            width: 36px;
            height: 36px;
          }
          .banner-arrow.right {
            right: 10px;
          }
          .banner-arrow.left {
            left: 10px;
          }
        }
      `}</style>

      <section className="banner-container">
        
        {/* السهم الأيمن */}
        <button 
          onClick={handleNext}
          className="banner-arrow right"
          title="التالي"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* السهم الأيسر */}
        <button 
          onClick={handlePrev}
          className="banner-arrow left"
          title="السابق"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {currentSlide === 0 ? (
          <WeeklyBrandBannerSlide1 
            isAr={isAr}
            brandTitle={brandTitle}
            brandSubtitle={brandSubtitle}
            brandStory={brandStory}
            brandVideo={brandVideo}
            brandImage={brandImage}
            brandLogo={brandLogo}
            brandName={brandName}
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentBrandSlug={brandSlug}
          />
        ) : (
          <WeeklyBrandBannerSlide2 
            isAr={isAr}
            brandName={brandName}
            brandStory={brandStory}
            brandLogo={brandLogo}
            displayProducts={displayProducts}
          />
        )}

      </section>
    </>
  );
}