import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

export default function PartModal({ isOpen, onClose, onSave, editingPart, onDelete, t }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPart) {
      setName(editingPart.name || '');
      setPrice(editingPart.price !== undefined ? String(editingPart.price) : '');
      setQuantity(editingPart.quantity !== undefined ? String(editingPart.quantity) : '');
      setNote(editingPart.note || '');
    } else {
      setName('');
      setPrice('');
      setQuantity('');
      setNote('');
    }
    setError('');
  }, [editingPart, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.partModal.errName);
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError(t.partModal.errPrice);
      return;
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 0) {
      setError(t.partModal.errQty);
      return;
    }

    onSave({
      name: name.trim(),
      price: numPrice,
      quantity: numQty,
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">
            {editingPart ? t.partModal.editTitle : t.partModal.addTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Part Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {t.partModal.nameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.partModal.namePlaceholder}
              className="w-full text-lg px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
              autoFocus
            />
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {t.partModal.priceLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-lg pl-9 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {t.partModal.qtyLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t.partModal.qtyPlaceholder}
                className="w-full text-lg px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {t.partModal.noteLabel}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.partModal.notePlaceholder}
              className="w-full text-base px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
            {editingPart && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(editingPart.id)}
                className="px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.partModal.deletePart}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm"
              >
                {t.partModal.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <Save className="w-5 h-5" />
                <span>{t.partModal.save}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
