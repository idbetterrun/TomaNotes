import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import ResizableImage from './extensions/ResizableImageExtension';
import FileAttachment from './extensions/FileAttachment';
import SearchHighlight from './extensions/SearchHighlight';
import SearchModule from './SearchModule';
import LinkModal from './LinkModal';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Search, ImageIcon, FilePlus,
  Strikethrough, Code, Quote, Type, Table2,
  Rows3, Columns3, Trash2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react';
import { useSettings, useTranslation } from '../context/SettingsContext';



// ── Font Size Extension ──────────────────────────────────────────────────────
import { Mark } from '@tiptap/core';

const FontSize = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return { size: { default: null, renderHTML: attrs => attrs.size ? { style: `font-size: ${attrs.size}` } : {} } };
  },
  parseHTML() { return [{ style: 'font-size', getAttrs: v => ({ size: v }) }]; },
  renderHTML({ HTMLAttributes }) { return ['span', HTMLAttributes, 0]; },
  addCommands() {
    return {
      setFontSize: (size) => ({ commands }) => commands.setMark(this.name, { size }),
      unsetFontSize: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },
});

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

// ── toBase64 utility: converts a File to Base64 DataURL with error handling ──
function toBase64(file) {
  return new Promise((resolve, reject) => {
    // Reject files larger than 10MB to prevent crashes
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

// ── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, title, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '5px 7px', borderRadius: 5, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--surface-strong)' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s', opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = 'var(--accent-soft)'; }}
      onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: 'var(--border-color)', margin: '0 4px', flexShrink: 0 }} />;
}

function ToolbarGroup({ label, children }) {
  return (
    <div className="rich-toolbar-group" aria-label={label}>
      {children}
    </div>
  );
}

// ── Main Toolbar ─────────────────────────────────────────────────────────────
function EditorToolbar({ editor, onLinkClick, onSearchToggle, isSearchOpen }) {
  if (!editor) return null;

  const applyFontSize = (e) => {
    const size = e.target.value;
    if (size === '') editor.chain().focus().unsetFontSize().run();
    else editor.chain().focus().setFontSize(size).run();
  };

  const handleImageUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await toBase64(f);
      editor.chain().focus().setImage({ src: dataUrl }).run();
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const handleFileAttach = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await toBase64(f);
      editor.chain().focus().insertContent({
        type: 'fileAttachment',
        attrs: {
          name: f.name,
          size: f.size,
          url: dataUrl,
          extension: f.name.split('.').pop().toLowerCase(),
        },
      }).run();
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="rich-toolbar-shell">
      <div className="rich-toolbar">
        <ToolbarGroup label="Text style">
          <select
            onChange={applyFontSize}
            defaultValue="16px"
            className="rich-toolbar-select"
            title="Font size"
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{parseInt(s, 10)}</option>)}
          </select>
          <Divider />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
            <UnderlineIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
            <Code size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <ToolbarGroup label="Structure">
          {[1, 2, 3].map((level, i) => {
            const sizes = [17, 15, 13];
            return (
              <ToolbarBtn
                key={level}
                onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                active={editor.isActive('heading', { level })}
                title={`Heading ${level}`}
              >
                <span style={{ fontSize: sizes[i], fontWeight: 800, lineHeight: 1 }}>H{level}</span>
              </ToolbarBtn>
            );
          })}
          <Divider />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <List size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
            <ListOrdered size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
            <Quote size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <ToolbarGroup label="Layout">
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
            <AlignLeft size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
            <AlignCenter size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
            <AlignRight size={15} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <ToolbarGroup label="Insert">
          <label title="Font color" style={{
            padding: '5px 7px', borderRadius: 5, cursor: 'pointer', display: 'flex', position: 'relative',
            alignItems: 'center', color: 'var(--text-muted)', transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Type size={15} style={{ color: editor.getAttributes('textStyle').color || 'var(--text-main)' }} />
            <input
              type="color"
              onInput={e => {
                const c = e.target.value;
                if (c === '#000000' || c === '') editor.chain().focus().unsetColor().run();
                else editor.chain().focus().setColor(c).run();
              }}
              value={editor.getAttributes('textStyle').color || '#000000'}
              style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
          <ToolbarBtn
            onClick={onLinkClick}
            active={editor.isActive('link')}
            title="Insert link"
          >
            <LinkIcon size={15} />
          </ToolbarBtn>
          <label title="Upload image" style={{
            padding: '5px 7px', borderRadius: 5, cursor: 'pointer', display: 'flex',
            alignItems: 'center', color: 'var(--text-muted)', transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ImageIcon size={15} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <label title="Attach file" style={{
            padding: '5px 7px', borderRadius: 5, cursor: 'pointer', display: 'flex',
            alignItems: 'center', color: 'var(--text-muted)', transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FilePlus size={15} />
            <input type="file" className="hidden" onChange={handleFileAttach} />
          </label>
        </ToolbarGroup>

        <ToolbarGroup label="Tables">
          <ToolbarBtn
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={editor.isActive('table')}
            title="Insert table"
          >
            <Table2 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            title="Add row"
          >
            <Rows3 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            title="Add column"
          >
            <Columns3 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            title="Delete table"
          >
            <Trash2 size={15} />
          </ToolbarBtn>
        </ToolbarGroup>

        <div className="rich-toolbar-spacer" />

        <ToolbarGroup label="Actions">
          <ToolbarBtn onClick={onSearchToggle} active={isSearchOpen} title="Search in note (Ctrl+F)">
            <Search size={15} />
          </ToolbarBtn>
        </ToolbarGroup>
      </div>
    </div>
  );
}

// ── Rich Text Editor ─────────────────────────────────────────────────────────
const RichTextEditor = ({ note, onChange, onTitleChange, onActionsChange }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [updateTick, setUpdateTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 }, dropCursor: { color: '#4f46e5', width: 2 } }),
      Underline,
      Typography,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: true, autolink: true }),
      ResizableImage,
      FileAttachment,
      SearchHighlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: t('editorPlaceholder') || 'Start writing something amazing...' }),
      CharacterCount,
    ],
    content: note.content,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); setUpdateTick(t => t + 1); },
    onSelectionUpdate: () => setUpdateTick(t => t + 1),
    onTransaction: () => setUpdateTick(t => t + 1),
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none max-w-none leading-relaxed caret-indigo-600 min-h-[400px]',
        style: `font-family: inherit; color: var(--text-main); font-size: ${settings.fontSize}px;`,
      },
    },
  });

  useEffect(() => {
    if (!onActionsChange) return;
    if (!editor) {
      onActionsChange({ canUndo: false, canRedo: false, undo: null, redo: null });
      return;
    }

    onActionsChange({
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      undo: () => editor.chain().focus().undo().run(),
      redo: () => editor.chain().focus().redo().run(),
    });
  }, [editor, onActionsChange, updateTick]);

  // ── Link Modal handlers ───────────────────────────────────────────────────
  const handleLinkClick = useCallback(() => {
    setIsLinkModalOpen(true);
  }, []);

  const handleLinkSubmit = useCallback((url) => {
    if (!editor) return;
    if (url === '' || url === null) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setIsLinkModalOpen(false);
  }, [editor]);

  // ── Search handlers ───────────────────────────────────────────────────────
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!editor) return;
    const newResults = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && term) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let m;
        const regex = new RegExp(escaped, 'gi');
        while ((m = regex.exec(node.text)) !== null)
          newResults.push({ start: pos + m.index, end: pos + m.index + m[0].length });
      }
    });
    setResults(newResults);
    setCurrentIndex(newResults.length > 0 ? 0 : -1);
    if (newResults.length > 0) {
      editor.chain().setTextSelection(newResults[0].start).scrollIntoView().run();
    }
    editor.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm: term, currentIndex: 0 }));
  }, [editor]);

  const navigate = (dir) => {
    if (results.length === 0) return;
    const next = (currentIndex + dir + results.length) % results.length;
    setCurrentIndex(next);
    editor.chain().setTextSelection(results[next].start).scrollIntoView().run();
    editor.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm, currentIndex: next }));
  };

  return (
    <div className="rich-editor-shell">
      {/* Link floating input */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={editor?.getAttributes('link')?.href || ''}
      />

      <div className="rich-editor-sticky">
        <EditorToolbar
          editor={editor}
          onLinkClick={handleLinkClick}
          onSearchToggle={() => setIsSearchOpen(o => !o)}
          isSearchOpen={isSearchOpen}
          tick={updateTick}
        />

        <SearchModule
          isOpen={isSearchOpen}
          onClose={() => { setIsSearchOpen(false); editor?.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm: '', currentIndex: -1 })); }}
          onSearch={handleSearch}
          onNext={() => navigate(1)}
          onPrev={() => navigate(-1)}
          totalResults={results.length}
          currentResultIndex={currentIndex}
        />
      </div>

      <div className="rich-editor-paper">
        <div className="rich-editor-title-block">
          <div className="rich-editor-kicker">
            <span className="rich-editor-kicker-label">{t('richText')}</span>
            <span className="rich-editor-kicker-dot" />
            <span>{editor?.storage?.characterCount?.words() || 0} words</span>
            <span className="rich-editor-kicker-dot" />
            <span>{editor?.storage?.characterCount?.characters() || 0} chars</span>
          </div>
          <input
            type="text"
            value={note.title}
            onChange={e => onTitleChange(e.target.value)}
            className="editor-title-h1"
            placeholder={t('enterTitle')}
            style={{ width: '100%', marginBottom: 0 }}
          />
        </div>

        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 2,
              background: '#1a1a1a', borderRadius: 8, padding: '4px 6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              {[
                { icon: <Bold size={13}/>, cmd: () => editor.chain().focus().toggleBold().run(), mark: 'bold' },
                { icon: <Italic size={13}/>, cmd: () => editor.chain().focus().toggleItalic().run(), mark: 'italic' },
                { icon: <UnderlineIcon size={13}/>, cmd: () => editor.chain().focus().toggleUnderline().run(), mark: 'underline' },
              ].map(({ icon, cmd, mark }, i) => (
                <button key={i} onClick={cmd} style={{
                  padding: '4px 6px', borderRadius: 5, border: 'none', cursor: 'pointer', background: 'transparent',
                  color: editor.isActive(mark) ? '#818cf8' : '#ccc',
                }}>{icon}</button>
              ))}
            </div>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
