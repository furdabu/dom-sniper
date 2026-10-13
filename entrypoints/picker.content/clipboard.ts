/** ユーザー操作の中で呼ぶこと。非セキュアなページやフォーカスが無い場合は false */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clipboard API が使えないページ (http の LAN 内サーバーなど) 向けのフォールバック。
 * フォーカスを一時的に奪うので、ページの状態を撮り終えてから呼ぶ。
 * clipboardWrite 権限は持たないため、クリックによるユーザー操作の有効期間 (数秒) 内に呼ぶこと。
 */
export function writeClipboardLegacy(text: string): boolean {
  const previous = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.documentElement.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    // copied は false のまま
  }

  textarea.remove();
  if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
  return copied;
}
