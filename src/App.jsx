import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileBox, Star, Trash2, Settings, Plus, Search,
  FileText, Code, Download, Trash, RefreshCw,
  Pin, MoreHorizontal, Lock, Unlock, Eye, EyeOff,
  PanelLeftClose, PanelLeftOpen
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

// ─── New Note Dropdown ───────────────────────────────────────────────────────
function NewNoteDropdown({ onCreate }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 12 }}>
      <button
        className="nav-item-create"
        onClick={() => setOpen(o => !o)}
        title="New Note"
      >
        <Plus size={20} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', left: 52, top: 0, zIndex: 300,
            background: '#fff', border: '1px solid #e8e8e8',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 220, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: 'popIn 0.12s ease-out',
          }}
        >
          <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
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
              <div className="mr-3" style={{ marginTop: 2, color: opt.type === 'rich' ? '#6366f1' : '#10b981', flexShrink: 0 }}>
                {opt.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span className="font-medium text-gray-900" style={{ fontSize: 13, lineHeight: '1.2' }}>{opt.label}</span>
                <span className="text-sm text-gray-500" style={{ fontSize: 11, marginTop: 4 }}>{opt.sub}</span>
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
        background: '#fff', border: '1px solid #e8e8e8',
        borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
        width: 192, overflow: 'hidden', padding: '5px 0',
        display: 'flex', flexDirection: 'column',
        animation: 'popIn 0.12s ease-out',
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
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
              color: item.danger ? '#ef4444' : '#1a1a1a',
            }}
            onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="mr-3" style={{ color: item.danger ? '#ef4444' : '#888', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
        return titleMatch || contentMatch;
      });
    }
    if (typeFilter !== 'all') {
      list = list.filter(n => n.type === typeFilter);
    }
    // Pinned first
    return [...list.filter(n => n.isPinned), ...list.filter(n => !n.isPinned)];
  }, [notes, activeView, searchTerm, typeFilter]); // Added typeFilter dependency

  const activeNote = notes.find(n => n.id === activeNoteId);
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
    const n = {
      id: Date.now(), title: '', content: '', type,
      isFavorite: false, isDeleted: false, isPinned: false,
      encrypted: false, starred: false,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [n, ...prev]);
    setActiveNoteId(n.id);
    setActiveView('notes');
  }, []);

  const update = (id, patch) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));

  const handleTitleChange = (id, title) => update(id, { title });
  const handleUpdateNote = (id, content) => update(id, { content });
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

  return (
    <div className="app-container antialiased">
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

      {/* Column 1: Navigation Rail */}
      <nav className="nav-rail">
        <NewNoteDropdown onCreate={handleNewNote} />

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
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a1a', textTransform: 'capitalize' }}>
              {activeView === 'notes' ? t('allNotes') : activeView === 'favorites' ? t('favorites') : t('trash')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeView === 'trash' && filteredNotes.length > 0 && (
                <button
                  onClick={() => setConfirmModal({ type: 'empty' })}
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, background: '#fee2e2', color: '#ef4444', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                >
                  {t('emptyTrash')}
                </button>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, background: '#f0f0f0', color: '#999', padding: '2px 8px', borderRadius: 99 }}>{filteredNotes.length}</span>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search size={14} />
            <input type="text" placeholder={t('searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          
          {/* Type Filter Slider */}
          <div style={{ display: 'flex', background: '#f4f4f5', borderRadius: 8, padding: 2, marginTop: 12 }}>
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
                   background: typeFilter === type.id ? '#fff' : 'transparent',
                   color: typeFilter === type.id ? '#1a1a1a' : '#888',
                   boxShadow: typeFilter === type.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                   transition: 'all 0.15s ease', border: 'none', cursor: 'pointer'
                 }}
               >
                 {type.label}
               </button>
             ))}
          </div>
        </div>

        <div className="note-card-list">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              onContextMenu={e => openContextMenu(e, note)}
              className={`note-card ${activeNoteId === note.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, minWidth: 0 }}>
                {note.isPinned && <Pin size={10} style={{ color: '#f59e0b', flexShrink: 0, fill: '#f59e0b' }} />}
                {note.encrypted && <Lock size={10} style={{ color: '#6366f1', flexShrink: 0 }} />}
                <span style={{ flexShrink: 0, color: note.type === 'rich' ? '#6366f1' : '#10b981', display: 'flex' }}>
                  {note.type === 'rich' ? <FileText size={13} /> : <Code size={13} />}
                </span>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || t('untitled')}
                </h3>
              </div>
              <p style={{
                margin: 0, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', height: 18,
                color: note.encrypted ? '#6366f1' : '#aaa',
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
        </div>
        </div>
      </aside>

      {/* Column 3: Editor Viewport */}
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
          <>
            <header className="editor-header-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 99,
                  background: activeNote.type === 'rich' ? '#f0f0f0' : '#f0fdf4',
                  color: activeNote.type === 'rich' ? '#555' : '#16a34a',
                }}>
                  {activeNote.type === 'rich' ? t('richText') : t('markdown')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => handleExport(activeNote)} title={t('export')} style={{ color: '#aaa' }}><Download size={17} /></button>
                {/* Lock icon replaces the old MoreHorizontal (three-dots) menu */}
                <button
                  onClick={() => handleToggleEncryption(activeNote)}
                  title={activeNote.encrypted ? t('noteEncryptedMsg') : t('encryptNote')}
                  style={{ color: activeNote.encrypted ? '#6366f1' : '#aaa', transition: 'color 0.15s' }}
                >
                  {activeNote.encrypted ? <Lock size={17} /> : <Unlock size={17} />}
                </button>
              </div>
            </header>

            <div className="editor-scroll-surface">
              {activeNote.encrypted && !isNoteUnlocked(activeNote.id) ? (
                <LockedNoteView
                  key={`locked-${activeNote.id}`}
                  note={activeNote}
                  onUnlock={() => setUnlockedNotes(prev => { const n = new Set(prev); n.add(activeNote.id); return n; })}
                />
              ) : (
                <div className="editor-content-wrapper">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={e => handleTitleChange(activeNote.id, e.target.value)}
                    className="editor-title-h1"
                    placeholder={t('enterTitle')}
                  />
                  <div className="editor-main-container" style={{ fontSize: `${settings.fontSize}px` }}>
                    {activeNote.type === 'rich' ? (
                      <RichTextEditor key={activeNote.id} note={activeNote} onChange={c => handleUpdateNote(activeNote.id, c)} />
                    ) : (
                      <MarkdownEditor key={activeNote.id} note={activeNote} onChange={c => handleUpdateNote(activeNote.id, c)} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState onNewNote={handleNewNote} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
