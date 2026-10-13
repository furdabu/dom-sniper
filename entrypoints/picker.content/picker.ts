import type { Messages } from '@/lib/i18n';
import { actionForEvent, type KeyBindings, type PickerAction } from '@/lib/keys';
import { Overlay } from './overlay';

// click 以外の、ページ側に届くと副作用が出るポインター操作
const BLOCKED_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'auxclick'];

interface PickerOptions {
  onPick(el: Element): void;
  onStateChange(active: boolean): void;
}

/** 設定から決まる部分。選択中に変更されても反映できる */
export interface PickerConfig {
  keys: KeyBindings;
  messages: Messages['overlay'];
}

export interface Picker {
  readonly active: boolean;
  start(): void;
  stop(): void;
  toggle(): void;
  perform(action: PickerAction): void;
  configure(config: PickerConfig): void;
}

/**
 * 要素選択モード。オーバーレイは pointer-events: none にして、window のキャプチャフェーズで
 * イベントを横取りする。ホバーやスクロールはページにそのまま届くので、ホバーで開くメニューの
 * 中身も選択できる。
 */
export function createPicker(
  { onPick, onStateChange }: PickerOptions,
  initialConfig: PickerConfig,
): Picker {
  const overlay = new Overlay();
  let config = initialConfig;
  configure(config);
  const cursorSheet = new CSSStyleSheet();
  cursorSheet.replaceSync('*, *::before, *::after { cursor: crosshair !important; }');

  let active = false;
  /** ポインター直下の最も深い要素 */
  let hovered: Element | null = null;
  /** 選択候補。キー操作で hovered の祖先に移動できる */
  let current: Element | null = null;
  let frame = 0;
  let listeners: AbortController | undefined;

  function start() {
    if (active) return;
    active = true;
    overlay.mount();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, cursorSheet];

    listeners = new AbortController();
    const options = { capture: true, signal: listeners.signal };
    window.addEventListener('mousemove', onMouseMove, options);
    window.addEventListener('click', onClick, options);
    window.addEventListener('keydown', onKeyDown, options);
    window.addEventListener('keyup', onKeyUp, options);
    for (const type of BLOCKED_EVENTS) window.addEventListener(type, block, options);

    frame = requestAnimationFrame(tick);
    onStateChange(true);
  }

  function stop() {
    if (!active) return;
    active = false;
    hovered = current = null;
    cancelAnimationFrame(frame);
    listeners?.abort();
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== cursorSheet);
    overlay.unmount();
    onStateChange(false);
  }

  function tick() {
    if (current && !current.isConnected) hovered = current = null;
    overlay.highlight(current);
    frame = requestAnimationFrame(tick);
  }

  function onMouseMove(event: MouseEvent) {
    const target = event.composedPath()[0];
    // 同じ要素の上で動かしただけなら、キー操作で選んだ候補を維持する
    if (target instanceof Element && target !== hovered) hovered = current = target;
  }

  function onClick(event: MouseEvent) {
    block(event);
    const target = current ?? event.composedPath()[0];
    if (target instanceof Element) onPick(target);
  }

  function onKeyDown(event: KeyboardEvent) {
    const action = actionForEvent(config.keys, event);
    if (!action) return;
    block(event);
    perform(action);
  }

  function onKeyUp(event: KeyboardEvent) {
    if (actionForEvent(config.keys, event)) block(event);
  }

  function perform(action: PickerAction) {
    if (!active) return;
    if (action === 'cancel') return stop();
    if (!current) return;
    current =
      (action === 'parent' ? parentOf(current) : childToward(current, hovered)) ?? current;
  }

  function configure(next: PickerConfig) {
    config = next;
    const { keys, messages } = config;
    overlay.setHint([
      { text: messages.click },
      { keys: [keys.parent.label, keys.child.label], text: messages.parentChild },
      { keys: [keys.cancel.label], text: messages.cancel },
    ]);
  }

  return {
    get active() {
      return active;
    },
    start,
    stop,
    toggle: () => (active ? stop() : start()),
    perform,
    configure,
  };
}

function block(event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

/** Shadow DOM の中からは host へ抜ける */
function parentOf(el: Element): Element | null {
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

/** ancestor の子のうち、descendant へ向かう経路上にあるもの */
function childToward(ancestor: Element, descendant: Element | null): Element | null {
  for (let el = descendant; el; el = parentOf(el)) {
    if (parentOf(el) === ancestor) return el;
  }
  return null;
}
