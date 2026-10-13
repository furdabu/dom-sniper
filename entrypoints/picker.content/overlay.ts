import { getLabel } from './dom-path';
import css from './style.scss?inline';

const HOST_TAG = 'dom-sniper-overlay';
const LABEL_GAP = 6;
const VIEWPORT_MARGIN = 4;
const TOAST_DURATION = 2000;

let sheet: CSSStyleSheet | undefined;

/** ページの CSS から隔離された最前面のレイヤーを作る */
function createLayer(): { host: HTMLElement; root: ShadowRoot } {
  const host = document.createElement(HOST_TAG);
  const root = host.attachShadow({ mode: 'closed' });
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  }
  root.adoptedStyleSheets = [sheet];
  document.documentElement.append(host);

  try {
    // モーダルの <dialog> より手前に出すため top layer に載せる
    host.popover = 'manual';
    host.showPopover();
  } catch {
    // Popover API が使えなくても z-index で最前面に出る
  }
  return { host, root };
}

function create<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

/** 画面下の操作ガイドの 1 項目。keys はキーの表示名 */
export interface HintItem {
  keys?: string[];
  text: string;
}

export class Overlay {
  private host?: HTMLElement;
  private box = create('div', 'box');
  private label = create('div', 'label');
  private name = create('span', 'label__name');
  private size = create('span', 'label__size');
  private hint = create('div', 'hint');
  private target: Element | null = null;

  constructor() {
    this.label.append(this.name, this.size);
  }

  mount() {
    const { host, root } = createLayer();
    this.host = host;
    root.append(this.box, this.label, this.hint);
    this.highlight(null);
  }

  setHint(items: HintItem[]) {
    const children = items.flatMap((item, index) => [
      ...(index > 0 ? [create('span', 'hint__separator', '·')] : []),
      ...(item.keys ?? []).map((key) => create('kbd', undefined, key)),
      create('span', undefined, item.text),
    ]);
    this.hint.replaceChildren(...children);
  }

  unmount() {
    this.host?.remove();
    this.host = undefined;
    this.target = null;
  }

  /** 毎フレーム呼ばれる。スクロールやレイアウト変化にも追従する */
  highlight(el: Element | null) {
    this.box.hidden = this.label.hidden = !el;
    if (el !== this.target) {
      this.target = el;
      this.name.textContent = el ? getLabel(el) : '';
    }
    if (!el) return;

    const rect = el.getBoundingClientRect();
    this.box.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    this.box.style.width = `${rect.width}px`;
    this.box.style.height = `${rect.height}px`;

    const size = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    if (this.size.textContent !== size) this.size.textContent = size;

    const { clientWidth, clientHeight } = document.documentElement;
    const { offsetWidth, offsetHeight } = this.label;
    const maxTop = clientHeight - offsetHeight - VIEWPORT_MARGIN;
    // 上 → 下 → 要素の内側、の順で収まる場所に置く
    let top = rect.top - offsetHeight - LABEL_GAP;
    if (top < VIEWPORT_MARGIN) top = rect.bottom + LABEL_GAP;
    if (top > maxTop) top = clamp(rect.top + LABEL_GAP, VIEWPORT_MARGIN, maxTop);
    const left = clamp(rect.left, VIEWPORT_MARGIN, clientWidth - offsetWidth - VIEWPORT_MARGIN);
    this.label.style.transform = `translate(${left}px, ${top}px)`;
  }
}

export function showToast(message: string, kind: 'success' | 'error' = 'success') {
  const { host, root } = createLayer();
  root.append(create('div', `toast toast--${kind}`, message));
  setTimeout(() => host.remove(), TOAST_DURATION);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
