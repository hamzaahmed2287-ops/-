'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';

export default function SiteFooterSupport() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [settings, setSettings] = useState({
    supportPhone: '01080967125',
    supportEmail: 'support@kashafa.eg',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com'
  });

  // جلب إعدادات الموقع والدعم الفني من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/settings/footer`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for footer settings');
      }

      // البديل المحلي في حال عدم اتصال السيرفر
      const saved = localStorage.getItem('kashafa_site_settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {}
      }
    };

    fetchFooterSettings();

    // الاستماع لتحديثات التخزين المحلي والـ events
    const loadSettings = () => {
      const saved = localStorage.getItem('kashafa_site_settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {}
      }
    };

    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  return (
    <footer style={{ backgroundColor: '#20232B', color: '#F5F2EC', padding: '40px 20px', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', alignItems: 'center' }}>
        
        {/* معلومات الدعم الفني */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '12px', color: '#A6C96A' }}>
            {isAr ? 'الدعم الفني وخدمة العملاء' : 'Customer Support'}
          </h3>
          <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>
            📞 <a href={`tel:${settings.supportPhone}`} style={{ color: '#F5F2EC', textDecoration: 'none' }}>{settings.supportPhone}</a>
          </p>
          <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>
            ✉️ <a href={`mailto:${settings.supportEmail}`} style={{ color: '#F5F2EC', textDecoration: 'none' }}>{settings.supportEmail}</a>
          </p>
        </div>

        {/* أيقونات السوشيال ميديا بـ SVG دقيق ومربوطة بالروابط */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          
          {/* فيسبوك SVG */}
          {settings.facebookUrl && (
            <a 
              href={settings.facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Facebook"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5F2EC">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </a>
          )}

          {/* انستجرام SVG */}
          {settings.instagramUrl && (
            <a 
              href={settings.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Instagram"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F2EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          )}

          {/* تيك توك SVG */}
          {settings.tiktokUrl && (
            <a 
              href={settings.tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="TikTok"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="#F5F2EC">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.242V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002-.001a2.895 2.895 0 0 1 3.144-4.53v-3.48a6.342 6.342 0 1 0-1.623 12.44 6.34 6.34 0 0 0 5.405-3.083V9.664a8.196 8.196 0 0 0 4.896 1.62v-3.445a4.75 4.75 0 0 1-1.458-.153z"/>
              </svg>
            </a>
          )}

        </div>

      </div>
    </footer>
  );
}