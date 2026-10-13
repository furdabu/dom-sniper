import { useCallback, useEffect, useRef, useState } from 'react';
import { browser, type Browser } from 'wxt/browser';
import { actionForEvent, type KeyBindings } from '@/lib/keys';
import type { BackgroundRequest, Broadcast, Result } from '@/lib/messages';
import { sendPickerCommand } from '@/lib/picker-client';

const ERROR_DURATION = 4000;

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

/** サイドパネルが付いているウィンドウの、表示中のタブに対する要素選択モード */
export function usePicker(keys: KeyBindings) {
  const [active, setActive] = useState(false);
  /** 表示中のタブで選択を始められなかった (chrome:// など) */
  const [unavailable, setUnavailable] = useState(false);
  const tabId = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const id = await getActiveTabId();
      const state = id == null ? undefined : await sendPickerCommand(id, { type: 'picker:get-state' });
      if (cancelled) return;
      tabId.current = id;
      setActive(state?.active ?? false);
    };
    const onMessage = (message: Broadcast, sender: Browser.runtime.MessageSender) => {
      if (message?.type === 'picker-state' && sender.tab?.id === tabId.current) {
        setActive(message.active);
      }
    };
    // ページを読み込み直すと content script ごと消える
    const onUpdated = (id: number, info: Browser.tabs.OnUpdatedInfo) => {
      if (id === tabId.current && info.status === 'loading') setActive(false);
    };

    void sync();
    browser.runtime.onMessage.addListener(onMessage);
    browser.tabs.onActivated.addListener(sync);
    browser.tabs.onUpdated.addListener(onUpdated);
    return () => {
      cancelled = true;
      browser.runtime.onMessage.removeListener(onMessage);
      browser.tabs.onActivated.removeListener(sync);
      browser.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  // 選択中にサイドパネルへフォーカスがあるとページ側でキーを拾えないので、こちらから転送する
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // 文字キーを割り当てていても、検索欄には普通に入力できるようにする
      if (event.target instanceof HTMLInputElement) return;
      const action = actionForEvent(keys, event);
      if (!action || tabId.current == null) return;
      event.preventDefault();
      void sendPickerCommand(tabId.current, { type: 'picker:action', action });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, keys]);

  useEffect(() => {
    if (!unavailable) return;
    const timer = setTimeout(() => setUnavailable(false), ERROR_DURATION);
    return () => clearTimeout(timer);
  }, [unavailable]);

  const toggle = useCallback(async () => {
    setUnavailable(false);
    const id = await getActiveTabId();
    tabId.current = id;
    const result =
      id == null
        ? undefined
        : await browser.runtime
            .sendMessage<BackgroundRequest, Result>({ type: 'toggle-picker', tabId: id })
            .catch(() => undefined);
    if (!result?.ok) setUnavailable(true);
  }, []);

  return { active, unavailable, toggle };
}
