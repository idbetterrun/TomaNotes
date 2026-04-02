import React, { useState, useEffect } from 'react';
import { useTranslation, useSettings } from '../context/SettingsContext';
import { Lock } from 'lucide-react';

const AutoLockScreen = ({ onUnlock }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (settings.touchIdEnabled && window.electron) {
        window.electron.security.promptTouchID('Unlock TomaNotes').then(success => {
            if (success) {
                onUnlock();
            }
        });
    }
  }, []);

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
          const valid = await window.electron?.security.verifyPin(newPin);
          if (valid) {
            onUnlock();
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, 
      WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)', 
      background: 'rgba(255, 255, 255, 0.65)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: '#1a1a1a', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
          <Lock size={32} color="#fff" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{t('appLocked') || 'App Locked'}</h2>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 13 }}>{t('enterPinToUnlock') || 'Enter your 6-digit PIN to continue'}</p>
      
      <div style={{ display: 'flex', gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: i < pin.length ? (error ? '#ef4444' : '#1a1a1a') : 'transparent',
            border: `2px solid ${error ? '#ef4444' : (i < pin.length ? '#1a1a1a' : '#d4d4d8')}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: i < pin.length ? 'scale(1.1)' : 'scale(1)'
          }} />
        ))}
      </div>
      {error && <p className="animate-in fade-in" style={{ color: '#ef4444', fontSize: 13, marginTop: 24, fontWeight: 600 }}>{t('incorrectPin') || 'Incorrect PIN, please try again'}</p>}
    </div>
  );
};

export default AutoLockScreen;
