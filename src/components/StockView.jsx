import React, { useState, useMemo } from 'react';
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
  Eye,
  Coins,
  CheckCircle2,
  TrendingUp,
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

  // Compute total stock units and total monetary worth
  const totalStockUnits = useMemo(() => {
    return parts.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
  }, [parts]);

  const totalStockWorth = useMemo(() => {
    return parts.reduce((sum, p) => {
      const qty = parseInt(p.quantity, 10) || 0;
      const price = parseFloat(p.price) || 0;
      return sum + (qty * price);
    }, 0);
  }, [parts]);

  // 1. First apply typo-tolerant fuzzy search across name, part_number, and note (memoized for fast search)
  const searchedParts = useMemo(() => {
    return searchTerm
      ? fuzzyFilter(parts, searchTerm, ['name', 'part_number', 'note'])
      : parts;
  }, [parts, searchTerm]);

  // 2. Filter parts by stock condition (memoized)
  const filteredParts = useMemo(() => {
    return searchedParts.filter((part) => {
      const qty = parseInt(part.quantity, 10) || 0;
      if (filterType === 'instock') return qty > 3;
      if (filterType === 'low') return qty > 0 && qty <= 3;
      if (filterType === 'out') return qty <= 0;
      return true;
    });
  }, [searchedParts, filterType]);

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

      {/* 2. HERO INVENTORY VALUATION CARD (TOTAL STOCK WORTH) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-4 sm:p-5 border border-slate-800 shadow-md">
        {/* Glow Effects */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Main Worth Display */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span>{t.stock.totalStockWorth}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({t.stock.holdingValue})
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-sans drop-shadow-xs">
                ₹{totalStockWorth.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
              {lang === 'ml'
                ? `കൈവശമുള്ള ${totalStockUnits.toLocaleString('en-IN')} യൂണിറ്റ് പാർട്സുകളുടെ ആകെ മൂല്യം`
                : `Total valuation across ${totalStockUnits.toLocaleString('en-IN')} physical units currently on shelf`}
            </p>
          </div>

          {/* Micro Metrics Row */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 flex-shrink-0">
            {/* Units on shelf */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                {t.stock.totalStockUnits}
              </div>
              <div className="text-base sm:text-lg font-black text-white flex items-center gap-1">
                <Package className="w-4 h-4 text-blue-300" />
                <span>{totalStockUnits.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Part Varieties */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                {t.stock.partTypes}
              </div>
              <div className="text-base sm:text-lg font-black text-white flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-300" />
                <span>{parts.length}</span>
              </div>
            </div>

            {/* Health Status pill */}
            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10 flex items-center justify-between sm:flex-col sm:items-start">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                {lang === 'ml' ? 'സ്റ്റോക്ക് നില' : 'Stock Status'}
              </div>
              {outCount === 0 && lowCount === 0 ? (
                <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.stock.healthyStock}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {outCount > 0 && (
                    <button
                      onClick={() => setFilterType('out')}
                      className="text-[10px] font-black bg-red-500/30 text-red-300 hover:bg-red-500/50 px-2 py-0.5 rounded-lg border border-red-500/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>{outCount} {lang === 'ml' ? 'തീർന്നു' : 'Out'}</span>
                    </button>
                  )}
                  {lowCount > 0 && (
                    <button
                      onClick={() => setFilterType('low')}
                      className="text-[10px] font-black bg-amber-500/30 text-amber-300 hover:bg-amber-500/50 px-2 py-0.5 rounded-lg border border-amber-500/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{lowCount} {lang === 'ml' ? 'കുറവ്' : 'Low'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH BAR & QUICK FILTERS */}
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
                  {/* Image Thumbnail with Direct Click-to-View (Extra Large for Low-Literacy Recognition) */}
                  {part.image_url ? (
                    <button
                      type="button"
                      onClick={() => setViewImagePart(part)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-blue-400 flex-shrink-0 bg-slate-100 group cursor-pointer shadow-sm active:scale-95 transition-all"
                      title={lang === 'ml' ? 'ഫോട്ടോ വലുതായി കാണുക' : 'Click to view photo'}
                    >
                      <img
                        src={part.image_url}
                        alt={part.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(part)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 text-slate-400 hover:text-slate-600 flex flex-col items-center justify-center flex-shrink-0 active:scale-95 transition-all cursor-pointer"
                      title={lang === 'ml' ? 'ഫോട്ടോ ചേർക്കുക' : 'Add photo'}
                    >
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-bold mt-1 text-slate-500">
                        {lang === 'ml' ? '+ ഫോട്ടോ' : '+ Photo'}
                      </span>
                    </button>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                        {part.name}
                      </h3>
                      {/* Part Number Badge */}
                      {part.part_number && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold tracking-tight">
                          <Hash className="w-3 h-3" />
                          <span>{part.part_number}</span>
                        </span>
                      )}
                      {/* Direct View Photo Pill */}
                      {part.image_url && (
                        <button
                          type="button"
                          onClick={() => setViewImagePart(part)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 text-xs font-black cursor-pointer active:scale-95 shadow-2xs"
                          title={lang === 'ml' ? 'ഫോട്ടോ വലുതായി കാണുക' : 'View photo'}
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-700" />
                          <span>{lang === 'ml' ? 'ഫോട്ടോ കാണുക' : 'View Photo'}</span>
                        </button>
                      )}
                    </div>

                    {part.note && (
                      <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">
                        {part.note}
                      </p>
                    )}
                  </div>

                  {/* Price & Total Holding Worth */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {lang === 'ml' ? 'ഒരു പീസ്' : 'Unit Price'}
                    </div>
                    <div className="font-black text-slate-900 text-lg sm:text-xl leading-tight">
                      ₹{(parseFloat(part.price) || 0).toFixed(0)}
                    </div>
                    <div className="mt-1 inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs tracking-tight shadow-2xs">
                      {t.stock.itemWorth}: ₹{(qty * (parseFloat(part.price) || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Badge + Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  {/* Stock Quantity Badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-700 border-2 border-red-200'
                          : isLowStock
                          ? 'bg-amber-50 text-amber-800 border-2 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200'
                      }`}
                    >
                      {isOutOfStock ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 stroke-[2.5]" />
                          <span>{t.stock.outOfStock}</span>
                        </>
                      ) : (
                        <>
                          <span>{qty} {t.stock.inStock}</span>
                          {isLowStock && <span className="text-xs text-amber-600 font-black">!</span>}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Actions Group (Thumb-friendly touch targets) */}
                  <div className="flex items-center gap-1.5">
                    {/* Fast +Stock Button */}
                    <button
                      onClick={() => setQuickStockPart(part)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                      title={t.stock.addStock}
                    >
                      <PackagePlus className="w-4 h-4 stroke-[2.5]" />
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
