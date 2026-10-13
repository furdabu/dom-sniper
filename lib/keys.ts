/** 選択モード中にキーで行える操作 */
export const PICKER_ACTIONS = ['parent', 'child', 'cancel'] as const;
export type PickerAction = (typeof PICKER_ACTIONS)[number];

export interface KeyBinding {
  /**
   * KeyboardEvent.code。IME がオンだと key は "Process" になってしまうので、
   * 判定には物理キーを使う。
   */
  code: string;
  /** 画面に出す名前 */
  label: string;
}

export type KeyBindings = Record<PickerAction, KeyBinding>;

export const DEFAULT_KEYS: KeyBindings = {
  parent: { code: 'ArrowUp', label: '↑' },
  child: { code: 'ArrowDown', label: '↓' },
  cancel: { code: 'Escape', label: 'Esc' },
};

const LABELS: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
  Space: 'Space',
};

const MODIFIER_CODE = /^(Shift|Control|Alt|Meta|OS)(Left|Right)$/;

/** ブラウザのショートカット (Cmd+R など) を奪わないよう、修飾キー付きの入力は対象外にする */
export function actionForEvent(keys: KeyBindings, event: KeyboardEvent): PickerAction | undefined {
  if (event.metaKey || event.ctrlKey || event.altKey) return undefined;
  return PICKER_ACTIONS.find((action) => keys[action].code === event.code);
}

/** 押されたキーを割り当て用の値にする。修飾キー単体などは undefined */
export function bindingFromEvent(event: KeyboardEvent): KeyBinding | undefined {
  const { code, key } = event;
  if (!code || MODIFIER_CODE.test(code)) return undefined;

  // 文字キーは配列に合った表記 (key) を優先し、IME がオンのときなどは code から作る
  const label =
    LABELS[code] ??
    (key.length === 1 && key.trim() ? key.toUpperCase() : code.replace(/^(Key|Digit)/, ''));
  return { code, label };
}

/** 他の操作と同じキーを選んだら、元のキーと入れ替える */
export function assignKey(
  keys: KeyBindings,
  action: PickerAction,
  binding: KeyBinding,
): KeyBindings {
  const next = { ...keys, [action]: binding };
  const conflict = PICKER_ACTIONS.find(
    (other) => other !== action && keys[other].code === binding.code,
  );
  if (conflict) next[conflict] = keys[action];
  return next;
}

export function isSameKeys(a: KeyBindings, b: KeyBindings): boolean {
  return PICKER_ACTIONS.every((action) => a[action].code === b[action].code);
}
