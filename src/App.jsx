import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileBox, Star, Trash2, Settings, Plus, Search,
  FileText, Code, Download, Trash, RefreshCw,
  Pin, MoreHorizontal, Lock, Unlock, Eye, EyeOff,
  PanelLeftClose, PanelLeftOpen, Undo2, Redo2, Tags, X, Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, zhCN, zhTW } from 'date-fns/locale';
import RichTextEditor from './components/RichTextEditor';
import MarkdownEditor from './components/MarkdownEditor';
import EmptyState from './components/EmptyState';
import SettingsSidebar from './components/SettingsSidebar';
import ExportModal from './components/ExportModal';
import ConfirmModal from './components/ConfirmModal';
import AutoLockScreen from './components/AutoLockScreen';
import SidebarSearchPanel from './components/SidebarSearchPanel';
import { ToastContainer, useToast } from './components/Toast';
import { useSettings, useTranslation } from './context/SettingsContext';
import { useSecurityManager } from './hooks/useSecurityManager';
import { useNoteSearch } from './hooks/useNoteSearch';

const FONT_SIZE_PRESETS_CN = [
  { label: '小四', px: 12 },
  { label: '四号', px: 14 },
  { label: '小三', px: 15 },
  { label: '三号', px: 16 },
  { label: '小二', px: 18 },
  { label: '二号', px: 22 },
  { label: '小一', px: 24 },
];

const normalizeNote = (note) => {
  const isProtected = note?.protected ?? note?.encrypted ?? false;
  return {
    ...note,
    isDeleted: note?.isDeleted ?? false,
    isFavorite: note?.isFavorite ?? false,
    isPinned: note?.isPinned ?? false,
    encrypted: isProtected,
    protected: isProtected,
    starred: note?.starred ?? false,
    tags: note?.tags ?? [],
    modifiedAt: note?.modifiedAt ?? note?.createdAt,
    lastOpenedAt: note?.lastOpenedAt ?? note?.createdAt,
  };
};

// ─── New Note Dropdown ───────────────────────────────────────────────────────
function NewNoteDropdown({ onCreate, variant = 'rail' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isSidebar = variant === 'sidebar';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: isSidebar ? 0 : 12, width: isSidebar ? '100%' : 'auto' }}>
      <button
        className={isSidebar ? 'sidebar-create-button' : 'nav-item-create'}
        onClick={() => setOpen(o => !o)}
        title="New Note"
      >
        <Plus size={20} />
        {isSidebar && <span>{t('newNote')}</span>}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', left: isSidebar ? 0 : 52, top: isSidebar ? 'auto' : 0, bottom: isSidebar ? 'calc(100% + 10px)' : 'auto', zIndex: 1200,
            background: 'var(--surface-strong)', border: '1px solid var(--border-color)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: isSidebar ? '100%' : 220, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: 'popIn 0.12s ease-out',
          }}
        >
          <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {t('newNote')}
          </div>
          {[
            { label: t('richTextNote'), icon: <FileText size={16} />, type: 'rich', sub: t('richTextSub') },
            { label: t('markdownNote'), icon: <Code size={16} />, type: 'markdown', sub: t('markdownSub') },
          ].map(opt => (
            <button
              key={opt.type}
              className="w-full hover:bg-gray-50 transition-colors"
              onClick={() => { onCreate(opt.type); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
                padding: '12px 16px', textAlignment: 'left',
                background: 'transparent', border: 'none', cursor: 'pointer'
              }}
            >
              <div className="mr-3" style={{ marginTop: 2, color: opt.type === 'rich' ? 'var(--accent)' : '#10b981', flexShrink: 0 }}>
                {opt.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span className="font-medium text-gray-900" style={{ fontSize: 13, lineHeight: '1.2', color: 'var(--text-main)' }}>{opt.label}</span>
                <span className="text-sm text-gray-500" style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>{opt.sub}</span>
              </div>
            </button>
          ))}
          <div style={{ height: 4 }} />
        </div>
      )}
    </div>
  );
}

function ProtectedNotePrompt({ title, onAuthenticate, t, lang }) {
  return (
    <div style={{
      minHeight: 420,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{
        width: 'min(100%, 420px)',
        borderRadius: 24,
        border: '1px solid var(--border-color)',
        background: 'var(--surface-strong)',
        padding: '34px 28px',
        boxShadow: 'var(--shadow-soft)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 20,
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
        }}>
          <Lock size={30} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: 8 }}>
          {title || t('untitled')}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 22 }}>
          {lang === 'en' ? 'This protected note needs password verification before previewing.' : lang === 'zh-TW' ? '這篇受保護筆記需要先完成密碼驗證才能預覽。' : '这篇受保护笔记需要先完成密码验证才能预览。'}
        </div>
        <button
          onClick={onAuthenticate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 16px',
            borderRadius: 999,
            border: '1px solid var(--border-color)',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Lock size={14} />
          {lang === 'en' ? 'Verify to view' : lang === 'zh-TW' ? '驗證後查看' : '验证后查看'}
        </button>
      </div>
    </div>
  );
}

// ─── Note Card Context Menu ───────────────────────────────────────────────────
function ContextMenu({ x, y, note, onPin, onFavorite, onExport, onDelete, onClose }) {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const items = [
    { icon: <Pin size={13} />, label: note.isPinned ? t('unpin') : t('pinToTop'), action: onPin },
    { icon: <Star size={13} />, label: note.isFavorite ? t('unfavorite') : t('addToFavorites'), action: onFavorite },
    { icon: <Download size={13} />, label: t('exportNote'), action: onExport },
    null, // separator
    { icon: <Trash size={13} />, label: note.isDeleted ? t('restore') : t('moveToTrash'), action: onDelete, danger: !note.isDeleted },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 500,
        background: 'var(--surface-strong)', border: '1px solid var(--border-color)',
        borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
        width: 192, overflow: 'hidden', padding: '5px 0',
        display: 'flex', flexDirection: 'column',
        animation: 'popIn 0.12s ease-out',
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className="hover:bg-gray-100"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
              padding: '8px 16px', textAlign: 'left',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, transition: 'background 0.1s',
              color: item.danger ? '#ef4444' : 'var(--text-main)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : 'var(--accent-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="mr-3" style={{ color: item.danger ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const { settings } = useSettings();
  const { t, lang } = useTranslation();
  const locales = { 'en': enUS, 'zh-CN': zhCN, 'zh-TW': zhTW };
  const dangerSoft = 'color-mix(in srgb, #ef4444 16%, var(--surface-primary) 84%)';
  const dangerHover = 'color-mix(in srgb, #ef4444 24%, var(--surface-primary) 76%)';
  const dangerText = 'color-mix(in srgb, #ef4444 84%, var(--text-main) 16%)';
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const detachedNoteId = query.get('note');
  const isDetachedWindow = query.get('detached') === '1' || query.get('editor') === '1' || query.get('windowType') === 'editor';
  
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const seen = new Set();
      return parsed.filter(n => n && !seen.has(n.id) && seen.add(n.id)).map(normalizeNote);
    } catch (e) {
      console.error('[Notes] Failed to parse saved notes:', e);
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeView, setActiveView] = useState('notes');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [isNoteInfoOpen, setIsNoteInfoOpen] = useState(false);
  const [isMdPreview, setIsMdPreview] = useState(false);
  const [isEditorSearchOpen, setIsEditorSearchOpen] = useState(false);
  const [protectedPreviewNoteId, setProtectedPreviewNoteId] = useState(null);
  const [editorActions, setEditorActions] = useState({ canUndo: false, canRedo: false, undo: null, redo: null });
  const [showLaunchBrand, setShowLaunchBrand] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const sidebarSearchRef = useRef(null);
  const notesStorageSnapshotRef = useRef('');
  const persistNotesTimerRef = useRef(null);
  
  // Security
  const [contextMenu, setContextMenu] = useState(null); // { x, y, note }
  const [exportModal, setExportModal] = useState(null); // note object or null
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'single' | 'empty', payload?: noteId }

  const { toasts, remove: removeToast, toast } = useToast();
  const {
    securityState,
    requireAuth,
    lockApp,
    enablePassword,
    disablePassword,
    enableBiometric,
    disableBiometric,
    getBiometricPromptMessage,
    unlockWithBiometric,
    unlockWithPassword,
  } = useSecurityManager({
    enabled: settings.globalPinEnabled,
    autoLockMinutes: settings.autoLockTime,
    biometricEnabled: settings.touchIdEnabled,
    onLock: () => {
      setIsNoteInfoOpen(false);
      setContextMenu(null);
    },
  });

  const isSecurityEnabled = securityState.enabled && securityState.hasPassword;

  useEffect(() => {
    if (persistNotesTimerRef.current) {
      window.clearTimeout(persistNotesTimerRef.current);
    }
    // Debounce full-note persistence to avoid giant stringify churn on every keystroke.
    persistNotesTimerRef.current = window.setTimeout(() => {
      try {
        const serialized = JSON.stringify(notes);
        if (notesStorageSnapshotRef.current === serialized) return;
        notesStorageSnapshotRef.current = serialized;
        if (localStorage.getItem('notes') !== serialized) {
          localStorage.setItem('notes', serialized);
        }
      } catch (e) {
        console.error('[Notes] Failed to persist notes:', e);
      }
    }, 450);

    return () => {
      if (persistNotesTimerRef.current) {
        window.clearTimeout(persistNotesTimerRef.current);
        persistNotesTimerRef.current = null;
      }
    };
  }, [notes]);

  useEffect(() => {
    const syncNotes = (event) => {
      if (event.key !== 'notes' || !event.newValue) return;
      if (event.newValue === notesStorageSnapshotRef.current) return;
      try {
        const parsed = JSON.parse(event.newValue);
        const seen = new Set();
        const normalized = parsed.filter(n => n && !seen.has(n.id) && seen.add(n.id)).map(normalizeNote);
        notesStorageSnapshotRef.current = event.newValue;
        setNotes(normalized);
      } catch (error) {
        console.error('[Notes] Failed to sync notes:', error);
      }
    };

    window.addEventListener('storage', syncNotes);
    return () => window.removeEventListener('storage', syncNotes);
  }, []);

  useEffect(() => {
    // Renderer-side hard fallback: always route external links to system browser.
    const handleDocumentClick = async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;
      event.preventDefault();
      event.stopPropagation();
      if (window.electron?.system?.openExternal) {
        await window.electron.system.openExternal(href);
      } else {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    };
    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, []);

  useEffect(() => {
    const brandTimer = window.setTimeout(() => setShowLaunchBrand(false), 2600);
    const bootTimer = window.setTimeout(() => setIsBooting(false), 900);
    return () => {
      window.clearTimeout(brandTimer);
      window.clearTimeout(bootTimer);
    };
  }, []);

  const isProtectedNote = useCallback((note) => !!(note?.protected ?? note?.encrypted), []);

  const browseNotes = useMemo(() => {
    const list = notes.filter(n => {
      if (activeView === 'trash') return n.isDeleted;
      if (activeView === 'favorites') return !n.isDeleted && n.isFavorite;
      return !n.isDeleted;
    });

    return [...list.filter(n => n.isPinned), ...list.filter(n => !n.isPinned)];
  }, [notes, activeView]);

  const searchTags = useMemo(() => {
    const tags = new Set();
    browseNotes.forEach(note => (note.tags || []).forEach(tag => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [browseNotes]);

  const searchOptions = useMemo(() => ({
    excludeProtectedNotes: settings.globalPinEnabled && settings.hideProtectedSearch,
    isProtectedNote,
  }), [isProtectedNote, settings.globalPinEnabled, settings.hideProtectedSearch]);

  const { searchState, searchActions } = useNoteSearch({ notes: browseNotes, searchOptions });
  const {
    openPanel: openSearchPanel,
    closePanel: closeSearchPanel,
    setQuery: setSearchQuery,
    clearQuery: clearSearchQuery,
    rememberQuery,
    applyRecentSearch,
    setTypeFilter: setSearchTypeFilter,
    toggleTagFilter: toggleSearchTagFilter,
    resetFilters: resetSearchFilters,
  } = searchActions;
  const displayedNotesCount = searchState.isOpen ? searchState.results.length : browseNotes.length;

  useEffect(() => {
    if (!searchState.isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (sidebarSearchRef.current && !sidebarSearchRef.current.contains(event.target)) {
        closeSearchPanel({ clearQueryOnClose: true });
        resetSearchFilters();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeSearchPanel, resetSearchFilters, searchState.isOpen]);

  const activeNote = notes.find(n => n.id === activeNoteId);
  const activeNoteText = useMemo(() => {
    if (!activeNote) return '';
    return activeNote.type === 'rich' ? activeNote.content.replace(/<[^>]*>/g, ' ') : activeNote.content;
  }, [activeNote]);
  const activeNoteStats = useMemo(() => {
    const text = activeNoteText.trim();
    return {
      characters: text.length,
      words: text ? text.split(/\s+/).filter(Boolean).length : 0,
    };
  }, [activeNoteText]);
  const formattedModifiedAt = useMemo(
    () => activeNote ? new Date(activeNote.modifiedAt || activeNote.createdAt).toLocaleString(lang) : '',
    [activeNote, lang]
  );
  const formattedCreatedAt = useMemo(
    () => activeNote ? new Date(activeNote.createdAt).toLocaleString(lang) : '',
    [activeNote, lang]
  );
  const toolbarNoteTitleSize = useMemo(() => {
    const length = (activeNote?.title || '').trim().length;
    if (!length) return 'toolbar-note-title-empty';
    if (length <= 12) return 'toolbar-note-title-large';
    if (length <= 26) return 'toolbar-note-title-medium';
    return 'toolbar-note-title-small';
  }, [activeNote]);

  // Unified note-open entry: protected notes must always pass requireAuth().
  const openNoteById = useCallback(async (id) => {
    const note = notes.find(item => item.id === id);
    if (!note) return;

    setActiveNoteId(id);
    setIsMdPreview(false);
    setIsEditorSearchOpen(false);
    setEditorActions({ canUndo: false, canRedo: false, undo: null, redo: null });
    setIsNoteInfoOpen(false);

    if (isProtectedNote(note)) {
      setProtectedPreviewNoteId(id);
      return;
    }

    setProtectedPreviewNoteId(null);
    update(id, { lastOpenedAt: new Date().toISOString() });
  }, [isProtectedNote, notes]);

  const handleAuthenticateProtectedNote = useCallback(async (noteId) => {
    const note = notes.find(item => item.id === noteId);
    if (!note) return;
    const allowed = await requireAuth({ reason: 'protected-note', force: true });
    if (!allowed) return;
    setProtectedPreviewNoteId(null);
    update(noteId, { lastOpenedAt: new Date().toISOString() });
  }, [notes, requireAuth]);

  const handleDisableGlobalPinRequest = useCallback(async () => {
    const protectedNote = notes.find(note => isProtectedNote(note));
    if (protectedNote) {
      return {
        ok: false,
        message: lang === 'en'
          ? `Global password cannot be disabled because "${protectedNote.title || t('untitled')}" is still protected.`
          : lang === 'zh-TW'
            ? `由於「${protectedNote.title || t('untitled')}」仍處於受保護狀態，無法關閉全局密碼。`
            : `由于「${protectedNote.title || t('untitled')}」处于保护状态，无法关闭全局密码。`,
      };
    }

    const allowed = await requireAuth({ reason: 'disable-security', force: true, mode: 'password' });
    if (!allowed) {
      return { ok: false };
    }

    await disablePassword();
    return { ok: true };
  }, [disablePassword, isProtectedNote, lang, notes, requireAuth, t]);

  const handleDisableBiometricRequest = useCallback(async () => {
    const allowed = await requireAuth({ reason: 'disable-biometric', force: true, mode: 'biometric' });
    if (!allowed) {
      return { ok: false };
    }
    await disableBiometric();
    return { ok: true };
  }, [disableBiometric, requireAuth]);

  useEffect(() => {
    if (!isDetachedWindow || !detachedNoteId) return;
    openNoteById(Number(detachedNoteId));
  }, [detachedNoteId, isDetachedWindow, openNoteById]);

  const handleNoteClick = useCallback(async (id) => {
    await openNoteById(id);
  }, [openNoteById]);

  const handleSearchResultSelect = useCallback(async (note) => {
    rememberQuery();
    closeSearchPanel({ clearQueryOnClose: true });
    resetSearchFilters();
    await openNoteById(note.id);
  }, [closeSearchPanel, openNoteById, rememberQuery, resetSearchFilters]);

  const handleNavClick = useCallback(async (view) => {
    if (view === 'trash' && settings.trashAuthEnabled && isSecurityEnabled) {
      const allowed = await requireAuth({ reason: 'trash', force: true });
      if (!allowed) return;
    }
    setActiveView(view);
    closeSearchPanel({ clearQueryOnClose: true });
    resetSearchFilters();
  }, [closeSearchPanel, isSecurityEnabled, requireAuth, resetSearchFilters, settings.trashAuthEnabled]);

  const handleNewNote = useCallback((type) => {
    const now = new Date().toISOString();
    const n = {
      id: Date.now(), title: '', content: '', type,
      isFavorite: false, isDeleted: false, isPinned: false,
      encrypted: false, protected: false, starred: false,
      tags: [],
      createdAt: now,
      modifiedAt: now,
      lastOpenedAt: now,
    };
    setNotes(prev => [n, ...prev]);
    setActiveNoteId(n.id);
    setActiveView('notes');
  }, []);

  const update = (id, patch) => setNotes(prev => prev.map(n => n.id === id ? {
    ...n,
    ...patch,
    modifiedAt: patch.modifiedAt ?? (('content' in patch || 'title' in patch || 'tags' in patch || 'encrypted' in patch || 'protected' in patch || 'isFavorite' in patch || 'isPinned' in patch || 'isDeleted' in patch) ? new Date().toISOString() : n.modifiedAt),
  } : n));

  const handleTitleChange = (id, title) => update(id, { title });
  const handleUpdateNote = (id, content) => update(id, { content });
  const addTagToNote = useCallback((id, rawTag) => {
    const tag = rawTag.trim().replace(/^#/, '');
    if (!tag) return;
    const note = notes.find(n => n.id === id);
    if (!note) return;
    update(id, { tags: [...new Set([...(note.tags || []), tag])] });
    setTagInput('');
  }, [notes]);
  const removeTagFromNote = useCallback((id, tag) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    update(id, { tags: (note.tags || []).filter(item => item !== tag) });
  }, [notes]);
  const handleToggleFavorite = (e, id) => {
    if (e) e.stopPropagation();
    update(id, { isFavorite: !notes.find(n => n.id === id)?.isFavorite });
  };

  const handleSoftDelete = useCallback((e, id) => {
    (async () => {
      if (e) e.stopPropagation();
      const note = notes.find(n => n.id === id);
      if (!note) return;
      if (isProtectedNote(note)) {
        const allowed = await requireAuth({ reason: 'delete-protected-note', force: true });
        if (!allowed) return;
      }
      update(id, { isDeleted: true });
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setProtectedPreviewNoteId(null);
      }
    })();
  }, [activeNoteId, isProtectedNote, notes, requireAuth]);

  const handleRestore = useCallback((e, id) => {
    if (e) e.stopPropagation();
    update(id, { isDeleted: false });
  }, []);

  const requestPermanentDelete = (e, id) => {
    (async () => {
      if (e) e.stopPropagation();
      const note = notes.find(n => n.id === id);
      if (!note) return;
      if (isProtectedNote(note)) {
        const allowed = await requireAuth({ reason: 'delete-protected-note', force: true });
        if (!allowed) return;
      }
      setConfirmModal({ type: 'single', payload: id });
    })();
  };

  const confirmPermanentDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'single') {
      setNotes(prev => prev.filter(n => n.id !== confirmModal.payload));
      if (activeNoteId === confirmModal.payload) {
        setActiveNoteId(null);
        setProtectedPreviewNoteId(null);
      }
    } else if (confirmModal.type === 'empty') {
      setNotes(prev => prev.filter(n => !n.isDeleted));
      if (notes.find(n => n.id === activeNoteId)?.isDeleted) {
        setActiveNoteId(null);
        setProtectedPreviewNoteId(null);
      }
    }
    setConfirmModal(null);
  };

  const handlePin = (id) => update(id, { isPinned: !notes.find(n => n.id === id)?.isPinned });

  const handleToggleEncryption = useCallback((note) => {
    if (!note) return;
    if (!isSecurityEnabled) {
      toast(t('globalPinDesc') || 'Enable global PIN first.', 'error');
      return;
    }
    const nextProtected = !isProtectedNote(note);
    update(note.id, { encrypted: nextProtected, protected: nextProtected });
    if (nextProtected && activeNoteId === note.id) {
      setProtectedPreviewNoteId(note.id);
      setIsNoteInfoOpen(false);
    } else if (!nextProtected && protectedPreviewNoteId === note.id) {
      setProtectedPreviewNoteId(null);
    }
    toast(nextProtected ? (t('encryptNoteTitle') || 'Protected note enabled.') : (t('unlockNote') || 'Protected note disabled.'), 'success');
  }, [activeNoteId, isProtectedNote, isSecurityEnabled, protectedPreviewNoteId, t, toast]);

  // Trigger file download using native <a> tag
  const downloadFile = useCallback((content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('File saved to your Downloads folder', 'success');
    } catch (e) {
      toast('Failed to save file.', 'error');
    }
  }, [toast]);

  const handleExport = useCallback((note) => {
    (async () => {
      if (!note) return;
      if (isProtectedNote(note)) {
        const allowed = await requireAuth({ reason: 'protected-note', force: true });
        if (!allowed) return;
      }
      // Rich text: export directly as .txt (strip HTML)
      if (note.type !== 'markdown') {
        const stripped = note.content.replace(/<[^>]*>/g, '');
        downloadFile(stripped, `${note.title || 'Untitled_Note'}.txt`);
        return;
      }
      // Markdown: open clean UI modal to choose .md or .txt
      setExportModal(note);
    })();
  }, [downloadFile, isProtectedNote, requireAuth]);

  const handleExportWithFormat = useCallback((ext) => {
    if (!exportModal) return;
    const content = exportModal.content;
    const mimeType = ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    downloadFile(content, `${exportModal.title || 'Untitled_Note'}.${ext}`, mimeType);
    setExportModal(null);
  }, [exportModal, downloadFile]);

  const openContextMenu = useCallback((e, note) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, note });
  }, []);

  // Close context menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setContextMenu(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleDetachActiveNote = useCallback(async () => {
    if (!activeNoteId || !window.electron?.window?.detachNote) return;
    const note = notes.find(item => item.id === activeNoteId);
    if (!note) return;
    // Detached windows also require authentication unless the note itself is protected
    // (protected note already has its own auth gate on open).
    // Detached window itself should not force a second global-password prompt.
    // Protected-note access is still guarded by the protected-note auth flow.
    await window.electron.window.detachNote(activeNoteId);
  }, [activeNoteId]);
  const handleRestoreDetachedNote = useCallback(async () => {
    if (!window.electron?.window?.restoreNote) return;
    await window.electron.window.restoreNote();
  }, []);

  const sidebarShellWidth = isDetachedWindow ? 0 : 64 + (isSidebarOpen ? 280 : 0);
  const showEditorTitlebar = isDetachedWindow || !!activeNote;
  const detachedTitle = activeNote
    ? `${activeNote.title || t('untitled')} · ${activeNote.type === 'rich' ? t('richText') : t('markdown')} · TomaNotes`
    : 'TomaNotes';

  return (
    <div className={`app-container antialiased ${isBooting ? 'app-booting' : ''}`}>
      {securityState.isLocked && (
        <AutoLockScreen
          reason={securityState.pendingReason}
          canUseBiometric={settings.globalPinEnabled && settings.touchIdEnabled && securityState.pendingAuthMode !== 'password'}
          onUnlock={unlockWithPassword}
          onBiometricUnlock={() => unlockWithBiometric(getBiometricPromptMessage(securityState.pendingReason))}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Export Modal (for Markdown format choice) */}
      <ExportModal
        isOpen={!!exportModal}
        onClose={() => setExportModal(null)}
        onExport={handleExportWithFormat}
        noteTitle={exportModal?.title}
      />

      {/* Context Menu (global, portal-like) */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y} note={contextMenu.note}
          onPin={() => handlePin(contextMenu.note.id)}
          onFavorite={() => handleToggleFavorite(null, contextMenu.note.id)}
          onExport={() => handleExport(contextMenu.note)}
          onDelete={() => {
            if (contextMenu.note.isDeleted) {
              handleRestore(null, contextMenu.note.id);
            } else {
              handleSoftDelete(null, contextMenu.note.id);
            }
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmModal}
        type={confirmModal?.type}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmPermanentDelete}
      />

      <div className="workspace-shell">
      {!isDetachedWindow && (
        <section
          className="sidebar-shell"
          style={{ width: sidebarShellWidth, transition: 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}
        >
          <header className="sidebar-titlebar" style={{ WebkitAppRegion: 'drag' }}>
            <div className="sidebar-titlebar-brand">
              <div className={`sidebar-brand ${showLaunchBrand ? 'sidebar-brand-intro' : 'sidebar-brand-settled'}`}>
                <span className="sidebar-brand-line sidebar-brand-line-intro">
                  {lang === 'en' ? '🍅Inspiration strikes！' : '🍅灵感迸发！'}
                </span>
                <span className="sidebar-brand-line sidebar-brand-line-wordmark">TomaNotes</span>
              </div>
            </div>
          </header>

          <div className="sidebar-columns">
      {/* Column 1: Navigation Rail */}
      <nav className="nav-rail">

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { view: 'notes', icon: <FileBox size={20} />, title: t('allNotes') },
            { view: 'favorites', icon: <Star size={20} />, title: t('favorites') },
            { view: 'trash', icon: <Trash2 size={20} />, title: t('trash') },
          ].map(({ view, icon, title }) => (
            <button key={view} onClick={() => handleNavClick(view)} className={`nav-item ${activeView === view ? 'active' : ''}`} title={title}>
              {icon}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isSecurityEnabled && (
            <button onClick={() => lockApp('manual')} className="nav-item" title={t('lockImmediate')}>
              <Lock size={20} />
            </button>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="nav-item" title={t('toggleSidebar') || 'Toggle Sidebar'}>
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="nav-item" title={t('settingsTitle')}>
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Column 2: Note List */}
      <aside className="note-list-column" style={{ width: isSidebarOpen ? 280 : 0, transition: 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}>
        <div ref={sidebarSearchRef} style={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%', opacity: isSidebarOpen ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isSidebarOpen ? 'auto' : 'none' }}>
        <div className="column-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {activeView === 'notes' ? t('allNotes') : activeView === 'favorites' ? t('favorites') : t('trash')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeView === 'trash' && browseNotes.length > 0 && (
                <button
                  onClick={() => setConfirmModal({ type: 'empty' })}
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, background: dangerSoft, color: dangerText, fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = dangerHover}
                  onMouseLeave={e => e.currentTarget.style.background = dangerSoft}
                >
                  {t('emptyTrash')}
                </button>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 99 }}>{displayedNotesCount}</span>
            </div>
          </div>
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <Search size={14} className="search-input-icon" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchState.query}
                onFocus={openSearchPanel}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    rememberQuery();
                  }
                  if (e.key === 'Escape') {
                    closeSearchPanel({ clearQueryOnClose: true });
                    resetSearchFilters();
                  }
                }}
                className="search-input"
              />
              {!!searchState.query && (
                <button
                  onClick={() => {
                    clearSearchQuery();
                    resetSearchFilters();
                  }}
                  className="search-clear-btn"
                  title={t('clear') || 'Clear'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {searchState.isOpen && (
              <button
                onClick={() => {
                  closeSearchPanel({ clearQueryOnClose: true });
                  resetSearchFilters();
                }}
                className="search-exit-btn"
                title={lang === 'en' ? 'Exit search' : lang === 'zh-TW' ? '退出搜尋' : '退出搜索'}
              >
                <EyeOff size={14} />
                <span>{lang === 'en' ? 'Exit' : lang === 'zh-TW' ? '退出' : '退出'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="note-card-list">
          {searchState.isOpen ? (
            <SidebarSearchPanel
              searchState={searchState}
              tags={searchTags}
              onSelectNote={handleSearchResultSelect}
              onSelectRecent={applyRecentSearch}
              onTypeChange={setSearchTypeFilter}
              onToggleTag={toggleSearchTagFilter}
            />
          ) : (
          <>
          {browseNotes.map(note => (
            <div
              key={note.id}
              onClick={() => handleNoteClick(note.id)}
              onContextMenu={e => openContextMenu(e, note)}
              className={`note-card ${activeNoteId === note.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, minWidth: 0 }}>
                {note.isPinned && <Pin size={10} style={{ color: '#f59e0b', flexShrink: 0, fill: '#f59e0b' }} />}
                {isProtectedNote(note) && <Lock size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                <span style={{ flexShrink: 0, color: note.type === 'rich' ? 'var(--accent)' : '#10b981', display: 'flex' }}>
                  {note.type === 'rich' ? <FileText size={13} /> : <Code size={13} />}
                </span>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || t('untitled')}
                </h3>
              </div>
              {!!note.tags?.length && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p style={{
                margin: 0, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', height: 18,
                color: isProtectedNote(note) ? 'var(--accent)' : 'var(--text-muted)',
                fontStyle: isProtectedNote(note) ? 'italic' : 'normal',
              }}>
                {isProtectedNote(note) ? t('textEncrypted') : (note.content ? note.content.replace(/<[^>]*>/g, '').substring(0, 50) : t('noContentYet'))}
              </p>
              <div className="note-card-meta">
                <span>{t('createdAt') || 'Created at'}: {formatDistanceToNow(new Date(note.createdAt), { locale: locales[lang] || enUS, addSuffix: true })}</span>
                <div className="note-card-meta-actions">
                  {note.isFavorite && <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}

                  {activeView === 'trash' ? (
                    <>
                      <button
                        onClick={e => handleRestore(e, note.id)}
                        style={{ padding: 3 }}
                        title={t('restore')}
                        onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                        onMouseLeave={e => e.currentTarget.style.color = '#ddd'}
                      >
                        <RefreshCw size={10} />
                      </button>
                      <button
                        onClick={e => requestPermanentDelete(e, note.id)}
                        style={{ padding: 3 }}
                        title={t('deleteConfirmTitle')}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#ddd'}
                      >
                        <Trash2 size={10} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={e => handleSoftDelete(e, note.id)}
                      style={{ padding: 3 }}
                      title={t('moveToTrash')}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#ddd'}
                    >
                      <Trash size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {browseNotes.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.25 }}>
              <FileBox size={32} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('emptyStateTitle')}</p>
            </div>
          )}
          </>
          )}
        </div>
        <div className="note-list-floating-create">
          <NewNoteDropdown onCreate={handleNewNote} variant="sidebar" />
        </div>
        </div>
      </aside>
          </div>
        </section>
      )}

      {/* Column 3: Editor Viewport */}
      <section className="editor-shell">
        {showEditorTitlebar && (
          <header
            className="editor-titlebar"
            style={{ WebkitAppRegion: 'drag', paddingLeft: isDetachedWindow ? 86 : 24 }}
          >
            <div className="editor-titlebar-main">
              {isDetachedWindow ? (
                <div className="toolbar-detached-title">
                  <span>{detachedTitle}</span>
                </div>
              ) : activeNote ? (
                <div className="toolbar-note-title-wrap">
                  <span className={`toolbar-note-title ${toolbarNoteTitleSize}`}>
                    {activeNote.title || t('untitled')}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="editor-titlebar-actions" style={{ WebkitAppRegion: 'no-drag' }}>
              {activeNote && (
                <>
                  <button
                    onClick={() => editorActions.undo?.()}
                    title="Undo"
                    disabled={!editorActions.canUndo}
                    style={{ color: editorActions.canUndo ? 'var(--text-muted)' : 'var(--text-subtle)', padding: 4, opacity: editorActions.canUndo ? 1 : 0.45 }}
                  >
                    <Undo2 size={17} />
                  </button>
                  <button
                    onClick={() => editorActions.redo?.()}
                    title="Redo"
                    disabled={!editorActions.canRedo}
                    style={{ color: editorActions.canRedo ? 'var(--text-muted)' : 'var(--text-subtle)', padding: 4, opacity: editorActions.canRedo ? 1 : 0.45 }}
                  >
                    <Redo2 size={17} />
                  </button>
                  {activeNote.type === 'markdown' && (
                    <>
                      <button
                        onClick={() => setIsEditorSearchOpen(!isEditorSearchOpen)}
                        style={{ color: isEditorSearchOpen ? 'var(--text-main)' : 'var(--text-muted)', transition: 'color 0.2s', padding: 4 }}
                        title="Search (Ctrl + F)"
                      >
                        <Search size={17} />
                      </button>
                      <button
                        onClick={() => setIsMdPreview(!isMdPreview)}
                        style={{ color: isMdPreview ? 'var(--text-main)' : 'var(--text-muted)', transition: 'color 0.2s', padding: 4 }}
                        title={isMdPreview ? "Show Source" : "Show Preview"}
                      >
                        {isMdPreview ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                    </>
                  )}
                  <button onClick={() => handleExport(activeNote)} title={t('export')} style={{ color: 'var(--text-muted)', padding: 4 }}><Download size={17} /></button>
                  <button
                    onClick={() => handleToggleEncryption(activeNote)}
                    title={isProtectedNote(activeNote) ? t('noteEncryptedMsg') : t('encryptNote')}
                    style={{ color: isProtectedNote(activeNote) ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s', padding: 4 }}
                  >
                    {isProtectedNote(activeNote) ? <Lock size={17} /> : <Unlock size={17} />}
                  </button>
                  <button
                    onClick={isDetachedWindow ? handleRestoreDetachedNote : handleDetachActiveNote}
                    title={isDetachedWindow ? t('restoreWindow') : t('detachWindow')}
                    style={{ color: 'var(--text-muted)', padding: '4px 10px', fontSize: 12, border: '1px solid var(--border-color)', borderRadius: 999, background: 'var(--surface-primary)' }}
                  >
                    {isDetachedWindow ? t('restoreWindow') : t('detachWindow')}
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setIsNoteInfoOpen(v => !v)}
                      title={lang === 'en' ? 'Note details' : lang === 'zh-TW' ? '筆記詳情' : '笔记详情'}
                      style={{ color: isNoteInfoOpen ? 'var(--text-main)' : 'var(--text-muted)', padding: 4 }}
                    >
                      <Info size={17} />
                    </button>
                    {isNoteInfoOpen && (
                      <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 320, background: 'var(--surface-strong)', border: '1px solid var(--border-color)', borderRadius: 14, boxShadow: 'var(--shadow-soft)', padding: 16, zIndex: 160 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 12 }}>
                          {t('noteDetails')}
                        </div>
                        {[
                          [t('titleLabel'), activeNote.title || t('untitled')],
                          [t('typeLabel'), activeNote.type === 'rich' ? t('richText') : t('markdown')],
                          [t('modifiedAt'), formattedModifiedAt],
                          [t('createdTime'), formattedCreatedAt],
                          [t('tagsLabel'), (activeNote.tags || []).length ? activeNote.tags.map(tag => `#${tag}`).join(', ') : '—'],
                          [lang.startsWith('zh') ? t('charactersLabel') : t('wordsLabel'), String(lang.startsWith('zh') ? activeNoteStats.characters : activeNoteStats.words)],
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</span>
                            <span style={{ color: 'var(--text-main)', fontSize: 12, textAlign: 'right' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </header>
        )}

        <main className="editor-viewport">
        <SettingsSidebar 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          notes={notes}
          securityState={securityState}
          onEnableGlobalPin={enablePassword}
          onDisableGlobalPin={handleDisableGlobalPinRequest}
          onEnableBiometric={enableBiometric}
          onDisableBiometric={handleDisableBiometricRequest}
        />

        {activeNote ? (
            <div className="editor-scroll-surface">
                {isProtectedNote(activeNote) && protectedPreviewNoteId === activeNote.id ? (
                  <ProtectedNotePrompt
                    title={activeNote.title}
                    onAuthenticate={() => handleAuthenticateProtectedNote(activeNote.id)}
                    t={t}
                    lang={lang}
                  />
                ) : (
                <div className="editor-content-wrapper">
                  <div className="editor-inline-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
                      {activeNote.isPinned && <Pin size={11} style={{ color: 'var(--text-main)', transform: 'rotate(45deg)' }} />}
                      {(activeNote.tags || []).map(tag => (
                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11 }}>
                          #{tag}
                          <button onClick={() => removeTagFromNote(activeNote.id, tag)} style={{ padding: 0, color: 'inherit' }}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTagToNote(activeNote.id, tagInput.replace(/,$/, ''));
                          }
                        }}
                        placeholder={lang === 'en' ? 'Add tag' : lang === 'zh-TW' ? '新增標籤' : '新增标签'}
                        style={{ border: '1px solid var(--border-color)', background: 'var(--surface-strong)', color: 'var(--text-main)', borderRadius: 999, padding: '5px 10px', fontSize: 12, outline: 'none', minWidth: 90 }}
                      />
                    </div>
                  </div>
                  <div className="editor-main-container" style={{ fontSize: `${settings.fontSize}px` }}>
                    {activeNote.type === 'rich' ? (
                      <RichTextEditor 
                        key={activeNote.id} 
                        note={activeNote} 
                        onChange={c => handleUpdateNote(activeNote.id, c)} 
                        onTitleChange={v => handleTitleChange(activeNote.id, v)}
                        onActionsChange={setEditorActions}
                      />
                    ) : (
                      <MarkdownEditor 
                        key={activeNote.id} 
                        note={activeNote} 
                        onChange={c => handleUpdateNote(activeNote.id, c)} 
                        onTitleChange={v => handleTitleChange(activeNote.id, v)}
                        isPreview={isMdPreview}
                        isSearchOpen={isEditorSearchOpen}
                        onCloseSearch={() => setIsEditorSearchOpen(false)}
                        onActionsChange={setEditorActions}
                      />
                    )}
                  </div>
                </div>
                )}
            </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState onNewNote={handleNewNote} />
          </div>
        )}
        </main>
      </section>
      </div>
    </div>
  );
}

export default App;
