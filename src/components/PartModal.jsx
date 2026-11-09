import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Package,
  Camera,
  Image as ImageIcon,
  Loader2,
  Hash,
  Plus,
  Eye,
  ZoomIn,
  Check,
  Sparkles,
} from 'lucide-react';
import { searchCommonBikeParts } from '../services/commonBikeParts';

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Produces a lightweight JPEG Data URL (max 600px, 0.7 quality ~30-50KB)
 * so it can be saved directly in Supabase text column with ₹0 cost and zero cloud storage bucket setup.
 */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PartModal({ isOpen, onClose, onSave, editingPart, onDelete, t, lang }) {
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Full-size image preview state
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (editingPart) {
      setName(editingPart.name || '');
      setPartNumber(editingPart.part_number || '');
      setPrice(editingPart.price !== undefined ? String(editingPart.price) : '');
      setQuantity(editingPart.quantity !== undefined ? String(editingPart.quantity) : '');
      setNote(editingPart.note || '');
      setImageUrl(editingPart.image_url || '');
    } else {
      setName('');
      setPartNumber('');
      setPrice('');
      setQuantity('');
      setNote('');
      setImageUrl('');
    }
    setError('');
    setIsSaving(false);
    setShowSuggestions(false);
    setIsPreviewImageOpen(false);
  }, [editingPart, isOpen]);

  // Update autocomplete suggestions as user types in Part Name
  useEffect(() => {
    if (name.trim().length > 0) {
      const results = searchCommonBikeParts(name, 10);
      setSuggestions(results);
    } else {
      // Default top suggestions when empty
      setSuggestions(searchCommonBikeParts('', 8));
    }
  }, [name]);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectSuggestion = (suggestedPart) => {
    setName(suggestedPart.name);
    setShowSuggestions(false);
    // Focus price input next for seamless flow
    setTimeout(() => {
      priceInputRef.current?.focus();
    }, 50);
  };

  const handleConfirmCustomPart = () => {
    if (name.trim()) {
      setShowSuggestions(false);
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 50);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setError('');
      const compressedDataUrl = await compressImageFile(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Failed to compress photo:', err);
      setError(lang === 'ml' ? 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to process selected image');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double-clicking / rapid double saves
    if (isSaving) return;

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

    try {
      setIsSaving(true);
      setError('');
      await onSave({
        name: name.trim(),
        part_number: partNumber.trim() || null,
        price: numPrice,
        quantity: numQty,
        note: note.trim() || null,
        image_url: imageUrl.trim() || null,
      });
    } catch (err) {
      setError(err?.message || (lang === 'ml' ? 'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to save part'));
      setIsSaving(false);
    }
  };

  const hasExactMatch = suggestions.some(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-black tracking-tight truncate">
              {editingPart ? t.partModal.editTitle : t.partModal.addTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 rounded-xl text-slate-400 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          {/* Part Name with Autocomplete & Plus Icon */}
          <div className="relative" ref={autocompleteRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>
                {t.partModal.nameLabel} <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{lang === 'ml' ? 'ഓട്ടോകംപ്ലീറ്റ് ലഭ്യമാണ്' : 'Auto-suggest active'}</span>
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  disabled={isSaving}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t.partModal.namePlaceholder || 'Type or pick part (e.g. Engine Oil, Brake Shoe)'}
                  className="w-full text-sm sm:text-base px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-900 disabled:bg-slate-100 placeholder:font-normal placeholder:text-xs sm:placeholder:text-sm"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {/* Plus Button to add/confirm part */}
              <button
                type="button"
                onClick={handleConfirmCustomPart}
                disabled={isSaving || !name.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white font-black transition-all shadow-xs flex-shrink-0 cursor-pointer"
                title={lang === 'ml' ? 'ഈ പേര് ഉറപ്പിക്കുക / ചേർക്കുക' : 'Confirm / Add this part name'}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border-2 border-blue-500/30 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in duration-100 divide-y divide-slate-100">
                {/* Option to add custom typed name if not matching */}
                {name.trim() && !hasExactMatch && (
                  <button
                    type="button"
                    onClick={handleConfirmCustomPart}
                    className="w-full text-left p-2.5 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">
                        {t.partModal.addCustomPart || 'Add as custom part'}: <strong>"{name.trim()}"</strong>
                      </span>
                    </span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold flex-shrink-0">
                      {lang === 'ml' ? 'പുതിയത്' : 'Custom'}
                    </span>
                  </button>
                )}

                {/* Suggested Parts */}
                {suggestions.map((partItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(partItem)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 truncate">
                        {partItem.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        {partItem.category} {partItem.ml ? `• ${partItem.ml}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 bg-slate-100 group-hover:bg-blue-50 px-2 py-0.5 rounded flex-shrink-0">
                      + Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Part Number (Nullable / Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.partModal.partNumberLabel || 'Part Number / Code (Optional)'}</span>
            </label>
            <input
              type="text"
              disabled={isSaving}
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
              placeholder={t.partModal.partNumberPlaceholder || 'e.g. 24101-KTC-900, BOSCH-024'}
              className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 placeholder:font-sans placeholder:font-normal uppercase disabled:bg-slate-100"
            />
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {t.partModal.priceLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  ref={priceInputRef}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  disabled={isSaving}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full text-base font-black pl-7 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {t.partModal.qtyLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                required
                disabled={isSaving}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full text-base font-black px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Part Photo / Image Upload & View Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.partModal.imageLabel || 'Part Photo (Optional)'}</span>
              </span>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  disabled={isSaving}
                  className="text-[11px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  {t.partModal.removePhoto || 'Remove Photo'}
                </button>
              )}
            </label>

            {/* Photo attached preview card with VIEW FULL PHOTO option */}
            {imageUrl ? (
              <div className="p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  {/* Clickable thumbnail to view full image */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewImageOpen(true)}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 group cursor-pointer"
                    title={lang === 'ml' ? 'ഫോട്ടോ വലുതായി കാണുക' : 'Click to view full photo'}
                  >
                    <img
                      src={imageUrl}
                      alt="Part preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 truncate">
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'ml' ? 'ഫോട്ടോ ചേർത്തു' : 'Photo attached'}</span>
                    </div>

                    {/* Prominent VIEW FULL PHOTO Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPreviewImageOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.partModal.viewPhoto || 'View Photo'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-slate-600 hover:text-slate-900 font-bold hover:underline"
                      >
                        {t.partModal.changePhoto || 'Change'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving || isProcessingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isProcessingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>{lang === 'ml' ? 'പ്രോസസ്സ് ചെയ്യുന്നു...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{t.partModal.uploadPhoto || 'Take Photo / Upload'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Image URL Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                disabled={isSaving}
                value={imageUrl.startsWith('data:') ? '' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t.partModal.imageUrlPlaceholder || 'Or paste image link (http://...)'}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
              {imageUrl && !imageUrl.startsWith('data:') && (
                <button
                  type="button"
                  onClick={() => setIsPreviewImageOpen(true)}
                  className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  title={t.partModal.viewPhoto || 'View Photo'}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.partModal.noteLabel}
            </label>
            <input
              type="text"
              disabled={isSaving}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.partModal.notePlaceholder}
              className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-800 disabled:bg-slate-100"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 flex-shrink-0">
            {editingPart && onDelete ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onDelete(editingPart.id)}
                className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden xs:inline">{t.partModal.deletePart}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                {t.partModal.cancel}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t.partModal.saving || 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t.partModal.save}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Full-Size Uploaded Image Preview Modal */}
      {isPreviewImageOpen && imageUrl && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setIsPreviewImageOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <h4 className="text-sm font-black truncate">
                  {name || (lang === 'ml' ? 'ഫോട്ടോ പ്രിവ്യൂ' : 'Part Photo Preview')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewImageOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[260px] max-h-[65vh]">
              <img
                src={imageUrl}
                alt="Enlarged part view"
                className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain mx-auto shadow-md"
              />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setIsPreviewImageOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                {lang === 'ml' ? 'ശരി' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
