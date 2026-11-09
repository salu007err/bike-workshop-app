import React from 'react';
import { Home, Package, PlusCircle, History, Bot, Sparkles } from 'lucide-react';

export default function BottomNav({
  currentSection,
  onSelectSection,
  onOpenAIAssistant,
  partsCount = 0,
  invoicesCount = 0,
  t,
  lang,
}) {
  const isHome = currentSection === 'home';
  const isStock = currentSection === 'stock';
  const isInvoice = currentSection === 'invoice';
  const isHistory = currentSection === 'history';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 safe-pb shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {/* 1. HOME TAB */}
        <button
          onClick={() => onSelectSection('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isHome ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110 text-blue-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'ഹോം' : 'Home'}
          </span>
        </button>

        {/* 2. STOCK TAB */}
        <button
          onClick={() => onSelectSection('stock')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isStock ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-label="Stock"
        >
          <div className="relative">
            <Package className={`w-5 h-5 transition-transform ${isStock ? 'scale-110 text-blue-600 stroke-[2.5]' : ''}`} />
            {partsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-black px-1 rounded-full min-w-[14px] text-center leading-tight">
                {partsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'സ്റ്റോക്ക്' : 'Stock'}
          </span>
        </button>

        {/* 3. NEW BILL (CENTER HIGHLIGHTED TAB) */}
        <button
          onClick={() => onSelectSection('invoice')}
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
          aria-label="Create Invoice"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isInvoice
                ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-100 scale-105'
                : 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600'
            }`}
          >
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-black tracking-tight leading-tight ${
              isInvoice ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {lang === 'ml' ? '+ ബിൽ' : '+ Bill'}
          </span>
        </button>

        {/* 4. HISTORY TAB */}
        <button
          onClick={() => onSelectSection('history')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isHistory ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-label="Past Bills"
        >
          <div className="relative">
            <History className={`w-5 h-5 transition-transform ${isHistory ? 'scale-110 text-blue-600 stroke-[2.5]' : ''}`} />
            {invoicesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black px-1 rounded-full min-w-[14px] text-center leading-tight">
                {invoicesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'ബില്ലുകൾ' : 'Bills'}
          </span>
        </button>

        {/* 5. AI HELP TAB */}
        <button
          onClick={onOpenAIAssistant}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer active:scale-95"
          aria-label="AI Help"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-indigo-600 stroke-[2.2]" />
            <Sparkles className="w-2.5 h-2.5 text-amber-500 absolute -top-0.5 -right-1 animate-pulse" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-indigo-600 leading-tight">
            {lang === 'ml' ? 'AI സഹായം' : 'AI Help'}
          </span>
        </button>
      </div>
    </nav>
  );
}
