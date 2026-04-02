import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FileAttachmentNodeView from './FileAttachmentNodeView';

const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      name: { default: 'File' },
      size: { default: 0 },
      url: { default: null },
      type: { default: 'file' },
      extension: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file-attachment' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNodeView);
  },
});

export default FileAttachment;
