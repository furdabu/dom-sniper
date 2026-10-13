import { Outlet, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { browser } from 'wxt/browser';
import type { Broadcast } from '@/lib/messages';

export function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const onMessage = (message: Broadcast) => {
      if (message?.type !== 'captures-changed') return;
      void router.invalidate();
      // 詳細を開いている最中に新しく取得したら、一覧に戻して先頭に見せる (設定画面はそのまま)
      if (message.addedId && router.state.location.pathname.startsWith('/captures/')) {
        void router.navigate({ to: '/' });
      }
    };
    browser.runtime.onMessage.addListener(onMessage);
    return () => browser.runtime.onMessage.removeListener(onMessage);
  }, [router]);

  return <Outlet />;
}
