import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Unlock, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../context/SettingsContext';

/**
 * PasswordModal — replaces ALL window.prompt usage for encryption.
 * Now using Portals and Framer Motion for a crash-free, premium experience.
 */
const PasswordModal = ({ isOpen, mode, noteTitle, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPw(false);
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t('pwEmptyErr') || 'Password cannot be empty.');
      return;
    }
    if (mode === 'set' && password.length < 3) {
      setError(t('pwLengthErr') || 'Password must be at least 3 characters.');
      return;
    }
    onConfirm(password);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  const isEncrypting = mode === 'set';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pw-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            key="pw-modal-content"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            style={{
              width: 400, background: '#fff', borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
              padding: '32px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: isEncrypting ? '#f0f4ff' : '#f0fdf4',
                  color: isEncrypting ? '#4f46e5' : '#16a34a',
                  border: `1px solid ${isEncrypting ? '#e0e7ff' : '#dcfce7'}`,
                }}>
                  {isEncrypting ? <Lock size={22} /> : <Unlock size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isEncrypting ? (t('encryptNoteTitle') || 'Encrypt Note') : (t('unlockNoteTitle') || 'Unlock Note')}
                  </h3>
                  {noteTitle && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>
                      「{noteTitle}」
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onCancel}
                style={{
                  padding: 6, borderRadius: 10, border: 'none', background: '#f3f4f6',
                  color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ height: 1, background: '#f1f5f9' }} />

            {/* Description */}
            <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
              {isEncrypting
                ? (t('encryptDesc') || 'Set a password to encrypt this note. The content will be hidden from the sidebar preview until unlocked.')
                : (t('unlockDesc') || "Enter the password to unlock and view this note's content.")}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder={isEncrypting ? (t('setPwPlaceholder') || 'Set a password…') : (t('enterPwPlaceholder') || 'Enter password…')}
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', borderRadius: 12,
                    border: `2px solid ${error ? '#fee2e2' : '#f1f5f9'}`,
                    fontSize: 15, fontFamily: 'inherit', outline: 'none',
                    background: '#f8fafc', boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    borderColor: error ? '#ef4444' : '#f1f5f9'
                  }}
                  onFocus={(e) => { if (!error) e.target.style.borderColor = '#4f46e5'; }}
                  onBlur={(e) => { if (!error) e.target.style.borderColor = '#f1f5f9'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 6,
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{error}</p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    padding: '11px 20px', borderRadius: 12, border: '1px solid #e2e8f0',
                    background: '#fff', color: '#475569', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '11px 24px', borderRadius: 12, border: 'none',
                    background: isEncrypting ? '#4f46e5' : '#16a34a',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: `0 4px 12px ${isEncrypting ? 'rgba(79, 70, 229, 0.25)' : 'rgba(22, 163, 74, 0.25)'}`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  {isEncrypting ? (t('encryptNoteTitle') || 'Encrypt Note') : (t('unlockBtn') || 'Unlock')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PasswordModal;
