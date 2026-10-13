import type { Messages } from './en';

export const ja: Messages = {
  common: {
    copy: 'コピー',
    copied: 'コピーしました',
    copyFailed: 'コピーできませんでした',
    delete: '削除',
  },
  picker: {
    start: '要素を選択',
    active: (cancelKey) => `選択中… ${cancelKey} で終了`,
    unavailable: 'このページでは要素を選択できません',
  },
  history: {
    title: '履歴',
    searchPlaceholder: 'URL・セレクタ・テキストで検索',
    emptyTitle: 'まだキャプチャがありません',
    emptyBody:
      '「要素を選択」を押してページ上の要素をクリックすると、URL・DOM Path・位置・HTML がコピーされ、ここに履歴として残ります。',
    count: (count) => `${count} 件`,
    filteredCount: (shown, total) => `${shown} / ${total} 件`,
    noMatch: '一致するキャプチャがありません',
    clear: 'すべて削除',
    clearConfirm: 'もう一度押すと全件削除',
  },
  detail: {
    copyImage: '画像をコピー',
    copyField: (field) => `${field} をコピー`,
    notFound: 'このキャプチャは削除されています',
    backToHistory: '履歴に戻る',
  },
  settings: {
    title: '設定',
    language: '言語',
    languageAuto: 'ブラウザの言語に合わせる',
    keys: 'キー設定',
    keysHint: '選択中に使うキーです。キーをクリックしてから、割り当てたいキーを押してください。',
    actions: {
      parent: '親要素へ',
      child: '子要素へ',
      cancel: '選択を終了',
    },
    pressKey: 'キーを押してください…',
    reset: '初期設定に戻す',
    shortcut: '選択を開始',
    shortcutUnset: '未設定',
    shortcutNote:
      'このショートカットは Chrome が管理しているため、Chrome のショートカット設定画面で変更します。',
    shortcutOpen: 'Chrome のショートカット設定を開く',
  },
  overlay: {
    click: 'クリックで取得',
    parentChild: '親 / 子要素',
    cancel: '終了',
  },
  toast: {
    copied: 'コピーしました',
    copiedNotSaved: 'コピーしました (履歴には保存できませんでした)',
    savedNotCopied: 'コピーできませんでした。サイドパネルの履歴からコピーできます',
    failed: 'キャプチャに失敗しました',
  },
};
