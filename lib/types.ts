export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 選択した要素から content script が取り出す情報 */
export interface ElementSnapshot {
  url: string;
  title: string;
  /** 一覧表示用の短い名前 (例: `span.V9tjod`) */
  label: string;
  domPath: string;
  /** ビューポート基準の位置 */
  rect: Rect;
  /** 開始タグ + テキストだけの 1 行表現 */
  snippet: string;
  /** outerHTML (長い場合は切り詰め) */
  html: string;
  text: string;
  viewport: { width: number; height: number };
}

export interface Capture extends ElementSnapshot {
  id: string;
  createdAt: number;
  screenshot?: Blob;
}
