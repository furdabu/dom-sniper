import { browser } from 'wxt/browser';
import type { Broadcast } from './messages';

/** 他の拡張機能ページ (サイドパネル) への通知。受信者がいないときの失敗は無視する */
export function broadcast(message: Broadcast): void {
  browser.runtime.sendMessage(message).catch(() => {});
}
