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
import PasswordModal from './components/PasswordModal';
import LockedNoteView from './components/LockedNoteView';
import ConfirmModal from './components/ConfirmModal';
import AutoLockScreen from './components/AutoLockScreen';
import { ToastContainer, useToast } from './components/Toast';
import { useSettings, useTranslation } from './context/SettingsContext';

const FONT_SIZE_PRESETS_CN = [
  { label: '小四', px: 12 },
  { label: '四号', px: 14 },
  { label: '小三', px: 15 },
  { label: '三号', px: 16 },
  { label: '小二', px: 18 },
  { label: '二号', px: 22 },
  { label: '小一', px: 24 },
];

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
  const isDetachedWindow = query.get('detached') === '1';
  
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const seen = new Set();
      return parsed.filter(n => n && !seen.has(n.id) && seen.add(n.id)).map(n => ({
        ...n,
        isDeleted: n.isDeleted ?? false,
        isFavorite: n.isFavorite ?? false,
        isPinned: n.isPinned ?? false,
        encrypted: n.encrypted ?? false,
        starred: n.starred ?? false,
        tags: n.tags ?? [],
        modifiedAt: n.modifiedAt ?? n.createdAt,
        lastOpenedAt: n.lastOpenedAt ?? n.createdAt,
      }));
    } catch (e) {
      console.error('[Notes] Failed to parse saved notes:', e);
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeView, setActiveView] = useState('notes');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'rich' | 'markdown'
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [isSidebarSearchFocused, setIsSidebarSearchFocused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [isNoteInfoOpen, setIsNoteInfoOpen] = useState(false);
  const [isMdPreview, setIsMdPreview] = useState(false);
  const [isEditorSearchOpen, setIsEditorSearchOpen] = useState(false);
  const [editorActions, setEditorActions] = useState({ canUndo: false, canRedo: false, undo: null, redo: null });
  const [showLaunchBrand, setShowLaunchBrand] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  
  // Security
  const [isLocked, setIsLocked] = useState(false);
  const [globalUnlocked, setGlobalUnlocked] = useState(false);
  const [pendingView, setPendingView] = useState(null);
  const blurTimeRef = useRef(null);
  
  const [contextMenu, setContextMenu] = useState(null); // { x, y, note }
  const [exportModal, setExportModal] = useState(null); // note object or null
  const [passwordModal, setPasswordModal] = useState(null); // { note, mode: 'set' | 'unlock' }
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'single' | 'empty', payload?: noteId }
  const [unlockedNotes, setUnlockedNotes] = useState(new Set()); // session-level unlocking

  const { toasts, remove: removeToast, toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch (e) {
      console.error('[Notes] Failed to persist notes:', e);
    }
  }, [notes]);

  useEffect(() => {
    const syncNotes = (event) => {
      if (event.key !== 'notes' || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        const seen = new Set();
        setNotes(parsed.filter(n => n && !seen.has(n.id) && seen.add(n.id)).map(n => ({
          ...n,
          isDeleted: n.isDeleted ?? false,
          isFavorite: n.isFavorite ?? false,
          isPinned: n.isPinned ?? false,
          encrypted: n.encrypted ?? false,
          starred: n.starred ?? false,
          tags: n.tags ?? [],
          modifiedAt: n.modifiedAt ?? n.createdAt,
          lastOpenedAt: n.lastOpenedAt ?? n.createdAt,
        })));
      } catch (error) {
        console.error('[Notes] Failed to sync notes:', error);
      }
    };

    window.addEventListener('storage', syncNotes);
    return () => window.removeEventListener('storage', syncNotes);
  }, []);

  useEffect(() => {
    if (!isDetachedWindow || !detachedNoteId) return;
    setActiveNoteId(Number(detachedNoteId));
  }, [isDetachedWindow, detachedNoteId]);

  useEffect(() => {
    const brandTimer = window.setTimeout(() => setShowLaunchBrand(false), 2600);
    const bootTimer = window.setTimeout(() => setIsBooting(false), 900);
    return () => {
      window.clearTimeout(brandTimer);
      window.clearTimeout(bootTimer);
    };
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => (note.tags || []).forEach(tag => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const recentNotes = useMemo(() => {
    return [...notes]
      .filter(n => !n.isDeleted)
      .sort((a, b) => new Date(b.lastOpenedAt || b.createdAt) - new Date(a.lastOpenedAt || a.createdAt))
      .slice(0, 5);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let list = notes.filter(n => {
      if (activeView === 'trash') return n.isDeleted;
      if (activeView === 'favorites') return !n.isDeleted && n.isFavorite;
      return !n.isDeleted;
    });
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(n => {
        const titleMatch = n.title.toLowerCase().includes(term);
        const contentMatch = !n.encrypted && n.content.toLowerCase().includes(term);
        const tagsMatch = (n.tags || []).some(tag => tag.toLowerCase().includes(term));
        return titleMatch || contentMatch || tagsMatch;
      });
    }
    if (typeFilter !== 'all') {
      list = list.filter(n => n.type === typeFilter);
    }
    if (tagFilter !== 'all') {
      list = list.filter(n => (n.tags || []).includes(tagFilter));
    }
    // Pinned first
    return [...list.filter(n => n.isPinned), ...list.filter(n => !n.isPinned)];
  }, [notes, activeView, searchTerm, typeFilter, tagFilter]);

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
  const isNoteUnlocked = useCallback((id) => {
    if (settings.globalPinEnabled && settings.masterKeyEnabled && globalUnlocked) return true;
    return unlockedNotes.has(id);
  }, [settings.globalPinEnabled, settings.masterKeyEnabled, globalUnlocked, unlockedNotes]);

  // Initial Boot-up Lock & Event listeners for AutoLock
  useEffect(() => {
    if (!window.electron) return;
    
    // Attempt Touch ID at startup if enabled
    if (settings.globalPinEnabled) {
       setIsLocked(true); 
    }
    
    let isCleanup = false;
    window.electron.system.onBlur(() => { if (!isCleanup) blurTimeRef.current = Date.now(); });
    window.electron.system.onFocus(() => {
      if (isCleanup || !settings.globalPinEnabled || settings.autoLockTime === -1) return;
      if (blurTimeRef.current) {
        const diffMins = (Date.now() - blurTimeRef.current) / 60000;
        if (diffMins >= settings.autoLockTime) {
          setIsLocked(true);
          setGlobalUnlocked(false);
        }
        blurTimeRef.current = null;
      }
    });
    return () => { isCleanup = true; };
  }, [settings.globalPinEnabled, settings.autoLockTime]);

  const handleNoteClick = (id) => {
    update(id, { lastOpenedAt: new Date().toISOString() });
    setActiveNoteId(id);
    setIsMdPreview(false);
    setIsEditorSearchOpen(false);
    setEditorActions({ canUndo: false, canRedo: false, undo: null, redo: null });
    setIsSidebarSearchFocused(false);
    setIsNoteInfoOpen(false);
  };

  // Handle global unlock success
  const handleGlobalUnlock = () => {
    setIsLocked(false);
    setGlobalUnlocked(true);
    if (pendingView) {
      setActiveView(pendingView);
      setPendingView(null);
    }
  };

  const handleNavClick = async (view) => {
    if (view === 'trash' && settings.globalPinEnabled && !globalUnlocked) {
      if (settings.touchIdEnabled && window.electron && await window.electron.security.promptTouchID('Unlock Trash')) {
        setGlobalUnlocked(true);
        setActiveView(view);
      } else {
        setPendingView(view);
        setIsLocked(true);
      }
      return;
    }
    setActiveView(view);
  };

  const handleNewNote = useCallback((type) => {
    const now = new Date().toISOString();
    const n = {
      id: Date.now(), title: '', content: '', type,
      isFavorite: false, isDeleted: false, isPinned: false,
      encrypted: false, starred: false,
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
    modifiedAt: patch.modifiedAt ?? (('content' in patch || 'title' in patch || 'tags' in patch || 'encrypted' in patch || '_pwMarker' in patch || 'isFavorite' in patch || 'isPinned' in patch || 'isDeleted' in patch) ? new Date().toISOString() : n.modifiedAt),
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

  // Security check for deletion
  const canDeleteNote = useCallback((id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return false;
    if (note.encrypted && !isNoteUnlocked(note.id)) {
      toast(t('unlockToDelete') || 'Please unlock the note before deleting.', 'error');
      return false;
    }
    return true;
  }, [notes, isNoteUnlocked, t]);

  const handleSoftDelete = useCallback((e, id) => {
    if (e) e.stopPropagation();
    if (!canDeleteNote(id)) return;
    update(id, { isDeleted: true });
    if (activeNoteId === id) setActiveNoteId(null);
  }, [canDeleteNote, activeNoteId]);

  const handleRestore = useCallback((e, id) => {
    if (e) e.stopPropagation();
    update(id, { isDeleted: false });
  }, []);

  const requestPermanentDelete = (e, id) => {
    if (e) e.stopPropagation();
    if (!canDeleteNote(id)) return;
    setConfirmModal({ type: 'single', payload: id });
  };

  const confirmPermanentDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'single') {
      setNotes(prev => prev.filter(n => n.id !== confirmModal.payload));
      if (activeNoteId === confirmModal.payload) setActiveNoteId(null);
    } else if (confirmModal.type === 'empty') {
      setNotes(prev => prev.filter(n => !n.isDeleted));
      if (notes.find(n => n.id === activeNoteId)?.isDeleted) setActiveNoteId(null);
    }
    setConfirmModal(null);
  };

  const handlePin = (id) => update(id, { isPinned: !notes.find(n => n.id === id)?.isPinned });

  // ── Encryption ──────────────────────────────────────────────────────────────
  const handleToggleEncryption = useCallback((note) => {
    if (!note) return;
    if (!note.encrypted) {
      // Encrypt: open password modal to set
      setPasswordModal({ note, mode: 'set' });
    } else {
      // Decrypt (remove encryption entirely): open password modal to verify, then unlock
      setPasswordModal({ note, mode: 'unlock' });
    }
  }, [setPasswordModal]);

  const handlePasswordConfirm = useCallback((password) => {
    if (!passwordModal) return;
    const { note, mode } = passwordModal;

    if (mode === 'set') {
      const marker = btoa(unescape(encodeURIComponent(password)));
      update(note.id, { encrypted: true, _pwMarker: marker });
      setUnlockedNotes(prev => { const n = new Set(prev); n.delete(note.id); return n; });
      toast(t('encryptNoteTitle') || 'Note encrypted successfully.', 'success');
    } else if (mode === 'unlock') {
      const marker = btoa(unescape(encodeURIComponent(password)));
      if (marker !== note._pwMarker) {
        toast(t('incorrectPin') || 'Incorrect password.', 'error');
        return;
      }
      update(note.id, { encrypted: false, _pwMarker: null });
      setUnlockedNotes(prev => { const n = new Set(prev); n.delete(note.id); return n; });
      toast(t('unlockNote') || 'Encryption removed.', 'success');
    }
    setPasswordModal(null);
  }, [passwordModal, toast, update, t, setPasswordModal]);

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
    if (!note) return;
    if (note.encrypted && !isNoteUnlocked(note.id)) {
      toast('Please unlock the note first to export it.', 'error');
      return;
    }
    // Rich text: export directly as .txt (strip HTML)
    if (note.type !== 'markdown') {
      const stripped = note.content.replace(/<[^>]*>/g, '');
      downloadFile(stripped, `${note.title || 'Untitled_Note'}.txt`);
      return;
    }
    // Markdown: open clean UI modal to choose .md or .txt
    setExportModal(note);
  }, [downloadFile]);

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
      {isLocked && <AutoLockScreen onUnlock={handleGlobalUnlock} />}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <PasswordModal
        isOpen={!!passwordModal}
        mode={passwordModal?.mode}
        noteTitle={passwordModal?.note?.title}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setPasswordModal(null)}
      />

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
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%', opacity: isSidebarOpen ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isSidebarOpen ? 'auto' : 'none' }}>
        <div className="column-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {activeView === 'notes' ? t('allNotes') : activeView === 'favorites' ? t('favorites') : t('trash')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeView === 'trash' && filteredNotes.length > 0 && (
                <button
                  onClick={() => setConfirmModal({ type: 'empty' })}
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, background: dangerSoft, color: dangerText, fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = dangerHover}
                  onMouseLeave={e => e.currentTarget.style.background = dangerSoft}
                >
                  {t('emptyTrash')}
                </button>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 99 }}>{filteredNotes.length}</span>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search size={14} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onFocus={() => setIsSidebarSearchFocused(true)}
              onBlur={() => setTimeout(() => { if (!searchTerm) setIsSidebarSearchFocused(false); }, 120)}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Type Filter Slider */}
          <div style={{ display: 'flex', background: 'var(--surface-elevated)', borderRadius: 8, padding: 2, marginTop: 12, border: '1px solid var(--border-color)' }}>
             {[
               { id: 'all', label: t('allNotes') || 'All' },
               { id: 'rich', label: t('richText') || 'Rich Text' },
               { id: 'markdown', label: t('markdown') || 'Markdown' }
             ].map(type => (
               <button
                 key={type.id}
                 onClick={() => setTypeFilter(type.id)}
                 style={{
                   flex: 1, padding: '4px 0', fontSize: 11, fontWeight: 600, borderRadius: 6,
                   background: typeFilter === type.id ? 'var(--surface-strong)' : 'transparent',
                   color: typeFilter === type.id ? 'var(--text-main)' : 'var(--text-muted)',
                   boxShadow: typeFilter === type.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                   transition: 'all 0.15s ease', border: 'none', cursor: 'pointer'
                 }}
               >
                 {type.label}
               </button>
             ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tags size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="search-input"
                style={{ paddingLeft: 32, appearance: 'none' }}
              >
                <option value="all">{t('allTags')}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsSidebarSearchFocused(v => !v)}
              style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 58, textAlign: 'right', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-primary)' }}
            >
              {t('searchScope')}
            </button>
          </div>
        </div>

        <div className="note-card-list">
          {isSidebarSearchFocused ? (
            <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
                  {t('recentLabel')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteClick(note.id)}
                      style={{ justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--surface-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150, textAlign: 'left' }}>{note.title || t('untitled')}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{note.type === 'rich' ? t('richText') : t('markdown')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
                  {t('searchScope')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button onClick={() => setTypeFilter('rich')} style={{ padding: '8px 12px', borderRadius: 999, background: typeFilter === 'rich' ? 'var(--accent)' : 'var(--surface-primary)', color: typeFilter === 'rich' ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    {t('searchRichText')}
                  </button>
                  <button onClick={() => setTypeFilter('markdown')} style={{ padding: '8px 12px', borderRadius: 999, background: typeFilter === 'markdown' ? 'var(--accent)' : 'var(--surface-primary)', color: typeFilter === 'markdown' ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    {t('searchMarkdown')}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
                  {t('searchByTag')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    onClick={() => setTagFilter('all')}
                    style={{ padding: '8px 12px', borderRadius: 999, background: tagFilter === 'all' ? 'var(--accent)' : 'var(--surface-primary)', color: tagFilter === 'all' ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)' }}
                  >
                    {t('allTags')}
                  </button>
                  {allTags.length ? allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      style={{ padding: '8px 12px', borderRadius: 999, background: tagFilter === tag ? 'var(--accent)' : 'var(--accent-soft)', color: tagFilter === tag ? '#fff' : 'var(--accent)', border: '1px solid var(--border-color)' }}
                    >
                      #{tag}
                    </button>
                  )) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('noTagsYet')}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <>
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => handleNoteClick(note.id)}
              onContextMenu={e => openContextMenu(e, note)}
              className={`note-card ${activeNoteId === note.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, minWidth: 0 }}>
                {note.isPinned && <Pin size={10} style={{ color: '#f59e0b', flexShrink: 0, fill: '#f59e0b' }} />}
                {note.encrypted && <Lock size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
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
                color: note.encrypted ? 'var(--accent)' : 'var(--text-muted)',
                fontStyle: note.encrypted ? 'italic' : 'normal',
              }}>
                {note.encrypted ? t('textEncrypted') : (note.content ? note.content.replace(/<[^>]*>/g, '').substring(0, 50) : t('noContentYet'))}
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
          {filteredNotes.length === 0 && (
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
                    title={activeNote.encrypted ? t('noteEncryptedMsg') : t('encryptNote')}
                    style={{ color: activeNote.encrypted ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s', padding: 4 }}
                  >
                    {activeNote.encrypted ? <Lock size={17} /> : <Unlock size={17} />}
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
                          [t('wordsLabel'), String(activeNoteStats.words)],
                          [t('charactersLabel'), String(activeNoteStats.characters)],
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
          onUnlockAll={() => {
            setNotes(prev => prev.map(n => n.encrypted ? { ...n, encrypted: false, _pwMarker: null } : n));
            toast('Successfully unlocked all encrypted notes', 'success');
          }}
        />

        {activeNote ? (
            <div className="editor-scroll-surface">
              {activeNote.encrypted && !isNoteUnlocked(activeNote.id) ? (
                <LockedNoteView
                  key={`locked-${activeNote.id}`}
                  note={activeNote}
                  onUnlock={() => setUnlockedNotes(prev => { const n = new Set(prev); n.add(activeNote.id); return n; })}
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
