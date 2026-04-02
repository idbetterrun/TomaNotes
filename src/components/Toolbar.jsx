import React from 'react';
import { 
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  ImageIcon, FilePlus, List, CheckSquare, 
  Table as TableIcon, Hash, Link as LinkIcon,
  Search, Download, Trash2, RotateCw, Type,
  Subscript as SubIcon, Superscript as SuperIcon,
  Quote
} from 'lucide-react';

const Toolbar = ({ editor, onSearchClick, onExportClick }) => {
  if (!editor) {
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        editor.chain().focus()
            .insertContent({
                type: 'fileAttachment',
                attrs: {
                    name: file.name,
                    size: file.size,
                    url: url,
                    type: file.type,
                    extension: file.name.split('.').pop() || 'file'
                }
            })
            .run();
    }
  };

  const setLink = () => {
      const url = window.prompt('URL:');
      if (url) editor.chain().focus().setLink({ href: url }).run();
      else if (url === '') editor.chain().focus().unsetLink().run();
  };

  const insertTable = () => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="p-2.5 border-b border-slate-100 flex items-center space-x-1.5 flex-wrap bg-white sticky top-0 z-[60] shadow-sm">
      
      <div className="flex items-center space-x-0.5 bg-gray-50/50 p-0.5 rounded-xl border border-slate-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
            <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
            <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()} isActive={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={16} />
        </ToolbarButton>
      </div>

      <div className="h-6 border-l border-slate-200 mx-1"></div>

      <div className="flex items-center space-x-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
              <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List">
              <CheckSquare size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
              <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={insertTable} isActive={editor.isActive('table')} title="Insert Table">
              <TableIcon size={16} />
          </ToolbarButton>
      </div>

      <div className="h-6 border-l border-slate-200 mx-1"></div>

      <div className="flex items-center space-x-0.5 bg-gray-50/50 p-0.5 rounded-xl border border-slate-50">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight size={16} />
        </ToolbarButton>
      </div>

      <div className="h-6 border-l border-slate-200 mx-1"></div>

      <div className="flex items-center space-x-2 px-1">
        <label className="p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer group" title="Upload Image">
            <ImageIcon size={18} className="transition-transform group-hover:scale-110" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <label className="p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer group" title="Attach File">
            <FilePlus size={18} className="transition-transform group-hover:scale-110" />
            <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
        <button onClick={setLink} className={`p-2 rounded-xl transition-all ${editor.isActive('link') ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100 opacity-60 hover:opacity-100'}`} title="Link">
            <LinkIcon size={18} />
        </button>
      </div>

      <div className="flex-grow"></div>

      <div className="flex items-center space-x-1 pr-2">
          <button onClick={onSearchClick} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-all hover:scale-105 active:scale-95" title="Search (Ctrl+F)">
              <Search size={18} />
          </button>
          <button onClick={onExportClick} className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-600 transition-all hover:scale-105 active:scale-95" title="Export Note">
              <Download size={18} />
          </button>
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all duration-300 transform active:scale-90 ${isActive ? 'bg-white shadow-sm text-blue-600 ring-1 ring-slate-100' : 'text-gray-500 hover:text-gray-800 hover:bg-white/80'}`}
    >
      {children}
    </button>
);

export default Toolbar;
