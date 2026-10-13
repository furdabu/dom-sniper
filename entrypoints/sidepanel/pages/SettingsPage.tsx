import { useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { isLanguage, LOCALE_NAMES, LOCALES } from '@/lib/i18n';
import {
  assignKey,
  bindingFromEvent,
  DEFAULT_KEYS,
  isSameKeys,
  PICKER_ACTIONS,
  type KeyBinding,
} from '@/lib/keys';
import { Icon } from '../components/Icon';
import { useGoBack } from '../hooks/useGoBack';
import { useShortcut } from '../hooks/useShortcut';
import { useSettings } from '../settings';

const SHORTCUTS_URL = 'chrome://extensions/shortcuts';

export function SettingsPage() {
  const { settings, update, t } = useSettings();
  const goBack = useGoBack();
  const shortcut = useShortcut();

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <button type="button" className="button button--text" onClick={goBack}>
          <Icon name="back" />
          <span>{t.history.title}</span>
        </button>
      </header>

      <main className="page__body settings">
        <h1 className="settings__title">{t.settings.title}</h1>

        <section className="settings__section">
          <h2 className="settings__heading">
            <label htmlFor="language">{t.settings.language}</label>
          </h2>
          <select
            id="language"
            className="select"
            value={settings.language}
            onChange={(event) => {
              if (isLanguage(event.target.value)) update({ language: event.target.value });
            }}
          >
            <option value="auto">{t.settings.languageAuto}</option>
            {LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_NAMES[locale]}
              </option>
            ))}
          </select>
        </section>

        <section className="settings__section">
          <h2 className="settings__heading">{t.settings.keys}</h2>
          <p className="settings__hint">{t.settings.keysHint}</p>
          {PICKER_ACTIONS.map((action) => (
            <div key={action} className="settings__row">
              <span>{t.settings.actions[action]}</span>
              <KeyField
                binding={settings.keys[action]}
                label={t.settings.actions[action]}
                onChange={(binding) => update({ keys: assignKey(settings.keys, action, binding) })}
              />
            </div>
          ))}
          <div className="settings__footer">
            <button
              type="button"
              className="button button--text"
              disabled={isSameKeys(settings.keys, DEFAULT_KEYS)}
              onClick={() => update({ keys: DEFAULT_KEYS })}
            >
              {t.settings.reset}
            </button>
          </div>

          <div className="settings__row">
            <span>{t.settings.shortcut}</span>
            <kbd className="keycap keycap--static">{shortcut || t.settings.shortcutUnset}</kbd>
          </div>
          <p className="settings__hint">{t.settings.shortcutNote}</p>
          <div>
            <button
              type="button"
              className="button"
              onClick={() => void browser.tabs.create({ url: SHORTCUTS_URL })}
            >
              {t.settings.shortcutOpen}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/** クリックすると入力待ちになり、次に押されたキーを割り当てる */
function KeyField({
  binding,
  label,
  onChange,
}: {
  binding: KeyBinding;
  label: string;
  onChange: (binding: KeyBinding) => void;
}) {
  const { t } = useSettings();
  const [recording, setRecording] = useState(false);
  // 割り当てに使った Enter / Space が、そのままボタンの「クリック」として働くのを防ぐ
  const swallowKeyUp = useRef(false);

  return (
    <button
      type="button"
      className={`keycap ${recording ? 'is-recording' : ''}`}
      aria-label={`${label}: ${binding.label}`}
      onClick={() => setRecording((current) => !current)}
      onBlur={() => setRecording(false)}
      onKeyDown={(event) => {
        if (!recording) return;
        // Esc も割り当てられるキーなので、入力待ちの取り消しはクリックかフォーカス移動で行う
        event.preventDefault();
        event.stopPropagation();
        const next = bindingFromEvent(event.nativeEvent);
        if (!next) return;
        swallowKeyUp.current = true;
        onChange(next);
        setRecording(false);
      }}
      onKeyUp={(event) => {
        if (!swallowKeyUp.current) return;
        swallowKeyUp.current = false;
        event.preventDefault();
      }}
    >
      {recording ? t.settings.pressKey : binding.label}
    </button>
  );
}
