import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'DOM Sniper',
    // manifest の文言は public/_locales、画面の文言は lib/i18n にある
    default_locale: 'en',
    description: '__MSG_extDescription__',
    // サイドパネル API と Popover API が揃うバージョン
    minimum_chrome_version: '114',
    permissions: ['scripting', 'storage'],
    action: { default_title: 'DOM Sniper' },
    commands: {
      'toggle-picker': {
        suggested_key: { default: 'Alt+Shift+S' },
        description: '__MSG_commandToggle__',
      },
    },
  },
});
