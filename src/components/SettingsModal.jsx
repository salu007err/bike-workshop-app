import React, { useState } from 'react';
import {
  X,
  Store,
  Database,
  Save,
  CheckCircle,
  Globe,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { clearAllLocalData } from '../services/db';

export default function SettingsModal({
  isOpen,
  onClose,
  workshopConfig,
  onSaveWorkshopConfig,
  isSupabaseConnected,
  onRefreshData,
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
      lang === 'ml' ? 'വർക്ക്ഷോപ്പ് പേര് സേവ് ചെയ്തു!' : 'Workshop name saved successfully!'
    );
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleResetAllData = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      clearAllLocalData();
      onRefreshData();
      setSaveMessage(
        lang === 'ml'
          ? 'എല്ലാ ഡാറ്റയും മായ്ച്ചു. ആപ്പ് ഫ്രെഷായി തുടങ്ങി.'
          : 'All app data reset. Clean fresh start.'
      );
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">{t.settings.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {saveMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* 1. LANGUAGE SETTING */}
          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.settings.languageLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>English</span>
                {lang === 'en' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('ml')}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  lang === 'ml'
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>മലയാളം</span>
                {lang === 'ml' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* 2. WORKSHOP NAME SETTING */}
          <form onSubmit={handleSaveWorkshop} className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-500" />
                <span>{t.settings.workshopInfo}</span>
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {t.settings.shopNameLabel}
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t.settings.shopNamePlaceholder}
                className="w-full text-base font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t.settings.saveShopName}</span>
            </button>
          </form>

          {/* 3. READ-ONLY DATABASE STATUS BADGE (NO API INPUTS) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Database Status</div>
                <div className="text-sm font-black text-slate-800">
                  {isSupabaseConnected ? 'Supabase PostgreSQL' : 'Local Storage Mode'}
                </div>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {isSupabaseConnected ? 'Live Connected' : 'Free Local Mode'}
            </span>
          </div>

          {/* 4. CLEAR ALL DATA (FRESH START) */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleResetAllData}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.resetData}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 text-right border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
}
