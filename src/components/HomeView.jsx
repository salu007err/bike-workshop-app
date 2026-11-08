import React from 'react';
import { Package, FileText, ArrowRight } from 'lucide-react';

export default function HomeView({ onSelectSection, t }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          {t.home.title}
        </h2>
        <p className="text-slate-500 text-base md:text-lg mt-2 font-medium">
          {t.home.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* BUTTON 1: STOCK */}
        <button
          onClick={() => onSelectSection('stock')}
          className="group relative bg-white hover:bg-blue-50 active:scale-98 border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Package className="w-10 h-10" />
          </div>
          <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-wide mb-2">
            {t.home.stockBtn}
          </span>
          <span className="text-slate-500 text-sm md:text-base font-medium">
            {t.home.stockDesc}
          </span>
          <div className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold text-sm md:text-base group-hover:translate-x-1 transition-transform">
            <span>{t.home.openStock}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>

        {/* BUTTON 2: CREATE INVOICE */}
        <button
          onClick={() => onSelectSection('invoice')}
          className="group relative bg-white hover:bg-emerald-50 active:scale-98 border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <FileText className="w-10 h-10" />
          </div>
          <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-wide mb-2">
            {t.home.invoiceBtn}
          </span>
          <span className="text-slate-500 text-sm md:text-base font-medium">
            {t.home.invoiceDesc}
          </span>
          <div className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm md:text-base group-hover:translate-x-1 transition-transform">
            <span>{t.home.startInvoice}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
}
