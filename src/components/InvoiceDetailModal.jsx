import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  FileText,
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
  onCreateNew,
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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
      const res = await shareInvoiceOnWhatsApp(invoice, workshopName, phone);
      if (res && res.sharedViaFile) {
        setShareFeedback('Invoice shared via device share sheet!');
      } else {
        setShareFeedback('WhatsApp opened with invoice details! PDF also downloaded.');
      }
      setTimeout(() => setShareFeedback(null), 6000);
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setIsSharing(false);
      setShowPhonePrompt(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this invoice?\n\nAll deducted spare parts will be restored back to stock!'
      )
    ) {
      setIsCancelling(true);
      await onCancelInvoice(invoice.id);
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">
              Invoice #{invoice.invoice_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Share / Feedback Notification */}
        {shareFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-emerald-800 text-sm font-semibold flex items-center gap-2 no-print">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Action Buttons Header (Prominent, High-Contrast) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 no-print">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Download PDF */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>

            {/* Print Invoice */}
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-5 h-5" />
              <span>Print Invoice</span>
            </button>

            {/* Share on WhatsApp */}
            <button
              onClick={() => setShowPhonePrompt(!showPhonePrompt)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>WhatsApp Share</span>
            </button>
          </div>

          {/* WhatsApp Direct Phone Prompt (Optional) */}
          {showPhonePrompt && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1">
                Send to Customer Phone (Optional 10-digit number):
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength="10"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210 (or leave empty to pick contact)"
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white"
                />
                <button
                  onClick={() => handleWhatsAppClick(whatsappPhone)}
                  disabled={isSharing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl"
                >
                  {isSharing ? 'Opening...' : 'Open WhatsApp'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                Free WhatsApp Click-to-Chat. Opens WhatsApp with bill text and automatically prepares PDF.
              </p>
            </div>
          )}
        </div>

        {/* Printable Invoice Card Area */}
        <div id="printable-invoice" className="p-6 md:p-8 bg-white space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-wide">
                {(workshopName || 'BIKE WORKSHOP').toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Two-Wheeler Service & Spare Parts
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-slate-500">INVOICE</div>
              <div className="text-lg font-black text-slate-900">{invoice.invoice_number}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                Date: {formatDate(invoice.date || invoice.created_at)}
              </div>
            </div>
          </div>

          {/* Vehicle Banner */}
          <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between border border-slate-200">
            <div>
              <div className="text-xs font-bold uppercase text-slate-500">Vehicle Registration No.</div>
              <div className="text-2xl font-black text-slate-900 tracking-wider mt-0.5">
                {(invoice.vehicle_number || '').toUpperCase()}
              </div>
            </div>
            {isCancelled && (
              <span className="px-3 py-1 bg-red-100 text-red-700 font-extrabold text-sm rounded-xl border border-red-300">
                CANCELLED
              </span>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-xs uppercase font-extrabold text-slate-700">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {(invoice.items || []).map((item, idx) => {
                  const qty = parseInt(item.quantity, 10) || 1;
                  const price = parseFloat(item.price) || 0;
                  const lineTotal = (qty * price).toFixed(0);

                  return (
                    <tr key={idx} className="font-medium text-slate-800">
                      <td className="py-3 px-2 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{item.description}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                            item.item_type === 'part'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.item_type === 'part' ? 'Part' : 'Work'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{qty}</td>
                      <td className="py-3 px-3 text-right">₹{price.toFixed(0)}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">₹{lineTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Amount Box */}
          <div className="border-t-2 border-slate-900 pt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500 font-bold">
              Total Items: {(invoice.items || []).length}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-500 mr-3">TOTAL:</span>
              <span className="text-3xl font-black text-slate-900">
                ₹{(parseFloat(invoice.total_amount) || 0).toFixed(0)}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 italic">
            Thank you for visiting! Ride safely.
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          {!isCancelled && onCancelInvoice ? (
            <button
              onClick={handleCancelInvoice}
              disabled={isCancelling}
              className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50"
              title="Cancel bill and restore parts back to stock"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel Invoice (Restore Stock)</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Another Bill</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
