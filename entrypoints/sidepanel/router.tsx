import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from '@tanstack/react-router';
import { getCapture, listCaptures } from '@/lib/db';
import { CaptureNotFound, CapturePage } from './pages/CapturePage';
import { HistoryPage } from './pages/HistoryPage';
import { RootLayout } from './pages/RootLayout';
import { SettingsPage } from './pages/SettingsPage';

const rootRoute = createRootRoute({ component: RootLayout });

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === 'string' && search.q ? { q: search.q } : {},
  loader: () => listCaptures(),
  component: HistoryPage,
});

const captureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/captures/$captureId',
  loader: async ({ params }) => {
    const capture = await getCapture(params.captureId);
    if (!capture) throw notFound();
    return capture;
  },
  component: CapturePage,
  notFoundComponent: CaptureNotFound,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([historyRoute, captureRoute, settingsRoute]),
  history: createHashHistory(),
  // 履歴が変わったときは明示的に invalidate するので、画面遷移のたびには読み直さない
  defaultStaleTime: Infinity,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
