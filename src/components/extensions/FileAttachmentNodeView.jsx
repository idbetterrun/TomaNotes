import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import {
  FileText, Image as ImageIcon, Film, FileCode, FileArchive,
  Music, FileSpreadsheet, Trash2, File
} from 'lucide-react';

// Map file extensions to lucide-react icons and a color
const getFileIcon = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(e)) return { Icon: FileText, bg: 'bg-indigo-50', color: 'text-indigo-600' };
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(e)) return { Icon: ImageIcon, bg: 'bg-emerald-50', color: 'text-emerald-600' };
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(e)) return { Icon: Film, bg: 'bg-purple-50', color: 'text-purple-600' };
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(e)) return { Icon: Music, bg: 'bg-amber-50', color: 'text-amber-600' };
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'xml'].includes(e)) return { Icon: FileCode, bg: 'bg-cyan-50', color: 'text-cyan-600' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return { Icon: FileArchive, bg: 'bg-orange-50', color: 'text-orange-600' };
  if (['xls', 'xlsx', 'csv'].includes(e)) return { Icon: FileSpreadsheet, bg: 'bg-green-50', color: 'text-green-600' };
  return { Icon: File, bg: 'bg-gray-50', color: 'text-gray-500' };
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

const FileAttachmentNodeView = ({ node, deleteNode }) => {
  const { name, size, url, extension } = node.attrs;
  const { Icon: FileIcon, bg, color } = getFileIcon(extension);
  const ext = (extension || '?').toUpperCase();

  const handleFileClick = (e) => {
    e.preventDefault();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNode();
  };

  return (
    <NodeViewWrapper className="file-attachment-wrapper" contentEditable={false} draggable>
      <div
        onClick={handleFileClick}
        className="flex items-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm gap-3 max-w-sm my-2 hover:bg-gray-50 group"
        style={{ cursor: 'pointer', transition: 'all 0.15s' }}
      >
        {/* 1. Semantic File Icon */}
        <div className={`p-2 ${bg} rounded-lg ${color}`} style={{ flexShrink: 0 }}>
          <FileIcon className="w-8 h-8" />
        </div>

        {/* 2. File Details */}
        <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <p className="text-sm font-semibold text-gray-900 truncate" style={{ margin: 0 }} title={name}>
            {name || 'Unknown File'}
          </p>
          <p className="text-xs text-gray-500 uppercase" style={{ margin: 0, marginTop: 2 }}>
            {ext} • {formatFileSize(size)}
          </p>
        </div>

        {/* 3. Delete Button — hidden until hover */}
        <button
          onClick={handleDeleteFile}
          className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
          style={{ flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}
          title="Remove file"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </NodeViewWrapper>
  );
};

export default FileAttachmentNodeView;
