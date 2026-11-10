import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  FileText,
  Wrench,
  Package,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  X,
  Search,
  Hash,
  Loader2,
  Edit2,
  Info,
  Gauge,
} from 'lucide-react';
import { fuzzyFilter } from '../services/searchUtils';
import { searchCommonBikeParts } from '../services/commonBikeParts';
import { searchBikeModels, QUICK_POPULAR_MODELS } from '../services/commonBikeModels';
import ImageViewModal from './ImageViewModal';
import { Eye } from 'lucide-react';

export default function CreateInvoiceView({
  parts,
  onBack,
  onCreateInvoice,
  onUpdateInvoice,
  editingInvoice = null,
  onCancelEdit = null,
  onViewHistory,
  isCreating,
  t,
  lang,
}) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const modelAutocompleteRef = useRef(null);

  const [kmReading, setKmReading] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingPartPhoto, setViewingPartPhoto] = useState(null);

  // Sync state if editing an existing invoice
  useEffect(() => {
    if (editingInvoice) {
      setVehicleNumber(editingInvoice.vehicle_number || '');
      setVehicleModel(editingInvoice.vehicle_model || '');
      setKmReading(editingInvoice.km_reading || '');
      if (Array.isArray(editingInvoice.items)) {
        setItems(
          editingInvoice.items.map((it, idx) => ({
            id: it.id || `edit_item_${idx}_${Date.now()}`,
            part_id: it.part_id || null,
            description: it.description || '',
            quantity: parseInt(it.quantity, 10) || 1,
            price: parseFloat(it.price) || 0,
            item_type: it.item_type || (it.part_id ? 'part' : 'work'),
          }))
        );
      }
      setError('');
    }
  }, [editingInvoice]);

  // Update vehicle model suggestions when input changes
  useEffect(() => {
    setModelSuggestions(searchBikeModels(vehicleModel, 8));
  }, [vehicleModel]);

  // Close vehicle model autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelAutocompleteRef.current && !modelAutocompleteRef.current.contains(e.target)) {
        setShowModelSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Active Tab for adding: 'stock' | 'outside' | 'work'
  const [itemTypeTab, setItemTypeTab] = useState('stock');

  // Stock Part form state
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Outside / Purchased Part form state
  const [outsidePartName, setOutsidePartName] = useState('');
  const [outsidePartPrice, setOutsidePartPrice] = useState('');
  const [outsidePartQty, setOutsidePartQty] = useState(1);
  const [outsideSuggestions, setOutsideSuggestions] = useState([]);
  const [showOutsideSuggestions, setShowOutsideSuggestions] = useState(false);
  const outsideAutocompleteRef = useRef(null);

  // Work form state
  const [workDescription, setWorkDescription] = useState('');
  const [workPrice, setWorkPrice] = useState('');

  // Selected part details
  const selectedPart = parts.find((p) => String(p.id) === String(selectedPartId));

  // Typo-tolerant filtered parts for quick search selection
  const searchedParts = partSearchQuery.trim()
    ? fuzzyFilter(parts, partSearchQuery, ['name', 'part_number', 'note'])
    : parts;

  // Autocomplete suggestions for outside part name
  useEffect(() => {
    if (outsidePartName.trim()) {
      setOutsideSuggestions(searchCommonBikeParts(outsidePartName, 8));
    } else {
      setOutsideSuggestions(searchCommonBikeParts('', 6));
    }
  }, [outsidePartName]);

  // Click outside to close outside part autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (outsideAutocompleteRef.current && !outsideAutocompleteRef.current.contains(e.target)) {
        setShowOutsideSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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
      .filter((it) => String(it.part_id) === String(selectedPart.id))
      .reduce((s, it) => s + (parseInt(it.quantity, 10) || 0), 0);

    const neededTotal = alreadyInBill + qty;

    // When editing an invoice, the parts already on that invoice are returned upon save,
    // so available stock includes what was previously in editingInvoice.
    const previouslyInEdit = editingInvoice?.items
      ? editingInvoice.items
          .filter((it) => String(it.part_id) === String(selectedPart.id))
          .reduce((s, it) => s + (parseInt(it.quantity, 10) || 0), 0)
      : 0;
    const maxAvailable = (selectedPart.quantity || 0) + previouslyInEdit;

    if (neededTotal > maxAvailable) {
      setError(
        `${t.createInvoice.errPartStockPrefix} "${selectedPart.name}": ${maxAvailable}.`
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
    setPartSearchQuery('');
    setPartQty(1);
    setError('');
  };

  // Add Outside / Custom Purchased Part to bill (ZERO stock deduction)
  const handleAddOutsidePart = (e) => {
    if (e) e.preventDefault();
    const name = outsidePartName.trim();
    if (!name) {
      setError(t.createInvoice.errOutsidePartName || 'Please enter the outside part name.');
      return;
    }

    const price = parseFloat(outsidePartPrice);
    if (isNaN(price) || price < 0) {
      setError(t.createInvoice.errOutsidePartPrice || 'Please enter a valid price (₹0 or greater).');
      return;
    }

    const qty = parseInt(outsidePartQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError(t.createInvoice.errPartQty || 'Please enter a valid quantity of 1 or more.');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        part_id: null, // Null part_id ensures zero workshop stock inventory deduction
        description: name,
        quantity: qty,
        price: price,
        item_type: 'part',
        is_outside: true,
      },
    ]);

    setOutsidePartName('');
    setOutsidePartPrice('');
    setOutsidePartQty(1);
    setShowOutsideSuggestions(false);
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
    if (isSubmitting || isCreating) return;

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
        const previouslyInEdit = editingInvoice?.items
          ? editingInvoice.items
              .filter((it) => String(it.part_id) === String(item.part_id))
              .reduce((s, it) => s + (parseInt(it.quantity, 10) || 0), 0)
          : 0;
        const maxAvailable = (part.quantity || 0) + previouslyInEdit;

        if (maxAvailable < item.quantity) {
          setError(
            `Stock has changed! Available for "${part.name}" is ${maxAvailable}, but bill requires ${item.quantity}.`
          );
          return;
        }
      }
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    // Prevent double clicking duplicate invoices
    if (isSubmitting || isCreating) return;

    try {
      setIsSubmitting(true);
      setError('');
      let success = false;
      const cleanKm = kmReading.trim() ? kmReading.trim() : null;
      const cleanModel = vehicleModel.trim() ? vehicleModel.trim() : null;
      if (editingInvoice && onUpdateInvoice) {
        success = await onUpdateInvoice({
          invoiceId: editingInvoice.id,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleModel: cleanModel,
          kmReading: cleanKm,
          items,
          totalAmount,
        });
      } else {
        success = await onCreateInvoice({
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleModel: cleanModel,
          kmReading: cleanKm,
          items,
          totalAmount,
        });
      }

      if (success) {
        setShowConfirmModal(false);
        setVehicleNumber('');
        setVehicleModel('');
        setKmReading('');
        setItems([]);
      }
    } catch (err) {
      setError(err?.message || (editingInvoice ? 'Failed to update invoice' : 'Failed to create invoice'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stockItemsCount = items.filter((it) => it.item_type === 'part' && it.part_id).length;
  const outsideItemsCount = items.filter((it) => it.item_type === 'part' && !it.part_id).length;
  const workItemsCount = items.filter((it) => it.item_type === 'work').length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4 pb-36">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (editingInvoice && onCancelEdit) onCancelEdit();
              onBack();
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs flex-shrink-0"
            title={t.createInvoice.backHome}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
              {editingInvoice ? (t.createInvoice.editTitle || 'Edit Saved Invoice') : t.createInvoice.title}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              {items.length} {t.createInvoice.currentItems}
            </p>
          </div>
        </div>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 transition-all flex-shrink-0"
        >
          <History className="w-3.5 h-3.5 text-slate-600" />
          <span>{lang === 'ml' ? 'പഴയ ബില്ലുകൾ' : 'Past Bills'}</span>
        </button>
      </div>

      {/* Editing Invoice Notice Banner */}
      {editingInvoice && (
        <div className="p-3 sm:p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-amber-950 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-amber-500 text-white rounded-xl flex-shrink-0">
              <Edit2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                {t.createInvoice.editingNotice || 'Editing invoice for bike'}
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 truncate">
                {editingInvoice.vehicle_number} (#{editingInvoice.invoice_number})
              </div>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={() => {
                setVehicleNumber('');
                setItems([]);
                onCancelEdit();
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white hover:bg-amber-50 text-amber-900 font-black text-xs active:scale-95 transition-all flex-shrink-0"
            >
              {t.createInvoice.cancelEdit || 'Cancel'}
            </button>
          )}
        </div>
      )}

      {/* Global Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 text-red-400 hover:text-red-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. STEP 1: VEHICLE REGISTRATION NUMBER, OPTIONAL MODEL & OPTIONAL KM READING */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Vehicle Registration Number */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
              {t.createInvoice.vehicleLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder={t.createInvoice.vehiclePlaceholder}
              className="w-full text-base sm:text-lg font-black uppercase tracking-wider px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:bg-white bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-300"
            />
          </div>

          {/* Vehicle Model Name (Optional with Autocomplete) */}
          <div className="relative" ref={modelAutocompleteRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 truncate">
                {t.createInvoice.modelLabel || 'Vehicle Model'}
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                {t.createInvoice.optional || 'Optional'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => {
                  setVehicleModel(e.target.value);
                  setShowModelSuggestions(true);
                }}
                onFocus={() => setShowModelSuggestions(true)}
                placeholder={t.createInvoice.modelPlaceholder || 'e.g. Activa, Pulsar, Dio...'}
                className="w-full text-sm sm:text-base font-bold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-300"
              />
              {vehicleModel && (
                <button
                  type="button"
                  onClick={() => setVehicleModel('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Clear model"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Model Suggestions Dropdown */}
            {showModelSuggestions && modelSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-blue-200 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                {modelSuggestions.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVehicleModel(m.name);
                      setShowModelSuggestions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{m.category}</span>
                  </button>
                ))}
                {vehicleModel.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowModelSuggestions(false)}
                    className="w-full text-left px-3.5 py-2 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.createInvoice.addCustomModel || 'Use'}: "{vehicleModel.trim()}"</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Odometer / KM Reading (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.createInvoice.kmLabel || 'KM Reading'}</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                {t.createInvoice.optional || 'Optional'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={kmReading}
                onChange={(e) => setKmReading(e.target.value)}
                placeholder={t.createInvoice.kmPlaceholder || 'e.g. 24,500'}
                className="w-full text-base sm:text-lg font-black px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-300"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 select-none">
                KM
              </span>
            </div>
          </div>
        </div>

        {/* Quick tap chips for most common bike models in India */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] uppercase font-black text-slate-400 flex-shrink-0">
            {lang === 'ml' ? 'പ്രധാന മോഡലുകൾ:' : 'Popular:'}
          </span>
          {QUICK_POPULAR_MODELS.map((quickName) => (
            <button
              key={quickName}
              type="button"
              onClick={() => {
                setVehicleModel(quickName);
                setShowModelSuggestions(false);
              }}
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                vehicleModel === quickName
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
              }`}
            >
              {quickName}
            </button>
          ))}
        </div>
      </div>

      {/* 3. STEP 2: ADD ITEMS (TABBED PICKER: STOCK vs OUTSIDE PART vs LABOUR) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        {/* Sub-tabs: Workshop Stock vs Outside Purchased Part vs Labour */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setItemTypeTab('stock')}
            className={`py-2 px-1.5 sm:px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              itemTypeTab === 'stock'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 stroke-[2.2] flex-shrink-0" />
            <span className="truncate">{t.createInvoice.tabStockPart || 'Stock Part'}</span>
          </button>

          <button
            type="button"
            onClick={() => setItemTypeTab('outside')}
            className={`py-2 px-1.5 sm:px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              itemTypeTab === 'outside'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2] flex-shrink-0" />
            <span className="truncate">{t.createInvoice.tabOutsidePart || 'Outside Part'}</span>
          </button>

          <button
            type="button"
            onClick={() => setItemTypeTab('work')}
            className={`py-2 px-1.5 sm:px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              itemTypeTab === 'work'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 stroke-[2.2] flex-shrink-0" />
            <span className="truncate">{t.createInvoice.tabWork || 'Labour'}</span>
          </button>
        </div>

        {/* TAB A: ADD SPARE PART FROM WORKSHOP STOCK */}
        {itemTypeTab === 'stock' && (
          <form onSubmit={handleAddPart} className="space-y-3">
            {/* Quick Filter Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partSearchQuery}
                onChange={(e) => setPartSearchQuery(e.target.value)}
                placeholder={t.createInvoice.searchPartPlaceholder || 'Type part name, number, or typo...'}
                className="w-full text-xs font-semibold pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none text-slate-800 placeholder-slate-400"
              />
              {partSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPartSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Part Selection Dropdown */}
            <div>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 focus:outline-none text-slate-800"
              >
                <option value="">{t.createInvoice.choosePart}</option>
                {searchedParts.map((p) => {
                  const isZero = (p.quantity || 0) <= 0;
                  const partNumStr = p.part_number ? ` [${p.part_number}]` : '';
                  return (
                    <option key={p.id} value={p.id} disabled={isZero}>
                      {p.name}{partNumStr} — ₹{(parseFloat(p.price) || 0).toFixed(0)}{' '}
                      {isZero ? `(${t.stock.outOfStock})` : `(${p.quantity} ${t.stock.inStock})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {searchedParts.length === 0 && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <span>{lang === 'ml' ? 'കടയിൽ സ്റ്റോക്കില്ലേ? പുറത്തുനിന്ന് വാങ്ങി നൽകാൻ:' : 'Not in workshop stock?'}</span>
                <button
                  type="button"
                  onClick={() => setItemTypeTab('outside')}
                  className="font-black text-purple-700 hover:underline"
                >
                  {lang === 'ml' ? 'പുറത്തുനിന്ന് വാങ്ങിയത് ടാബ് തുറക്കുക →' : 'Switch to Outside Part →'}
                </button>
              </div>
            )}

            {selectedPart && (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedPart.image_url && (
                    <button
                      type="button"
                      onClick={() => setViewingPartPhoto(selectedPart)}
                      className="w-11 h-11 rounded-lg overflow-hidden border border-blue-200 flex-shrink-0 bg-white group cursor-pointer"
                      title={lang === 'ml' ? 'ഫോട്ടോ വലുതായി കാണുക' : 'View photo'}
                    >
                      <img
                        src={selectedPart.image_url}
                        alt={selectedPart.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  )}
                  <div className="min-w-0">
                    <div className="text-slate-900 font-bold truncate">
                      {selectedPart.name}
                      {selectedPart.part_number && (
                        <span className="ml-1 text-[11px] font-mono font-normal text-blue-700 bg-blue-100/70 px-1 py-0.2 rounded">
                          #{selectedPart.part_number}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                      <span>
                        {t.createInvoice.partPrice}{' '}
                        <strong className="text-slate-900 font-black">
                          ₹{(parseFloat(selectedPart.price) || 0).toFixed(0)}
                        </strong>
                      </span>
                      {selectedPart.image_url && (
                        <button
                          type="button"
                          onClick={() => setViewingPartPhoto(selectedPart)}
                          className="text-[11px] text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{lang === 'ml' ? 'ഫോട്ടോ' : 'Photo'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ${
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
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPartQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
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
                  className="w-10 text-center font-black text-base focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const maxQty = selectedPart ? selectedPart.quantity || 999 : 999;
                    setPartQty((q) => Math.min(maxQty, q + 1));
                  }}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Add Part Button */}
              <button
                type="submit"
                disabled={!selectedPart || (selectedPart.quantity || 0) <= 0}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer whitespace-nowrap min-w-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span className="truncate">{t.createInvoice.addPartBtn}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB B: ADD OUTSIDE / PURCHASED PART (ZERO WORKSHOP STOCK DEDUCTED) */}
        {itemTypeTab === 'outside' && (
          <form onSubmit={handleAddOutsidePart} className="space-y-3">
            {/* Friendly explanation notice */}
            <div className="p-2.5 bg-purple-50 border border-purple-200/80 rounded-xl text-purple-950 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="leading-snug">
                {t.createInvoice.outsidePartNotice ||
                  'Billed to customer for this bike. Will NOT reduce your workshop stock.'}
              </span>
            </div>

            {/* Part Name with Autocomplete */}
            <div className="relative" ref={outsideAutocompleteRef}>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {t.createInvoice.outsidePartNameLabel || 'Part Name'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={outsidePartName}
                  onChange={(e) => {
                    setOutsidePartName(e.target.value);
                    setShowOutsideSuggestions(true);
                  }}
                  onFocus={() => setShowOutsideSuggestions(true)}
                  placeholder={
                    t.createInvoice.outsidePartNamePlaceholder ||
                    'Type part name (e.g. Battery, Disc Rotor, Piston)...'
                  }
                  className="w-full text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-purple-600 focus:outline-none placeholder:text-slate-400"
                />
                {outsidePartName && (
                  <button
                    type="button"
                    onClick={() => {
                      setOutsidePartName('');
                      setShowOutsideSuggestions(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showOutsideSuggestions && outsideSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto z-40 divide-y divide-slate-100">
                  {outsideSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setOutsidePartName(item.name);
                        setShowOutsideSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="truncate">{item.name}</span>
                      {item.category && (
                        <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded ml-1 flex-shrink-0">
                          {item.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Quantity Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {t.createInvoice.outsidePartPriceLabel || 'Price Charged (₹)'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={outsidePartPrice}
                    onChange={(e) => setOutsidePartPrice(e.target.value)}
                    placeholder="e.g. 250 or 0"
                    className="w-full text-base font-black pl-7 pr-3 py-2 rounded-xl border-2 border-slate-200 bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {t.stock.quantity}
                </label>
                <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden h-[42px]">
                  <button
                    type="button"
                    onClick={() => setOutsidePartQty((q) => Math.max(1, q - 1))}
                    className="px-3 h-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={999}
                    value={outsidePartQty}
                    onChange={(e) => setOutsidePartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-center font-black text-sm focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setOutsidePartQty((q) => q + 1)}
                    className="px-3 h-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Customer Supplied (₹0) Shortcut Button & Add Button */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setOutsidePartPrice('0')}
                className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors cursor-pointer"
              >
                {lang === 'ml' ? '⚡ കസ്റ്റമർ തന്ന പാർട്ട് (₹0)' : '⚡ Customer supplied (₹0)'}
              </button>

              <button
                type="submit"
                disabled={!outsidePartName.trim() || outsidePartPrice === ''}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span>{t.createInvoice.addOutsidePartBtn || 'Add Outside Part'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB C: ADD WORK / LABOR */}
        {itemTypeTab === 'work' && (
          <form onSubmit={handleAddWork} className="space-y-2.5">
            {/* Friendly explanation notice for customer-supplied parts */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-950 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="leading-snug">
                {lang === 'ml'
                  ? 'കസ്റ്റമർ സ്വന്തമായി പാർട്ട് കൊണ്ടുവന്നതാണോ? ഇവിടെ ഫിറ്റിംഗ് കൂലി മാത്രം നൽകി ബിൽ ചെയ്യാം.'
                  : 'Customer brought own parts? Just add the fitting labour charge here for a labour-only bill.'}
              </span>
            </div>

            <div>
              <input
                type="text"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder={t.createInvoice.workDescPlaceholder}
                className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
              />

              {/* Suggestion Chips */}
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
              <div className="relative flex-1 min-w-0">
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
                className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span>{t.createInvoice.addWorkBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. STEP 3: CURRENT BILL ITEMS LIST */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
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
                          item.item_type === 'part' && item.part_id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.item_type === 'part' && !item.part_id
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.item_type === 'part' && item.part_id
                          ? (t.createInvoice.itemColStockPart || (lang === 'ml' ? 'സ്റ്റോക്ക് പാർട്ട്' : 'Stock Part'))
                          : item.item_type === 'part' && !item.part_id
                          ? (t.createInvoice.itemColOutsidePart || (lang === 'ml' ? 'പുറത്തുനിന്ന്' : 'Outside Part'))
                          : (t.createInvoice.itemColWork || (lang === 'ml' ? 'പണിക്കൂലി' : 'Labour'))}
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
                      className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* 5. STICKY BOTTOM ACTION BAR (CLEAN, NO OVERLAP WITH BOTTOM NAV) */}
      {items.length > 0 && (
        <div className="fixed bottom-[56px] left-0 right-0 z-30 bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-xl border-t border-slate-800 no-print select-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block leading-tight">
                {t.createInvoice.totalLabel}
              </span>
              <div className="text-lg sm:text-2xl font-black text-emerald-400 leading-tight">
                ₹{totalAmount.toFixed(0)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiateConfirm}
              disabled={isCreating || isSubmitting || !vehicleNumber.trim()}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap ${
                editingInvoice
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {isCreating || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                  <span>
                    {editingInvoice
                      ? (t.createInvoice.updating || 'Updating...')
                      : (t.createInvoice.creating || 'Creating...')}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                  <span>
                    {editingInvoice
                      ? (t.createInvoice.updateBtn || 'Update Invoice')
                      : (lang === 'ml' ? 'ബിൽ ഉണ്ടാക്കുക' : 'Confirm Bill')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION BOTTOM-SHEET / MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.5] flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-black truncate">
                  {editingInvoice
                    ? (t.createInvoice.confirmUpdateModalTitle || 'Confirm Changes to Invoice & Stock')
                    : t.createInvoice.confirmModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isCreating || isSubmitting}
                className="p-1 rounded-xl text-slate-400 hover:text-white disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3.5">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-400">
                    {t.createInvoice.vehicleNumLabel}
                  </div>
                  <div className="text-xl font-black text-slate-900 tracking-wider mt-0.5">
                    {vehicleNumber.toUpperCase()}
                  </div>
                  {vehicleModel.trim() && (
                    <div className="text-xs font-bold text-blue-700 mt-0.5">
                      {vehicleModel.trim()}
                    </div>
                  )}
                </div>
                {kmReading.trim() && (
                  <div className="text-right">
                    <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-end gap-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.createInvoice.kmLabel || 'KM'}</span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-blue-700 tracking-wide mt-0.5">
                      {kmReading.trim().toUpperCase().includes('KM') ? kmReading.trim() : `${kmReading.trim()} KM`}
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Items to be deducted */}
              {stockItemsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                  <div className="text-xs font-bold uppercase text-amber-800 mb-1">
                    {t.createInvoice.stockDeductWarn}
                  </div>
                  <ul className="text-xs font-semibold text-amber-900 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                    {items
                      .filter((it) => it.item_type === 'part' && it.part_id)
                      .map((it, i) => (
                        <li key={i} className="truncate">
                          {it.description} — {it.quantity} {t.stock.partsUnit}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Outside Purchased Items (Zero stock deducted) */}
              {outsideItemsCount > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
                  <div className="text-xs font-bold uppercase text-purple-900 mb-1">
                    {t.createInvoice.outsidePartsWarning || 'Outside Purchased Parts (No workshop stock deducted):'}
                  </div>
                  <ul className="text-xs font-semibold text-purple-900 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                    {items
                      .filter((it) => it.item_type === 'part' && !it.part_id)
                      .map((it, i) => (
                        <li key={i} className="truncate">
                          {it.description} — {it.quantity} {t.stock.partsUnit} (₹{(parseFloat(it.price) || 0).toFixed(0)})
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Zero Stock Deduction Notification (Labour only or outside parts) */}
              {stockItemsCount === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {t.createInvoice.labourOnlyNotice ||
                      'Zero workshop stock deducted (Labour only or outside parts).'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl">
                <span className="text-xs font-bold text-slate-300">{t.createInvoice.totalConfirmLabel}</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={isCreating || isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm active:scale-95 transition-all disabled:opacity-40"
                >
                  {t.createInvoice.goBack}
                </button>
                <button
                  type="button"
                  disabled={isCreating || isSubmitting}
                  onClick={handleFinalConfirm}
                  className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    editingInvoice
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  }`}
                >
                  {isCreating || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                      <span>{editingInvoice ? (t.createInvoice.updating || 'Updating...') : t.createInvoice.creating}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                      <span>{editingInvoice ? (t.createInvoice.yesUpdate || 'Yes, Save Changes') : t.createInvoice.yesConfirm}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part Image View Modal */}
      <ImageViewModal
        isOpen={!!viewingPartPhoto}
        onClose={() => setViewingPartPhoto(null)}
        part={viewingPartPhoto}
        t={t}
        lang={lang}
      />
    </div>
  );
}
