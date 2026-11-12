import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  X,
  ChevronRight,
  Edit2,
  Gauge,
  Trash2,
} from 'lucide-react';
import { formatDate } from '../services/invoiceService';

export default function InvoiceHistoryView({
  invoices,
  onBack,
  onSelectInvoice,
  onEditInvoice,
  onCancelInvoice,
  onDeleteInvoice,
  isLoading,
  t,
  lang,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = useMemo(() => {
    const cleanTerm = searchTerm.trim().toLowerCase();
    if (!cleanTerm) return invoices;
    const cleanSearchNoSpaces = cleanTerm.replace(/[\s-]/g, '');

    return invoices.filter((inv) => {
      const rawVehicle = (inv.vehicle_number || '').toLowerCase();
      const cleanVehicle = rawVehicle.replace(/[\s-]/g, '');
      const model = (inv.vehicle_model || '').toLowerCase();
      const invNum = (inv.invoice_number || '').toLowerCase();

      return (
        rawVehicle.includes(cleanTerm) ||
        cleanVehicle.includes(cleanSearchNoSpaces) ||
        model.includes(cleanTerm) ||
        invNum.includes(cleanTerm)
      );
    });
  }, [invoices, searchTerm]);

  const handleDeleteClick = async (e, invoiceId) => {
    e.stopPropagation();
    const msg = t.invoiceDetail?.deleteConfirm || (lang === 'ml' ? 'ഈ ബിൽ പൂർണ്ണമായി ഡിലീറ്റ് ചെയ്യണോ?' : 'Permanently delete this invoice?');
    if (window.confirm(msg)) {
      if (onDeleteInvoice) {
        await onDeleteInvoice(invoiceId);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4">
      {/* 1. TOP BAR */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
          title={t.history.back}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {t.history.title}
          </h2>
          <p className="text-[11px] text-slate-500 font-semibold">
            {invoices.length} {t.history.itemsLabel}
          </p>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'ml' ? 'വണ്ടി നമ്പർ, മോഡൽ നൽകി തിരയുക (ഉദാ: KL 07, 1234, Activa)...' : 'Search vehicle number, model, or bill no (e.g. KL 07, 1234, Activa)...'}
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-bold text-slate-900 placeholder-slate-400 shadow-xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            aria-label="Clear Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. INVOICE LIST */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mb-2" />
          <p className="text-slate-500 font-bold text-sm">{t.history.loading}</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">{t.history.noInvoices}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {t.history.noInvoicesDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredInvoices.map((inv) => {
            const isCancelled = inv.invoice_status === 'cancelled';
            const itemsCount = (inv.items || []).length;

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all cursor-pointer hover:shadow-md active:scale-99 flex items-center justify-between gap-3 ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/30 opacity-80'
                    : 'border-slate-200/90 hover:border-blue-400'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      #{inv.invoice_number}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(inv.date || inv.created_at)}
                    </span>
                    {isCancelled && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                        {lang === 'ml' ? 'റദ്ദാക്കി' : 'CANCELLED'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-slate-900 text-base sm:text-lg tracking-wider bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-300">
                      {(inv.vehicle_number || '').toUpperCase()}
                    </span>
                    {inv.vehicle_model && (
                      <span className="inline-flex items-center text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {inv.vehicle_model}
                      </span>
                    )}
                    {inv.km_reading && (
                      <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Gauge className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        {inv.km_reading.toUpperCase().includes('KM') ? inv.km_reading : `${inv.km_reading} KM`}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-bold mt-1">
                    {itemsCount} {t.history.itemsLabel}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-slate-400">Total</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700">
                      ₹{(parseFloat(inv.total_amount) || 0).toFixed(0)}
                    </div>
                  </div>

                  {!isCancelled && onEditInvoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditInvoice(inv);
                      }}
                      className="p-2 sm:p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      title={lang === 'ml' ? 'ബില്ലിൽ മാറ്റം വരുത്തുക' : 'Edit Bill'}
                      aria-label="Edit invoice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {onDeleteInvoice && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, inv.id)}
                      className="p-2 sm:p-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      title={lang === 'ml' ? 'ബിൽ ഡിലീറ്റ് ചെയ്യുക' : 'Delete Invoice'}
                      aria-label="Delete invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black">
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
