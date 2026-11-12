import React from 'react';
import {
  Package,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Clock,
  Sparkles,
  Gauge,
  Coins,
} from 'lucide-react';
import { formatDate } from '../services/invoiceService';

export default function HomeView({
  onSelectSection,
  parts = [],
  invoices = [],
  onSelectInvoice,
  onOpenAddPart,
  t,
  lang,
}) {
  // Compute key workshop metrics
  const totalPartsCount = parts.length;
  const totalStockUnits = parts.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
  const totalStockWorth = parts.reduce((sum, p) => {
    const qty = parseInt(p.quantity, 10) || 0;
    const price = parseFloat(p.price) || 0;
    return sum + (qty * price);
  }, 0);

  const lowStockParts = parts.filter((p) => {
    const qty = parseInt(p.quantity, 10) || 0;
    return qty > 0 && qty <= 3;
  });
  const outOfStockParts = parts.filter((p) => (parseInt(p.quantity, 10) || 0) <= 0);
  const recentInvoices = invoices.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. QUICK STATS SUMMARY CHIPS (MOBILE OPTIMIZED 4-CARD GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Stock Worth (Hero Financial Metric) */}
        <button
          onClick={() => onSelectSection('stock')}
          className="bg-gradient-to-br from-emerald-500/10 via-white to-white p-3 rounded-2xl border border-emerald-200/90 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all text-left cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-emerald-800 truncate">
              {t.home.stockWorth || (lang === 'ml' ? 'സ്റ്റോക്ക് മൂല്യം' : 'Stock Worth')}
            </span>
            <Coins className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 leading-tight">
            ₹{totalStockWorth.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-800 font-semibold truncate mt-0.5">
            {totalStockUnits.toLocaleString('en-IN')} {lang === 'ml' ? 'യൂണിറ്റ് സ്റ്റോക്ക്' : 'units in stock'}
          </div>
        </button>

        {/* Total Part Types */}
        <button
          onClick={() => onSelectSection('stock')}
          className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all text-left cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 truncate">
              {lang === 'ml' ? 'പാർട്സുകൾ' : 'Part Types'}
            </span>
            <Package className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {totalPartsCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {lang === 'ml' ? 'ലഭ്യമായ ഇനങ്ങൾ' : 'Items listed'}
          </div>
        </button>

        {/* Low Stock Warning */}
        <button
          onClick={() => onSelectSection('stock')}
          className={`p-3 rounded-2xl border shadow-xs transition-all text-left cursor-pointer active:scale-98 ${
            outOfStockParts.length > 0 || lowStockParts.length > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-amber-700 truncate">
              {lang === 'ml' ? 'കുറഞ്ഞവ' : 'Low Stock'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800 leading-tight">
            {lowStockParts.length + outOfStockParts.length}
          </div>
          <div className="text-[10px] text-amber-700 font-medium truncate mt-0.5">
            {outOfStockParts.length > 0
              ? `${outOfStockParts.length} ${lang === 'ml' ? 'തീർന്നു' : 'out of stock'}`
              : lang === 'ml' ? 'സ്റ്റോക്ക് കുറവ്' : 'Need reorder'}
          </div>
        </button>

        {/* Total Invoices */}
        <button
          onClick={() => onSelectSection('history')}
          className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all text-left cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 truncate">
              {lang === 'ml' ? 'ബില്ലുകൾ' : 'Bills'}
            </span>
            <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {invoices.length}
          </div>
          <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {lang === 'ml' ? 'തയ്യാറാക്കിയവ' : 'Total created'}
          </div>
        </button>
      </div>

      {/* 2. PRIMARY ACTION CARDS: FIRST STOCK, THEN BILL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* CARD 1: STOCK MANAGEMENT (FIRST) */}
        <div
          onClick={() => onSelectSection('stock')}
          className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between overflow-hidden border border-blue-500"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Package className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest bg-blue-400/30 text-blue-100 px-2.5 py-1 rounded-full border border-blue-300/30 flex items-center gap-1">
                <span>{totalPartsCount} {lang === 'ml' ? 'പാർട്സ്' : 'Parts'}</span>
                <span>•</span>
                <span className="text-emerald-300 font-extrabold">₹{totalStockWorth.toLocaleString('en-IN')}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
              {t.home.stockBtn}
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed">
              {t.home.stockDesc}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>{t.home.openStock}</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* CARD 2: CREATE INVOICE / BILL (SECOND) */}
        <div
          onClick={() => onSelectSection('invoice')}
          className="group relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between overflow-hidden border border-emerald-500"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <FileText className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-400/30 text-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300/30">
                {lang === 'ml' ? '+ പുതിയ ബിൽ' : '+ New Bill'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
              {t.home.invoiceBtn}
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
              {t.home.invoiceDesc}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>{t.home.startInvoice}</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT INVOICES SECTION (QUICK ACCESS FOR MECHANICS) */}
      {recentInvoices.length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700">
                {lang === 'ml' ? 'സമീപകാല ബില്ലുകൾ' : 'Recent Bills'}
              </h4>
            </div>
            <button
              onClick={() => onSelectSection('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {lang === 'ml' ? 'എല്ലാം കാണുക →' : 'View All →'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-1 rounded-xl transition-colors cursor-pointer active:scale-99"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-slate-900 text-sm tracking-wide truncate">
                      {(inv.vehicle_number || '').toUpperCase()}
                    </span>
                    {inv.vehicle_model && (
                      <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {inv.vehicle_model}
                      </span>
                    )}
                    {inv.km_reading && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Gauge className="w-2.5 h-2.5 text-indigo-500 flex-shrink-0" />
                        {inv.km_reading.toUpperCase().includes('KM') ? inv.km_reading : `${inv.km_reading} KM`}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    #{inv.invoice_number} • {formatDate(inv.date || inv.created_at)}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div className="text-base font-black text-slate-900">
                    ₹{(parseFloat(inv.total_amount) || 0).toFixed(0)}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                    ›
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
