import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageNodeView from './ResizableImageNodeView';

const ResizableImage = Image.extend({
  name: 'resizableImage', // Use a unique name
  draggable: true,
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 400,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
      position: {
        default: 'center',
        renderHTML: (attributes) => ({
          'data-position': attributes.position,
        }),
      },
      alt: {
        default: '',
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },
});

export default ResizableImage;
