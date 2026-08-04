import type { Lang } from '@/lib/types';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]!
  );
}

export function formatTimeTo12Hour(timeStr: string, lang: Lang = 'ar'): string {
  if (!timeStr) return '-';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;

  const ampm =
    h >= 12 ? (lang === 'ar' ? 'مساءً' : 'PM') : lang === 'ar' ? 'صباحاً' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hStr = h < 10 ? '0' + h : '' + h;
  return `${hStr}:${m} ${ampm}`;
}

export function getDayNameFromDate(dateStr: string, lang: Lang = 'ar'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (lang === 'ar') {
      const arDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return arDays[d.getDay()] || '';
    }
    const enDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return enDays[d.getDay()] || '';
  } catch {
    return '';
  }
}

export const ACTION_TYPE_META: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  register: { icon: '➕', label: 'تسجيل', color: '#10b981' },
  edit: { icon: '✏️', label: 'تعديل', color: '#f59e0b' },
  delete: { icon: '🗑️', label: 'حذف', color: '#ef4444' },
  followup: { icon: '📅', label: 'متابعة', color: '#3b82f6' },
  print: { icon: '🖨️', label: 'طباعة', color: '#8b5cf6' },
  view: { icon: '👁️', label: 'عرض', color: '#64748b' },
  login: { icon: '🔐', label: 'دخول', color: '#06b6d4' },
  logout: { icon: '🚪', label: 'خروج', color: '#94a3b8' },
  backup: { icon: '💾', label: 'نسخ', color: '#a855f7' },
  restore: { icon: '📥', label: 'استعادة', color: '#f97316' },
  tooth: { icon: '🦷', label: 'أسنان', color: '#14b8a6' },
  attach: { icon: '📎', label: 'مرفق', color: '#ec4899' },
  system: { icon: '⚙️', label: 'نظام', color: '#64748b' },
};

export function detectActionType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('register') || a.includes('new patient')) return 'register';
  if (a.includes('edit') || a.includes('updated')) return 'edit';
  if (a.includes('delete') || a.includes('deleted')) return 'delete';
  if (a.includes('follow-up') || a.includes('followup')) return 'followup';
  if (a.includes('print') || a.includes('طباعة')) return 'print';
  if (a.includes('view') || a.includes('opened')) return 'view';
  if (a.includes('login') || a.includes('logged in')) return 'login';
  if (a.includes('logout') || a.includes('logged out')) return 'logout';
  if (a.includes('backup') || a.includes('export')) return 'backup';
  if (a.includes('restore') || a.includes('import')) return 'restore';
  if (a.includes('tooth') || a.includes('odontogram')) return 'tooth';
  if (a.includes('attachment') || a.includes('uploaded')) return 'attach';
  return 'system';
}
