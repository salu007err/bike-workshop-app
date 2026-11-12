import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  FileText,
  Calendar,
  Edit2,
  Gauge,
  Trash2,
} from 'lucide-react';
import {
  downloadInvoicePDF,
  shareInvoiceOnWhatsApp,
  formatDate,
} from '../services/invoiceService';

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  workshopName,
  onCancelInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onCreateNew,
  lang,
  t,
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !invoice) return null;

  const isCancelled = invoice.invoice_status === 'cancelled';

  const handleDownload = () => {
    downloadInvoicePDF(invoice, workshopName);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppClick = async (phone = '') => {
    setIsSharing(true);
    try {
      const res = await shareInvoiceOnWhatsApp(invoice, workshopName, phone, lang);
      if (res && res.sharedViaFile) {
        setShareFeedback(lang === 'ml' ? 'ബിൽ ഷെയർ ചെയ്തു!' : 'Invoice shared!');
      } else {
        setShareFeedback(
          lang === 'ml'
            ? 'വാട്സാപ്പ് തുറന്നു! PDF ഡൗൺലോഡ് ചെയ്യപ്പെട്ടു.'
            : 'WhatsApp opened with bill details! PDF downloaded.'
        );
      }
      setTimeout(() => setShareFeedback(null), 5000);
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setIsSharing(false);
      setShowPhonePrompt(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (window.confirm(t.invoiceDetail.cancelConfirm)) {
      setIsCancelling(true);
      await onCancelInvoice(invoice.id);
      setIsCancelling(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (window.confirm(t.invoiceDetail.deleteConfirm)) {
      setIsDeleting(true);
      if (onDeleteInvoice) {
        await onDeleteInvoice(invoice.id);
      }
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
        {/* 1. MODAL TOP BAR */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold">
              {t.invoiceDetail.invoiceNo}: #{invoice.invoice_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Feedback Toast */}
        {shareFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-emerald-800 text-xs font-semibold flex items-center gap-2 no-print flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* 2. QUICK ACTIONS BAR (MOBILE POLISHED & HIGH IMPACT) */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 no-print flex-shrink-0 space-y-2.5">
          {/* Big WhatsApp Action Button */}
          <button
            onClick={() => setShowPhonePrompt(!showPhonePrompt)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm sm:text-base shadow-md shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5 stroke-[2.5] flex-shrink-0" />
            <span>{lang === 'ml' ? 'വാട്സാപ്പിൽ അയക്കുക (WhatsApp Share)' : 'Share on WhatsApp'}</span>
          </button>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Download PDF (Blue) */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>{lang === 'ml' ? 'ഡൗൺലോഡ്' : 'PDF'}</span>
            </button>

            {/* Print Button (Dark) */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 flex-shrink-0" />
              <span>{lang === 'ml' ? 'പ്രിന്റ്' : 'Print'}</span>
            </button>

            {/* Edit Invoice Button (Amber) */}
            {!isCancelled && onEditInvoice ? (
              <button
                onClick={() => onEditInvoice(invoice)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                title={t.invoiceDetail.editInvoice}
              >
                <Edit2 className="w-4 h-4 flex-shrink-0" />
                <span>{lang === 'ml' ? 'മാറ്റുക' : 'Edit'}</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Optional Phone Number Prompt for Direct WhatsApp Click-to-Chat */}
          {showPhonePrompt && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
              <label className="block text-[11px] font-bold text-emerald-900 uppercase">
                {t.invoiceDetail.phonePrompt}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="tel"
                  inputMode="tel"
                  maxLength="10"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.invoiceDetail.phonePlaceholder}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white"
                />
                <button
                  onClick={() => handleWhatsAppClick(whatsappPhone)}
                  disabled={isSharing}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  {isSharing ? '...' : t.invoiceDetail.openWhatsapp}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE BILL PREVIEW (RESPONSIVE) */}
        <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide">
                {(workshopName || 'BIKE WORKSHOP').toUpperCase()}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {t.invoiceDetail.billTitle}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-slate-900">#{invoice.invoice_number}</div>
              <div className="text-[11px] text-slate-400 font-medium">
                {formatDate(invoice.date || invoice.created_at)}
              </div>
            </div>
          </div>

          {/* Vehicle Number & KM Reading Banner */}
          <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {t.invoiceDetail.vehicleNo}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-black text-slate-900 tracking-wider">
                  {(invoice.vehicle_number || '').toUpperCase()}
                </span>
                {invoice.vehicle_model && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-black">
                    {invoice.vehicle_model}
                  </span>
                )}
              </div>
              {invoice.km_reading && (
                <div className="text-xs font-bold text-blue-700 flex items-center gap-1 mt-0.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    {invoice.km_reading.toUpperCase().includes('KM')
                      ? invoice.km_reading
                      : `${invoice.km_reading} KM`}
                  </span>
                </div>
              )}
            </div>
            {isCancelled && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-black text-xs rounded-md border border-red-200">
                {t.invoiceDetail.cancelled}
              </span>
            )}
          </div>

          {/* Items List (Responsive Cards for mobile, clean for print) */}
          <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
            {(invoice.items || []).map((item, idx) => {
              const qty = parseInt(item.quantity, 10) || 1;
              const price = parseFloat(item.price) || 0;
              const lineTotal = (qty * price).toFixed(0);

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                      {idx + 1}. {item.description}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
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
                        {qty} × ₹{price.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      ₹{lineAmount(qty, price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Amount Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between">
            <div className="text-xs text-slate-300 font-bold">
              {t.invoiceDetail.total} ({(invoice.items || []).length} {t.createInvoice.currentItems})
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ₹{(parseFloat(invoice.total_amount) || 0).toFixed(0)}
            </div>
          </div>
        </div>

        {/* 4. MODAL BOTTOM FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2 no-print flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {!isCancelled && onCancelInvoice && (
              <button
                onClick={handleCancelInvoice}
                disabled={isCancelling || isDeleting}
                className="text-amber-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 py-1.5 px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 active:scale-95 transition-all cursor-pointer"
                title="Cancel bill"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}</span>
              </button>
            )}

            {onDeleteInvoice && (
              <button
                onClick={handleDeleteInvoice}
                disabled={isDeleting || isCancelling}
                className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 py-1.5 px-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/80 active:scale-95 transition-all cursor-pointer"
                title={lang === 'ml' ? 'ബിൽ ഡിലീറ്റ് ചെയ്യുക' : 'Delete bill permanently'}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>{lang === 'ml' ? 'ഡിലീറ്റ്' : 'Delete'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCancelled && onEditInvoice && (
              <button
                onClick={() => onEditInvoice(invoice)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{lang === 'ml' ? 'മാറ്റം വരുത്തുക' : 'Edit Bill'}</span>
              </button>
            )}

            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.invoiceDetail.createAnother}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs cursor-pointer"
            >
              {t.invoiceDetail.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function lineAmount(q, p) {
    return (q * p).toFixed(0);
  }
}
