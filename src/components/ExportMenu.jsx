import React from 'react';
import { Download, FileText, Code, X } from 'lucide-react';
import { saveAs } from 'file-saver';

const ExportMenu = ({ note, onClose }) => {
  const handleExport = (format) => {
    let content = note.content;
    let filename = `${note.title || 'untitled'}.${format}`;
    
    // For rich text, simple text extraction for .txt
    if (note.type === 'rich' && format === 'txt') {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        content = temp.innerText || temp.textContent || '';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
    onClose();
  };

  return (
    <div className="absolute top-16 right-4 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 min-w-[200px] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Export Note</h3>
        <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1">
        {note.type === 'markdown' && (
          <button 
            onClick={() => handleExport('md')}
            className="w-full flex items-center p-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all font-semibold active:scale-[0.98]"
          >
            <Code size={18} className="mr-3" />
            <div className="text-left">
              <p className="text-sm">As Markdown (.md)</p>
              <p className="text-[10px] opacity-70">Preserve all formatting</p>
            </div>
          </button>
        )}
        
        <button 
          onClick={() => handleExport('txt')}
          className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 text-gray-600 transition-all font-semibold active:scale-[0.98]"
        >
          <FileText size={18} className="mr-3" />
          <div className="text-left">
            <p className="text-sm">As Plain Text (.txt)</p>
            <p className="text-[10px] opacity-70 border-t border-transparent">Maximum compatibility</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ExportMenu;
