import React, { useState, useEffect } from 'react';
import { useTranslation, useSettings } from '../context/SettingsContext';
import { Fingerprint, Lock } from 'lucide-react';

const reasonCopy = {
  startup: {
    titleKey: 'appLocked',
    descKey: 'enterPinToUnlock',
  },
  trash: {
    title: '回收站已保护',
    titleEn: 'Trash is protected',
    desc: '请完成验证后再进入回收站。',
    descEn: 'Authenticate to open the trash.',
  },
  'protected-note': {
    title: '受保护笔记',
    titleEn: 'Protected note',
    desc: '请先验证身份后再打开这篇笔记。',
    descEn: 'Authenticate before opening this protected note.',
  },
  'delete-protected-note': {
    title: '删除前验证',
    titleEn: 'Confirm before delete',
    desc: '删除受保护笔记前需要再次验证。',
    descEn: 'Authenticate again before deleting this protected note.',
  },
  idle: {
    title: '应用已自动锁定',
    titleEn: 'App locked automatically',
    desc: '由于长时间未操作，TomaNotes 已进入锁定状态。',
    descEn: 'TomaNotes locked itself after being idle.',
  },
  manual: {
    title: '应用已锁定',
    titleEn: 'App locked',
    desc: '完成验证后即可继续。',
    descEn: 'Authenticate to continue.',
  },
  unlock: {
    titleKey: 'appLocked',
    descKey: 'enterPinToUnlock',
  },
};

const AutoLockScreen = ({ reason = 'unlock', canUseBiometric = false, onUnlock, onBiometricUnlock }) => {
  const { t, lang } = useTranslation();
  const { settings } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = async (e) => {
    if (e.key === 'Backspace') {
      setPin(p => p.slice(0, -1));
      setError(false);
    } else if (/^[0-9]$/.test(e.key)) {
      if (pin.length < 6) {
        const newPin = pin + e.key;
        setPin(newPin);
        setError(false);
        if (newPin.length === 6) {
          const valid = await onUnlock(newPin);
          if (valid) {
            setPin('');
          } else {
            setError(true);
            setTimeout(() => setPin(''), 500);
          }
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pin]);

  const copy = reasonCopy[reason] || reasonCopy.unlock;
  const isEnglish = lang === 'en';
  const title = copy.titleKey ? t(copy.titleKey) : (isEnglish ? copy.titleEn : copy.title);
  const description = copy.descKey ? t(copy.descKey) : (isEnglish ? copy.descEn : copy.desc);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      WebkitBackdropFilter: 'blur(28px)',
      backdropFilter: 'blur(28px)',
      background: 'color-mix(in srgb, var(--bg-primary) 78%, rgba(0, 0, 0, 0.18) 22%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: 'min(100%, 420px)',
        borderRadius: 28,
        border: '1px solid var(--border-color)',
        background: 'color-mix(in srgb, var(--surface-strong) 88%, transparent 12%)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.22)',
        padding: '36px 30px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 74,
          height: 74,
          borderRadius: 22,
          background: 'linear-gradient(180deg, var(--accent-soft) 0%, color-mix(in srgb, var(--accent) 18%, var(--surface-primary) 82%) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
          boxShadow: '0 14px 32px rgba(0,0,0,0.18)'
        }}>
          <Lock size={34} color="var(--accent)" />
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em', color: 'var(--text-main)', textAlign: 'center' }}>
          {title || t('appLocked') || 'App Locked'}
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 28px', fontSize: 13, lineHeight: 1.6, textAlign: 'center', maxWidth: 300 }}>
          {description || t('enterPinToUnlock') || 'Enter your 6-digit PIN to continue'}
        </p>

        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: i < pin.length ? (error ? '#ef4444' : 'var(--accent)') : 'transparent',
              border: `2px solid ${error ? '#ef4444' : (i < pin.length ? 'var(--accent)' : 'var(--border-color)')}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: i < pin.length ? 'scale(1.08)' : 'scale(1)'
            }} />
          ))}
        </div>

        {canUseBiometric && !!onBiometricUnlock && (
          <button
            onClick={async () => {
              const success = await onBiometricUnlock();
              if (!success) {
                setError(true);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--surface-primary)',
              color: 'var(--text-main)',
              borderRadius: 999,
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: error ? 14 : 0,
            }}
          >
            <Fingerprint size={15} />
            {lang === 'en' ? 'Unlock with Touch ID' : lang === 'zh-TW' ? '透過 Touch ID 解鎖' : '通过 Touch ID 解锁'}
          </button>
        )}

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, margin: canUseBiometric ? 0 : '2px 0 0', fontWeight: 600 }}>
            {t('incorrectPin') || 'Incorrect PIN, please try again'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AutoLockScreen;
