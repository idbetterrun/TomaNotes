import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import ResizableImage from './extensions/ResizableImageExtension';
import FileAttachment from './extensions/FileAttachment';
import SearchHighlight from './extensions/SearchHighlight';
import SearchModule from './SearchModule';
import LinkModal from './LinkModal';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Search, ImageIcon, FilePlus,
  Strikethrough, Code, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react';

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

const FONT_SIZES = ['12px', '14px', '16px', '18px', '24px'];

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
        background: active ? '#1a1a1a' : 'transparent',
        color: active ? '#fff' : '#555',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s', opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = '#f0f0f0'; }}
      onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: '#e8e8e8', margin: '0 4px', flexShrink: 0 }} />;
}

// ── Main Toolbar ─────────────────────────────────────────────────────────────
function EditorToolbar({ editor, onLinkClick }) {
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
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2,
      padding: '6px 10px', background: '#fafafa',
      border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Font Size Dropdown */}
      <select
        onChange={applyFontSize}
        defaultValue=""
        style={{
          height: 28, padding: '0 6px', borderRadius: 5, border: '1px solid #e8e8e8',
          fontSize: 12, fontFamily: 'inherit', background: '#fff', color: '#444',
          cursor: 'pointer', outline: 'none', marginRight: 4,
        }}
        title="Font size"
      >
        <option value="">Size</option>
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <Divider />

      {/* Text Formatting */}
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

      <Divider />

      {/* Headings */}
      {[1, 2, 3].map(level => (
        <ToolbarBtn
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive('heading', { level })}
          title={`Heading ${level}`}
        >
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>H{level}</span>
        </ToolbarBtn>
      ))}

      <Divider />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        <List size={15} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
        <ListOrdered size={15} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={15} />
      </ToolbarBtn>

      <Divider />

      {/* Text Alignment */}
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

      <Divider />

      {/* Link — opens floating input instead of window.prompt */}
      <ToolbarBtn
        onClick={onLinkClick}
        active={editor.isActive('link')}
        title="Insert link"
      >
        <LinkIcon size={15} />
      </ToolbarBtn>

      {/* Image upload */}
      <label title="Upload image" style={{
        padding: '5px 7px', borderRadius: 5, cursor: 'pointer', display: 'flex',
        alignItems: 'center', color: '#555', transition: 'background 0.12s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <ImageIcon size={15} />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </label>

      {/* File attach */}
      <label title="Attach file" style={{
        padding: '5px 7px', borderRadius: 5, cursor: 'pointer', display: 'flex',
        alignItems: 'center', color: '#555', transition: 'background 0.12s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <FilePlus size={15} />
        <input type="file" className="hidden" onChange={handleFileAttach} />
      </label>
    </div>
  );
}

// ── Rich Text Editor ─────────────────────────────────────────────────────────
const RichTextEditor = ({ note, onChange }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 }, dropCursor: { color: '#4f46e5', width: 2 } }),
      Underline,
      Typography,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: true, autolink: true }),
      ResizableImage,
      FileAttachment,
      SearchHighlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing something amazing...' }),
      CharacterCount,
    ],
    content: note.content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none max-w-none text-slate-800 leading-relaxed caret-indigo-600 min-h-[400px]',
        style: 'font-family: inherit;',
      },
    },
  });

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
    if (newResults.length > 0) editor.commands.focus(newResults[0].start);
    editor.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm: term, currentIndex: 0 }));
  }, [editor]);

  const navigate = (dir) => {
    if (results.length === 0) return;
    const next = (currentIndex + dir + results.length) % results.length;
    setCurrentIndex(next);
    editor.commands.focus(results[next].start);
    editor.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm, currentIndex: next }));
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Link floating input */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={editor?.getAttributes('link')?.href || ''}
      />

      <EditorToolbar editor={editor} onLinkClick={handleLinkClick} />

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

      <SearchModule
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); editor?.view.dispatch(editor.state.tr.setMeta('searchHighlight', { searchTerm: '', currentIndex: -1 })); }}
        onSearch={handleSearch}
        onNext={() => navigate(1)}
        onPrev={() => navigate(-1)}
        totalResults={results.length}
        currentResultIndex={currentIndex}
      />

      <EditorContent editor={editor} />

      {/* FAB for search */}
      <button
        onClick={() => setIsSearchOpen(o => !o)}
        title="Search in note (Ctrl+F)"
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 60,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: '#1a1a1a', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Search size={18} />
      </button>
    </div>
  );
};

export default RichTextEditor;
