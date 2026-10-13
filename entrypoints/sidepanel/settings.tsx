import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getMessages, resolveLocale, type Locale, type Messages } from '@/lib/i18n';
import { saveSettings, watchSettings, type Settings } from '@/lib/settings';

interface SettingsContextValue {
  settings: Settings;
  update(patch: Partial<Settings>): void;
  locale: Locale;
  /** 現在の言語の辞書 */
  t: Messages;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ initial, children }: { initial: Settings; children: ReactNode }) {
  const [settings, setSettings] = useState(initial);
  const latest = useRef(settings);
  latest.current = settings;

  useEffect(() => watchSettings(setSettings), []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setSettings(next);
    void saveSettings(next);
  }, []);

  const value = useMemo(() => {
    const locale = resolveLocale(settings.language);
    return { settings, update, locale, t: getMessages(locale) };
  }, [settings, update]);

  useEffect(() => {
    document.documentElement.lang = value.locale;
  }, [value.locale]);

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
