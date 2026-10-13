import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { formatCapture } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type {
  BackgroundRequest,
  Broadcast,
  PickerCommand,
  PickerState,
  Result,
} from '@/lib/messages';
import { DEFAULT_SETTINGS, loadSettings, watchSettings, type Settings } from '@/lib/settings';
import { writeClipboard, writeClipboardLegacy } from './clipboard';
import { showToast } from './overlay';
import { createPicker } from './picker';
import { takeSnapshot } from './snapshot';

// background が scripting.executeScript で注入する。注入 = 選択モードの開始で、
// 以降の開始 / 終了はメッセージで受け取る。
export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  noScriptStartedPostMessage: true,

  async main(ctx) {
    let messages = getMessages(DEFAULT_SETTINGS.language);

    const picker = createPicker(
      {
        onPick: (el) => void capture(el),
        onStateChange: (active) => void send({ type: 'picker-state', active }),
      },
      { keys: DEFAULT_SETTINGS.keys, messages: messages.overlay },
    );

    function applySettings(settings: Settings) {
      messages = getMessages(settings.language);
      picker.configure({ keys: settings.keys, messages: messages.overlay });
    }

    async function capture(el: Element) {
      // オーバーレイを片付けてから読み取る (<html> を選んだときに outerHTML へ混ざらないように)
      picker.stop();
      const snapshot = takeSnapshot(el);
      const text = formatCapture(snapshot);
      const clipboard = writeClipboard(text);

      // オーバーレイが消えた画面が描画されてから撮影を頼む
      await nextPaint();
      const saved = await send<Result>({ type: 'capture', snapshot });
      const copied = (await clipboard) || writeClipboardLegacy(text);

      const { toast } = messages;
      if (copied && saved?.ok) showToast(toast.copied);
      else if (copied) showToast(toast.copiedNotSaved, 'error');
      else if (saved?.ok) showToast(toast.savedNotCopied, 'error');
      else showToast(toast.failed, 'error');
    }

    const onMessage = (
      message: PickerCommand,
      _sender: unknown,
      sendResponse: (state: PickerState) => void,
    ) => {
      switch (message?.type) {
        case 'picker:toggle':
          picker.toggle();
          break;
        case 'picker:action':
          picker.perform(message.action);
          break;
        case 'picker:get-state':
          break;
        default:
          return;
      }
      sendResponse({ active: picker.active });
    };

    browser.runtime.onMessage.addListener(onMessage);
    const unwatch = watchSettings(applySettings);
    ctx.onInvalidated(() => {
      picker.stop();
      unwatch();
    });

    // 既定の言語やキーが一瞬表示されないよう、設定を読んでから始める。読めなくても既定値で動く
    await loadSettings().then(applySettings, () => {});
    picker.start();
  },
});

/** 拡張機能がリロードされた後のタブでは送信自体が例外になるので、まとめて握りつぶす */
async function send<T = void>(message: BackgroundRequest | Broadcast): Promise<T | undefined> {
  try {
    return await browser.runtime.sendMessage(message);
  } catch {
    return undefined;
  }
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    // タブが背面に回ると rAF が止まるための保険
    setTimeout(resolve, 200);
  });
}
