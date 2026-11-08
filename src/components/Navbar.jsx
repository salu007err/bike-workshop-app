import React from 'react';
import { Wrench, Settings, Database, CheckCircle2, Globe, Bot } from 'lucide-react';

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
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl flex items-center justify-center shadow-inner">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wide leading-tight text-white">
              {workshopConfig.workshopName || 'BIKE WORKSHOP'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t.nav.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 text-blue-300 hover:bg-blue-900 active:scale-95 text-xs font-bold border border-blue-700/60 transition-all cursor-pointer shadow-sm"
            title={t.aiAgent.floatingBtn}
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="font-bold">AI Help</span>
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer shadow-sm"
            title={lang === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-extrabold text-emerald-400">
              {lang === 'en' ? 'മലയാളം' : 'English'}
            </span>
          </button>

          {/* Cloud / Local storage indicator */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isSupabaseConnected
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
            title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Operating in Free Local Storage Mode'}
          >
            {isSupabaseConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.nav.supabaseLive}</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.nav.localOffline}</span>
              </>
            )}
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-xs font-medium"
            title={t.nav.settings}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.settings}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
