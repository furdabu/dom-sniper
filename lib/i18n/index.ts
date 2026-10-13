import { browser } from 'wxt/browser';
import { en, type Messages } from './en';
import { ja } from './ja';

export type { Messages };

// 言語を増やすときは、辞書ファイルを足してここと LOCALE_NAMES に登録する
const MESSAGES = { en, ja } satisfies Record<string, Messages>;

export type Locale = keyof typeof MESSAGES;
/** 設定値。auto はブラウザの表示言語に合わせる */
export type Language = Locale | 'auto';

export const LOCALES = Object.keys(MESSAGES) as Locale[];

/** 言語の選択肢に出す名前。その言語自身での呼び名にする */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
};

export function isLanguage(value: unknown): value is Language {
  return value === 'auto' || LOCALES.includes(value as Locale);
}

export function resolveLocale(language: Language): Locale {
  if (language !== 'auto') return language;
  const ui = browser.i18n.getUILanguage().toLowerCase();
  return LOCALES.find((locale) => ui === locale || ui.startsWith(`${locale}-`)) ?? 'en';
}

export function getMessages(language: Language): Messages {
  return MESSAGES[resolveLocale(language)];
}
