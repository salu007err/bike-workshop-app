import React, { useState } from 'react';
import { X, PlusCircle, PackageCheck } from 'lucide-react';

export default function AddStockQuickModal({ isOpen, onClose, part, onConfirm }) {
  const [addQty, setAddQty] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !part) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(addQty, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid number of parts (at least 1).');
      return;
    }
    onConfirm(part.id, parsed);
    setAddQty('');
    setError('');
  };

  const currentStock = part.quantity || 0;
  const parsedAdd = parseInt(addQty, 10) || 0;
  const newTotal = currentStock + parsedAdd;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Add More Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs uppercase font-bold text-slate-400">Spare Part</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{part.name}</div>
            <div className="mt-2 text-sm text-slate-600 flex items-center justify-between">
              <span>Current in stock:</span>
              <span className="font-bold text-base text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {currentStock} units
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Quantity Received (New Stock)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              autoFocus
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              placeholder="e.g. 5, 10, 20"
              className="w-full text-2xl font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-800 text-center"
            />
          </div>

          {parsedAdd > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-sm font-semibold text-emerald-800">
              New Total Stock will be: <strong className="text-base">{newTotal} units</strong>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add to Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
