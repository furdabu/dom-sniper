// 翻訳の基準になる辞書。他の言語はこの型 (Messages) に合わせて書く
export const en = {
  common: {
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: "Couldn't copy",
    delete: 'Delete',
  },
  picker: {
    start: 'Select element',
    active: (cancelKey: string) => `Selecting… ${cancelKey} to cancel`,
    unavailable: "Can't select elements on this page",
  },
  history: {
    title: 'History',
    searchPlaceholder: 'Search URL, selector, or text',
    emptyTitle: 'No captures yet',
    emptyBody:
      'Press “Select element”, then click an element on the page. Its URL, DOM path, position, and HTML are copied and kept here.',
    count: (count: number) => `${count} ${count === 1 ? 'capture' : 'captures'}`,
    filteredCount: (shown: number, total: number) => `${shown} of ${total}`,
    noMatch: 'No matching captures',
    clear: 'Delete all',
    clearConfirm: 'Click again to delete all',
  },
  detail: {
    copyImage: 'Copy image',
    copyField: (field: string) => `Copy ${field}`,
    notFound: 'This capture has been deleted',
    backToHistory: 'Back to history',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    languageAuto: 'Match browser language',
    keys: 'Keys',
    keysHint: 'Used while selecting. Click a key, then press the one you want to assign.',
    actions: {
      parent: 'Select parent',
      child: 'Select child',
      cancel: 'Cancel selection',
    },
    pressKey: 'Press a key…',
    reset: 'Reset to defaults',
    shortcut: 'Start selecting',
    shortcutUnset: 'Not set',
    shortcutNote: 'Chrome manages this shortcut, so it is changed on Chrome’s shortcuts page.',
    shortcutOpen: 'Open Chrome shortcuts',
  },
  overlay: {
    click: 'Click to capture',
    parentChild: 'Parent / child',
    cancel: 'Cancel',
  },
  toast: {
    copied: 'Copied',
    copiedNotSaved: "Copied (couldn't save to history)",
    savedNotCopied: "Couldn't copy. Copy it from the history in the side panel",
    failed: 'Capture failed',
  },
};

export type Messages = typeof en;
