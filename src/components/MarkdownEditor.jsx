import React, { useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { useSettings, useTranslation } from '../context/SettingsContext';
import SearchModule from './SearchModule';
import { ViewPlugin, Decoration, EditorView, scrollPastEnd } from '@codemirror/view';
import { findNext, findPrevious } from '@codemirror/search';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { tags } from '@lezer/highlight';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('rust', rust);

// 关键修改点：HighlightStyle 只使用当前项目里已验证存在的标准 tags，
// 避免把 undefined tag 传给 HighlightStyle.define 导致运行时白屏。
const markdownHighlightStyle = HighlightStyle.define([
  { tag: [tags.content, tags.name, tags.string, tags.keyword, tags.special(tags.string)], color: 'var(--text-main)' },
  { tag: [tags.heading, tags.strong], color: 'var(--text-main)', fontWeight: '700' },
  { tag: [tags.emphasis], color: 'var(--text-main)', fontStyle: 'italic' },
  { tag: [tags.link, tags.url], color: 'var(--accent)', textDecoration: 'underline' },
  { tag: [tags.monospace], color: 'var(--text-main)' },
  { tag: [tags.quote, tags.comment], color: 'var(--text-muted)' },
  { tag: [tags.list, tags.separator], color: 'var(--text-subtle)' },
]);

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

const MarkdownEditor = ({ note, onChange, onTitleChange, isPreview, isSearchOpen, onCloseSearch, onActionsChange }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const editorViewRef = useRef(null);

  const emitActions = useCallback((view) => {
    if (!onActionsChange) return;
    if (!view) {
      onActionsChange({ canUndo: false, canRedo: false, undo: null, redo: null });
      return;
    }
    onActionsChange({
      canUndo: undoDepth(view.state) > 0,
      canRedo: redoDepth(view.state) > 0,
      undo: () => undo(view),
      redo: () => redo(view),
    });
  }, [onActionsChange]);

  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    imagePlugin,
    EditorView.lineWrapping,
    scrollPastEnd(),
    syntaxHighlighting(markdownHighlightStyle),
    EditorView.theme({
      '&': { height: '100%', minHeight: '400px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' },
      '.cm-editor': { backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' },
      '.cm-scroller': { 
        overflow: 'auto', 
        outline: 'none',
        paddingBottom: '20vh', 
        color: 'var(--text-main)',
      },
      '.cm-content': { 
        paddingTop: '32px',
        minHeight: '100% ',
        color: 'var(--text-main)',
      },
      '.cm-gutters': { backgroundColor: 'var(--bg-primary)', color: 'var(--text-subtle)', borderRight: '1px solid var(--border-color)' },
      '.cm-activeLineGutter': { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' },
      '.cm-cursor': { borderLeftColor: 'var(--text-main)' },
      '.cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'var(--accent)', opacity: 0.2 },
      '.cm-activeLine': { backgroundColor: 'var(--bg-secondary)', opacity: 0.5 },
      '.cm-line': { padding: '0 4px', color: 'var(--text-main)' },
      '.cm-placeholder': { color: 'var(--text-subtle)' },
      '.cm-panels': { backgroundColor: 'var(--surface-strong)', color: 'var(--text-main)', borderColor: 'var(--border-color)' },
    })
  ];

  const handleNext = () => editorViewRef.current && findNext(editorViewRef.current);
  const handlePrev = () => editorViewRef.current && findPrevious(editorViewRef.current);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ padding: '0 48px' }}>
        <input
          type="text"
          value={note.title}
          onChange={e => onTitleChange(e.target.value)}
          className="editor-title-h1"
          placeholder={t('enterTitle')}
          style={{ width: '100%', marginBottom: 16 }}
        />
      </div>

      <SearchModule
        isOpen={isSearchOpen}
        onClose={onCloseSearch}
        onSearch={() => {}}
        onNext={handleNext}
        onPrev={handlePrev}
        totalResults={0}
        currentResultIndex={0}
      />

      <div style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
        {isPreview ? (
          <div
            className="prose markdown-preview"
            style={{ maxWidth: 'none', fontSize: 'inherit', lineHeight: 1.6, paddingTop: 8 }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: 16, background: 'transparent', border: 'none' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        ) : (
          <CodeMirror
            value={note.content}
            height="100%"
            extensions={extensions}
            style={{ height: '100%' }}
            onChange={(value, viewUpdate) => { onChange(value); editorViewRef.current = viewUpdate.view; emitActions(viewUpdate.view); }}
            onCreateEditor={(view) => { editorViewRef.current = view; emitActions(view); }}
            basicSetup={{
              lineNumbers: settings.showLineNumbers,
              syntaxHighlighting: settings.syntaxHighlighting,
              search: false, // Disable CM6 internal search panel
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
