import type { Locale } from '@/lib/i18n';

const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
const DATE_AND_TIME: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric', ...TIME };

/** 今日のものは時刻だけ、それ以外は日付も付ける */
export function formatTime(timestamp: number, locale: Locale): string {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(locale, isToday ? TIME : DATE_AND_TIME).format(date);
}

/** クエリやハッシュを除いた、一覧表示用の短い URL */
export function formatPage(url: string): string {
  try {
    const { host, pathname } = new URL(url);
    return host + (pathname === '/' ? '' : pathname);
  } catch {
    return url;
  }
}
