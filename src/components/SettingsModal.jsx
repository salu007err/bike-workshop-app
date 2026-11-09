import React, { useState } from 'react';
import {
  X,
  Store,
  Save,
  CheckCircle,
  Globe,
  Sparkles,
  Key,
  RotateCcw,
} from 'lucide-react';
import {
  getStoredGeminiKey,
  saveStoredGeminiKey,
  removeStoredGeminiKey,
} from '../services/aiAgent';

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

  const geminiInfo = getStoredGeminiKey();
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiInfo?.isCustom ? geminiInfo.key : '');
  const [geminiStatus, setGeminiStatus] = useState('');

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

  const handleSaveGeminiKey = (e) => {
    e.preventDefault();
    const clean = (geminiKeyInput || '').trim();
    if (clean) {
      saveStoredGeminiKey(clean);
      setGeminiStatus(lang === 'ml' ? 'Gemini കീ സേവ് ചെയ്തു!' : 'Gemini API Key saved!');
    } else {
      removeStoredGeminiKey();
      setGeminiStatus(lang === 'ml' ? 'കസ്റ്റം കീ മാറ്റി ഡീഫോൾട്ട് ആക്കി' : 'Custom key removed');
    }
    setTimeout(() => setGeminiStatus(''), 3000);
  };

  const handleResetGemini = () => {
    removeStoredGeminiKey();
    setGeminiKeyInput('');
    setGeminiStatus(lang === 'ml' ? 'ഡീഫോൾട്ട് കീ പുനഃസ്ഥാപിച്ചു' : 'Reset to default key');
    setTimeout(() => setGeminiStatus(''), 3000);
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
            className="p-1 rounded-xl text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
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

          {/* 3. GOOGLE GEMINI AI KEY SETTING */}
          <div className="border border-indigo-100 p-3.5 rounded-2xl bg-indigo-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-indigo-900 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Gemini AI API Key</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {geminiInfo?.key ? (geminiInfo.isCustom ? 'Custom Key' : 'Active') : 'Not Set'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {lang === 'ml'
                ? 'ബൈക്ക് റിപ്പയറിംഗ് സംശയങ്ങൾക്കും മെക്കാനിക് സഹായങ്ങൾക്കും Google AI Studio-യിൽ നിന്നുള്ള നിങ്ങളുടെ Gemini API കീ ഇവിടെ നൽകാം.'
                : 'For live motorcycle repair diagnosis and mechanic advice, enter your Gemini API key from Google AI Studio.'}
            </p>

            <form onSubmit={handleSaveGeminiKey} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{lang === 'ml' ? 'സേവ്' : 'Save'}</span>
                </button>
                {geminiInfo?.isCustom && (
                  <button
                    type="button"
                    onClick={handleResetGemini}
                    className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
                    title="Reset to default key"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {geminiStatus && (
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span>✓ {geminiStatus}</span>
                </div>
              )}
            </form>
          </div>
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
