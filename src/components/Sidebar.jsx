import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Star, Trash2, Settings, 
  FileBox, ChevronRight, Hash, FileText, Code, 
  Trash, RotateCw, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Sidebar = ({ 
  notes, activeNoteId, setActiveNoteId, onNewNote, onDeleteNote, 
  onToggleFavorite, onTitleChange, onRestoreNote, onEmptyTrash, 
  activeView, setActiveView, onOpenSettings 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingNoteId, setRenamingNoteId] = useState(null);

  const filteredNotes = useMemo(() => {
    let list = notes.filter(n => {
      if (activeView === 'trash') return n.isDeleted;
      if (activeView === 'favorites') return !n.isDeleted && n.isFavorite;
      return !n.isDeleted;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(n => 
        n.title.toLowerCase().includes(term) || 
        n.content.toLowerCase().includes(term)
      );
    }
    return list;
  }, [notes, activeView, searchTerm]);

  return (
    <div className="w-[300px] flex flex-col h-full bg-[#f9f9f9] border-r border-slate-100/50 select-none">
      {/* Top Nav: Categories */}
      <div className="pt-6 px-4 space-y-1">
        <NavButton 
            icon={<FileBox size={16} />} 
            label="All Notes" 
            active={activeView === 'notes'} 
            onClick={() => setActiveView('notes')} 
            count={notes.filter(n => !n.isDeleted).length}
        />
        <NavButton 
            icon={<Star size={16} />} 
            label="Favorites" 
            active={activeView === 'favorites'} 
            onClick={() => setActiveView('favorites')}
            count={notes.filter(n => !n.isDeleted && n.isFavorite).length}
        />
        <NavButton 
            icon={<Trash2 size={16} />} 
            label="Trash" 
            active={activeView === 'trash'} 
            onClick={() => setActiveView('trash')}
            count={notes.filter(n => n.isDeleted).length}
        />
      </div>

      {/* Action: Create Note */}
      <div className="px-5 mt-6 mb-2 flex items-center justify-between group">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-6">Note list</h4>
        <button 
           onClick={() => onNewNote('rich')}
           className="w-5 h-5 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Search */}
      <div className="mx-4 mb-4 relative flex items-center group">
        <Search className="absolute left-3 text-gray-300 group-hover:text-blue-400 transition-colors" size={14} />
        <input
          type="text"
          placeholder="Jump to..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#f3f3f3] hover:bg-[#ececec] focus:bg-white text-xs py-2 pr-4 pl-9 rounded-xl outline-none border border-transparent focus:border-blue-100 transition-all duration-200"
        />
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar pb-10">
        {activeView === 'trash' && filteredNotes.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 mb-2 group">
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Trash empty?</span>
            <button onClick={onEmptyTrash} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors">
              <XCircle size={14} />
            </button>
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-20 filter grayscale">
            <Hash size={32} />
            <p className="text-[9px] font-bold mt-4 tracking-widest uppercase italic">Collection Empty</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setRenamingNoteId(note.id);
              }}
              className={`p-2.5 rounded-xl cursor-pointer group transition-all duration-200 flex items-start space-x-3 ${activeNoteId === note.id ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-slate-100' : 'hover:bg-[#f0f0f0] border border-transparent'}`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${activeNoteId === note.id ? 'bg-blue-50 text-blue-500' : 'bg-white text-gray-400 shadow-sm'}`}>
                {note.isDeleted ? <Trash size={14} /> : (note.type === 'rich' ? <FileText size={14} /> : <Code size={14} />)}
              </div>
              
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                {renamingNoteId === note.id ? (
                  <input
                    autoFocus
                    value={note.title}
                    onChange={(e) => onTitleChange(note.id, e.target.value)}
                    onBlur={() => setRenamingNoteId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setRenamingNoteId(null)}
                    className="text-xs font-semibold bg-transparent outline-none w-full border-b border-blue-200"
                  />
                ) : (
                  <h3 className={`text-xs font-semibold truncate ${activeNoteId === note.id ? 'text-[#1d1d1f]' : 'text-gray-600'}`}>{note.title || 'Untitled'}</h3>
                )}
                
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: false })}
                  </span>
                  {!note.isDeleted && note.isFavorite && <div className="w-1 h-1 bg-yellow-400 rounded-full" />}
                </div>
              </div>

              {note.isDeleted && activeNoteId === note.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRestoreNote(note.id); }}
                    className="p-1 px-1.5 rounded-md hover:bg-green-50 text-green-500"
                    title="Restore"
                  >
                    <RotateCw size={12} />
                  </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Profile / Settings */}
      <div className="p-4 border-t border-slate-100/50 mt-auto bg-white/50 backdrop-blur-md">
        <button 
           onClick={onOpenSettings}
           className="w-full flex items-center p-2.5 rounded-xl hover:bg-gray-100 transition-all group space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg">T</div>
          <div className="flex-1 text-left min-w-0">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Account</p>
             <p className="text-xs font-bold text-gray-700 truncate">Settings</p>
          </div>
          <Settings size={14} className="text-gray-300 group-hover:text-blue-500 group-hover:rotate-45 transition-all" />
        </button>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick, count }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 group ${active ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-blue-600 ring-1 ring-slate-100' : 'text-gray-500 hover:bg-[#f0f0f0] group'}`}
    >
        <div className="flex items-center space-x-3">
            <div className={`transition-colors ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`}>
                {icon}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        {count > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg border  ${active ? 'bg-blue-50 border-blue-100 text-blue-500' : 'bg-white border-slate-100 text-gray-300'}`}>{count}</span>}
    </button>
);

export default Sidebar;
