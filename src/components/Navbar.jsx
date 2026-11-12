import React from 'react';
import { Wrench, Settings, Globe, Bot, Sparkles } from 'lucide-react';

export default function Navbar({
  workshopConfig,
  onOpenSettings,
  onOpenAIAssistant,
  isSupabaseConnected,
  lang,
  onToggleLanguage,
  t,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-900 border-b-2 border-slate-200/90 shadow-xs no-print select-none">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Garage Icon & Workshop Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-slate-900 truncate">
                {workshopConfig.workshopName || (lang === 'ml' ? 'ബൈക്ക് വർക്ക്ഷോപ്പ്' : 'BIKE WORKSHOP')}
              </h1>
              {/* Online Cloud Status Indicator */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                  isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title={isSupabaseConnected ? 'Live Cloud Connected' : 'Offline / Local'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isSupabaseConnected ? (lang === 'ml' ? 'ഓൺലൈൻ' : 'Live') : (lang === 'ml' ? 'ഓഫ്‌ലൈൻ' : 'Offline')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold truncate hidden xs:block mt-0.5">
              {lang === 'ml' ? 'ടു-വീലർ സർവീസ് & സ്പെയർ പാർട്സ്' : 'Two-Wheeler Service & Spares'}
            </p>
          </div>
        </div>

        {/* Right: Actions (Language, AI, Settings) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* AI Quick Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 active:scale-95 text-xs font-black transition-all cursor-pointer shadow-2xs"
            title={t.aiAgent.floatingBtn}
            aria-label="AI Help"
          >
            <Bot className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="hidden xs:inline">AI</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>

          {/* Language Switcher Pill - Extra Prominent & High Contrast */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
            title={lang === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
            aria-label="Toggle Language"
          >
            <Globe className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span className="tracking-wide text-xs">
              {lang === 'en' ? 'മലയാളം' : 'ENGLISH'}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title={t.nav.settings}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
