'use client';
import { useState } from 'react';
import { useLang } from '@/app/layout';

interface Props {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: Props) {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // التحقق عبر السيرفر وقاعدة البيانات فقط - لا fallback credentials في الكود
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('kashafa_admin_logged', 'true');
        if (data?.token) {
          localStorage.setItem('kashafa_admin_token', data.token);
        }
        onLoginSuccess();
        return;
      } else {
        // Server returned 401/403 — show error
        setError(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Network error or server unreachable
      console.warn('Server unreachable. Please ensure the backend is running.');
      setError(true);
      setLoading(false);
    }
  };

  const t = {
    title: isAr ? 'دخول لوحة السوبر أدمن' : 'Super Admin Portal',
    subtitle: isAr ? 'مخصص لإدارة منصة كشافة' : 'Restricted area for Kashafa management',
    emailLabel: isAr ? 'البريد الإلكتروني للأدمن' : 'Admin Email',
    passLabel: isAr ? 'كلمة المرور' : 'Password',
    loginBtn: isAr ? 'تسجيل الدخول' : 'Sign In',
    loadingBtn: isAr ? 'جاري التحقق...' : 'Verifying...',
    errorMsg: isAr ? '✗ البريد الإلكتروني أو كلمة المرور غير صحيحة' : '✗ Invalid email or password',
    show: isAr ? 'إظهار' : 'Show',
    hide: isAr ? 'إخفاء' : 'Hide'
  };

  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <form onSubmit={handleLogin} style={{ maxWidth: '420px', width: '100%', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #DAD8D2', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', marginTop: '10px', color: '#20232B' }}>
            {t.title}
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
            {t.subtitle}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FDF2F2', color: '#D9534F', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', marginBottom: '15px' }}>
            {t.errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#20232B' }}>
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              placeholder="hamza.ahmed2287@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none', textAlign: isAr ? 'right' : 'left' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#20232B' }}>
              {t.passLabel}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="TWA@1234$"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 45px 12px 14px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none', textAlign: isAr ? 'right' : 'left' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  [isAr ? 'left' : 'right']: '12px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '0.8rem', 
                  fontWeight: '800', 
                  color: '#2D473B' 
                }}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '800', cursor: 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t.loadingBtn : t.loginBtn}
          </button>
        </div>

      </form>
    </div>
  );
}