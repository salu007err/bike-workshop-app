import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  X,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { formatDate } from '../services/invoiceService';

export default function InvoiceHistoryView({
  invoices,
  onBack,
  onSelectInvoice,
  onEditInvoice,
  onCancelInvoice,
  isLoading,
  t,
  lang,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const vehicleMatch = (inv.vehicle_number || '').toLowerCase().includes(term);
    const numMatch = (inv.invoice_number || '').toLowerCase().includes(term);
    return vehicleMatch || numMatch;
  });

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
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.history.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-xs"
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
                className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer hover:shadow-xs active:scale-99 flex items-center justify-between gap-3 ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/20 opacity-80'
                    : 'border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      #{inv.invoice_number}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {formatDate(inv.date || inv.created_at)}
                    </span>
                    {isCancelled && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                        {lang === 'ml' ? 'റദ്ദാക്കി' : 'CANCELLED'}
                      </span>
                    )}
                  </div>

                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-wide truncate">
                    {(inv.vehicle_number || '').toUpperCase()}
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    {itemsCount} {t.history.itemsLabel}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900">
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
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
                      title={lang === 'ml' ? 'ബില്ലിൽ മാറ്റം വരുത്തുക' : 'Edit Bill'}
                      aria-label="Edit invoice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
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
