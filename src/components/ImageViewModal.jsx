import React, { useEffect } from 'react';
import { X, Image as ImageIcon, Package, Hash } from 'lucide-react';

export default function ImageViewModal({ isOpen, onClose, part, t, lang }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !part) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h3 className="text-base font-black truncate">{part.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close image modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Content */}
        <div className="p-3 bg-slate-950/50 flex items-center justify-center min-h-[240px] max-h-[60vh] overflow-hidden">
          {part.image_url ? (
            <img
              src={part.image_url}
              alt={part.name}
              className="max-h-[55vh] w-auto max-w-full rounded-2xl object-contain shadow-md mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const errEl = document.createElement('div');
                  errEl.className = 'text-center p-6 text-slate-400 font-bold text-xs';
                  errEl.innerText = lang === 'ml' ? 'ഫോട്ടോ കാണിക്കാൻ കഴിഞ്ഞില്ല' : 'Image preview failed to load';
                  parent.appendChild(errEl);
                }
              }}
            />
          ) : (
            <div className="text-center p-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-xs">{lang === 'ml' ? 'ഫോട്ടോ ലഭ്യമല്ല' : 'No photo uploaded for this part'}</p>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            {part.part_number && (
              <div className="flex items-center gap-1 text-xs text-blue-400 font-mono font-bold">
                <Hash className="w-3.5 h-3.5" />
                <span className="truncate">{part.part_number}</span>
              </div>
            )}
            <div className="text-xs text-slate-400 font-medium">
              {lang === 'ml' ? 'സ്റ്റോക്ക്:' : 'Available Stock:'}{' '}
              <strong className="text-white font-extrabold">{part.quantity || 0}</strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {lang === 'ml' ? 'വില' : 'Price'}
            </span>
            <span className="text-xl font-black text-emerald-400">
              ₹{(parseFloat(part.price) || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
