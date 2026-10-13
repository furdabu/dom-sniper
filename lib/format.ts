import type { ElementSnapshot, Rect } from './types';

export function formatPosition(rect: Rect): string {
  const px = (value: number) => `${Math.round(value)}px`;
  return `top=${px(rect.top)}, left=${px(rect.left)}, width=${px(rect.width)}, height=${px(rect.height)}`;
}

/** AI に貼り付けるためのテキスト。Cursor の要素選択と同じ形式に URL を加えたもの */
export function formatCapture(
  snapshot: Pick<ElementSnapshot, 'url' | 'domPath' | 'rect' | 'snippet'>,
): string {
  return [
    `URL: ${snapshot.url}`,
    `DOM Path: ${snapshot.domPath}`,
    `Position: ${formatPosition(snapshot.rect)}`,
    `HTML Element: ${snapshot.snippet}`,
  ].join('\n');
}
