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
  X,
  Filter,
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
  lang,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'instock' | 'low' | 'out'
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [quickStockPart, setQuickStockPart] = useState(null);

  // Filter parts by search and stock filter
  const filteredParts = parts.filter((part) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (part.name || '').toLowerCase().includes(term);
    const noteMatch = (part.note || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || noteMatch;

    if (!matchesSearch) return false;

    const qty = parseInt(part.quantity, 10) || 0;
    if (filterType === 'instock') return qty > 3;
    if (filterType === 'low') return qty > 0 && qty <= 3;
    if (filterType === 'out') return qty <= 0;
    return true;
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

  const lowCount = parts.filter((p) => {
    const q = parseInt(p.quantity, 10) || 0;
    return q > 0 && q <= 3;
  }).length;

  const outCount = parts.filter((p) => (parseInt(p.quantity, 10) || 0) <= 0).length;

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4">
      {/* 1. TOP HEADER & ADD PART BUTTON */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
            title={t.stock.backHome}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {t.stock.title}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              {parts.length} {t.stock.partsUnit}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{lang === 'ml' ? '+ പുതിയ പാർട്ട്' : '+ Add Part'}</span>
        </button>
      </div>

      {/* 2. SEARCH BAR & QUICK FILTERS */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.stock.searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ml' ? 'എല്ലാം' : 'All'} ({parts.length})
          </button>

          {lowCount > 0 && (
            <button
              onClick={() => setFilterType('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'low'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{lang === 'ml' ? 'കുറഞ്ഞവ' : 'Low Stock'} ({lowCount})</span>
            </button>
          )}

          {outCount > 0 && (
            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'out'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {lang === 'ml' ? 'തീർന്നവ' : 'Out of Stock'} ({outCount})
            </button>
          )}

          <button
            onClick={() => setFilterType('instock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'instock'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ml' ? 'സ്റ്റോക്കിൽ ഉള്ളവ' : 'In Stock'}
          </button>
        </div>
      </div>

      {/* 3. PARTS LIST (MOBILE CARDS + DESKTOP TABLE) */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-2" />
          <p className="text-slate-500 font-bold text-sm">{t.stock.loading}</p>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">{t.stock.noPartsFound}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No parts match "${searchTerm}".`
              : t.stock.noPartsDesc}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.stock.addFirstPart}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredParts.map((part) => {
            const qty = parseInt(part.quantity, 10) || 0;
            const isOutOfStock = qty <= 0;
            const isLowStock = qty > 0 && qty <= 3;

            return (
              <div
                key={part.id}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
              >
                {/* Top Row: Part Name + Price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                      {part.name}
                    </h3>
                    {part.note && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium line-clamp-1">
                        {part.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-slate-900 text-lg sm:text-xl">
                      ₹{(parseFloat(part.price) || 0).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Badge + Quick Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                  {/* Stock Quantity Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                      isOutOfStock
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isLowStock
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span>{t.stock.outOfStock}</span>
                      </>
                    ) : (
                      <>
                        <span>{qty} {t.stock.inStock}</span>
                        {isLowStock && <span className="text-[10px] text-amber-600 font-black">!</span>}
                      </>
                    )}
                  </span>

                  {/* Actions Group (Thumb-friendly touch targets) */}
                  <div className="flex items-center gap-1.5">
                    {/* Fast +Stock Button */}
                    <button
                      onClick={() => setQuickStockPart(part)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                      title={t.stock.addStock}
                    >
                      <PackagePlus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.stock.addStock}</span>
                    </button>

                    {/* Edit Part */}
                    <button
                      onClick={() => handleOpenEdit(part)}
                      className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 active:scale-95 transition-colors cursor-pointer"
                      title={t.stock.edit}
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Part */}
                    <button
                      onClick={() => handleConfirmDelete(part.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 active:scale-95 transition-colors cursor-pointer"
                      title={t.stock.delete}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
