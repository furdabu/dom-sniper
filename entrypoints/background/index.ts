import { browser, type Browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { broadcast } from '@/lib/broadcast';
import { addCapture } from '@/lib/db';
import { TOGGLE_COMMAND, type BackgroundRequest, type Result } from '@/lib/messages';
import { sendPickerCommand } from '@/lib/picker-client';
import type { Capture, ElementSnapshot } from '@/lib/types';
import { captureElement } from './screenshot';

export default defineBackground(() => {
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  browser.commands.onCommand.addListener((command, tab) => {
    if (command !== TOGGLE_COMMAND || tab?.id == null) return;
    const tabId = tab.id;
    togglePicker(tabId).catch(() => flashBadge(tabId));
  });

  browser.runtime.onMessage.addListener(
    (message: BackgroundRequest, sender, sendResponse: (result: Result) => void) => {
      switch (message?.type) {
        case 'toggle-picker':
          respond(togglePicker(message.tabId), sendResponse);
          return true;
        case 'capture':
          respond(saveCapture(message.snapshot, sender.tab), sendResponse);
          return true;
      }
    },
  );
});

function respond(work: Promise<void>, sendResponse: (result: Result) => void) {
  work.then(
    () => sendResponse({ ok: true }),
    (error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }),
  );
}

/** 注入済みならトグルし、未注入なら注入する (content script は注入時に選択モードを開始する) */
async function togglePicker(tabId: number): Promise<void> {
  if (await sendPickerCommand(tabId, { type: 'picker:toggle' })) return;
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/content-scripts/picker.js'],
  });
}

async function saveCapture(snapshot: ElementSnapshot, tab?: Browser.tabs.Tab): Promise<void> {
  // スクリーンショットが撮れなくても、テキスト情報だけで履歴に残す
  const screenshot = tab
    ? await captureElement(tab.windowId, snapshot).catch((error) => {
        console.warn('[DOM Sniper] Failed to capture a screenshot', error);
        return undefined;
      })
    : undefined;

  const capture: Capture = {
    ...snapshot,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    screenshot,
  };
  await addCapture(capture);
  broadcast({ type: 'captures-changed', addedId: capture.id });
}

/** chrome:// など注入できないページでショートカットを押したときの合図 */
function flashBadge(tabId: number) {
  void browser.action.setBadgeBackgroundColor({ color: '#e11d48' });
  void browser.action.setBadgeText({ tabId, text: '!' });
  setTimeout(() => void browser.action.setBadgeText({ tabId, text: '' }), 2000);
}
