'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Slide1Props {
  isAr: boolean;
  brandTitle: any;
  brandSubtitle: any;
  brandStory: any;
  brandVideo: any;
  brandImage: any;
  brandLogo: any;
  brandName: any;
  viewMode: 'story' | 'video';
  setViewMode: (mode: 'story' | 'video') => void;
  currentBrandSlug: any;
}

export default function WeeklyBrandBannerSlide1({
  isAr,
  brandTitle,
  brandSubtitle,
  brandStory,
  brandVideo,
  brandImage,
  brandLogo,
  brandName,
  viewMode,
  setViewMode,
  currentBrandSlug,
}: Slide1Props) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const brandProfileLink = currentBrandSlug ? `/brands/${currentBrandSlug}` : `/brands/kashafa-studio`;

  if (!isMounted) {
    return <div style={{ width: '100%', minHeight: '440px', backgroundColor: '#16241e' }} />;
  }

  return (
    <>
      <style>{`
        .slide1-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          direction: rtl;
          padding: 60px 80px;
          color: #FFFFFF;
          min-height: 440px;
          background-image: ${
            brandImage 
              ? `linear-gradient(to right, rgba(32, 35, 43, 0.85), rgba(32, 35, 43, 0.35)), url(${brandImage})`
              : 'linear-gradient(135deg, #2d473b 0%, #16241e 100%)'
          };
          background-size: cover;
          background-position: center;
          box-sizing: border-box;
        }

        .slide1-content {
          max-width: 650px;
          width: 100%;
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-right: 0;
          margin-left: auto;
        }

        .slide1-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 14px;
          width: 100%;
          text-align: right;
        }

        /* شاشات التابلت والشاشات المتوسطة (أقل من 1024px) */
        @media (max-width: 1024px) {
          .slide1-wrapper {
            padding: 45px 50px;
          }
          .slide1-content {
            max-width: 100%;
            margin: 0 auto;
            align-items: center;
            text-align: center;
          }
          .slide1-title {
            font-size: 2.2rem;
            text-align: center;
          }
          .slide1-content p, .slide1-content div {
            text-align: center !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }

        /* شاشات الموبايل (أقل من 640px) - إضافة مسافة أمان للأسهم */
        @media (max-width: 640px) {
          .slide1-wrapper {
            padding: 32px 45px; /* مسافة أمان جانبية أوسع عشان الأسهم متجيش ع الكلام */
          }
          .slide1-title {
            font-size: 1.55rem;
            line-height: 1.25;
            margin-bottom: 10px;
            text-align: center;
          }
          .slide1-content {
            align-items: center;
            text-align: center;
          }
          .slide1-content p, .slide1-content div {
            text-align: center !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="slide1-wrapper">
        <div className="slide1-content">
          
          {/* شارة البراند وزرار الفيديو */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: '#A6C96A', 
              color: '#20232B', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold' 
            }}>
              {brandLogo && (
                <img src={brandLogo} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <span>★ {String(brandName || '')}</span>
            </div>

            {brandVideo && (
              <button 
                onClick={() => setViewMode(viewMode === 'story' ? 'video' : 'story')}
                style={{
                  backgroundColor: '#20232B', 
                  border: '1px solid #A6C96A', 
                  color: '#A6C96A',
                  padding: '7px 16px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {viewMode === 'story' ? (isAr ? '🎥 مشاهدة الفيديو' : '🎥 Watch Video') : (isAr ? '📖 قصة البراند' : '📖 Read Story')}
              </button>
            )}

          </div>
          
          <h1 className="slide1-title">
            {String(brandTitle || '')}
          </h1>

          {viewMode === 'story' || !brandVideo ? (
            <>
              <p style={{ fontSize: '1rem', color: '#DAD8D2', marginBottom: '10px', lineHeight: '1.5', width: '100%', textAlign: 'center' }}>
                {String(brandSubtitle || '')}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#B5C2B7', marginBottom: '24px', lineHeight: '1.6', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                {String(brandStory || '')}
              </p>
            </>
          ) : (
            <div style={{ marginBottom: '24px', width: '100%', maxWidth: '380px', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3A3F4B' }}>
              {String(brandVideo).startsWith('data:video') || String(brandVideo).includes('blob:') ? (
                <video src={brandVideo} controls style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#000' }} />
              ) : (
                <iframe width="100%" height="100%" src={brandVideo} title="Brand Video" frameBorder="0" allowFullScreen></iframe>
              )}
            </div>
          )}
          
          <Link href={brandProfileLink} style={{ 
            backgroundColor: '#A6C96A', 
            color: '#20232B', 
            textDecoration: 'none',
            padding: '12px 30px', 
            borderRadius: '35px', 
            fontWeight: '800', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '1rem', 
            boxShadow: '0 6px 20px rgba(166, 201, 106, 0.35)'
          }}>
            <span>{isAr ? 'اكتشف البراند الآن' : 'Discover Brand Now'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>

        </div>
      </div>
    </>
  );
}