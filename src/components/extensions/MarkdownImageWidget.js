import { Decoration, WidgetType } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

class ImageWidget extends WidgetType {
  constructor(url, alt, width, height) {
    super();
    this.url = url;
    this.alt = alt;
    this.width = width;
    this.height = height;
  }

  eq(other) {
    return other.url === this.url && other.alt === this.alt && other.width === this.width;
  }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.className = 'cm-image-container relative inline-block my-2 border border-slate-100 rounded-lg overflow-hidden group';
    
    const img = document.createElement('img');
    img.src = this.url;
    img.alt = this.alt;
    img.style.maxWidth = '100%';
    img.style.width = this.width ? `${this.width}px` : 'auto';
    img.style.display = 'block';
    
    wrap.appendChild(img);
    
    // Simple resize handle (Visual Only for now in CM6 without complex state sync)
    const handle = document.createElement('div');
    handle.className = 'absolute bottom-0 right-0 w-4 h-4 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-se-resize transition-opacity';
    wrap.appendChild(handle);

    return wrap;
  }
}

export const imageWidgetExtension = (view) => {
  const builder = new RangeSetBuilder();
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (node) => {
        if (node.name === 'Image') {
          const text = view.state.doc.sliceString(node.from, node.to);
          const match = /!\[(.*?)\]\((.*?)\)/.exec(text);
          if (match) {
            const alt = match[1];
            const url = match[2];
            builder.add(node.to, node.to, Decoration.widget({
              widget: new ImageWidget(url, alt),
              side: 1
            }));
          }
        }
      }
    });
  }
  return builder.finish();
};
