'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Lang } from '@/lib/types';

type Theme = 'dark' | 'light';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface AppContextValue {
  lang: Lang;
  theme: Theme;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('dental_lang') as Lang | null;
    const savedTheme = localStorage.getItem('dental_theme') as Theme | null;
    if (savedLang === 'ar' || savedLang === 'en') setLangState(savedLang);
    if (savedTheme === 'dark' || savedTheme === 'light') setThemeState(savedTheme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('dental_lang', lang);
  }, [lang, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dental_theme', theme);
  }, [theme, hydrated]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      theme,
      setLang: setLangState,
      toggleLang: () => setLangState((l) => (l === 'ar' ? 'en' : 'ar')),
      toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
      showToast,
    }),
    [lang, theme, showToast]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <span style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <div>{toast.message}</div>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
