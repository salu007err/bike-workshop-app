import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Wrench,
  Package,
  CheckCircle,
  AlertCircle,
  History,
  ShieldCheck,
} from 'lucide-react';

export default function CreateInvoiceView({
  parts,
  onBack,
  onCreateInvoice,
  onViewHistory,
  isCreating,
  t,
}) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active Tab for adding: 'part' or 'work'
  const [itemTypeTab, setItemTypeTab] = useState('part');

  // Part form state
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState('1');

  // Work form state
  const [workDescription, setWorkDescription] = useState('');
  const [workPrice, setWorkPrice] = useState('');
  const [workQty, setWorkQty] = useState('1');

  // Current selected part details
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

    // Check existing quantity of this part in items + newly requested
    const alreadyInBill = items
      .filter((it) => it.part_id === selectedPart.id)
      .reduce((s, it) => s + it.quantity, 0);

    const neededTotal = alreadyInBill + qty;
    if (neededTotal > (selectedPart.quantity || 0)) {
      setError(
        `${t.createInvoice.errPartStockPrefix} "${selectedPart.name}": ${selectedPart.quantity}. (Already in bill: ${alreadyInBill})`
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
    setPartQty('1');
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

    const qty = parseInt(workQty, 10) || 1;

    setItems((prev) => [
      ...prev,
      {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        part_id: null,
        description: desc,
        quantity: qty,
        price: price,
        item_type: 'work',
      },
    ]);

    setWorkDescription('');
    setWorkPrice('');
    setWorkQty('1');
    setError('');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const handleInitiateConfirm = (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError(t.createInvoice.errVehicle);
      return;
    }
    if (items.length === 0) {
      setError(t.createInvoice.errNoItems);
      return;
    }

    // Double check stock for all parts before opening confirm dialog
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

  // Count parts in current bill
  const partItemsCount = items.filter((it) => it.item_type === 'part').length;
  const workItemsCount = items.filter((it) => it.item_type === 'work').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
          <span>{t.createInvoice.backHome}</span>
        </button>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-800 font-bold text-sm border border-slate-300"
        >
          <History className="w-4 h-4 text-slate-600" />
          <span>{t.createInvoice.pastBills}</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="bg-slate-900 text-white p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-2xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {t.createInvoice.title}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">
                {t.createInvoice.subtitle}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-8">
          {/* STEP 1: VEHICLE REGISTRATION NUMBER */}
          <div>
            <label className="block text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              {t.createInvoice.vehicleLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder={t.createInvoice.vehiclePlaceholder}
                className="w-full text-2xl md:text-3xl font-black uppercase tracking-wider px-5 py-4 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none bg-slate-50 text-slate-900"
              />
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1.5">
              {t.createInvoice.vehicleHelp}
            </p>
          </div>

          {/* STEP 2: ADD ITEMS (TABS: PARTS vs WORK) */}
          <div className="bg-slate-50 rounded-3xl p-5 md:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800">
                {t.createInvoice.addItemsHeading}
              </h3>
            </div>

            {/* Sub-tabs */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setItemTypeTab('part')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                  itemTypeTab === 'part'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>{t.createInvoice.tabPart}</span>
              </button>

              <button
                type="button"
                onClick={() => setItemTypeTab('work')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                  itemTypeTab === 'work'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span>{t.createInvoice.tabWork}</span>
              </button>
            </div>

            {/* TAB CONTENT: ADD SPARE PART */}
            {itemTypeTab === 'part' && (
              <form onSubmit={handleAddPart} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    {t.createInvoice.selectPartPrompt}
                  </label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full text-base font-bold px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white focus:border-blue-500 focus:outline-none text-slate-800"
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
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">{t.createInvoice.partPrice} </span>
                      <strong className="text-slate-900 text-base">
                        ₹{(parseFloat(selectedPart.price) || 0).toFixed(0)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t.createInvoice.availableStock} </span>
                      <span
                        className={`font-black text-sm px-2.5 py-0.5 rounded-lg ${
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

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      {t.createInvoice.qtyUsed}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedPart ? selectedPart.quantity : 999}
                      value={partQty}
                      onChange={(e) => setPartQty(e.target.value)}
                      className="w-full text-lg font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white focus:border-blue-500 focus:outline-none text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedPart || (selectedPart.quantity || 0) <= 0}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t.createInvoice.addPartBtn}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: ADD WORK / SERVICE */}
            {itemTypeTab === 'work' && (
              <form onSubmit={handleAddWork} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    {t.createInvoice.workDescLabel}
                  </label>
                  <input
                    type="text"
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder={t.createInvoice.workDescPlaceholder}
                    className="w-full text-base font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                  />

                  {/* Suggestion Chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setWorkDescription(sug)}
                        className="text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      {t.createInvoice.workPriceLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={workPrice}
                        onChange={(e) => setWorkPrice(e.target.value)}
                        placeholder="e.g. 150"
                        className="w-full text-lg font-bold pl-8 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t.createInvoice.addWorkBtn}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 3: CURRENT BILL TABLE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                {t.createInvoice.currentItems} ({items.length})
              </h3>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  {t.createInvoice.clearAll}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 bg-slate-50/50">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-slate-600">{t.createInvoice.noItems}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t.createInvoice.noItemsHelp}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const lineAmount = (
                      (item.quantity || 1) * (parseFloat(item.price) || 0)
                    ).toFixed(0);

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-base">
                              {item.description}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span
                                className={`font-semibold px-2 py-0.5 rounded-md ${
                                  item.item_type === 'part'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {item.item_type === 'part' ? t.createInvoice.itemColPart : t.createInvoice.itemColWork}
                              </span>
                              <span>
                                Qty: <strong>{item.quantity}</strong> × ₹
                                {parseFloat(item.price).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-black text-slate-900 text-lg">
                              ₹{lineAmount}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOTAL AMOUNT FOOTER */}
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                      {t.createInvoice.totalLabel}
                    </span>
                    <div className="text-xs text-slate-400 font-medium">
                      ({partItemsCount} {t.createInvoice.partsCount}, {workItemsCount} {t.createInvoice.workCount})
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-wide">
                    ₹{totalAmount.toFixed(0)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CONFIRM & CREATE INVOICE BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleInitiateConfirm}
              disabled={isCreating || items.length === 0 || !vehicleNumber.trim()}
              className="w-full py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black text-xl md:text-2xl shadow-xl shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <CheckCircle className="w-7 h-7" />
              <span>{t.createInvoice.confirmBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                <h3 className="text-xl font-black">{t.createInvoice.confirmModalTitle}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs uppercase font-bold text-slate-400">{t.createInvoice.vehicleNumLabel}</div>
                <div className="text-2xl font-black text-slate-900 tracking-wider mt-0.5">
                  {vehicleNumber.toUpperCase()}
                </div>
              </div>

              {partItemsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="text-xs font-bold uppercase text-amber-800 mb-1">
                    {t.createInvoice.stockDeductWarn}
                  </div>
                  <ul className="text-sm font-semibold text-amber-900 list-disc list-inside space-y-1">
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

              <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
                <span className="text-sm font-bold text-slate-300">{t.createInvoice.totalConfirmLabel}</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm"
                >
                  {t.createInvoice.goBack}
                </button>
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleFinalConfirm}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isCreating ? (
                    <span>{t.createInvoice.creating}</span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
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
