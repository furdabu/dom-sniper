import type { PickerAction } from './keys';
import type { ElementSnapshot } from './types';

export const TOGGLE_COMMAND = 'toggle-picker';

/** content script 宛て。必ず PickerState を返す */
export type PickerCommand =
  | { type: 'picker:toggle' }
  | { type: 'picker:get-state' }
  | { type: 'picker:action'; action: PickerAction };

export interface PickerState {
  active: boolean;
}

/** background 宛て。必ず Result を返す */
export type BackgroundRequest =
  | { type: 'toggle-picker'; tabId: number }
  | { type: 'capture'; snapshot: ElementSnapshot };

export type Result = { ok: true } | { ok: false; error: string };

/** 返信を期待しない通知 */
export type Broadcast =
  | { type: 'picker-state'; active: boolean }
  | { type: 'captures-changed'; addedId?: string };
