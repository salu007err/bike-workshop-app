import React, { useState } from 'react';
import {
  X,
  Store,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Trash2,
} from 'lucide-react';
import {
  getStoredSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
  clearAllLocalData,
} from '../services/db';

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
  const [phone, setPhone] = useState(workshopConfig.phone || '');
  const [address, setAddress] = useState(workshopConfig.address || '');

  // Supabase fields
  const storedCreds = getStoredSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(storedCreds?.url || '');
  const [sbKey, setSbKey] = useState(storedCreds?.key || '');
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!isOpen) return null;

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    onSaveWorkshopConfig({
      workshopName: shopName.trim() || 'BIKE WORKSHOP',
      phone: phone.trim(),
      address: address.trim(),
    });
    setSaveMessage(lang === 'ml' ? 'വർക്ക്ഷോപ്പ് പേര് സേവ് ചെയ്തു!' : 'Workshop name saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbKey.trim()) {
      saveSupabaseCredentials('', '');
      setTestStatus({
        type: 'info',
        message: lang === 'ml' ? 'ക്ലൗഡ് കീ ഒഴിവാക്കി. ലോക്കൽ സ്റ്റോറേജ് ഉപയോഗിക്കുന്നു.' : 'Supabase credentials cleared. Using Free Local Browser Storage.',
      });
      onRefreshData();
      return;
    }

    saveSupabaseCredentials(sbUrl.trim(), sbKey.trim());
    setIsTesting(true);
    setTestStatus(null);

    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Client creation failed');
      const { data, error } = await client.from('parts').select('id').limit(1);
      if (error) throw error;

      setTestStatus({
        type: 'success',
        message: lang === 'ml' ? 'സുപബേസ് ഡാറ്റാബേസ് കണക്റ്റ് ചെയ്തു!' : 'Connected to Supabase PostgreSQL successfully!',
      });
      onRefreshData();
    } catch (err) {
      setTestStatus({
        type: 'error',
        message:
          'Error: ' +
          (err.message || 'Check your Supabase URL, Anon Key, and database tables.'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetAllData = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      clearAllLocalData();
      onRefreshData();
      setSaveMessage(lang === 'ml' ? 'എല്ലാ ഡാറ്റയും മായ്ച്ചു. ആപ്പ് ഫ്രെഷായി തുടങ്ങി.' : 'All app data reset. Clean fresh start.');
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
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
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* LANGUAGE SETTING */}
          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.settings.languageLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
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
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
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

          {/* SECTION 1: WORKSHOP NAME */}
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
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t.settings.saveShopName}</span>
            </button>
          </form>

          {/* SECTION 2: SUPABASE DATABASE CONFIG */}
          <form onSubmit={handleSaveSupabase} className="space-y-4 pt-2 border-t border-slate-200">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>{t.settings.supabaseTitle}</span>
              </h4>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isSupabaseConnected ? t.settings.supabaseConnected : t.settings.supabaseLocal}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t.settings.supabaseHelp}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {t.settings.projectUrl}
              </label>
              <input
                type="text"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {t.settings.anonKey}
              </label>
              <input
                type="password"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            {testStatus && (
              <div
                className={`p-3 text-xs font-semibold rounded-xl flex items-start gap-2 ${
                  testStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testStatus.type === 'info'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>{isTesting ? t.settings.connecting : t.settings.saveSupabase}</span>
              </button>
            </div>
          </form>

          {/* Clear all data button */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleResetAllData}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.resetData}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
}
