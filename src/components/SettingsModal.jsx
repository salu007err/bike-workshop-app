import React, { useState } from 'react';
import {
  X,
  Store,
  Save,
  CheckCircle,
  Globe,
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  workshopConfig,
  onSaveWorkshopConfig,
  lang,
  onSelectLanguage,
  t,
}) {
  const [shopName, setShopName] = useState(workshopConfig.workshopName || 'BIKE WORKSHOP');
  const [saveMessage, setSaveMessage] = useState('');

  if (!isOpen) return null;

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    onSaveWorkshopConfig({
      ...workshopConfig,
      workshopName: shopName.trim() || 'BIKE WORKSHOP',
    });
    setSaveMessage(
      lang === 'ml' ? 'വർക്ക്ഷോപ്പ് പേര് സേവ് ചെയ്തു!' : 'Workshop name saved!'
    );
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-black">{t.settings.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {saveMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* 1. LANGUAGE SETTING */}
          <div className="border border-slate-200 p-3 rounded-2xl bg-slate-50 space-y-2">
            <label className="block text-[11px] font-black text-slate-600 uppercase flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.settings.languageLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>English</span>
                {lang === 'en' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('ml')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lang === 'ml'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>മലയാളം</span>
                {lang === 'ml' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* 2. WORKSHOP NAME SETTING */}
          <form onSubmit={handleSaveWorkshop} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
                {t.settings.shopNameLabel}
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t.settings.shopNamePlaceholder}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.settings.saveShopName}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 text-right border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
          >
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
}
