import React, { useState } from 'react';
import { X, User, Lock, Cloud, Globe, Type, Code, Hash, Info, Heart, ChevronRight, Fingerprint, FileText } from 'lucide-react';
import { useSettings, useTranslation } from '../context/SettingsContext';
import { useToast } from './Toast';
import PinSetupModal from './PinSetupModal';
import appLogoSrc from '/icon.png';

export default function SettingsModal({ isOpen, onClose, notes, securityState, onEnableGlobalPin, onDisableGlobalPin, onEnableBiometric, onDisableBiometric }) {
  const { settings, systemAppearance, availableThemes, lightThemes, darkThemes, toggleLineNumbers, toggleSyntaxHighlighting, updateFontSize, setLanguage, updateSecuritySettings, setTheme } = useSettings();
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [generalSubTab, setGeneralSubTab] = useState('appearance');
  const [pinModal, setPinModal] = useState({ isOpen: false, mode: 'set', action: null });
  const isChineseUi = lang.startsWith('zh');

  if (!isOpen) return null;

  const handleLoginClick = () => {
    toast(t('loginUnavailable'), 'error');
  };

  const tabs = [
    { id: 'account', label: t('accountSection'), icon: <User size={16} /> },
    { id: 'general', label: t('generalSection'), icon: <Globe size={16} /> },
    { id: 'security', label: t('securitySection') || 'Security', icon: <Lock size={16} /> },
    { id: 'about', label: t('aboutSection'), icon: <Info size={16} /> },
  ];
  const selectableThemes = settings.followSystem
    ? (systemAppearance === 'dark' ? darkThemes : lightThemes)
    : availableThemes;

  const themeOptions = [
    { id: 'white', bg: '#ffffff', border: '#e5e7eb', label: t('themeWhite') },
    { id: 'gray', bg: '#e9edf1', border: '#cbd5e1', label: t('themeGray') },
    { id: 'sepia', bg: '#eadfc8', border: '#d6b98f', label: t('themeSepia') },
    { id: 'dim', bg: '#18191d', border: '#343a46', label: t('themeDim') },
    { id: 'black', bg: '#0a0b0d', border: '#2a2e36', label: t('themeBlack') },
  ].filter(theme => selectableThemes.includes(theme.id));
  const activeThemeId = settings.followSystem
    ? (systemAppearance === 'dark' ? settings.darkTheme : settings.lightTheme)
    : settings.theme;
  const fontPresets = [
    { label: '小四', px: 12 },
    { label: '四号', px: 14 },
    { label: '小三', px: 15 },
    { label: '三号', px: 16 },
    { label: '小二', px: 18 },
    { label: '二号', px: 22 },
    { label: '小一', px: 24 },
  ];
  const switchTrack = (enabled) => enabled ? 'var(--accent)' : 'var(--bg-secondary)';
  const hoverSurface = 'color-mix(in srgb, var(--surface-primary) 82%, var(--accent-soft) 18%)';
  const dangerSoft = 'color-mix(in srgb, #ef4444 16%, var(--surface-primary) 84%)';
  const dangerText = 'color-mix(in srgb, #ef4444 84%, var(--text-main) 16%)';
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
          width: 720, height: 500, background: 'var(--surface-strong)', borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.15)', display: 'flex',
          overflow: 'hidden', animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div style={{ width: 220, background: 'var(--surface-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 16px' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{t('settingsTitle')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', gap: 4 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: activeTab === tab.id ? 'var(--accent-soft)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--accent-soft)'; }}
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
              position: 'absolute', top: 16, right: 16, background: 'var(--surface-primary)', border: '1px solid var(--border-color)', 
              borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-primary)'}
          >
            <X size={16} />
          </button>

          <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1 }}>
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {t('profileLabel') || 'Profile'}
                  </h3>
                  <button
                    onClick={handleLoginClick}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--surface-strong)',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <User size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>{t('loginToAccount')}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('syncDescription') || 'Sync your notes everywhere'}</div>
                      </div>
                    </div>
                    <ChevronRight size={20} color="var(--text-subtle)" />
                  </button>
                </div>

                <div style={{ opacity: 0.6, pointerEvents: 'none' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} /> {t('accountSection')}
                  </h3>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--surface-primary)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Cloud size={18} color="var(--text-muted)" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('crossDeviceSync')}</span>
                      </div>
                      <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
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
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
                  {[
                    { id: 'appearance', label: t('appearanceSection') || 'Appearance' },
                    { id: 'editor', label: t('generalSection') || 'Editor' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setGeneralSubTab(item.id)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: generalSubTab === item.id ? 'var(--surface-strong)' : 'transparent',
                        color: generalSubTab === item.id ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                
                {/* Language Switcher */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
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
                          padding: '12px 16px', borderRadius: 8, border: `1px solid ${lang === l.id ? 'var(--accent)' : 'var(--border-color)'}`,
                          background: lang === l.id ? 'var(--accent-soft)' : 'var(--surface-strong)', cursor: 'pointer'
                        }}
                      >
                        <span style={{ color: lang === l.id ? 'var(--accent)' : 'var(--text-main)', fontSize: 14, fontWeight: 500 }}>{l.label}</span>
                        {lang === l.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Settings */}
                {generalSubTab === 'editor' && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {lang === 'en' ? 'Editor' : lang === 'zh-TW' ? '編輯器' : '编辑器'}
                  </h3>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-strong)' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Hash size={18} color="var(--text-muted)" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('showLineNumbers')}</span>
                      </div>
                      <button 
                        onClick={toggleLineNumbers}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.showLineNumbers),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.showLineNumbers ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Code size={18} color="var(--text-muted)" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('syntaxHighlighting')}</span>
                      </div>
                      <button 
                        onClick={toggleSyntaxHighlighting}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.syntaxHighlighting),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
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
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {lang === 'en' ? 'Appearance controls moved to the Appearance section.' : lang === 'zh-TW' ? '字體與主題選項已移至「外觀」。' : '字体与主题选项已移至「外观」。'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
                )}

                {/* Appearance Settings */}
                {generalSubTab === 'appearance' && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {t('appearanceSection') || 'Appearance'}
                  </h3>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--surface-strong)', overflow: 'hidden' }}>
                    
                    {/* Follow System */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Globe size={18} color="var(--text-muted)" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('followSystem')}</span>
                      </div>
                      <button 
                        onClick={() => updateSecuritySettings({ followSystem: !settings.followSystem })}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.followSystem),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.followSystem ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    {/* Theme Picker */}
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Type size={18} color="var(--text-muted)" />
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('fontSize')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {settings.fontSizeStandard === 'px' ? (
                            <>
                              <input
                                type="range" min="12" max="24" step="1"
                                value={settings.fontSize}
                                onChange={(e) => updateFontSize(Number(e.target.value))}
                                style={{ accentColor: 'var(--accent)' }}
                              />
                              <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 48, textAlign: 'right' }}>{settings.fontSize}px</span>
                            </>
                          ) : (
                            <select
                              value={settings.fontSize}
                              onChange={(e) => updateFontSize(Number(e.target.value))}
                              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, outline: 'none', background: 'var(--surface-primary)', color: 'var(--text-main)' }}
                            >
                              {fontPresets.map(item => (
                                <option key={item.label} value={item.px}>{item.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Hash size={18} color="var(--text-muted)" />
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('fontStandard')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-primary)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                          {[
                            { id: 'px', label: t('fontStandardPx') },
                            { id: 'cn', label: t('fontStandardCn') },
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => updateSecuritySettings({ fontSizeStandard: item.id })}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                background: settings.fontSizeStandard === item.id ? 'var(--surface-strong)' : 'transparent',
                                color: settings.fontSizeStandard === item.id ? 'var(--text-main)' : 'var(--text-muted)',
                                border: 'none'
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isChineseUi ? 1 : 0.5, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Type size={18} color="var(--text-muted)" />
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('uiFont')}</span>
                        </div>
                        <select
                          value={settings.fontFamily || 'system'}
                          disabled={!isChineseUi}
                          onChange={(e) => updateSecuritySettings({ fontFamily: e.target.value })}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, outline: 'none', background: 'var(--surface-primary)', color: 'var(--text-main)', minWidth: 120 }}
                        >
                          <option value="system">{t('fontSystem')}</option>
                          <option value="kai">{t('fontKai')}</option>
                          <option value="song">{t('fontSong')}</option>
                        </select>
                      </div>

                      <div style={{ height: 1, background: 'var(--border-color)', margin: '0 0 14px' }} />
                      <div style={{ display: 'flex', gap: 12 }}>
                        {themeOptions.map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => setTheme(theme.id)}
                            title={theme.label}
                            style={{
                              width: 36, height: 36, borderRadius: '50%', background: theme.bg,
                              border: `2px solid ${activeThemeId === theme.id ? 'var(--accent)' : theme.border}`,
                              padding: 0, position: 'relative', transform: activeThemeId === theme.id ? 'scale(1.1)' : 'scale(1)',
                              transition: 'transform 0.15s, border-color 0.15s', overflow: 'hidden'
                            }}
                          >
                            {activeThemeId === theme.id && (
                              <div style={{ 
                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', background: 'var(--accent-soft)' 
                              }} />
                            )}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span>{t('theme' + (activeThemeId?.charAt(0).toUpperCase() + activeThemeId?.slice(1)))}</span>
                        <span>{settings.followSystem ? (systemAppearance === 'dark' ? t('themeDim') + ' / ' + t('themeBlack') : [t('themeWhite'), t('themeGray'), t('themeSepia')].join(' / ')) : [t('themeWhite'), t('themeGray'), t('themeSepia'), t('themeDim'), t('themeBlack')].join(' / ')}</span>
                      </div>
                    </div>

                  </div>
                </div>
                )}

              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {t('securitySection')}
                  </h3>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-strong)' }}>
                    
                    {/* Global PIN */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Lock size={18} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('globalPin')}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('globalPinDesc')}</div>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (settings.globalPinEnabled) {
                             const result = await onDisableGlobalPin?.();
                             if (result?.message) {
                               window.alert(result.message);
                               return;
                             }
                             if (result?.ok) {
                               updateSecuritySettings({ globalPinEnabled: false, autoLockTime: -1, touchIdEnabled: false });
                               toast('Global PIN disabled.', 'success');
                             }
                          } else {
                             setPinModal({ isOpen: true, mode: 'set', action: 'enable' });
                          }
                        }}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.globalPinEnabled),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.globalPinEnabled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    {/* Biometric Unlock */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', opacity: settings.globalPinEnabled ? 1 : 0.5, pointerEvents: settings.globalPinEnabled ? 'auto' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Fingerprint size={18} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('touchId')}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('touchIdDesc')}</div>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!securityState?.hasPassword) {
                            toast(t('globalPinDesc'), 'error');
                            return;
                          }
                          if (settings.touchIdEnabled) {
                            const result = await onDisableBiometric?.();
                            if (result?.ok) {
                              updateSecuritySettings({ touchIdEnabled: false });
                            } else {
                              toast(t('touchIdDesc'), 'error');
                            }
                            return;
                          }
                          const enabled = await onEnableBiometric?.();
                          if (enabled) {
                            updateSecuritySettings({ touchIdEnabled: true });
                          } else {
                            toast(t('incorrectPin'), 'error');
                          }
                        }}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.touchIdEnabled),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.touchIdEnabled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    {/* Trash Authentication */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', opacity: settings.globalPinEnabled ? 1 : 0.5, pointerEvents: settings.globalPinEnabled ? 'auto' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileText size={18} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('trashAuth') || 'Trash verification'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('trashAuthDesc') || 'Require authentication before opening the trash'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSecuritySettings({ trashAuthEnabled: !settings.trashAuthEnabled })}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.trashAuthEnabled),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.trashAuthEnabled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    {/* Hide Protected Notes From Search */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', opacity: settings.globalPinEnabled ? 1 : 0.5, pointerEvents: settings.globalPinEnabled ? 'auto' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Lock size={18} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('hideProtectedSearch') || 'Hide protected notes from search'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('hideProtectedSearchDesc') || 'Protected notes will be excluded from sidebar search results'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSecuritySettings({ hideProtectedSearch: !settings.hideProtectedSearch })}
                        style={{
                          width: 44, height: 24, borderRadius: 12, background: switchTrack(settings.hideProtectedSearch),
                          position: 'relative', transition: 'background 0.2s', padding: 0, border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: settings.hideProtectedSearch ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>

                    {/* Auto Lock Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', opacity: settings.globalPinEnabled ? 1 : 0.5, pointerEvents: settings.globalPinEnabled ? 'auto' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Globe size={18} color="var(--text-muted)" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{t('autoLockTime')}</span>
                      </div>
                      <select
                        value={settings.autoLockTime}
                        onChange={e => updateSecuritySettings({ autoLockTime: Number(e.target.value) })}
                        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, outline: 'none', background: 'var(--surface-primary)', color: 'var(--text-main)' }}
                      >
                        <option value={-1}>{t('lockNever') || 'Never'}</option>
                        <option value={2}>2 {t('lockMins')}</option>
                        <option value={5}>5 {t('lockMins')}</option>
                        <option value={10}>10 {t('lockMins')}</option>
                        <option value={20}>20 {t('lockMins')}</option>
                        <option value={30}>30 {t('lockMins')}</option>
                        <option value={60}>60 {t('lockMins')}</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Encrypted Notes Manager */}
                <div style={{ opacity: settings.globalPinEnabled ? 1 : 0.5, pointerEvents: settings.globalPinEnabled ? 'auto' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                     <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                       {t('encryptedNotes') || 'Encrypted Notes'}
                     </h3>
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-strong)' }}>
                     {notes?.filter(n => n.encrypted).length > 0 ? notes.filter(n => n.encrypted).map((n, i, arr) => (
                       <div key={n.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                         <FileText size={14} color="var(--text-muted)" style={{ marginRight: 8 }} />
                         <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{n.title || t('untitled') || 'Untitled'}</span>
                       </div>
                     )) : (
                       <div style={{ padding: 16, fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center' }}>{t('noEncryptedNotes')}</div>
                     )}
                  </div>
                </div>

              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
                <img 
                  src={appLogoSrc}
                  alt="TomaNotes Logo" 
                  style={{ 
                    width: 80, height: 80, borderRadius: 20, 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    objectFit: 'cover'
                  }} 
                />
                
                <div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>TomaNotes</h2>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{t('version')}</p>
                </div>

                <div style={{ 
                  background: 'var(--surface-primary)', padding: '24px', borderRadius: 16, border: '1px solid var(--border-color)', 
                  width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 
                }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{t('developer')}</div>
                  </div>
                  
                  <div style={{ height: 1, background: 'var(--border-color)', width: '100%' }} />
                  
                  <button 
                    onClick={() => setActiveTab('credits')}
                    style={{ 
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Heart size={16} color={dangerText} fill={dangerText} opacity={0.8} />
                      <span>{t('creditsTitle') || 'Credits'}</span>
                    </div>
                    <ChevronRight size={16} color="var(--text-subtle)" />
                  </button>
                </div>
              </div>
            )}

            {/* Credits Sub-tab */}
            {activeTab === 'credits' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <button onClick={() => setActiveTab('about')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, padding: 0 }}>
                   <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> {t('back')}
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('creditsTitle') || 'Credits'}</h2>
                <div style={{ background: 'var(--surface-primary)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', lineHeight: 1.6, fontSize: 14, color: 'var(--text-muted)' }}>
                   {t('credits')}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <PinSetupModal 
        isOpen={pinModal.isOpen} 
        mode={pinModal.mode} 
        onClose={() => setPinModal({ isOpen: false, mode: 'set', action: null })} 
        onComplete={async (pin) => {
          setPinModal({ isOpen: false, mode: 'set', action: null });
          if (pinModal.action === 'enable') {
            const enabled = await onEnableGlobalPin?.(pin);
            if (enabled !== false) {
              updateSecuritySettings({ globalPinEnabled: true, touchIdEnabled: false, autoLockTime: settings.autoLockTime === -1 ? 2 : settings.autoLockTime });
              toast('Global PIN enabled securely.', 'success');
            }
          }
        }}
      />
    </div>
  );
}
