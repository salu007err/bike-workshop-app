import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import StockView from './components/StockView';
import CreateInvoiceView from './components/CreateInvoiceView';
import InvoiceHistoryView from './components/InvoiceHistoryView';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import SettingsModal from './components/SettingsModal';
import AIAssistantModal from './components/AIAssistantModal';
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

  // Data states (Clean Production Ready)
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
          : `Added "${partData.name}" to stock`
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
          : `Updated "${partData.name}"`
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
            ? `ബിൽ #${res.data.invoice_number} തയ്യാറായി!`
            : `Invoice #${res.data.invoice_number} created!`
        );
        await loadData();
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
          : 'Invoice cancelled! Stock restored.'
      );
      await loadData();
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800">
      {/* 1. TOP HEADER / APP BAR */}
      <Navbar
        workshopConfig={workshopConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      {/* 2. GLOBAL FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto sm:right-4 z-50 sm:max-w-sm animate-in slide-in-from-top-4 duration-200 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl font-bold text-xs sm:text-sm border flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-900 text-emerald-400 border-slate-800'
            }`}
          >
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT (SAFE BOTTOM PADDING FOR BOTTOM NAV) */}
      <main className="flex-1 pb-24 sm:pb-20">
        {currentSection === 'home' && (
          <HomeView
            onSelectSection={(sec) => setCurrentSection(sec)}
            parts={parts}
            invoices={invoices}
            onSelectInvoice={(inv) => setActiveInvoice(inv)}
            t={t}
            lang={lang}
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
            lang={lang}
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
            lang={lang}
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
            lang={lang}
          />
        )}
      </main>

      {/* 4. MODERN MOBILE BOTTOM NAVIGATION BAR (INSTANT 1-TAP ACCESS) */}
      <BottomNav
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        partsCount={parts.length}
        invoicesCount={invoices.length}
        t={t}
        lang={lang}
      />

      {/* 5. FREE AI ASSISTANT MODAL (WHATSAPP-STYLE BOTTOM SHEET) */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        parts={parts}
        invoices={invoices}
        lang={lang}
        t={t}
      />

      {/* 6. INVOICE DETAIL & SHARING MODAL (ONE-TAP WHATSAPP & PDF) */}
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

      {/* 7. SETTINGS MODAL */}
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
