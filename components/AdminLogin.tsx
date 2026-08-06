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
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

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
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card-header">
          <div className="admin-login-brand">
            <img src="/images/logo.png" alt="" />
            <div>
              <h1>{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</h1>
              <p>{t(lang, 'clinicTitle')}</p>
            </div>
          </div>
          <div className="admin-login-toggles">
            <button type="button" className="admin-topbar-btn" onClick={toggleTheme} aria-label="Theme">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button type="button" className="admin-topbar-btn" onClick={toggleLang} aria-label="Language">
              🌐
            </button>
          </div>
        </div>

        <h2>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in to continue'}</h2>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
            <input id="username" name="username" type="text" className="form-control no-icon" required autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input id="password" name="password" type="password" className="form-control no-icon" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '⏳ ...' : `🔑 ${lang === 'ar' ? 'دخول النظام' : 'Sign In'}`}
          </button>
        </form>

        <Link href="/" className="admin-login-back">
          ← {lang === 'ar' ? 'العودة لتسجيل المريض' : 'Back to patient registration'}
        </Link>
      </div>
    </div>
  );
}
