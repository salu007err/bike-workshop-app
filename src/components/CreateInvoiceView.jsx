import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  FileText,
  Wrench,
  Package,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function CreateInvoiceView({
  parts,
  onBack,
  onCreateInvoice,
  onViewHistory,
  isCreating,
  t,
  lang,
}) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active Tab for adding: 'part' or 'work'
  const [itemTypeTab, setItemTypeTab] = useState('part');

  // Part form state
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Work form state
  const [workDescription, setWorkDescription] = useState('');
  const [workPrice, setWorkPrice] = useState('');

  // Selected part details
  const selectedPart = parts.find((p) => String(p.id) === String(selectedPartId));

  // Compute live total
  const totalAmount = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

  // Add Part to current bill
  const handleAddPart = (e) => {
    e.preventDefault();
    if (!selectedPart) {
      setError(t.createInvoice.errSelectPart);
      return;
    }

    const qty = parseInt(partQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError(t.createInvoice.errPartQty);
      return;
    }

    const alreadyInBill = items
      .filter((it) => it.part_id === selectedPart.id)
      .reduce((s, it) => s + it.quantity, 0);

    const neededTotal = alreadyInBill + qty;
    if (neededTotal > (selectedPart.quantity || 0)) {
      setError(
        `${t.createInvoice.errPartStockPrefix} "${selectedPart.name}": ${selectedPart.quantity}.`
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        part_id: selectedPart.id,
        description: selectedPart.name,
        quantity: qty,
        price: parseFloat(selectedPart.price) || 0,
        item_type: 'part',
      },
    ]);

    setSelectedPartId('');
    setPartQty(1);
    setError('');
  };

  // Add Work to current bill
  const handleAddWork = (e) => {
    e.preventDefault();
    const desc = workDescription.trim();
    if (!desc) {
      setError(t.createInvoice.errWorkDesc);
      return;
    }

    const price = parseFloat(workPrice);
    if (isNaN(price) || price < 0) {
      setError(t.createInvoice.errWorkPrice);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        part_id: null,
        description: desc,
        quantity: 1,
        price: price,
        item_type: 'work',
      },
    ]);

    setWorkDescription('');
    setWorkPrice('');
    setError('');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const handleInitiateConfirm = (e) => {
    if (e) e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError(t.createInvoice.errVehicle);
      return;
    }
    if (items.length === 0) {
      setError(t.createInvoice.errNoItems);
      return;
    }

    // Verify live stock availability before opening confirm dialog
    for (const item of items) {
      if (item.item_type === 'part' && item.part_id) {
        const part = parts.find((p) => String(p.id) === String(item.part_id));
        if (!part) {
          setError(`Part "${item.description}" not found in stock list.`);
          return;
        }
        if ((part.quantity || 0) < item.quantity) {
          setError(
            `Stock has changed! Available for "${part.name}" is ${part.quantity}, but bill requires ${item.quantity}.`
          );
          return;
        }
      }
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    const success = await onCreateInvoice({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      items,
      totalAmount,
    });
    if (success) {
      setShowConfirmModal(false);
      setVehicleNumber('');
      setItems([]);
    }
  };

  const partItemsCount = items.filter((it) => it.item_type === 'part').length;
  const workItemsCount = items.filter((it) => it.item_type === 'work').length;

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4 pb-28">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
            title={t.createInvoice.backHome}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {t.createInvoice.title}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              {items.length} {t.createInvoice.currentItems}
            </p>
          </div>
        </div>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 transition-all"
        >
          <History className="w-3.5 h-3.5 text-slate-600" />
          <span>{lang === 'ml' ? 'പഴയ ബില്ലുകൾ' : 'Past Bills'}</span>
        </button>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. STEP 1: VEHICLE REGISTRATION NUMBER (NUMBER PLATE STYLE) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
          {t.createInvoice.vehicleLabel} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder={t.createInvoice.vehiclePlaceholder}
            className="w-full text-xl sm:text-2xl font-black uppercase tracking-wider px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:bg-white bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 3. STEP 2: ADD ITEMS (TABBED PICKER) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        {/* Sub-tabs: Spare Part vs Work */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setItemTypeTab('part')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              itemTypeTab === 'part'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 stroke-[2.2]" />
            <span>{t.createInvoice.tabPart}</span>
          </button>

          <button
            type="button"
            onClick={() => setItemTypeTab('work')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              itemTypeTab === 'work'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 stroke-[2.2]" />
            <span>{t.createInvoice.tabWork}</span>
          </button>
        </div>

        {/* TAB A: ADD SPARE PART */}
        {itemTypeTab === 'part' && (
          <form onSubmit={handleAddPart} className="space-y-3">
            <div>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full text-sm font-bold px-3.5 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 focus:outline-none text-slate-800"
              >
                <option value="">{t.createInvoice.choosePart}</option>
                {parts.map((p) => {
                  const isZero = (p.quantity || 0) <= 0;
                  return (
                    <option key={p.id} value={p.id} disabled={isZero}>
                      {p.name} — ₹{(parseFloat(p.price) || 0).toFixed(0)}{' '}
                      {isZero ? `(${t.stock.outOfStock})` : `(${p.quantity} ${t.stock.inStock})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedPart && (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 font-medium">{t.createInvoice.partPrice} </span>
                  <strong className="text-slate-900 text-base font-black">
                    ₹{(parseFloat(selectedPart.price) || 0).toFixed(0)}
                  </strong>
                </div>
                <div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                      (selectedPart.quantity || 0) > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {selectedPart.quantity || 0} {t.stock.inStock}
                  </span>
                </div>
              </div>
            )}

            {/* Stepper Quantity & Add Button Row */}
            <div className="flex items-center gap-2">
              {/* Stepper Controls */}
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPartQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={selectedPart ? selectedPart.quantity : 999}
                  value={partQty}
                  onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-12 text-center font-black text-base focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const maxQty = selectedPart ? selectedPart.quantity || 999 : 999;
                    setPartQty((q) => Math.min(maxQty, q + 1));
                  }}
                  className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Add Part Button */}
              <button
                type="submit"
                disabled={!selectedPart || (selectedPart.quantity || 0) <= 0}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.createInvoice.addPartBtn}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB B: ADD WORK / LABOR */}
        {itemTypeTab === 'work' && (
          <form onSubmit={handleAddWork} className="space-y-2.5">
            <div>
              <input
                type="text"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder={t.createInvoice.workDescPlaceholder}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
              />

              {/* Horizontal Scroll Suggestion Chips */}
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {t.suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setWorkDescription(sug)}
                    className="text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap transition-colors cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={workPrice}
                  onChange={(e) => setWorkPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full text-base font-black pl-7 pr-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!workDescription.trim() || !workPrice}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.createInvoice.addWorkBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. STEP 3: CURRENT BILL ITEMS LIST */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            {t.createInvoice.currentItems} ({items.length})
          </h3>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
            >
              {t.createInvoice.clearAll}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 bg-slate-50/50">
            <FileText className="w-8 h-8 mx-auto mb-1 text-slate-300" />
            <p className="font-bold text-xs text-slate-600">{t.createInvoice.noItems}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t.createInvoice.noItemsHelp}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const lineAmount = (
                (item.quantity || 1) * (parseFloat(item.price) || 0)
              ).toFixed(0);

              return (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                      {item.description}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          item.item_type === 'part'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.item_type === 'part' ? t.createInvoice.itemColPart : t.createInvoice.itemColWork}
                      </span>
                      <span>
                        {item.quantity} × ₹{parseFloat(item.price).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      ₹{lineAmount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. STICKY BOTTOM ACTION BAR (MOBILE SUPERPOWER) */}
      {items.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-30 bg-slate-900 text-white px-4 py-2.5 shadow-xl border-t border-slate-800 no-print">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.createInvoice.totalLabel}
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 leading-tight">
                ₹{totalAmount.toFixed(0)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiateConfirm}
              disabled={isCreating || !vehicleNumber.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex-shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{t.createInvoice.confirmBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION BOTTOM-SHEET / MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                <h3 className="text-base sm:text-lg font-black">{t.createInvoice.confirmModalTitle}</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3.5">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">
                  {t.createInvoice.vehicleNumLabel}
                </div>
                <div className="text-xl font-black text-slate-900 tracking-wider mt-0.5">
                  {vehicleNumber.toUpperCase()}
                </div>
              </div>

              {partItemsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                  <div className="text-xs font-bold uppercase text-amber-800 mb-1">
                    {t.createInvoice.stockDeductWarn}
                  </div>
                  <ul className="text-xs font-semibold text-amber-900 list-disc list-inside space-y-0.5">
                    {items
                      .filter((it) => it.item_type === 'part')
                      .map((it, i) => (
                        <li key={i}>
                          {it.description} — {it.quantity} {t.stock.partsUnit}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl">
                <span className="text-xs font-bold text-slate-300">{t.createInvoice.totalConfirmLabel}</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm active:scale-95 transition-all"
                >
                  {t.createInvoice.goBack}
                </button>
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleFinalConfirm}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isCreating ? (
                    <span>{t.createInvoice.creating}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>{t.createInvoice.yesConfirm}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
