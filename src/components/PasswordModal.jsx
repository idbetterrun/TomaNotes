import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, X } from 'lucide-react';

/**
 * PasswordModal — replaces ALL window.prompt usage for encryption.
 * Props:
 *   isOpen: bool
 *   mode: 'set' | 'unlock'
 *   noteTitle: string
 *   onConfirm(password: string): void
 *   onCancel(): void
 */
const PasswordModal = ({ isOpen, mode, noteTitle, onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPw(false);
      // Delay to let modal render before focusing
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password cannot be empty.');
      return;
    }
    if (mode === 'set' && password.length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }
    onConfirm(password);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  const isEncrypting = mode === 'set';

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Modal card */}
      <div
        style={{
          width: 380, background: '#fff', borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          padding: '28px 28px 24px',
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: 'popIn 0.15s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: isEncrypting ? '#eef2ff' : '#f0fdf4',
                color: isEncrypting ? '#6366f1' : '#16a34a',
              }}>
                {isEncrypting ? <Lock size={18} /> : <Unlock size={18} />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
                  {isEncrypting ? 'Encrypt Note' : 'Unlock Note'}
                </div>
                {noteTitle && (
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                    "{noteTitle}"
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: 5, borderRadius: 8, border: 'none', background: 'transparent',
              color: '#bbb', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ height: 1, background: '#f4f4f5' }} />

        {/* Description */}
        <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          {isEncrypting
            ? 'Set a password to encrypt this note. The content will be hidden from the sidebar preview until unlocked.'
            : 'Enter the password to unlock and view this note\'s content.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder={isEncrypting ? 'Set a password…' : 'Enter password…'}
              style={{
                width: '100%', padding: '10px 40px 10px 14px', borderRadius: 10,
                border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                background: '#fafafa', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { if (!error) e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { if (!error) e.target.style.borderColor = '#e5e7eb'; }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 4,
              }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: '#ef4444' }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                background: '#fff', color: '#555', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 18px', borderRadius: 10, border: 'none',
                background: isEncrypting ? '#6366f1' : '#16a34a',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'opacity 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {isEncrypting ? 'Encrypt Note' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
