import React, { useState } from 'react';
import { X, User, Lock, Cloud, Globe, Type, Code, Hash, Info, Heart, ChevronRight } from 'lucide-react';
import { useSettings, useTranslation } from '../context/SettingsContext';
import { useToast } from './Toast';

export default function SettingsModal({ isOpen, onClose }) {
  const { settings, toggleLineNumbers, toggleSyntaxHighlighting, updateFontSize, setLanguage } = useSettings();
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'general', 'about'

  if (!isOpen) return null;

  const handleLoginClick = () => {
    toast(t('loginUnavailable'), 'error');
  };

  const tabs = [
    { id: 'account', label: t('accountSection'), icon: <User size={16} /> },
    { id: 'general', label: t('generalSection'), icon: <Globe size={16} /> },
    { id: 'about', label: t('aboutSection'), icon: <Info size={16} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Container */}
      <div
        style={{
          width: 720, height: 500, background: '#fff', borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.15)', display: 'flex',
          overflow: 'hidden', animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div style={{ width: 220, background: '#f9fafb', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 16px' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{t('settingsTitle')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', gap: 4 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: activeTab === tab.id ? '#e5e7eb' : 'transparent',
                  color: activeTab === tab.id ? '#111827' : '#4b5563',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = '#f3f4f6'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', 
              borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', cursor: 'pointer', color: '#6b7280', zIndex: 10
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
          >
            <X size={16} />
          </button>

          <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1 }}>
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Login Banner */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Profile
                  </h3>
                  <button
                    onClick={handleLoginClick}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <User size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{t('loginToAccount')}</div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Sync your notes everywhere</div>
                      </div>
                    </div>
                    <ChevronRight size={20} color="#9ca3af" />
                  </button>
                </div>

                {/* Account Settings (Greyed out) */}
                <div style={{ opacity: 0.6, pointerEvents: 'none' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} /> {t('accountSection')}
                  </h3>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Cloud size={18} color="#6b7280" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{t('crossDeviceSync')}</span>
                      </div>
                      <span style={{ background: '#e0e7ff', color: '#4f46e5', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
                        {t('comingSoon')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Language Switcher */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {t('languageSection')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { id: 'en', label: 'English' },
                      { id: 'zh-CN', label: '简体中文' },
                      { id: 'zh-TW', label: '繁體中文' },
                    ].map(l => (
                      <button
                        key={l.id}
                        onClick={() => setLanguage(l.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 8, border: `1px solid ${lang === l.id ? '#6366f1' : '#e5e7eb'}`,
                          background: lang === l.id ? '#eef2ff' : '#fff', cursor: 'pointer'
                        }}
                      >
                        <span style={{ color: lang === l.id ? '#4f46e5' : '#374151', fontSize: 14, fontWeight: 500 }}>{l.label}</span>
                        {lang === l.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Settings */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {t('generalSection')}
                  </h3>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Hash size={18} color="#6b7280" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{t('showLineNumbers')}</span>
                      </div>
                      <button 
                        onClick={toggleLineNumbers}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: settings.showLineNumbers ? '#10b981' : '#d1d5db',
                          position: 'relative', transition: 'background 0.2s', padding: 0
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.showLineNumbers ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Code size={18} color="#6b7280" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{t('syntaxHighlighting')}</span>
                      </div>
                      <button 
                        onClick={toggleSyntaxHighlighting}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: settings.syntaxHighlighting ? '#10b981' : '#d1d5db',
                          position: 'relative', transition: 'background 0.2s', padding: 0
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.syntaxHighlighting ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Type size={18} color="#6b7280" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{t('fontSize')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="range" min="12" max="24" step="1"
                          value={settings.fontSize}
                          onChange={(e) => updateFontSize(Number(e.target.value))}
                          style={{ accentColor: '#6366f1' }}
                        />
                        <span style={{ fontSize: 13, color: '#6b7280', width: 36, textAlign: 'right' }}>{settings.fontSize}px</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                  <Globe size={40} />
                </div>
                
                <div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>TomaGo Notes</h2>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{t('version')}</p>
                </div>

                <div style={{ 
                  background: '#f9fafb', padding: '24px', borderRadius: 16, border: '1px solid #f3f4f6', 
                  width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 
                }}>
                  <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>{t('developer')}</div>
                  </div>
                  
                  <div style={{ height: 1, background: '#e5e7eb', width: '100%' }} />
                  
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <Heart size={16} color="#ef4444" fill="#ef4444" opacity={0.8} />
                    <span>{t('credits')}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
