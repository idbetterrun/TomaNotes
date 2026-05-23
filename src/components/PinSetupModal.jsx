import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

export default function PinSetupModal({ isOpen, onClose, onComplete, mode = 'set' }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Enter, 2: Confirm (only for 'set' mode)
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFirstPin('');
      setPin(['', '', '', '', '', '']);
      setError(false);
      
      // Safety: clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (inputsRef.current[0]) inputsRef.current[0].focus();
      }, 200); // Increased delay slightly to handle Modal/Portal mount jitter
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    // Handle pasting 6 digits
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newPin = [...pin];
      pasted.forEach((col, i) => { if (index + i < 6) newPin[index + i] = col; });
      setPin(newPin);
      const nextIndex = Math.min(index + pasted.length, 5);
      if (inputsRef.current[nextIndex]) inputsRef.current[nextIndex].focus();
      checkCompletion(newPin);
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value !== '' && index < 5) {
      if (inputsRef.current[index + 1]) inputsRef.current[index + 1].focus();
    }
    checkCompletion(newPin);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      if (inputsRef.current[index - 1]) inputsRef.current[index - 1].focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      setError(false);
    }
  };

  const checkCompletion = (currentPin) => {
    const joined = currentPin.join('');
    if (joined.length === 6) {
      if (mode === 'set') {
        if (step === 1) {
          setFirstPin(joined);
          setStep(2);
          setPin(['', '', '', '', '', '']);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            if (inputsRef.current[0]) inputsRef.current[0].focus();
          }, 100);
        } else {
          if (joined === firstPin) {
            onComplete(joined);
          } else {
            setError(true);
            setPin(['', '', '', '', '', '']);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              if (inputsRef.current[0]) inputsRef.current[0].focus();
            }, 100);
          }
        }
      } else if (mode === 'verify') {
        onComplete(joined);
      }
    }
  };

  const getTitle = () => {
    if (mode === 'verify') return t('enterPinToUnlock') || 'Enter your PIN';
    return step === 1 ? (t('setPinTitle') || 'Set Global PIN') : (t('confirmPinTitle') || 'Confirm PIN');
  };

  // We use Portals to render this modal at the top level of the body.
  // This prevents parent DOM overflows/conflicts and often solves 'removeChild' issues.
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="pin-modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: '#ffffff', borderRadius: 24, padding: '40px 32px',
              boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
              width: 380, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
            >
              <X size={20} />
            </button>

            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Lock size={28} color="#1e293b" />
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.025em' }}>{getTitle()}</h2>
            <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 32, height: 20 }}>
              {error ? (
                <span style={{ color: '#ef4444', fontWeight: 600 }}>
                   {mode === 'verify' ? (t('incorrectPin') || 'Incorrect PIN') : (t('pinMismatch') || 'PINs do not match, try again')}
                </span>
              ) : mode === 'set' ? (step === 1 ? (t('pinLengthPrompt') || 'Enter 6 digits') : (t('pinConfirmPrompt') || 'Re-enter your PIN')) : ''}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              {pin.map((digit, index) => (
                <input
                  key={`pin-input-${index}`}
                  ref={el => inputsRef.current[index] = el}
                  type="password"
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={e => handleChange(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  maxLength={1}
                  style={{
                    width: 48, height: 56, borderRadius: 14, border: `2.5px solid ${error ? '#fee2e2' : (digit ? '#1e293b' : '#f1f5f9')}`,
                    textAlign: 'center', fontSize: 24, fontWeight: 700, outline: 'none',
                    background: '#f8fafc', color: '#1e293b', transition: 'all 0.2s',
                    borderColor: error ? '#ef4444' : (digit ? '#1e293b' : '#e2e8f0'),
                    boxShadow: digit ? '0 4px 12px rgba(30, 41, 59, 0.08)' : 'none'
                  }}
                />
              ))}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
