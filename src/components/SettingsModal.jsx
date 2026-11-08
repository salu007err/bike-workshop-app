import React, { useState } from 'react';
import {
  X,
  Store,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  getStoredSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
} from '../services/db';

export default function SettingsModal({
  isOpen,
  onClose,
  workshopConfig,
  onSaveWorkshopConfig,
  isSupabaseConnected,
  onRefreshData,
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
    setSaveMessage('Workshop name saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbKey.trim()) {
      saveSupabaseCredentials('', '');
      setTestStatus({
        type: 'info',
        message: 'Supabase credentials cleared. Using Free Local Browser Storage.',
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
        message: 'Connected to Supabase PostgreSQL successfully!',
      });
      onRefreshData();
    } catch (err) {
      setTestStatus({
        type: 'error',
        message:
          'Could not connect: ' +
          (err.message || 'Check your Supabase URL, Anon Key, and database tables.'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">Workshop Settings</h3>
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

          {/* SECTION 1: WORKSHOP NAME */}
          <form onSubmit={handleSaveWorkshop} className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-500" />
                <span>Workshop Information</span>
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Workshop Name (Appears on Bills & PDF)
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ramesh Bike Works, Speedy Motors"
                className="w-full text-base font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Workshop Name</span>
            </button>
          </form>

          {/* SECTION 2: SUPABASE DATABASE CONFIG */}
          <form onSubmit={handleSaveSupabase} className="space-y-4 pt-2 border-t border-slate-200">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Supabase PostgreSQL Free Tier</span>
              </h4>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isSupabaseConnected ? 'Connected' : 'Free Local Storage'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Connect your free Supabase database or leave blank to use free local browser storage.
              Never paste service-role keys here — only use the <strong>Anon Public Key</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Project URL
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
                Anon Public Key
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
                <span>{isTesting ? 'Connecting...' : 'Save & Connect Supabase'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-100 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
