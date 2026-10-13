import { storage } from 'wxt/utils/storage';
import { isLanguage, type Language } from './i18n';
import { DEFAULT_KEYS, type KeyBindings } from './keys';

export interface Settings {
  language: Language;
  keys: KeyBindings;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'auto',
  keys: DEFAULT_KEYS,
};

// sync に置くので、同じアカウントの他の Chrome にも引き継がれる
const item = storage.defineItem<Partial<Settings>>('sync:settings', { fallback: {} });

/** 保存済みの値に無い項目 (後から追加した設定など) は既定値で補う */
function normalize(stored: Partial<Settings> | null): Settings {
  return {
    language: isLanguage(stored?.language) ? stored.language : DEFAULT_SETTINGS.language,
    keys: { ...DEFAULT_KEYS, ...stored?.keys },
  };
}

export async function loadSettings(): Promise<Settings> {
  return normalize(await item.getValue());
}

export async function saveSettings(settings: Settings): Promise<void> {
  await item.setValue(settings);
}

/** 他の画面やタブでの変更も届く。戻り値で解除する */
export function watchSettings(callback: (settings: Settings) => void): () => void {
  return item.watch((value) => callback(normalize(value)));
}
