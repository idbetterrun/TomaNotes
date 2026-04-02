import React from 'react';
import { Feather, Plus, FileText } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';

const EmptyState = ({ onNewNote }) => {
  const { t } = useTranslation();
  return (
    <div className="empty-state-container">
      <Feather className="empty-state-icon" />
      <h2 className="empty-state-title">{t('createNotePrompt')}</h2>
      <p className="empty-state-sub">{t('searchPlaceholder')}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="empty-state-action" onClick={() => onNewNote('rich')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} />
          {t('newRichNote')}
        </button>
        <button className="empty-state-action" onClick={() => onNewNote('markdown')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('newMarkdownNote')}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
