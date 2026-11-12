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
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm no-print select-none">
      <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Logo & Workshop Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
            <Wrench className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {workshopConfig.workshopName || 'BIKE WORKSHOP'}
              </h1>
              {/* Supabase Live Status Dot */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isSupabaseConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-500'
                }`}
                title={isSupabaseConnected ? 'Supabase Live Connected' : 'Offline / Connecting'}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate hidden xs:block leading-tight">
              {t.nav.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions (AI, Language, Settings) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* AI Quick Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 active:scale-95 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title={t.aiAgent.floatingBtn}
            aria-label="AI Help"
          >
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
            <span className="hidden xs:inline font-black text-[11px] sm:text-xs">AI</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 hidden sm:inline" />
          </button>

          {/* Language Switcher Pill - Prominent Emerald Button */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs border border-emerald-500 shadow-sm transition-all cursor-pointer"
            title={lang === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
            aria-label="Toggle Language"
          >
            <Globe className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span className="tracking-wide">
              {lang === 'en' ? 'മലയാളം' : 'ENGLISH'}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer shadow-xs"
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
