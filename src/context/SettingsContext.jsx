import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Dictionary ──────────
export const dictionary = {
  'en': {
    settingsTitle: 'Settings',
    loginToAccount: 'Login to your TomaGo account',
    loginUnavailable: 'Login currently unavailable',
    accountSection: 'Account',
    crossDeviceSync: 'Cross-device Sync',
    comingSoon: 'Coming Soon',
    generalSection: 'General',
    languageSection: 'Language',
    showLineNumbers: 'Show Line Numbers',
    syntaxHighlighting: 'Syntax Highlighting',
    fontSize: 'Font Size',
    fontStandard: 'Size Standard',
    fontStandardPx: 'Pixels',
    fontStandardCn: 'Chinese Sizes',
    aboutSection: 'About',
    appearanceSection: 'Appearance',
    followSystem: 'Follow System',
    noteDetails: 'Note Details',
    titleLabel: 'Title',
    typeLabel: 'Type',
    modifiedAt: 'Last Modified',
    createdTime: 'Created',
    tagsLabel: 'Tags',
    wordsLabel: 'Words',
    charactersLabel: 'Characters',
    recentLabel: 'Recent',
    searchScope: 'Search Scope',
    searchByTag: 'Search by Tag',
    searchRichText: 'Search rich text',
    searchMarkdown: 'Search markdown',
    allTags: 'All Tags',
    noTagsYet: 'No tags yet',
    noEncryptedNotes: 'No encrypted notes',
    back: 'Back',
    uiFont: 'App Font',
    fontSystem: 'System',
    fontKai: 'Kai',
    fontSong: 'Song',
    detachWindow: 'Detach',
    restoreWindow: 'Restore',
    themeWhite: 'White',
    themeGray: 'Gray',
    themeSepia: 'Sepia',
    themeDim: 'Dim',
    themeBlack: 'Black',
    developer: 'Developer',
    contactEmail: 'Contact',
    notieeRecommend: 'New from the Developer',
    notieeDesc: 'AI-powered photo note for iOS. Capture, AI-process, organize.',
    openSourceTitle: 'Open Source',
    openSourceNotice: 'This project is built with the following open source projects:',
    profileLabel: 'Profile',
    syncDescription: 'Sync your notes everywhere',
    createdAt: 'Created at',
    version: 'Version: v0.2.0',
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
    exportAsTmn: 'TomaNote Format (.tmn)',
    importNote: 'Import Note',
    importTmnDesc: 'Import notes from .tmn files',
    importSuccess: 'Note imported successfully.',
    importFailed: 'Failed to import note.',
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
    trashAuth: 'Trash verification',
    trashAuthDesc: 'Require authentication before opening the trash',
    hideProtectedSearch: 'Hide protected notes from search',
    hideProtectedSearchDesc: 'Protected notes will be excluded from sidebar search results',
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
    loginToAccount: '登录您的 TomaGo 账号',
    loginUnavailable: '暂不提供登录 (Login currently unavailable)',
    accountSection: '账户',
    crossDeviceSync: '跨设备同步',
    comingSoon: 'Coming Soon',
    generalSection: '常规',
    languageSection: '语言',
    showLineNumbers: '显示行号',
    syntaxHighlighting: '语法高亮',
    fontSize: '字体大小',
    fontStandard: '字号标准',
    fontStandardPx: '像素',
    fontStandardCn: '号字',
    aboutSection: '关于',
    appearanceSection: '外观',
    followSystem: '跟随系统切换深色模式',
    noteDetails: '详细信息',
    titleLabel: '标题',
    typeLabel: '类型',
    modifiedAt: '上次修改',
    createdTime: '创建时间',
    tagsLabel: '标签',
    wordsLabel: '字数',
    charactersLabel: '字符数',
    recentLabel: '最近使用',
    searchScope: '搜索范围',
    searchByTag: '根据标签搜索',
    searchRichText: '在富文本中搜索',
    searchMarkdown: '在 Markdown 中搜索',
    allTags: '所有标签',
    noTagsYet: '暂无标签',
    noEncryptedNotes: '暂无加密笔记',
    back: '返回',
    uiFont: '界面字体',
    fontSystem: '系统',
    fontKai: '楷体',
    fontSong: '宋体',
    detachWindow: '独立',
    restoreWindow: '恢复',
    themeWhite: '白',
    themeGray: '灰',
    themeSepia: '类纸黄',
    themeDim: '灰黑',
    themeBlack: '黑',
    developer: '开发者',
    contactEmail: '联系邮箱',
    notieeRecommend: '同开发者新作',
    notieeDesc: 'iOS AI 拍照笔记。拍照即记录，AI 自动整理。',
    openSourceTitle: '开源声明',
    openSourceNotice: '本项目使用了以下开源项目：',
    profileLabel: '个人资料',
    syncDescription: '在所有设备上同步您的笔记',
    createdAt: '创建时间',
    version: '版本: v0.2.0',
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
    exportAsTmn: 'TomaNote 格式 (.tmn)',
    importNote: '导入笔记',
    importTmnDesc: '从 .tmn 文件导入笔记',
    importSuccess: '笔记导入成功。',
    importFailed: '笔记导入失败。',
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
    trashAuth: '回收站验证',
    trashAuthDesc: '进入回收站前需要先验证身份',
    hideProtectedSearch: '受保护笔记不可搜索',
    hideProtectedSearchDesc: '侧边栏搜索结果中将隐藏受保护笔记',
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
    loginToAccount: '登入您的 TomaGo 帳號',
    loginUnavailable: '暫不提供登入 (Login currently unavailable)',
    accountSection: '帳戶',
    crossDeviceSync: '跨設備同步',
    comingSoon: 'Coming Soon',
    generalSection: '一般',
    languageSection: '語言',
    showLineNumbers: '顯示行號',
    syntaxHighlighting: '語法高亮',
    fontSize: '字體大小',
    fontStandard: '字號標準',
    fontStandardPx: '像素',
    fontStandardCn: '號字',
    aboutSection: '關於',
    appearanceSection: '外觀',
    followSystem: '跟隨系統切換深色模式',
    noteDetails: '詳細資訊',
    titleLabel: '標題',
    typeLabel: '類型',
    modifiedAt: '上次修改',
    createdTime: '建立時間',
    tagsLabel: '標籤',
    wordsLabel: '字詞數',
    charactersLabel: '字元數',
    recentLabel: '最近使用',
    searchScope: '搜尋範圍',
    searchByTag: '依標籤搜尋',
    searchRichText: '在富文本中搜尋',
    searchMarkdown: '在 Markdown 中搜尋',
    allTags: '所有標籤',
    noTagsYet: '尚無標籤',
    noEncryptedNotes: '尚無加密筆記',
    back: '返回',
    uiFont: '介面字體',
    fontSystem: '系統',
    fontKai: '楷體',
    fontSong: '宋體',
    detachWindow: '獨立',
    restoreWindow: '恢復',
    themeWhite: '白',
    themeGray: '灰',
    themeSepia: '類紙黃',
    themeDim: '灰黑',
    themeBlack: '黑',
    developer: '開發者',
    contactEmail: '聯絡郵箱',
    notieeRecommend: '同開發者新作',
    notieeDesc: 'iOS AI 拍照筆記。拍照即記錄，AI 自動整理。',
    openSourceTitle: '開源聲明',
    openSourceNotice: '本項目使用了以下開源項目：',
    profileLabel: '個人資料',
    syncDescription: '在所有設備上同步您的筆記',
    createdAt: '創建時間',
    version: '版本: v0.2.0',
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
    exportAsTmn: 'TomaNote 格式 (.tmn)',
    importNote: '匯入筆記',
    importTmnDesc: '從 .tmn 檔案匯入筆記',
    importSuccess: '筆記匯入成功。',
    importFailed: '筆記匯入失敗。',
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
    trashAuth: '回收站驗證',
    trashAuthDesc: '進入回收站前需要先驗證身分',
    hideProtectedSearch: '受保護筆記不可搜尋',
    hideProtectedSearchDesc: '側邊欄搜尋結果中將隱藏受保護筆記',
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

const LIGHT_THEMES = ['white', 'gray', 'sepia'];
const DARK_THEMES = ['dim', 'black'];
const ALL_THEMES = [...LIGHT_THEMES, ...DARK_THEMES];

function getSystemAppearance() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getAllowedThemes(appearance) {
  return appearance === 'dark' ? DARK_THEMES : LIGHT_THEMES;
}

function getDefaultTheme(appearance) {
  return appearance === 'dark' ? 'dim' : 'white';
}

function normalizeTheme(theme, appearance) {
  const allowed = getAllowedThemes(appearance);
  return allowed.includes(theme) ? theme : getDefaultTheme(appearance);
}

function isDarkTheme(theme) {
  return DARK_THEMES.includes(theme);
}

function getAppFontFamily(language, fontFamily) {
  if (!String(language || '').startsWith('zh')) {
    return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }

  if (fontFamily === 'kai') {
    return '"Kaiti SC", "STKaiti", "KaiTi", "BiauKai", serif';
  }

  if (fontFamily === 'song') {
    return '"Songti SC", "STSong", "SimSun", serif';
  }

  return 'system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
}

export function SettingsProvider({ children }) {
  const [systemAppearance, setSystemAppearance] = useState(getSystemAppearance);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editor-settings');
    const defaults = { 
      showLineNumbers: true, syntaxHighlighting: true, fontSize: 16, language: 'en',
      globalPinEnabled: false, touchIdEnabled: false, trashAuthEnabled: true, hideProtectedSearch: true, autoLockTime: 2,
      theme: 'white', lightTheme: 'white', darkTheme: 'dim', followSystem: true, fontSizeStandard: 'px', fontFamily: 'system'
    };
    if (!savedSettings) return defaults;
    const parsed = JSON.parse(savedSettings);
    // Migrate: "0" (Immediately) was removed — bump to 2 minutes
    if (parsed.autoLockTime === 0) parsed.autoLockTime = 2;
    delete parsed.masterKeyEnabled;
    const systemAppearance = getSystemAppearance();
    const fallbackTheme = defaults.theme;
    const parsedTheme = ALL_THEMES.includes(parsed.theme) ? parsed.theme : fallbackTheme;
    const next = { ...defaults, ...parsed, theme: parsedTheme };
    if (!ALL_THEMES.includes(next.lightTheme)) {
      next.lightTheme = isDarkTheme(parsedTheme) ? defaults.lightTheme : parsedTheme;
    }
    if (!ALL_THEMES.includes(next.darkTheme)) {
      next.darkTheme = isDarkTheme(parsedTheme) ? parsedTheme : defaults.darkTheme;
    }
    // When follow system is on, keep the selected tone per appearance.
    if (next.followSystem) {
      next.theme = systemAppearance === 'dark' ? next.darkTheme : next.lightTheme;
    }
    return next;
  });

  useEffect(() => {
    localStorage.setItem('editor-settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--note-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--app-font-family', getAppFontFamily(settings.language, settings.fontFamily));
    
    // Theme application
    const activeTheme = settings.followSystem
      ? (systemAppearance === 'dark' ? settings.darkTheme : settings.lightTheme)
      : settings.theme;

    document.documentElement.setAttribute('data-theme', activeTheme || 'white');

    if (window.electron?.system?.setLanguage) {
      window.electron.system.setLanguage(settings.language || 'en');
    }
  }, [settings, systemAppearance]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const nextAppearance = e.matches ? 'dark' : 'light';
      setSystemAppearance(nextAppearance);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.followSystem]);

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

  const setTheme = (theme) => {
    setSettings(prev => {
      if (!ALL_THEMES.includes(theme)) return prev;
      if (prev.followSystem) {
        if (isDarkTheme(theme)) {
          return { ...prev, darkTheme: theme };
        }
        return { ...prev, lightTheme: theme };
      }
      return { ...prev, theme };
    });
  };

  const value = { 
    settings, 
    systemAppearance,
    availableThemes: ALL_THEMES,
    lightThemes: LIGHT_THEMES,
    darkThemes: DARK_THEMES,
    toggleLineNumbers, 
    toggleSyntaxHighlighting, 
    updateFontSize,
    setLanguage,
    updateSecuritySettings,
    setTheme,
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
