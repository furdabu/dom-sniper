import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DEFAULT_SETTINGS, loadSettings } from '@/lib/settings';
import { router } from './router';
import { SettingsProvider } from './settings';
import './styles/main.scss';

// 別の言語で一瞬描画されないよう、設定を読んでから描画する
void loadSettings()
  .catch(() => DEFAULT_SETTINGS)
  .then((settings) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <SettingsProvider initial={settings}>
          <RouterProvider router={router} />
        </SettingsProvider>
      </StrictMode>,
    );
  });
