import React from 'react';
import { Clock3, FileText, Code, Search, Tags } from 'lucide-react';
import { useTranslation } from '../context/SettingsContext';
import { getPlainNoteText } from '../lib/searchNotes';

function SearchResultItem({ note, onSelect }) {
  const { t } = useTranslation();
  const preview = getPlainNoteText(note).slice(0, 80);

  return (
    <button
      onClick={() => onSelect(note)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: note.type === 'rich' ? 'var(--accent)' : '#10b981', display: 'inline-flex' }}>
            {note.type === 'rich' ? <FileText size={14} /> : <Code size={14} />}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title || t('untitled')}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {preview || t('noContentYet')}
        </div>
        {!!note.tags?.length && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0 }}>
        {note.type === 'rich' ? t('richText') : t('markdown')}
      </span>
    </button>
  );
}

export default function SidebarSearchPanel({
  searchState,
  tags,
  onSelectNote,
  onSelectRecent,
  onTypeChange,
  onToggleTag,
}) {
  const { t } = useTranslation();
  const { query, results, recent, filters } = searchState;

  return (
    <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
          {t('recentLabel')}
        </div>
        {recent.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recent.map(item => (
              <button
                key={item}
                onClick={() => onSelectRecent(item)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Clock3 size={12} />
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('searchPlaceholder')}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
          {t('generalSection')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {[
            { id: 'all', label: t('allNotes') || 'All' },
            { id: 'rich', label: t('richText') || 'Rich Text' },
            { id: 'markdown', label: t('markdown') || 'Markdown' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid var(--border-color)',
                background: filters.type === type.id ? 'var(--accent)' : 'var(--surface-primary)',
                color: filters.type === type.id ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
          {t('tagsLabel')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.length ? tags.map(tag => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border-color)',
                  background: active ? 'var(--accent)' : 'var(--accent-soft)',
                  color: active ? '#fff' : 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Tags size={12} />
                #{tag}
              </button>
            );
          }) : (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('noTagsYet')}</span>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>
          {query.trim() ? `${t('searchPlaceholder')} (${results.length})` : `${t('allNotes')} (${results.length})`}
        </div>
        {results.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map(note => (
              <SearchResultItem key={note.id} note={note} onSelect={onSelectNote} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '24px 16px',
            borderRadius: 14,
            border: '1px dashed var(--border-color)',
            background: 'var(--surface-primary)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            fontSize: 12,
          }}>
            <Search size={16} style={{ margin: '0 auto 8px' }} />
            {t('searchPlaceholder')}
          </div>
        )}
      </div>
    </div>
  );
}
