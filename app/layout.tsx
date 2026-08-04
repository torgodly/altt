import type { Metadata } from 'next';
import { AppProvider } from '@/components/AppProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'المركز التخصصي لطب وزراعة الاسنان | تسجيل المريض',
  description: 'نظام تسجيل وحفظ ملفات المرضى الإلكتروني',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
