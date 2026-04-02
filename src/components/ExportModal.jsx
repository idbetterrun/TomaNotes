import React from 'react';
import { FileText, Code, X } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

/**
 * A clean modal dialog for choosing export format (for Markdown notes).
 * Rich text notes bypass this and export directly as .txt.
 */
const ExportModal = ({ isOpen, onClose, onExport, noteTitle }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const options = [
    { ext: 'md', label: t('exportAsMd'), sub: 'Preserves all formatting syntax', icon: <Code size={18} />, color: '#10b981' },
    { ext: 'txt', label: t('exportAsTxt'), sub: 'Raw text, universal compatibility', icon: <FileText size={18} />, color: '#6366f1' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 340, background: '#fff', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'popIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{t('exportTo')}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {noteTitle || t('untitled')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, border: 'none',
              background: 'transparent', color: '#999', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ height: 1, background: '#f0f0f0' }} />

        {/* Format choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map(opt => (
            <button
              key={opt.ext}
              onClick={() => { onExport(opt.ext); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 10,
                border: '1px solid #f0f0f0', background: '#fafafa',
                cursor: 'pointer', transition: 'all 0.15s',
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ddd'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: opt.ext === 'md' ? '#f0fdf4' : '#eef2ff', color: opt.color,
                flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{opt.label}</span>
                <span style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{opt.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
