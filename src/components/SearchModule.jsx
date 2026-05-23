import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

const SearchModule = ({ isOpen, onClose, onSearch, onNext, onPrev, totalResults, currentResultIndex }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => document.getElementById('doc-search-input')?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) onPrev();
      else onNext();
    }
    if (e.key === 'Escape') onClose();
  };

  const handleInputChange = (e) => {
    e.stopPropagation();
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-16 z-[70] bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input 
          id="doc-search-input"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search in note..."
          className="pl-9 pr-24 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-xs w-64 outline-none transition-all focus:bg-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-1 rounded-md tracking-tighter">
          {totalResults > 0 ? `${currentResultIndex + 1} / ${totalResults}` : '0 results'}
        </div>
      </div>
      
      <div className="flex border-l border-slate-100 ml-1 pl-1">
        <button onClick={onPrev} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ChevronUp size={16} />
        </button>
        <button onClick={onNext} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ChevronDown size={16} />
        </button>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SearchModule;
