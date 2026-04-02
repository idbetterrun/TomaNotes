import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight } from '@uiw/codemirror-theme-github';
import { useSettings } from '../context/SettingsContext';
import SearchModule from './SearchModule';
import { ViewPlugin, Decoration } from '@codemirror/view';
import { search, findNext, findPrevious, openSearchPanel } from '@codemirror/search';
import { Search, Download, Circle, CheckCircle2 } from 'lucide-react';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import ReactMarkdown from 'react-markdown';

// Cleaner Image Decorator for CM6 Markdown
const imagePlugin = ViewPlugin.fromClass(class {
  constructor(view) { this.decorations = this.buildDecorations(view); }
  update(update) { if (update.docChanged || update.viewportChanged) this.decorations = this.buildDecorations(update.view); }
  buildDecorations(view) {
    const builder = new RangeSetBuilder();
    for (let { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({ from, to, enter: (node) => {
        if (node.name === 'Image') {
          const text = view.state.doc.sliceString(node.from, node.to);
          const match = /!\[(.*?)\]\((.*?)\)/.exec(text);
          if (match) {
            builder.add(node.to, node.to, Decoration.widget({
              widget: new class extends (import('@codemirror/view').WidgetType) {
                toDOM() { 
                    const img = document.createElement('img'); img.src = match[2]; 
                    img.className = 'rounded-xl border border-slate-100 shadow-sm mt-4 pointer-events-none select-none max-w-full';
                    return img; 
                }
              }(), side: 1
            }));
          }
        }
      }});
    }
    return builder.finish();
  }
}, { decorations: v => v.decorations });

const MarkdownEditor = ({ note, onChange }) => {
  const { settings } = useSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const editorViewRef = useRef(null);

  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    search({ top: true }),
    imagePlugin,
  ];

  const handleNext = () => editorViewRef.current && findNext(editorViewRef.current);
  const handlePrev = () => editorViewRef.current && findPrevious(editorViewRef.current);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Clean horizontal toolbar — sits below the H1 title in AppJsx */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 24, paddingBottom: 16,
        borderBottom: '1px solid #f0f0f0',
      }}>
        {/* Preview toggle */}
        <button
          onClick={() => setIsPreview(!isPreview)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: isPreview ? '#1a1a1a' : '#f4f4f5',
            color: isPreview ? '#fff' : '#555',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {isPreview ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {isPreview ? 'Preview' : 'Source'}
        </button>

        <div style={{ width: 1, height: 16, background: '#e8e8e8', margin: '0 4px' }} />

        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          title="Search (Ctrl+F)"
          style={{ color: isSearchOpen ? '#1a1a1a' : '#aaa' }}
        >
          <Search size={16} />
        </button>
      </div>

      <SearchModule
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={() => {}}
        onNext={handleNext}
        onPrev={handlePrev}
        totalResults={0}
        currentResultIndex={0}
      />

      <div style={{ flex: 1, overflow: 'visible' }}>
        {isPreview ? (
          <div
            className="prose"
            style={{ maxWidth: 'none', fontSize: 'inherit', lineHeight: 1.6 }}
          >
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        ) : (
          <CodeMirror
            value={note.content}
            height="100%"
            theme={githubLight}
            extensions={extensions}
            onChange={(value, viewUpdate) => { onChange(value); editorViewRef.current = viewUpdate.view; }}
            onCreateEditor={(view) => { editorViewRef.current = view; }}
            basicSetup={{
              lineNumbers: settings.showLineNumbers,
              syntaxHighlighting: settings.syntaxHighlighting,
              foldGutter: false,
              highlightActiveLine: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
