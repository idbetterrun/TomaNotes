import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Code, Star } from 'lucide-react';

const NoteItem = ({ note, isActive, isRenaming, onClick, onContextMenu, onTitleChange, setRenamingNote, searchTerm }) => {
  const handleTitleBlur = () => {
    setRenamingNote(null);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setRenamingNote(null);
    }
  };

  const Icon = note.type === 'rich' ? FileText : Code;
  const iconColor = note.type === 'rich' ? 'text-blue-500' : 'text-green-500';

  const highlightText = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? 
            <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-px px-0.5">{part}</mark> : 
            part
        )}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`p-3 rounded-xl cursor-pointer group transition-all duration-200 ${isActive ? 'bg-blue-50 shadow-sm border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
    >
      <div className="flex items-start justify-between space-x-2">
        <div className="flex items-start min-w-0 flex-1">
          <Icon size={18} className={`mr-3 mt-0.5 flex-shrink-0 ${iconColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <input
                type="text"
                value={note.title}
                onChange={(e) => onTitleChange(note.id, e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="bg-transparent font-bold text-sm truncate w-full focus:outline-none text-gray-800"
                autoFocus
              />
            ) : (
              <h2 className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                {highlightText(note.title, searchTerm)}
              </h2>
            )}
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {note.content ? highlightText(note.content.substring(0, 40).replace(/<[^>]*>/g, ''), searchTerm) : 'No content'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          {note.isFavorite && <Star size={12} className="text-yellow-400 fill-current" />}
          <span className="text-[9px] font-medium text-gray-300 uppercase whitespace-nowrap">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: false })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
