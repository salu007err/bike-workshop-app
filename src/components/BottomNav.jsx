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

  const TabBtn = ({ active, onClick, icon, label, badge, color = 'blue' }) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      emerald: 'text-emerald-600 bg-emerald-50',
      indigo: 'text-indigo-600 bg-indigo-50',
    };
    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[52px] ${
          active ? colorMap[color] + ' font-black' : 'text-slate-400 font-bold'
        }`}
        aria-label={label}
      >
        <div className="relative">
          {icon}
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none shadow-xs">
              {badge}
            </span>
          )}
        </div>
        <span className={`text-[11px] mt-0.5 leading-tight tracking-tight ${active ? '' : 'text-slate-400'}`}>
          {label}
        </span>
        {active && (
          <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full ${color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
        )}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 safe-pb shadow-[0_-4px_20px_rgba(0,0,0,0.07)] no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around gap-0.5">
        {/* HOME */}
        <TabBtn
          active={isHome}
          onClick={() => onSelectSection('home')}
          icon={<Home className={`w-6 h-6 transition-transform ${isHome ? 'scale-110 stroke-[2.8]' : 'stroke-[2]'}`} />}
          label={lang === 'ml' ? 'ഹോം' : 'Home'}
          color="blue"
        />

        {/* STOCK */}
        <TabBtn
          active={isStock}
          onClick={() => onSelectSection('stock')}
          icon={<Package className={`w-6 h-6 transition-transform ${isStock ? 'scale-110 stroke-[2.8]' : 'stroke-[2]'}`} />}
          label={lang === 'ml' ? 'സ്റ്റോക്ക്' : 'Stock'}
          badge={partsCount}
          color="blue"
        />

        {/* CENTER: NEW BILL */}
        <button
          onClick={() => onSelectSection('invoice')}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          aria-label="Create Invoice"
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isInvoice
                ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-200 scale-105'
                : 'bg-emerald-600 text-white shadow-emerald-600/35 hover:bg-emerald-500'
            }`}
          >
            <PlusCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span
            className={`text-xs mt-1 font-black tracking-tight leading-tight ${
              isInvoice ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {lang === 'ml' ? '+ ബിൽ' : '+ Bill'}
          </span>
        </button>

        {/* HISTORY */}
        <TabBtn
          active={isHistory}
          onClick={() => onSelectSection('history')}
          icon={<History className={`w-6 h-6 transition-transform ${isHistory ? 'scale-110 stroke-[2.8]' : 'stroke-[2]'}`} />}
          label={lang === 'ml' ? 'ബില്ലുകൾ' : 'Bills'}
          badge={invoicesCount > 0 ? invoicesCount : 0}
          color="blue"
        />

        {/* AI HELP */}
        <button
          onClick={onOpenAIAssistant}
          className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-indigo-600 transition-all cursor-pointer active:scale-95 min-w-[52px]"
          aria-label="AI Help"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-indigo-500 stroke-[2.4]" />
            <Sparkles className="w-3 h-3 text-amber-500 absolute -top-1 -right-1.5 animate-pulse" />
          </div>
          <span className="text-[11px] mt-0.5 font-black tracking-tight text-indigo-600 leading-tight">
            {lang === 'ml' ? 'AI' : 'AI Help'}
          </span>
        </button>
      </div>
    </nav>
  );
}
