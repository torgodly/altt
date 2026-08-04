'use client';

import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { t } from '@/lib/i18n';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAdminLink?: boolean;
  adminActions?: React.ReactNode;
}

export function Header({ title, subtitle, showAdminLink, adminActions }: HeaderProps) {
  const { lang, theme, toggleLang, toggleTheme } = useApp();

  return (
    <header className="header-nav">
      <div className="brand-logo">
        <div className="logo-icon">
          <img src="/images/logo.png" alt={t(lang, 'clinicTitle')} className="brand-logo-img" />
        </div>
        <div className="brand-text">
          <h1>{title || t(lang, 'clinicTitle')}</h1>
          <p>{subtitle || t(lang, 'clinicSubtitle')}</p>
        </div>
      </div>
      <div className="nav-actions">
        {adminActions}
        <button type="button" className="btn-icon-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span>{theme === 'dark' ? t(lang, 'lightTheme') : t(lang, 'darkTheme')}</span>
        </button>
        <button type="button" className="btn-icon-toggle" onClick={toggleLang} aria-label="Toggle Language">
          🌐 <span>{t(lang, 'langSwitch')}</span>
        </button>
        {showAdminLink && (
          <Link href="/admin/login" className="btn btn-secondary btn-sm">
            🔐 {t(lang, 'adminPanelLogin')}
          </Link>
        )}
      </div>
    </header>
  );
}
