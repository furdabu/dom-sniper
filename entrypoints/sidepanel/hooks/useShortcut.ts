import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { TOGGLE_COMMAND } from '@/lib/messages';

/** 要素選択に割り当てられているショートカット。未割り当てなら空文字 */
export function useShortcut(): string {
  const [shortcut, setShortcut] = useState('');

  useEffect(() => {
    const refresh = () =>
      void browser.commands.getAll().then((commands) => {
        setShortcut(commands.find((command) => command.name === TOGGLE_COMMAND)?.shortcut ?? '');
      });

    refresh();
    // 変更を知らせるイベントは無いので、Chrome の設定画面から戻ってきたときに読み直す
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return shortcut;
}
