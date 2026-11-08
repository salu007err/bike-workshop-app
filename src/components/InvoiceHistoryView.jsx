import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Eye,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../services/invoiceService';

export default function InvoiceHistoryView({
  invoices,
  onBack,
  onSelectInvoice,
  onCancelInvoice,
  isLoading,
  t,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const vehicleMatch = (inv.vehicle_number || '').toLowerCase().includes(term);
    const numMatch = (inv.invoice_number || '').toLowerCase().includes(term);
    return vehicleMatch || numMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
          <span>{t.history.back}</span>
        </button>
      </div>

      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 mb-6">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-8 h-8 text-emerald-600" />
            <span>{t.history.title}</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {t.history.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-base font-semibold text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-lg"
            >
              {t.history.clear}
            </button>
          )}
        </div>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
          <p className="text-slate-600 font-semibold">{t.history.loading}</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-800">{t.history.noInvoices}</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {t.history.noInvoicesDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => {
            const isCancelled = inv.invoice_status === 'cancelled';
            const itemsCount = (inv.items || []).length;

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className={`bg-white rounded-2xl p-4 md:p-5 border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/20 opacity-80'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      {inv.invoice_number}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(inv.date || inv.created_at)}
                    </span>
                    {isCancelled && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-red-100 text-red-700">
                        {t.history.cancelledBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 tracking-wide">
                    {(inv.vehicle_number || '').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {itemsCount} {t.history.itemsLabel}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase">Amount</div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{(parseFloat(inv.total_amount) || 0).toFixed(0)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInvoice(inv);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t.history.viewBill}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
