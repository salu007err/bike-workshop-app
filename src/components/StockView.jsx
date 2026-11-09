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
  Hash,
  Image as ImageIcon,
} from 'lucide-react';
import PartModal from './PartModal';
import AddStockQuickModal from './AddStockQuickModal';
import ImageViewModal from './ImageViewModal';
import { fuzzyFilter } from '../services/searchUtils';

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
  const [viewImagePart, setViewImagePart] = useState(null);

  // 1. First apply typo-tolerant fuzzy search across name, part_number, and note
  const searchedParts = searchTerm
    ? fuzzyFilter(parts, searchTerm, ['name', 'part_number', 'note'])
    : parts;

  // 2. Filter parts by stock condition
  const filteredParts = searchedParts.filter((part) => {
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
        {/* Search Input with typo tolerance */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'ml'
                ? 'പേര്, പാർട്ട് നമ്പർ അല്ലെങ്കിൽ തെറ്റിയ അക്ഷരത്തിലും തിരയാം...'
                : 'Search by name, part number, or typos (e.g. engne, brak)...'
            }
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

      {/* 3. PARTS LIST (MOBILE CARDS) */}
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
                className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-2"
              >
                {/* Top Row: Thumbnail + Part Name + Part Number + Price */}
                <div className="flex items-start gap-2.5 justify-between">
                  {/* Optional Image Thumbnail */}
                  {part.image_url && (
                    <button
                      type="button"
                      onClick={() => setViewImagePart(part)}
                      className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 group cursor-pointer"
                      title={lang === 'ml' ? 'ഫോട്ടോ വലുതായി കാണുക' : 'Click to view photo'}
                    >
                      <img
                        src={part.image_url}
                        alt={part.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {part.name}
                      </h3>
                      {/* Part Number Badge */}
                      {part.part_number && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-mono font-bold tracking-tight">
                          <Hash className="w-2.5 h-2.5" />
                          <span>{part.part_number}</span>
                        </span>
                      )}
                    </div>

                    {part.note && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium line-clamp-1">
                        {part.note}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-slate-900 text-base sm:text-xl">
                      ₹{(parseFloat(part.price) || 0).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Badge + Quick Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-1.5">
                  {/* Stock Quantity Badge */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
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

                    {/* View Image Icon Button if part has image */}
                    {part.image_url && (
                      <button
                        type="button"
                        onClick={() => setViewImagePart(part)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold"
                        title={lang === 'ml' ? 'ഫോട്ടോ കാണുക' : 'View photo'}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions Group (Thumb-friendly touch targets) */}
                  <div className="flex items-center gap-1">
                    {/* Fast +Stock Button */}
                    <button
                      onClick={() => setQuickStockPart(part)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
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
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Part */}
                    <button
                      onClick={() => handleConfirmDelete(part.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 active:scale-95 transition-colors cursor-pointer"
                      title={t.stock.delete}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        lang={lang}
      />

      {/* Quick Add Stock Modal */}
      <AddStockQuickModal
        isOpen={!!quickStockPart}
        onClose={() => setQuickStockPart(null)}
        part={quickStockPart}
        onConfirm={handleConfirmQuickStock}
        t={t}
        lang={lang}
      />

      {/* Full Image View Modal */}
      <ImageViewModal
        isOpen={!!viewImagePart}
        onClose={() => setViewImagePart(null)}
        part={viewImagePart}
        t={t}
        lang={lang}
      />
    </div>
  );
}
