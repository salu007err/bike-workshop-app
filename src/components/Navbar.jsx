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
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm no-print">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Logo & Workshop Name */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="bg-blue-600 p-2 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-tight text-white truncate max-w-[150px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {workshopConfig.workshopName || 'BIKE WORKSHOP'}
              </h1>
              {/* Cloud Connection Dot */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isSupabaseConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-500'
                }`}
                title={isSupabaseConnected ? 'Supabase Live Connected' : 'Local Storage Mode'}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate hidden xs:block">
              {t.nav.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          {/* AI Quick Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-700/60 active:scale-95 text-xs font-bold transition-all cursor-pointer"
            title={t.aiAgent.floatingBtn}
            aria-label="AI Help"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline font-bold">AI</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 hidden xs:inline" />
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xs border border-slate-700 transition-all cursor-pointer"
            title={lang === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-400 font-extrabold text-[11px] sm:text-xs">
              {lang === 'en' ? 'മലയാളം' : 'ENG'}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer"
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
