import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// ── Individual Toast ──────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount → slide in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // wait for slide-out
    }, toast.duration || 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const config = {
    success: { icon: <CheckCircle size={16} />, bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', text: '#166534' },
    error:   { icon: <AlertCircle size={16} />, bg: '#fef2f2', border: '#fecaca', color: '#ef4444', text: '#991b1b' },
    info:    { icon: <Info size={16} />,        bg: '#eff6ff', border: '#bfdbfe', color: '#3b82f6', text: '#1e40af' },
  }[toast.type || 'success'];

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 12,
        background: config.bg, border: `1px solid ${config.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        minWidth: 260, maxWidth: 360,
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        pointerEvents: 'all',
      }}
    >
      <span style={{ color: config.color, flexShrink: 0, display: 'flex' }}>{config.icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: config.text, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: config.color, padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9000,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
let _id = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, remove, toast: add };
}
