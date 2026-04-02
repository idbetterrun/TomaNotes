import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const SearchHighlight = Extension.create({
  name: 'searchHighlight',

  addOptions() {
    return {
      searchTerm: '',
      results: [],
      currentIndex: -1,
    };
  },

  addStorage() {
    return {
      results: [],
      currentIndex: -1,
    };
  },

  addProseMirrorPlugins() {
    const { name } = this;
    const { searchTerm, currentIndex } = this.options;

    return [
      new Plugin({
        key: new PluginKey(name),
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            if (!tr.docChanged && !tr.getMeta(name)) {
              return oldState;
            }

            const { searchTerm, currentIndex } = tr.getMeta(name) || this.options;

            if (!searchTerm) {
              return DecorationSet.empty;
            }

            const decorations = [];
            const results = [];

            tr.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text;
                let m;
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedTerm, 'gi');
                while ((m = regex.exec(text)) !== null) {
                  const start = pos + m.index;
                  const end = start + m[0].length;
                  results.push({ start, end });
                }
              }
            });

            this.storage.results = results;

            results.forEach((res, index) => {
                const className = index === currentIndex 
                    ? 'bg-orange-300 text-orange-950 font-bold ring-2 ring-orange-400 rounded-sm' 
                    : 'bg-yellow-200 text-yellow-900 rounded-sm';
                
                decorations.push(
                    Decoration.inline(res.start, res.end, { class: className })
                );
            });

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export default SearchHighlight;
