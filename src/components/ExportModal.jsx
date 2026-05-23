import React from 'react';
import { FileText, Code, Box, X } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

/**
 * A clean modal dialog for choosing export format.
 * For Markdown notes: .tmn, .md, .txt
 * For Rich text notes: .tmn, .txt
 */
const ExportModal = ({ isOpen, onClose, onExport, noteTitle, noteType = 'markdown' }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isMarkdown = noteType === 'markdown';

  const options = [
    { ext: 'tmn', label: t('exportAsTmn') || 'TomaNote Format (.tmn)', sub: isMarkdown ? 'Cross-app format with all metadata' : 'Cross-app format with formatting & metadata', icon: <Box size={18} />, color: 'var(--accent)' },
    ...(isMarkdown ? [
      { ext: 'md', label: t('exportAsMd'), sub: 'Preserves all formatting syntax', icon: <Code size={18} />, color: '#10b981' },
    ] : []),
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
          width: 340, background: 'var(--surface-strong)', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'popIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{t('exportTo')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {noteTitle || t('untitled')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border-color)' }} />

        {/* Format choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map(opt => (
            <button
              key={opt.ext}
              onClick={() => { onExport(opt.ext); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                border: '1px solid var(--border-color)', background: 'var(--surface-primary)',
                cursor: 'pointer', transition: 'all 0.15s',
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-primary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: opt.ext === 'tmn' ? 'var(--accent-soft)' : opt.ext === 'md' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                color: opt.color,
                flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>{opt.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{opt.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
