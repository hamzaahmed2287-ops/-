'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/app/layout';

interface Props {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function AdminHeader({ isLoggedIn, onLogout }: Props) {
  const lang = useLang();
  const isAr = lang === 'AR';

  const handleToggleLang = () => {
    const next = isAr ? 'EN' : 'AR';
    localStorage.setItem('kashafa_lang', next);
    window.dispatchEvent(new Event('langChanged'));
  };

  return (
    <header style={{
      backgroundColor: '#20232B',
      color: '#F5F2EC',
      padding: '14px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #3A3F4C',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: isAr ? 'rtl' : 'ltr',
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* اليمين/الشمال: شعار كشافة + لقب السوبر أدمن */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ backgroundColor: '#F5F2EC', padding: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/logo.png" alt="KASHAFA" width={34} height={34} style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, letterSpacing: '1px', color: '#F5F2EC' }}>
              KASHAFA
            </h2>
            <span style={{ backgroundColor: '#A6C96A', color: '#20232B', fontSize: '0.72rem', fontWeight: '900', padding: '2px 10px', borderRadius: '10px' }}>
              {isAr ? 'سوبر أدمن' : 'SUPER ADMIN'}
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#9DA3B0', fontWeight: '600' }}>
            {isAr ? 'بوابة الإدارة المركزية للمنصة' : 'Central Platform Control Panel'}
          </span>
        </div>
      </div>

      {/* الأزرار: الترجمة + العودة للمتجر + تسجيل الخروج */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleToggleLang}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#F5F2EC',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '9px 16px',
            borderRadius: '22px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          {isAr ? 'EN' : 'العربية'}
        </button>

        <Link
          href="/"
          style={{
            color: '#F5F2EC',
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '9px 18px',
            borderRadius: '22px',
            fontSize: '0.85rem',
            fontWeight: '700',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          {isAr ? '← العودة للمتجر' : '← Storefront'}
        </Link>

        {isLoggedIn && (
          <button
            type="button"
            onClick={onLogout}
            style={{
              backgroundColor: '#D9534F',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '22px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        )}
      </div>
    </header>
  );
}