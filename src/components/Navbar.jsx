import React from 'react';
import { Wrench, Settings, Globe } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/97 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-sm no-print select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
        {/* Left: Icon & Workshop Name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
            <Wrench className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight text-slate-900 truncate">
                {workshopConfig.workshopName || (lang === 'ml' ? 'ബൈക്ക് വർക്ക്ഷോപ്പ്' : 'BIKE WORKSHOP')}
              </h1>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
                title={isSupabaseConnected ? 'Live Cloud' : 'Offline'}
              />
            </div>
            <p className="text-xs text-slate-500 font-semibold truncate">
              {lang === 'ml' ? 'ടു-വീലർ സർവീസ് & സ്പെയർ പാർട്സ്' : 'Two-Wheeler Service & Spares'}
            </p>
          </div>
        </div>

        {/* Right: Language Toggle + Settings */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
            title={lang === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
            aria-label="Toggle Language"
          >
            <Globe className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span>{lang === 'en' ? 'മലയാളം' : 'ENG'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
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
