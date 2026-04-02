import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Feather, MessageCircle, Check } from 'lucide-react';

const ResizableImageNodeView = ({ node, updateAttributes, selected }) => {
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [caption, setCaption] = useState(node.attrs.alt || '');
  const rndRef = useRef(null);

  const handleResizeStop = (e, direction, ref, delta, position) => {
    updateAttributes({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    });
  };

  const handleDragStop = (e, d) => {
      // For Tiptap, dragging nodes is usually handled by the editor, 
      // but Rnd can provide a more clinical feel.
      // However, updating position in document is complex. 
      // We'll focus on resizing as primary requested feature for image interaction.
  };

  const handleCaptionSubmit = (e) => {
      e.stopPropagation();
      updateAttributes({ alt: caption });
      setShowCaptionInput(false);
  };

  const { src, width, height } = node.attrs;

  return (
    <NodeViewWrapper className={`inline-block relative my-4 group transition-all ${selected ? 'z-50' : ''}`}>
      <div className={`relative inline-block ${selected ? 'ring-2 ring-blue-500 rounded-sm' : ''}`}>
        <Rnd
          size={{ width: width || 'auto', height: height || 'auto' }}
          onResizeStop={handleResizeStop}
          onDragStop={handleDragStop}
          lockAspectRatio={true}
          dragAxis="none" // Stick to text flow but allow resize
          enableResizing={selected ? {
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          } : false}
          resizeHandleClasses={{
            topRight: 'w-3 h-3 bg-white border-2 border-blue-500 rounded-full !-top-1.5 !-right-1.5',
            bottomRight: 'w-3 h-3 bg-white border-2 border-blue-500 rounded-full !-bottom-1.5 !-right-1.5',
            bottomLeft: 'w-3 h-3 bg-white border-2 border-blue-500 rounded-full !-bottom-1.5 !-left-1.5',
            topLeft: 'w-3 h-3 bg-white border-2 border-blue-500 rounded-full !-top-1.5 !-left-1.5',
          }}
        >
          <img
            src={src}
            alt={node.attrs.alt}
            className="block w-full h-full object-contain pointer-events-none select-none"
          />
        </Rnd>

        {/* Caption Icon */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowCaptionInput(!showCaptionInput); }}
                className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                title="Add note/caption"
            >
                <Feather size={14} />
            </button>
        </div>

        {/* Caption Input Bubble */}
        {showCaptionInput && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-xl shadow-2xl p-2 z-[60] flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                <input 
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter caption..."
                    autoFocus
                    className="p-2 text-xs border border-slate-100 rounded-md outline-none bg-gray-50 focus:bg-white w-40"
                />
                <button 
                    onClick={handleCaptionSubmit}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    <Check size={14} />
                </button>
            </div>
        )}
      </div>
      
      {node.attrs.alt && (
          <div className="mt-2 text-xs text-gray-400 italic text-center w-full">
              {node.attrs.alt}
          </div>
      )}
    </NodeViewWrapper>
  );
};

export default ResizableImageNodeView;
