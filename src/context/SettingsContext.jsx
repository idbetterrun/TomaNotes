import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Dictionary ──────────
export const dictionary = {
  'en': {
    settingsTitle: 'Settings',
    loginToAccount: 'Login to TomaGo Account',
    loginUnavailable: 'Login currently unavailable',
    accountSection: 'Account',
    crossDeviceSync: 'Cross-device Sync',
    comingSoon: 'Coming Soon',
    generalSection: 'General',
    languageSection: 'Language',
    showLineNumbers: 'Show Line Numbers',
    syntaxHighlighting: 'Syntax Highlighting',
    fontSize: 'Font Size',
    aboutSection: 'About',
    developer: 'Developer: douyin@idbetterrun',
    credits: 'Credits: Special thanks to Google Gemini, Claude, and ChatGPT.',
    version: 'Version: v0.0.1',
    allNotes: 'All Notes',
    favorites: 'Favorites',
    trash: 'Trash',
    newNote: 'New Note',
    richTextNote: 'Rich Text Note',
    richTextSub: 'Bold, tables, images',
    markdownNote: 'Markdown Note',
    markdownSub: '# Headings, **bold**, lists',
    searchPlaceholder: 'Search notes...',
    emptyStateTitle: 'Empty',
    untitled: 'Untitled',
    noContentYet: 'No content yet',
    textEncrypted: 'Text is encrypted',
    pinToTop: 'Pin to top',
    unpin: 'Unpin',
    addToFavorites: 'Add to Favorites',
    unfavorite: 'Unfavorite',
    exportNote: 'Export note',
    moveToTrash: 'Move to trash',
    restore: 'Restore',
    richText: 'Rich Text',
    markdown: 'Markdown',
    encryptNote: 'Encrypt this note',
    unlockNote: 'Unlock Note',
    noteEncryptedMsg: 'Note is encrypted — click to unlock',
    cancel: 'Cancel',
    export: 'Export',
    exportTo: 'Export as...',
    exportAsTxt: 'Export as Plain Text (.txt)',
    exportAsMd: 'Export as Markdown (.md)',
    enterTitle: 'Enter title...',
    createNotePrompt: 'Create a new note to start writing',
    newRichNote: 'New Rich Note',
    newMarkdownNote: 'New Markdown',
    deleteConfirmTitle: 'Permanently Delete',
    deleteConfirmText: 'Are you sure you want to permanently delete this? This action cannot be undone.',
    emptyTrashConfirmText: 'Are you sure you want to empty the trash? All deleted notes will be permanently erased.',
    confirmDelete: 'Confirm Delete',
    emptyTrash: 'Empty Trash',
    unlockToDelete: 'Please unlock the note before deleting.',
  },
  'zh-CN': {
    settingsTitle: '设置',
    loginToAccount: '登录到 TomaGo',
    loginUnavailable: '暂不提供登录 (Login currently unavailable)',
    accountSection: '账户',
    crossDeviceSync: '跨设备同步',
    comingSoon: 'Coming Soon',
    generalSection: '常规',
    languageSection: '语言',
    showLineNumbers: '显示行号',
    syntaxHighlighting: '语法高亮',
    fontSize: '字体大小',
    aboutSection: '关于',
    developer: '开发者: douyin@idbetterrun',
    credits: '鸣谢: 特别感谢 Google Gemini, Claude, 和 ChatGPT.',
    version: '版本: v0.0.1',
    allNotes: '所有笔记',
    favorites: '收藏夹',
    trash: '回收站',
    newNote: '新建笔记',
    richTextNote: '富文本笔记',
    richTextSub: '加粗、表格、图片',
    markdownNote: 'Markdown 笔记',
    markdownSub: '# 标题、**加粗**、列表',
    searchPlaceholder: '搜索笔记...',
    emptyStateTitle: '为空',
    untitled: '无标题',
    noContentYet: '暂无内容',
    textEncrypted: '🔒 文字已加密',
    pinToTop: '置顶',
    unpin: '取消置顶',
    addToFavorites: '加入收藏',
    unfavorite: '取消收藏',
    exportNote: '导出笔记',
    moveToTrash: '移至回收站',
    restore: '恢复',
    richText: '富文本',
    markdown: 'Markdown',
    encryptNote: '加密此笔记',
    unlockNote: '解锁笔记',
    noteEncryptedMsg: '笔记已加密 — 点击解锁',
    cancel: '取消',
    export: '导出',
    exportTo: '导出为...',
    exportAsTxt: '导出为纯文本 (.txt)',
    exportAsMd: '导出为 Markdown (.md)',
    enterTitle: '输入标题...',
    createNotePrompt: '创建新笔记以开始书写',
    newRichNote: '新建富文本',
    newMarkdownNote: '新建 Markdown',
    deleteConfirmTitle: '彻底删除',
    deleteConfirmText: '确定要彻底删除吗？此操作不可撤销。',
    emptyTrashConfirmText: '确定要一键清空回收站吗？所有已删除的笔记将被彻底抹除且无法恢复。',
    confirmDelete: '确认删除',
    emptyTrash: '一键清空',
    unlockToDelete: '请先解锁笔记以进行删除操作。',
  },
  'zh-TW': {
    settingsTitle: '設定',
    loginToAccount: '登入到 TomaGo',
    loginUnavailable: '暫不提供登入 (Login currently unavailable)',
    accountSection: '帳戶',
    crossDeviceSync: '跨設備同步',
    comingSoon: 'Coming Soon',
    generalSection: '一般',
    languageSection: '語言',
    showLineNumbers: '顯示行號',
    syntaxHighlighting: '語法高亮',
    fontSize: '字體大小',
    aboutSection: '關於',
    developer: '開發者: douyin@idbetterrun',
    credits: '鳴謝: 特別感謝 Google Gemini, Claude, 和 ChatGPT.',
    version: '版本: v0.0.1',
    allNotes: '所有筆記',
    favorites: '收藏夾',
    trash: '回收站',
    newNote: '建立筆記',
    richTextNote: '富文本筆記',
    richTextSub: '粗體、表格、圖片',
    markdownNote: 'Markdown 筆記',
    markdownSub: '# 標題、**粗體**、列表',
    searchPlaceholder: '搜尋筆記...',
    emptyStateTitle: '為空',
    untitled: '無標題',
    noContentYet: '暫無內容',
    textEncrypted: '🔒 文字已加密',
    pinToTop: '置頂',
    unpin: '取消置頂',
    addToFavorites: '加入收藏',
    unfavorite: '取消收藏',
    exportNote: '匯出筆記',
    moveToTrash: '移至回收站',
    restore: '復原',
    richText: '富文本',
    markdown: 'Markdown',
    encryptNote: '加密此筆記',
    unlockNote: '解鎖筆記',
    noteEncryptedMsg: '筆記已加密 — 點擊解鎖',
    cancel: '取消',
    export: '匯出',
    exportTo: '匯出為...',
    exportAsTxt: '匯出為純文字 (.txt)',
    exportAsMd: '匯出為 Markdown (.md)',
    enterTitle: '輸入標題...',
    createNotePrompt: '建立新筆記以開始寫作',
    newRichNote: '新增富文本',
    newMarkdownNote: '新增 Markdown',
    deleteConfirmTitle: '徹底刪除',
    deleteConfirmText: '確定要徹底刪除嗎？此操作不可撤銷。',
    emptyTrashConfirmText: '確定要一鍵清空回收站嗎？所有已刪除的筆記將被徹底抹除且無法恢復。',
    confirmDelete: '確認刪除',
    emptyTrash: '一鍵清空',
    unlockToDelete: '請先解鎖筆記以進行刪除操作。',
  }
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editor-settings');
    const defaults = { showLineNumbers: true, syntaxHighlighting: true, fontSize: 15, language: 'en' };
    return savedSettings ? { ...defaults, ...JSON.parse(savedSettings) } : defaults;
  });

  useEffect(() => {
    localStorage.setItem('editor-settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--note-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
  }, [settings]);

  const toggleLineNumbers = () => {
    setSettings(prev => ({ ...prev, showLineNumbers: !prev.showLineNumbers }));
  };

  const toggleSyntaxHighlighting = () => {
    setSettings(prev => ({ ...prev, syntaxHighlighting: !prev.syntaxHighlighting }));
  };

  const updateFontSize = (size) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setLanguage = (lang) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const value = { 
    settings, 
    toggleLineNumbers, 
    toggleSyntaxHighlighting, 
    updateFontSize,
    setLanguage
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function useTranslation() {
  const { settings } = useSettings();
  const lang = settings.language || 'en';
  const t = (key) => dictionary[lang][key] || dictionary['en'][key] || key;
  return { t, lang };
}
