import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Dictionary ──────────
export const dictionary = {
  'en': {
    settingsTitle: 'Settings',
    loginToAccount: 'Login to TomaNotes',
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
    creditsTitle: 'Credits',
    profileLabel: 'Profile',
    syncDescription: 'Sync your notes everywhere',
    createdAt: 'Created at',
    version: 'Version: 0.1 Beta 1',
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
    encryptNoteTitle: 'Encrypt Note',
    unlockNoteTitle: 'Unlock Note',
    pwEmptyErr: 'Password cannot be empty.',
    pwLengthErr: 'Password must be at least 3 characters.',
    encryptDesc: 'Set a password to encrypt this note. The content will be hidden from the sidebar preview until unlocked.',
    unlockDesc: "Enter the password to unlock and view this note's content.",
    setPwPlaceholder: 'Set a password…',
    enterPwPlaceholder: 'Enter password…',
    unlockBtn: 'Unlock',
    editorPlaceholder: 'Start writing something amazing...',
    securitySection: 'Security',
    globalPin: 'Global PIN',
    globalPinDesc: 'Require a 6-digit PIN to access TomaNotes',
    changePin: 'Change PIN',
    touchId: 'Touch ID / Biometrics',
    touchIdDesc: 'Use fingerprint to quick unlock',
    autoLockTime: 'Auto-Lock Time',
    lockImmediate: 'Immediately',
    lockNever: 'Never',
    lockMins: 'minutes',
    masterKey: 'Master Key Mode',
    masterKeyDesc: 'Global PIN unlocks all encrypted notes directly',
    appLocked: 'App Locked',
    enterPinToUnlock: 'Enter your 6-digit PIN to continue',
    incorrectPin: 'Incorrect PIN, please try again',
    encryptedMask: '********',
    encryptedNotes: 'Encrypted Notes',
    unlockAll: 'Unlock All',
    setPinTitle: 'Set Global PIN',
    confirmPinTitle: 'Confirm PIN',
    pinMismatch: 'PINs do not match, try again',
    pinLengthPrompt: 'Enter 6 digits',
    pinConfirmPrompt: 'Re-enter your PIN',
  },
  'zh-CN': {
    settingsTitle: '设置',
    loginToAccount: '登录到 TomaNotes',
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
    creditsTitle: '鸣谢',
    profileLabel: '个人资料',
    syncDescription: '在所有设备上同步您的笔记',
    createdAt: '创建时间',
    version: '版本: 0.1 Beta 1',
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
    encryptNoteTitle: '加密笔记',
    unlockNoteTitle: '解锁笔记',
    pwEmptyErr: '密码不能为空。',
    pwLengthErr: '密码至少需要3个字符。',
    encryptDesc: '设置密码以加密此笔记。开启后未解锁前，该笔记内容将不会在侧边栏预览中显示。',
    unlockDesc: '输入密码以解锁并查看此笔记的内容。',
    setPwPlaceholder: '设置密码…',
    enterPwPlaceholder: '输入密码…',
    unlockBtn: '解锁',
    editorPlaceholder: '妙笔生花...',
    securitySection: '安全',
    globalPin: '全局密码 (PIN)',
    globalPinDesc: '开启 6 位数字密码保护整个应用',
    changePin: '修改密码',
    touchId: 'Touch ID 快速验证',
    touchIdDesc: '允许使用触控 ID 快速解锁',
    autoLockTime: '自动锁定时间',
    lockImmediate: '立即',
    lockNever: '永不',
    lockMins: '分钟',
    masterKey: '主钥匙特权',
    masterKeyDesc: '开启后全局密码将能直接解锁所有单篇加密笔记',
    appLocked: '应用已锁定',
    enterPinToUnlock: '请输入 6 位数字 PIN 码以继续',
    incorrectPin: 'PIN 码不正确，请重试',
    encryptedMask: '内容已加密',
    encryptedNotes: '已加密笔记',
    unlockAll: '一键解锁',
    setPinTitle: '设置全局 PIN 码',
    confirmPinTitle: '请再输一次以确认',
    pinMismatch: '密码不一致，请重试',
    pinLengthPrompt: '请输入 6 位数字',
    pinConfirmPrompt: '请确认您的密码',
  },
  'zh-TW': {
    settingsTitle: '設定',
    loginToAccount: '登入到 TomaNotes',
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
    creditsTitle: '鳴謝',
    profileLabel: '個人資料',
    syncDescription: '在所有設備上同步您的筆記',
    createdAt: '創建時間',
    version: '版本: 0.1 Beta 1',
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
    encryptNoteTitle: '加密筆記',
    unlockNoteTitle: '解鎖筆記',
    pwEmptyErr: '密碼不能為空。',
    pwLengthErr: '密碼至少需要3個字元。',
    encryptDesc: '設定密碼以加密此筆記。開啟後未解鎖前，該筆記內容將不會在側邊欄預覽中顯示。',
    unlockDesc: '輸入密碼以解鎖並查看此筆記的內容。',
    setPwPlaceholder: '設定密碼…',
    enterPwPlaceholder: '輸入密碼…',
    unlockBtn: '解鎖',
    editorPlaceholder: '妙筆生花...',
    securitySection: '安全',
    globalPin: '全局密碼 (PIN)',
    globalPinDesc: '開啟 6 位數字密碼保護整個應用',
    changePin: '修改密碼',
    touchId: 'Touch ID 快速驗證',
    touchIdDesc: '允許使用觸控 ID 快速解鎖',
    autoLockTime: '自動鎖定時間',
    lockImmediate: '立即',
    lockNever: '永不',
    lockMins: '分鐘',
    masterKey: '主鑰匙特權',
    masterKeyDesc: '開啟後全局密碼將能直接解鎖所有單篇加密筆記',
    appLocked: '應用已鎖定',
    enterPinToUnlock: '請輸入 6 位數字 PIN 碼以繼續',
    incorrectPin: 'PIN 碼不正確，請重試',
    encryptedMask: '內容已加密',
    encryptedNotes: '已加密筆記',
    unlockAll: '一鍵解鎖',
    setPinTitle: '設定全局 PIN 碼',
    confirmPinTitle: '請再輸一次以確認',
    pinMismatch: '密碼不一致，請重試',
    pinLengthPrompt: '請輸入 6 位數字',
    pinConfirmPrompt: '請確認您的密碼',
  }
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editor-settings');
    const defaults = { 
      showLineNumbers: true, syntaxHighlighting: true, fontSize: 15, language: 'en',
      globalPinEnabled: false, touchIdEnabled: false, autoLockTime: 2, masterKeyEnabled: false
    };
    if (!savedSettings) return defaults;
    const parsed = JSON.parse(savedSettings);
    // Migrate: "0" (Immediately) was removed — bump to 2 minutes
    if (parsed.autoLockTime === 0) parsed.autoLockTime = 2;
    return { ...defaults, ...parsed };
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

  const updateSecuritySettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const value = { 
    settings, 
    toggleLineNumbers, 
    toggleSyntaxHighlighting, 
    updateFontSize,
    setLanguage,
    updateSecuritySettings
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
