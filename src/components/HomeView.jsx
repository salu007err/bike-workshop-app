import React, { useState, useMemo } from 'react';
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
  Search,
  X,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '../services/invoiceService';
import { normalizeSearchText } from '../services/searchUtils';

export default function HomeView({
  onSelectSection,
  parts = [],
  invoices = [],
  onSelectInvoice,
  onOpenAddPart,
  t,
  lang,
}) {
  const [bikeSearchQuery, setBikeSearchQuery] = useState('');

  // Compute key workshop metrics
  const totalPartsCount = parts.length;
  const totalStockUnits = useMemo(() => {
    return parts.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
  }, [parts]);

  const totalStockWorth = useMemo(() => {
    return parts.reduce((sum, p) => {
      const qty = parseInt(p.quantity, 10) || 0;
      const price = parseFloat(p.price) || 0;
      return sum + qty * price;
    }, 0);
  }, [parts]);

  const lowStockParts = useMemo(() => {
    return parts.filter((p) => {
      const qty = parseInt(p.quantity, 10) || 0;
      return qty > 0 && qty <= 3;
    });
  }, [parts]);

  const outOfStockParts = useMemo(() => {
    return parts.filter((p) => (parseInt(p.quantity, 10) || 0) <= 0);
  }, [parts]);

  // Instant bike search filter across past bills
  const searchedInvoices = useMemo(() => {
    if (!bikeSearchQuery.trim()) return [];
    const query = normalizeSearchText(bikeSearchQuery).replace(/\s+/g, '');
    return invoices.filter((inv) => {
      const vNum = normalizeSearchText(inv.vehicle_number || '').replace(/\s+/g, '');
      const vModel = normalizeSearchText(inv.vehicle_model || '');
      const iNum = String(inv.invoice_number || '');
      return vNum.includes(query) || vModel.includes(query) || iNum.includes(query);
    });
  }, [invoices, bikeSearchQuery]);

  const recentInvoices = invoices.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 select-none">
      {/* 1. HERO INVENTORY VALUATION & WORKSHOP SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-4 sm:p-6 border border-slate-800 shadow-lg">
        {/* Decorative background glow circles */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <Coins className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span>{t.home.stockWorth || (lang === 'ml' ? 'സ്റ്റോക്ക് മൂല്യം' : 'Total Stock Worth')}</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight font-sans drop-shadow-sm">
                ₹{totalStockWorth.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              {lang === 'ml'
                ? `കടയിൽ ആകെ ${totalStockUnits.toLocaleString('en-IN')} യൂണിറ്റ് പാർട്സുകൾ സ്റ്റോക്കുണ്ട്`
                : `Total valuation of ${totalStockUnits.toLocaleString('en-IN')} spare parts currently on shelf`}
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 flex-shrink-0 flex-wrap">
            <button
              onClick={() => onSelectSection('stock')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/10 text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="text-[10px] uppercase font-bold text-slate-300">
                {lang === 'ml' ? 'പാർട്സുകൾ' : 'Part Types'}
              </div>
              <div className="text-lg font-black text-white flex items-center gap-1">
                <Package className="w-4 h-4 text-blue-300" />
                <span>{totalPartsCount}</span>
              </div>
            </button>

            <button
              onClick={() => onSelectSection('history')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/10 text-left transition-all active:scale-95 cursor-pointer"
            >
              <div className="text-[10px] uppercase font-bold text-slate-300">
                {lang === 'ml' ? 'ആകെ ബില്ലുകൾ' : 'Total Bills'}
              </div>
              <div className="text-lg font-black text-white flex items-center gap-1">
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>{invoices.length}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE 2 PRIMARY ACTION BUTTONS (MASSIVE, VIBRANT & EASY TO TAP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* BUTTON 1: MAKE NEW BILL (PRIMARY GREEN) */}
        <div
          onClick={() => onSelectSection('invoice')}
          className="group relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between overflow-hidden border-2 border-emerald-400"
        >
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
              <span className="text-xs uppercase font-black tracking-wider bg-white/25 text-white px-3 py-1 rounded-full border border-white/30 flex items-center gap-1">
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{lang === 'ml' ? 'വേഗത്തിൽ' : '1-Minute'}</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 leading-tight">
              {lang === 'ml' ? 'പുതിയ ബിൽ അടിക്കുക' : 'Make New Bill'}
            </h3>
            <p className="text-emerald-100 text-sm font-medium leading-relaxed">
              {lang === 'ml'
                ? 'വണ്ടി നമ്പർ നൽകി പാർട്സുകളും പണികളും ചേർത്ത ഉടൻ ബിൽ ഉണ്ടാക്കാം'
                : 'Enter bike number, pick parts & services, share on WhatsApp'}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center justify-between">
            <span className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <span>{lang === 'ml' ? 'ബിൽ തുടങ്ങുക' : 'Start Bill'}</span>
            </span>
            <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-md group-hover:translate-x-1.5 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* BUTTON 2: STOCK MANAGEMENT (PRIMARY BLUE) */}
        <div
          onClick={() => onSelectSection('stock')}
          className="group relative bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between overflow-hidden border-2 border-blue-400"
        >
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Package className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
              <span className="text-xs uppercase font-black tracking-wider bg-white/25 text-white px-3 py-1 rounded-full border border-white/30 flex items-center gap-1">
                <span>{totalPartsCount} {lang === 'ml' ? 'പാർട്സുകൾ' : 'Items'}</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 leading-tight">
              {lang === 'ml' ? 'പാർട്സ് സ്റ്റോക്ക്' : 'Parts & Stock'}
            </h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              {lang === 'ml'
                ? 'സ്പെയർ പാർട്സുകൾ, വില, ഫോട്ടോ, സ്റ്റോക്ക് അളവ് എന്നിവ കാണാനും മാറ്റാനും'
                : 'Check available parts, add received stock & view photos'}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center justify-between">
            <span className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <span>{lang === 'ml' ? 'സ്റ്റോക്ക് തുറക്കുക' : 'Open Stock'}</span>
            </span>
            <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md group-hover:translate-x-1.5 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOW STOCK WARNING ALERT (IF ANY LOW OR OUT OF STOCK) */}
      {(outOfStockParts.length > 0 || lowStockParts.length > 0) && (
        <div
          onClick={() => onSelectSection('stock')}
          className="bg-amber-500/10 hover:bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 text-amber-950 cursor-pointer active:scale-99 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-black text-amber-950 leading-tight">
                {lang === 'ml' ? 'സ്റ്റോക്ക് കുറവുള്ള പാർട്സുകൾ ശ്രദ്ധിക്കുക!' : 'Low Stock Warning!'}
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 font-semibold mt-0.5 leading-tight">
                {outOfStockParts.length > 0
                  ? `${outOfStockParts.length} ${lang === 'ml' ? 'ഇനങ്ങൾ തീർന്നു' : 'items out of stock'}${
                      lowStockParts.length > 0 ? `, ${lowStockParts.length} ${lang === 'ml' ? 'ഇനങ്ങൾ കുറവ്' : 'low stock'}` : ''
                    }`
                  : `${lowStockParts.length} ${lang === 'ml' ? 'ഇനങ്ങൾ കുറവാണ്' : 'items running low'}`}
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs sm:text-sm flex-shrink-0 shadow-xs">
            {lang === 'ml' ? 'കാണുക →' : 'View →'}
          </div>
        </div>
      )}

      {/* 4. QUICK VEHICLE BILL SEARCH (MECHANIC'S MOST FREQUENT TASK) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span>{t.home.quickSearchLabel || (lang === 'ml' ? 'വണ്ടി നമ്പർ നൽകി ബിൽ തിരയുക' : 'Search Bill by Bike Number')}</span>
          </label>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={bikeSearchQuery}
            onChange={(e) => setBikeSearchQuery(e.target.value.toUpperCase())}
            placeholder={
              t.home.quickSearchPlaceholder ||
              (lang === 'ml'
                ? 'വണ്ടി നമ്പർ അടിക്കുക (ഉദാ: KL 07 CD 1234)...'
                : 'Type bike number (e.g. KL 07 CD 1234)...')
            }
            className="w-full text-base sm:text-lg font-black uppercase tracking-wider pl-11 pr-10 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-300 placeholder:normal-case placeholder:font-normal"
          />
          {bikeSearchQuery && (
            <button
              onClick={() => setBikeSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Clear Search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Search Results */}
        {bikeSearchQuery.trim() && (
          <div className="pt-2 border-t border-slate-100">
            {searchedInvoices.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-sm font-bold">
                {lang === 'ml'
                  ? `"${bikeSearchQuery}" നമ്പറിലുള്ള ബില്ലുകൾ ഒന്നും കണ്ടില്ല.`
                  : `No bills match "${bikeSearchQuery}".`}
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {searchedInvoices.length} {lang === 'ml' ? 'ബില്ലുകൾ കണ്ടെത്തി:' : 'matching bills found:'}
                </span>
                {searchedInvoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-99"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-base sm:text-lg tracking-wide">
                          {inv.vehicle_number}
                        </span>
                        {inv.vehicle_model && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                            {inv.vehicle_model}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        #{inv.invoice_number} • {formatDate(inv.date || inv.created_at)}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black text-emerald-700">
                        ₹{(parseFloat(inv.total_amount) || 0).toFixed(0)}
                      </div>
                      <span className="text-[11px] text-blue-600 font-bold">
                        {lang === 'ml' ? 'തുറക്കുക →' : 'View Bill →'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. RECENT BILLS SECTION */}
      {recentInvoices.length > 0 && !bikeSearchQuery.trim() && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h4 className="text-sm sm:text-base font-black text-slate-800">
                {lang === 'ml' ? 'സമീപകാല ബില്ലുകൾ' : 'Recent Bills'}
              </h4>
            </div>
            <button
              onClick={() => onSelectSection('history')}
              className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {lang === 'ml' ? 'എല്ലാം കാണുക →' : 'View All →'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-2xl transition-colors cursor-pointer active:scale-99"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm sm:text-base tracking-wide">
                      {(inv.vehicle_number || '').toUpperCase()}
                    </span>
                    {inv.vehicle_model && (
                      <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                        {inv.vehicle_model}
                      </span>
                    )}
                    {inv.km_reading && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        <Gauge className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        {inv.km_reading.toUpperCase().includes('KM') ? inv.km_reading : `${inv.km_reading} KM`}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    #{inv.invoice_number} • {formatDate(inv.date || inv.created_at)}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    ₹{(parseFloat(inv.total_amount) || 0).toFixed(0)}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold">
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
