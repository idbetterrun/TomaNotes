import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

const ConfirmModal = ({ isOpen, type, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isWarning = type === 'empty' || type === 'single';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 360, background: '#fff', borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: '#ef4444'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
              {type === 'empty' ? t('emptyTrash') : t('deleteConfirmTitle')}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
              {type === 'empty' ? t('emptyTrashConfirmText') : t('deleteConfirmText')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              padding: '10px 16px', borderRadius: 8, border: 'none',
              background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Trash2 size={16} /> 
            {t('confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
