import { browser } from 'wxt/browser';
import type { PickerCommand, PickerState } from './messages';

/** content script が未注入のタブでは undefined を返す */
export async function sendPickerCommand(
  tabId: number,
  command: PickerCommand,
): Promise<PickerState | undefined> {
  try {
    return await browser.tabs.sendMessage(tabId, command, { frameId: 0 });
  } catch {
    return undefined;
  }
}
