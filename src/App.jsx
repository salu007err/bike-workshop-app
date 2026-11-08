import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import StockView from './components/StockView';
import CreateInvoiceView from './components/CreateInvoiceView';
import InvoiceHistoryView from './components/InvoiceHistoryView';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import SettingsModal from './components/SettingsModal';
import AIAssistantModal from './components/AIAssistantModal';
import { Bot, Sparkles } from 'lucide-react';
import {
  fetchParts,
  addPart,
  updatePart,
  addStockQuantity,
  deletePart,
  fetchInvoices,
  createInvoiceWithStockDeduction,
  cancelInvoice,
  getWorkshopConfig,
  saveWorkshopConfig,
  getSupabaseClient,
} from './services/db';
import {
  translations,
  getStoredLanguage,
  saveStoredLanguage,
} from './services/translations';

export default function App() {
  // Language State: 'en' (English) | 'ml' (മലയാളം)
  const [lang, setLang] = useState(getStoredLanguage());
  const t = translations[lang] || translations.en;

  const handleToggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ml' : 'en';
    setLang(nextLang);
    saveStoredLanguage(nextLang);
  };

  const handleSelectLanguage = (newLang) => {
    setLang(newLang);
    saveStoredLanguage(newLang);
  };

  // Navigation: 'home' | 'stock' | 'invoice' | 'history'
  const [currentSection, setCurrentSection] = useState('home');

  // Workshop config
  const [workshopConfig, setWorkshopConfig] = useState(getWorkshopConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // AI Assistant modal state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Data states (Zero Dummy Data - Clean Production Ready)
  const [parts, setParts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Active invoice for preview / actions
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check Supabase & load data
  const loadData = async () => {
    setIsLoadingParts(true);
    const client = getSupabaseClient();
    setIsSupabaseConnected(!!client);

    try {
      const partsRes = await fetchParts();
      if (partsRes.success) {
        setParts(partsRes.data || []);
      }
    } catch (err) {
      console.error('Error loading parts:', err);
    } finally {
      setIsLoadingParts(false);
    }

    try {
      const invRes = await fetchInvoices();
      if (invRes.success) {
        setInvoices(invRes.data || []);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stock operations
  const handleAddPart = async (partData) => {
    const res = await addPart(partData);
    if (res.success) {
      showToast(
        lang === 'ml'
          ? `"${partData.name}" സ്റ്റോക്കിലേക്ക് ചേർത്തു`
          : `Added part "${partData.name}"`
      );
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'പാർട്ട് ചേർക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to add part'), 'error');
    }
  };

  const handleUpdatePart = async (id, partData) => {
    const res = await updatePart(id, partData);
    if (res.success) {
      showToast(
        lang === 'ml'
          ? `"${partData.name}" വിവരങ്ങൾ മാറ്റി`
          : `Updated part "${partData.name}"`
      );
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'മാറ്റം വരുത്താൻ കഴിഞ്ഞില്ല' : 'Failed to update part'), 'error');
    }
  };

  const handleAddStock = async (id, addQty) => {
    const res = await addStockQuantity(id, addQty);
    if (res.success) {
      showToast(
        lang === 'ml'
          ? `${addQty} എണ്ണം സ്റ്റോക്കിലേക്ക് കൂട്ടി!`
          : `Added ${addQty} unit(s) to stock!`
      );
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'സ്റ്റോക്ക് കൂട്ടാൻ കഴിഞ്ഞില്ല' : 'Failed to add stock'), 'error');
    }
  };

  const handleDeletePart = async (id) => {
    const res = await deletePart(id);
    if (res.success) {
      showToast(lang === 'ml' ? 'പാർട്ട് ഒഴിവാക്കി' : 'Part deleted from stock');
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'ഡിലീറ്റ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to delete part'), 'error');
    }
  };

  // Invoice creation
  const handleCreateInvoice = async ({ vehicleNumber, items, totalAmount }) => {
    setIsCreatingInvoice(true);
    try {
      const res = await createInvoiceWithStockDeduction({
        vehicleNumber,
        items,
        totalAmount,
        workshopName: workshopConfig.workshopName,
      });

      if (res.success) {
        showToast(
          lang === 'ml'
            ? `ബിൽ #${res.data.invoice_number} തയ്യാറായി! സ്റ്റോക്ക് കുറച്ചു.`
            : `Invoice #${res.data.invoice_number} created! Stock updated.`
        );
        // Reload parts and invoices so quantities reflect changes
        await loadData();
        // Open detail modal with download/print/WhatsApp options
        setActiveInvoice(res.data);
        return true;
      } else {
        showToast(res.error || (lang === 'ml' ? 'ബിൽ ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to create invoice'), 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message || 'An unexpected error occurred', 'error');
      return false;
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Invoice cancellation
  const handleCancelInvoice = async (invoiceId) => {
    const res = await cancelInvoice(invoiceId);
    if (res.success) {
      showToast(
        lang === 'ml'
          ? 'ബിൽ റദ്ദാക്കി! പാർട്സുകൾ തിരികെ സ്റ്റോക്കിലേക്ക് ചേർത്തു.'
          : 'Invoice cancelled! Deducted stock has been restored.'
      );
      await loadData();
      // Update active invoice status in modal
      if (activeInvoice && activeInvoice.id === invoiceId) {
        setActiveInvoice((prev) => ({ ...prev, invoice_status: 'cancelled' }));
      }
    } else {
      showToast(res.error || (lang === 'ml' ? 'ബിൽ റദ്ദാക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to cancel invoice'), 'error');
    }
  };

  const handleSaveWorkshopConfig = (newConfig) => {
    saveWorkshopConfig(newConfig);
    setWorkshopConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      {/* Navbar */}
      <Navbar
        workshopConfig={workshopConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 max-w-sm animate-in slide-in-from-top-5 duration-200 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl font-bold text-sm border flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-900 text-emerald-400 border-slate-800'
            }`}
          >
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {currentSection === 'home' && (
          <HomeView
            onSelectSection={(sec) => setCurrentSection(sec)}
            t={t}
          />
        )}

        {currentSection === 'stock' && (
          <StockView
            parts={parts}
            isLoading={isLoadingParts}
            onBack={() => setCurrentSection('home')}
            onAddPart={handleAddPart}
            onUpdatePart={handleUpdatePart}
            onDeletePart={handleDeletePart}
            onAddStock={handleAddStock}
            t={t}
          />
        )}

        {currentSection === 'invoice' && (
          <CreateInvoiceView
            parts={parts}
            onBack={() => setCurrentSection('home')}
            onCreateInvoice={handleCreateInvoice}
            onViewHistory={() => setCurrentSection('history')}
            isCreating={isCreatingInvoice}
            t={t}
          />
        )}

        {currentSection === 'history' && (
          <InvoiceHistoryView
            invoices={invoices}
            isLoading={isLoadingInvoices}
            onBack={() => setCurrentSection('invoice')}
            onSelectInvoice={(inv) => setActiveInvoice(inv)}
            onCancelInvoice={handleCancelInvoice}
            t={t}
          />
        )}
      </main>

      {/* Floating Free AI Assistant Button */}
      <button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm px-4 py-3 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all no-print cursor-pointer border border-blue-400/40"
        title={t.aiAgent.floatingBtn}
      >
        <Bot className="w-5 h-5 text-white animate-pulse" />
        <span className="tracking-wide">{t.aiAgent.floatingBtn}</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{workshopConfig.workshopName || 'BIKE WORKSHOP'}</span>
          <span className="text-slate-500 font-semibold">
            {lang === 'ml'
              ? '100% സൗജന്യം • സബ്‌സ്‌ക്രിപ്ഷൻ ഇല്ല • ₹0 ചിലവ്'
              : '100% Free • No Subscription • ₹0 Cost'}
          </span>
        </div>
      </footer>

      {/* Free AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        parts={parts}
        invoices={invoices}
        lang={lang}
        t={t}
      />

      {/* Invoice Detail / Actions Modal (Download PDF, Print, WhatsApp) */}
      <InvoiceDetailModal
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        invoice={activeInvoice}
        workshopName={workshopConfig.workshopName}
        onCancelInvoice={handleCancelInvoice}
        onCreateNew={() => {
          setActiveInvoice(null);
          setCurrentSection('invoice');
        }}
        lang={lang}
        t={t}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workshopConfig={workshopConfig}
        onSaveWorkshopConfig={handleSaveWorkshopConfig}
        isSupabaseConnected={isSupabaseConnected}
        onRefreshData={loadData}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        t={t}
      />
    </div>
  );
}
