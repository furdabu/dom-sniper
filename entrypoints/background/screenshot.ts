import { browser } from 'wxt/browser';
import type { ElementSnapshot } from '@/lib/types';

/**
 * 表示中のタブを撮影し、要素の矩形で切り抜く。
 * 撮れるのは画面に見えている範囲だけで、要素が完全に画面外なら undefined を返す。
 */
export async function captureElement(
  windowId: number,
  { rect, viewport }: Pick<ElementSnapshot, 'rect' | 'viewport'>,
): Promise<Blob | undefined> {
  const dataUrl = await browser.tabs.captureVisibleTab(windowId, { format: 'png' });
  const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());

  try {
    // devicePixelRatio とページズームをまとめて吸収する
    const scale = bitmap.width / viewport.width;
    const left = Math.max(0, Math.floor(rect.left * scale));
    const top = Math.max(0, Math.floor(rect.top * scale));
    const right = Math.min(bitmap.width, Math.ceil((rect.left + rect.width) * scale));
    const bottom = Math.min(bitmap.height, Math.ceil((rect.top + rect.height) * scale));
    if (right <= left || bottom <= top) return undefined;

    const canvas = new OffscreenCanvas(right - left, bottom - top);
    canvas.getContext('2d')!.drawImage(bitmap, -left, -top);
    return await canvas.convertToBlob({ type: 'image/png' });
  } finally {
    bitmap.close();
  }
}
