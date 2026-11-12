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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 py-2 safe-pb shadow-[0_-4px_25px_rgba(0,0,0,0.08)] no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {/* 1. HOME TAB */}
        <button
          onClick={() => onSelectSection('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
            isHome ? 'text-blue-700 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
          aria-label="Home"
        >
          <Home className={`w-6 h-6 transition-transform ${isHome ? 'scale-110 text-blue-600 stroke-[2.8]' : 'stroke-[2]'}`} />
          <span className="text-[11px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'ഹോം' : 'Home'}
          </span>
        </button>

        {/* 2. STOCK TAB */}
        <button
          onClick={() => onSelectSection('stock')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
            isStock ? 'text-blue-700 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
          aria-label="Stock"
        >
          <div className="relative">
            <Package className={`w-6 h-6 transition-transform ${isStock ? 'scale-110 text-blue-600 stroke-[2.8]' : 'stroke-[2]'}`} />
            {partsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight shadow-xs">
                {partsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'സ്റ്റോക്ക്' : 'Stock'}
          </span>
        </button>

        {/* 3. NEW BILL (CENTER HIGHLIGHTED TAB) */}
        <button
          onClick={() => onSelectSection('invoice')}
          className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
          aria-label="Create Invoice"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isInvoice
                ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-200 scale-105'
                : 'bg-emerald-600 text-white shadow-emerald-600/35 hover:bg-emerald-500'
            }`}
          >
            <PlusCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span
            className={`text-xs mt-0.5 font-black tracking-tight leading-tight ${
              isInvoice ? 'text-emerald-700' : 'text-slate-700'
            }`}
          >
            {lang === 'ml' ? '+ ബിൽ' : '+ Bill'}
          </span>
        </button>

        {/* 4. HISTORY TAB */}
        <button
          onClick={() => onSelectSection('history')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
            isHistory ? 'text-blue-700 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
          aria-label="Past Bills"
        >
          <div className="relative">
            <History className={`w-6 h-6 transition-transform ${isHistory ? 'scale-110 text-blue-600 stroke-[2.8]' : 'stroke-[2]'}`} />
            {invoicesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-slate-200 text-slate-800 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight">
                {invoicesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 leading-tight tracking-tight">
            {lang === 'ml' ? 'ബില്ലുകൾ' : 'Bills'}
          </span>
        </button>

        {/* 5. AI HELP TAB */}
        <button
          onClick={onOpenAIAssistant}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-2xl text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer active:scale-95"
          aria-label="AI Help"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-indigo-600 stroke-[2.4]" />
            <Sparkles className="w-3 h-3 text-amber-500 absolute -top-0.5 -right-1 animate-pulse" />
          </div>
          <span className="text-[11px] mt-0.5 font-black tracking-tight text-indigo-600 leading-tight">
            {lang === 'ml' ? 'AI സഹായം' : 'AI Help'}
          </span>
        </button>
      </div>
    </nav>
  );
}
