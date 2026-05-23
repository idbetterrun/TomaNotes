import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

/**
 * Shown in place of the editor body when a note is encrypted.
 * Accepts the correct password hash to verify inline — no window.prompt.
 */
const LockedNoteView = ({ note, onUnlock }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) { setError(t('pwEmptyErr') || 'Enter a password.'); return; }
    try {
      const inputMarker = btoa(unescape(encodeURIComponent(password)));
      if (inputMarker === note._pwMarker) {
        setError('');
        setPassword('');
        onUnlock(); // tell parent: unlock for this session
      } else {
        setError(t('incorrectPin') || 'Incorrect password. Try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 360, gap: 24, padding: 48,
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'none',
      }}>
        <Lock size={34} style={{ color: 'var(--accent)' }} />
      </div>

      {/* Labels */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
          {t('noteEncryptedMsg') || 'This note is encrypted'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {t('unlockDesc') || 'Enter the password to unlock and view the content.'}
        </div>
      </div>

      {/* Password form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320,
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            autoFocus
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder={t('enterPwPlaceholder') || 'Password…'}
            style={{
              width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10,
              border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
              background: 'var(--surface-strong)', color: 'var(--text-main)', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { if (!error) e.target.style.borderColor = 'var(--border-color)'; }}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              border: 'none', background: 'transparent', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
            }}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            padding: '11px', borderRadius: 10, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {t('unlockBtn') || 'Unlock'}
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
};

export default LockedNoteView;
