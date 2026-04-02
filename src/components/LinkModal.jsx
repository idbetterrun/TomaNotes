import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ExternalLink } from 'lucide-react';

/**
 * Floating link input that appears near the current selection
 * instead of using the native Chrome prompt.
 */
const LinkModal = ({ isOpen, onClose, onSubmit, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl || 'https://');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || 'https://');
      // Small delay so TipTap doesn't steal focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url.trim());
  };

  const handleRemove = () => {
    onSubmit(''); // empty string = unset link
  };

  return (
    <div
      style={{
        position: 'absolute', top: -54, left: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 10, padding: '6px 8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        animation: 'popIn 0.12s ease-out',
      }}
      onMouseDown={e => e.stopPropagation()} // prevent editor blur
    >
      <ExternalLink size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 4 }}>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: 220, padding: '5px 8px', border: '1px solid #e5e7eb',
            borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none',
            background: '#fafafa',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        />
        <button
          type="submit"
          style={{
            padding: '4px 8px', borderRadius: 6, border: 'none',
            background: '#1a1a1a', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
          title="Apply link"
        >
          <Check size={14} />
        </button>
        {initialUrl && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              padding: '4px 8px', borderRadius: 6, border: 'none',
              background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
            title="Remove link"
          >
            <X size={14} />
          </button>
        )}
      </form>
      <button
        onClick={onClose}
        style={{
          padding: 3, borderRadius: 4, border: 'none',
          background: 'transparent', color: '#aaa', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default LinkModal;
