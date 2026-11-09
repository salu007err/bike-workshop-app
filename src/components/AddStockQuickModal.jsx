import React, { useState, useEffect } from 'react';
import { X, PlusCircle, PackageCheck, Loader2 } from 'lucide-react';

export default function AddStockQuickModal({ isOpen, onClose, part, onConfirm, t, lang }) {
  const [addQty, setAddQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAddQty('');
    setError('');
    setIsSubmitting(false);
  }, [isOpen, part]);

  if (!isOpen || !part) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double-clicking / duplicate stock increments
    if (isSubmitting) return;

    const parsed = parseInt(addQty, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError(t.quickStockModal.errInvalid);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onConfirm(part.id, parsed);
    } catch (err) {
      setError(err?.message || (lang === 'ml' ? 'സ്റ്റോക്ക് ചേർക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to add stock'));
      setIsSubmitting(false);
    }
  };

  const currentStock = parseInt(part.quantity, 10) || 0;
  const parsedAdd = parseInt(addQty, 10) || 0;
  const newTotal = currentStock + parsedAdd;

  const handlePreset = (num) => {
    if (isSubmitting) return;
    setAddQty(String(num));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black">{t.quickStockModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-xl text-slate-400 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t.quickStockModal.partLabel}
            </div>
            <div className="text-base font-black text-slate-900 truncate">{part.name}</div>
            <div className="mt-1 text-xs text-slate-500 flex items-center justify-between font-semibold">
              <span>{t.quickStockModal.currentStock}</span>
              <span className="font-black text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentStock} {t.quickStockModal.units}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.quickStockModal.qtyReceived}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              required
              disabled={isSubmitting}
              autoFocus
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              placeholder="e.g. 5"
              className="w-full text-2xl font-black px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-900 text-center disabled:bg-slate-100"
            />

            {/* Quick Presets for fast 1-tap additions */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePreset(num)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>

          {parsedAdd > 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
              {t.quickStockModal.newTotalLabel}{' '}
              <strong className="text-sm font-black text-emerald-900">
                {newTotal} {t.quickStockModal.units}
              </strong>
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs disabled:opacity-40"
            >
              {t.quickStockModal.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t.quickStockModal.adding || 'Adding...'}</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.quickStockModal.confirm}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
