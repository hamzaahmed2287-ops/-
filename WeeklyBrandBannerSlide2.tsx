'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Slide2Props {
  isAr: boolean;
  brandName: string;
  brandStory: string;
  brandLogo: string;
  displayProducts: any[];
}

export default function WeeklyBrandBannerSlide2({
  isAr,
  brandName,
  brandStory,
  brandLogo,
  displayProducts,
}: Slide2Props) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width: '100%', minHeight: '440px', backgroundColor: '#16241e' }} />;
  }

  return (
    <>
      <style>{`
        .slide2-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          direction: rtl;
          padding: 60px 100px;
          color: #FFFFFF;
          min-height: 440px;
          background-image: linear-gradient(135deg, #2d473b 0%, #16241e 100%);
          box-sizing: border-box;
          gap: 32px;
        }

        .slide2-info {
          max-width: 500px;
          text-align: right;
          flex-shrink: 0;
        }

        .slide2-title {
          font-size: 2.4rem;
          font-weight: 800;
          margin: 10px 0 12px 0;
          line-height: 1.2;
        }

        .slide2-products {
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: flex-start;
          direction: ltr;
        }

        .slide2-card {
          background-color: #FFFFFF;
          padding: 18px;
          border-radius: 18px;
          color: #20232B;
          width: 190px;
          height: 270px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          text-align: center;
          overflow: hidden;
          cursor: pointer;
          box-sizing: border-box;
          transition: transform 0.2s ease;
        }

        .slide2-card:hover {
          transform: translateY(-4px);
        }

        .slide2-card-img {
          width: 100%;
          height: 145px;
          border-radius: 12px;
          background-color: #F5F2EC;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* شاشات التابلت (أقل من 1024px) */
        @media (max-width: 1024px) {
          .slide2-wrapper {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 45px 32px;
            min-height: auto;
          }

          .slide2-info {
            max-width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .slide2-title {
            font-size: 2rem;
          }

          .slide2-products {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
          }
        }

        /* شاشات الموبايل (أقل من 640px) */
        @media (max-width: 640px) {
          .slide2-wrapper {
            padding: 32px 16px;
            gap: 24px;
          }

          .slide2-title {
            font-size: 1.55rem;
          }

          .slide2-products {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            width: 100%;
          }

          .slide2-products a {
            width: 100%;
            display: block;
          }

          .slide2-card {
            width: 100%;
            height: 225px;
            padding: 12px;
            border-radius: 14px;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
          }

          .slide2-card-img {
            height: 115px;
            border-radius: 10px;
          }
        }
      `}</style>

      <div className="slide2-wrapper">
        {/* تفاصيل البراند */}
        <div className="slide2-info">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#A6C96A', color: '#20232B', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '900', marginBottom: '10px' }}>
            <span>★ {String(brandName || '')}</span>
            {brandLogo && <img src={brandLogo} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />}
          </div>
          <h2 className="slide2-title">
            {isAr ? 'منتجات البراند المميزة' : 'Featured Brand Products'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#DAD8D2', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>
            {String(brandStory || '')}
          </p>
        </div>

        {/* بطاقات المنتجات */}
        <div className="slide2-products">
          {displayProducts.map((prod) => {
            const prodImage = prod?.images?.[0] || prod?.image || '';

            let prodName = 'Product';
            if (isAr) {
              prodName = prod?.nameAr || prod?.title?.AR || prod?.title?.en || prod?.nameEn || 'منتج';
            } else {
              prodName = prod?.nameEn || prod?.title?.EN || prod?.title?.ar || prod?.nameAr || 'Product';
            }

            const prodPrice = prod?.price || 0;
            const prodId = prod?.id || prod?._id || 1;
            const productHref = prodId ? `/products/${prodId}` : '#';

            return (
              <Link key={prodId} href={productHref} style={{ textDecoration: 'none' }}>
                <div className="slide2-card">
                  <div className="slide2-card-img">
                    {prodImage ? (
                      <img src={prodImage} alt={prodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: '700' }}>KASHFA</span>
                    )}
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#20232B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {prodName}
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#2d473b', backgroundColor: '#F5F2EC', padding: '4px 12px', borderRadius: '10px' }}>
                    {prodPrice} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}