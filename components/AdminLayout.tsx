'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { t } from '@/lib/i18n';
import type { SessionUser } from '@/lib/types';

interface AdminLayoutProps {
  user: SessionUser | null;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  onSidebarClose: () => void;
  onOpenDoctors: () => void;
  onOpenAudit: () => void;
  onOpenUsers: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  user,
  sidebarOpen,
  onSidebarToggle,
  onSidebarClose,
  onOpenDoctors,
  onOpenAudit,
  onOpenUsers,
  onExportBackup,
  onImportBackup,
  onLogout,
  children,
}: AdminLayoutProps) {
  const { lang, theme, toggleLang, toggleTheme } = useApp();

  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

  const navItem = (icon: string, label: string, onClick: () => void) => (
    <button
      type="button"
      className="admin-nav-item"
      onClick={() => {
        onClick();
        onSidebarClose();
      }}
    >
      <span className="admin-nav-icon">{icon}</span>
      <span className="admin-nav-label">{label}</span>
    </button>
  );

  return (
    <div className="admin-shell" id="dashboard-app">
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={onSidebarClose}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <img src="/images/logo.png" alt="" />
          </div>
          <div>
            <strong>{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</strong>
            <small>{t(lang, 'clinicTitle')}</small>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <Link href="/admin/dashboard" className="admin-nav-item active" onClick={onSidebarClose}>
            <span className="admin-nav-icon">📊</span>
            <span className="admin-nav-label">{lang === 'ar' ? 'المرضى' : 'Patients'}</span>
          </Link>
          <Link href="/" className="admin-nav-item" onClick={onSidebarClose}>
            <span className="admin-nav-icon">➕</span>
            <span className="admin-nav-label">{lang === 'ar' ? 'تسجيل مريض' : 'New Patient'}</span>
          </Link>
          {navItem('🩺', lang === 'ar' ? 'الأطباء' : 'Doctors', onOpenDoctors)}
          {navItem('📋', t(lang, 'auditLogTitle'), onOpenAudit)}
          {user?.canManageUsers && navItem('👤', lang === 'ar' ? 'المستخدمون' : 'Users', onOpenUsers)}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-nav-item" onClick={onExportBackup}>
            <span className="admin-nav-icon">💾</span>
            <span className="admin-nav-label">{lang === 'ar' ? 'نسخ احتياطي' : 'Backup'}</span>
          </button>
          <label className="admin-nav-item admin-nav-item--file">
            <span className="admin-nav-icon">📥</span>
            <span className="admin-nav-label">{lang === 'ar' ? 'استعادة' : 'Restore'}</span>
            <input
              type="file"
              accept=".json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportBackup(file);
                e.target.value = '';
              }}
            />
          </label>
          <button type="button" className="admin-nav-item admin-nav-item--danger" onClick={onLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span className="admin-nav-label">{t(lang, 'logout')}</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={onSidebarToggle}
              aria-label={lang === 'ar' ? 'القائمة' : 'Menu'}
            >
              ☰
            </button>
            <div className="admin-topbar-title">
              <h1>{t(lang, 'adminDashboard')}</h1>
              <p>{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <button type="button" className="admin-topbar-btn" onClick={toggleTheme} aria-label="Theme">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button type="button" className="admin-topbar-btn" onClick={toggleLang} aria-label="Language">
              🌐
            </button>
            {user && (
              <div className="admin-user-chip">
                <span className="admin-user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                <span className="admin-user-name">{user.username}</span>
              </div>
            )}
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
