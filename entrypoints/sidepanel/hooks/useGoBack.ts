import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

/** 検索条件を保ったまま一覧に戻る。この画面を直接開いた場合は戻り先が無いので一覧へ移動する */
export function useGoBack(): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (router.history.canGoBack()) router.history.back();
    else void router.navigate({ to: '/' });
  }, [router]);
}
