import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  PackagePlus,
  Trash2,
  AlertTriangle,
  Package,
} from 'lucide-react';
import PartModal from './PartModal';
import AddStockQuickModal from './AddStockQuickModal';

export default function StockView({
  parts,
  onBack,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddStock,
  isLoading,
  t,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [quickStockPart, setQuickStockPart] = useState(null);

  // Filter parts by name or note
  const filteredParts = parts.filter((part) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (part.name || '').toLowerCase().includes(term);
    const noteMatch = (part.note || '').toLowerCase().includes(term);
    return nameMatch || noteMatch;
  });

  const handleOpenAdd = () => {
    setEditingPart(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (part) => {
    setEditingPart(part);
    setIsAddEditModalOpen(true);
  };

  const handleSavePart = async (partData) => {
    if (editingPart) {
      await onUpdatePart(editingPart.id, partData);
    } else {
      await onAddPart(partData);
    }
    setIsAddEditModalOpen(false);
    setEditingPart(null);
  };

  const handleConfirmDelete = async (id) => {
    if (window.confirm(t.stock.deleteConfirm)) {
      await onDeletePart(id);
      setIsAddEditModalOpen(false);
      setEditingPart(null);
    }
  };

  const handleConfirmQuickStock = async (id, addQty) => {
    await onAddStock(id, addQty);
    setQuickStockPart(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
          <span>{t.stock.backHome}</span>
        </button>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-sm shadow-md shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>{t.stock.addNewPart}</span>
        </button>
      </div>

      {/* Header and Search */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Package className="w-8 h-8 text-blue-600" />
              <span>{t.stock.title}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {t.stock.totalParts}{' '}
              <strong className="text-slate-800">
                {parts.length} {t.stock.partsUnit}
              </strong>
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.stock.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none text-base font-semibold text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-lg"
            >
              {t.stock.clear}
            </button>
          )}
        </div>
      </div>

      {/* Parts List / Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
          <p className="text-slate-600 font-semibold">{t.stock.loading}</p>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-800">{t.stock.noPartsFound}</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `"${searchTerm}" ന് അനുയോജ്യമായ പാർട്സുകൾ ലഭ്യമല്ല.`
              : t.stock.noPartsDesc}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>{t.stock.addFirstPart}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">{t.stock.thPartName}</th>
                  <th className="py-4 px-6">{t.stock.thPrice}</th>
                  <th className="py-4 px-6 text-center">{t.stock.thQuantity}</th>
                  <th className="py-4 px-6 text-right">{t.stock.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.map((part) => {
                  const qty = part.quantity || 0;
                  const isOutOfStock = qty <= 0;
                  const isLowStock = qty > 0 && qty <= 3;

                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-base">
                          {part.name}
                        </div>
                        {part.note && (
                          <div className="text-xs text-slate-500 mt-0.5">{part.note}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-black text-slate-900 text-lg">
                          ₹{(parseFloat(part.price) || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isOutOfStock && <AlertTriangle className="w-3.5 h-3.5" />}
                          {qty} {isOutOfStock ? t.stock.outOfStock : t.stock.inStock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Add Stock Button */}
                          <button
                            onClick={() => setQuickStockPart(part)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs"
                            title={t.stock.addStock}
                          >
                            <PackagePlus className="w-4 h-4" />
                            <span>{t.stock.addStock}</span>
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200"
                            title={t.stock.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleConfirmDelete(part.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200"
                            title={t.stock.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filteredParts.map((part) => {
              const qty = part.quantity || 0;
              const isOutOfStock = qty <= 0;
              const isLowStock = qty > 0 && qty <= 3;

              return (
                <div key={part.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 text-base leading-snug">
                        {part.name}
                      </div>
                      {part.note && (
                        <div className="text-xs text-slate-500 mt-0.5">{part.note}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-xl">
                        ₹{(parseFloat(part.price) || 0).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isOutOfStock && <AlertTriangle className="w-3.5 h-3.5" />}
                      {qty} {isOutOfStock ? t.stock.outOfStock : t.stock.inStock}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setQuickStockPart(part)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs"
                      >
                        <PackagePlus className="w-4 h-4" />
                        <span>{t.stock.addStock}</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(part)}
                        className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(part.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Part Add/Edit Modal */}
      <PartModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSavePart}
        editingPart={editingPart}
        onDelete={handleConfirmDelete}
        t={t}
      />

      {/* Quick Add Stock Modal */}
      <AddStockQuickModal
        isOpen={!!quickStockPart}
        onClose={() => setQuickStockPart(null)}
        part={quickStockPart}
        onConfirm={handleConfirmQuickStock}
        t={t}
      />
    </div>
  );
}
