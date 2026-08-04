'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { t } from '@/lib/i18n';

export function AdminLogin() {
  const { lang, theme, toggleLang, toggleTheme, showToast } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) router.replace('/admin/dashboard');
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const username = String(fd.get('username') || '').trim();
    const password = String(fd.get('password') || '');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        showToast(
          lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password',
          'error'
        );
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      showToast(lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button type="button" className="btn-icon-toggle" onClick={toggleTheme}>
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span>{theme === 'dark' ? t(lang, 'lightTheme') : t(lang, 'darkTheme')}</span>
          </button>
          <button type="button" className="btn-icon-toggle" onClick={toggleLang}>
            🌐 <span>{t(lang, 'langSwitch')}</span>
          </button>
        </div>

        <div className="brand-logo" style={{ justifyContent: 'center', flexDirection: 'column', textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ width: 70, height: 70, marginBottom: '0.75rem' }}>
            <img src="/images/logo.png" alt="" className="brand-logo-img" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {lang === 'ar' ? 'تسجيل دخول لوحة التحكم' : 'Admin Dashboard Login'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t(lang, 'clinicTitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="username">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
            <input id="username" name="username" type="text" className="form-control no-icon" required autoComplete="username" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input id="password" name="password" type="password" className="form-control no-icon" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            🔑 {lang === 'ar' ? 'دخول النظام' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ← {lang === 'ar' ? 'العودة لصفحة تسجيل المريض' : 'Back to patient registration'}
          </Link>
        </div>
      </div>
    </div>
  );
}
