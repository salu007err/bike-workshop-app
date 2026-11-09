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
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import {
  fetchParts,
  addPart,
  updatePart,
  addStockQuantity,
  deletePart,
  fetchInvoices,
  createInvoiceWithStockDeduction,
  updateInvoiceWithStockDeduction,
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
  const [isTableMissing, setIsTableMissing] = useState(false);

  // AI Assistant modal state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Data states (Pure Supabase Live State)
  const [parts, setParts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Active invoice for preview / actions
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Invoice being edited
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Check Supabase & load pure cloud data
  const loadData = async () => {
    setIsLoadingParts(true);
    const client = getSupabaseClient();
    setIsSupabaseConnected(!!client);

    try {
      const partsRes = await fetchParts();
      if (partsRes.success) {
        setParts(partsRes.data || []);
        setIsTableMissing(false);
      } else {
        if (partsRes.isTableMissing) {
          setIsTableMissing(true);
        }
        console.warn('Supabase parts fetch:', partsRes.error);
      }
    } catch (err) {
      console.error('Error loading parts from Supabase:', err);
    } finally {
      setIsLoadingParts(false);
    }

    try {
      const invRes = await fetchInvoices();
      if (invRes.success) {
        setInvoices(invRes.data || []);
      } else {
        if (invRes.isTableMissing) {
          setIsTableMissing(true);
        }
      }
    } catch (err) {
      console.error('Error loading invoices from Supabase:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stock operations (Direct Supabase)
  const handleAddPart = async (partData) => {
    const res = await addPart(partData);
    if (res.success) {
      if (res.isSchemaUpgradeNeeded) {
        showToast(
          lang === 'ml'
            ? `"${partData.name}" ചേർത്തു! ഫോട്ടോയും പാർട്ട് നമ്പറും സൂക്ഷിക്കാൻ സുപാബേസിൽ SQL റൺ ചെയ്യുക.`
            : `Added "${partData.name}"! Run SQL upgrade in Supabase to save photos & part numbers.`
        );
      } else {
        showToast(
          lang === 'ml'
            ? `"${partData.name}" ക്ലൗഡ് സ്റ്റോക്കിലേക്ക് ചേർത്തു`
            : `Added "${partData.name}" to Supabase`
        );
      }
      await loadData();
    } else {
      if (res.isTableMissing) setIsTableMissing(true);
      showToast(res.error || (lang === 'ml' ? 'പാർട്ട് ചേർക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to add part'), 'error');
    }
  };

  const handleUpdatePart = async (id, partData) => {
    const res = await updatePart(id, partData);
    if (res.success) {
      if (res.isSchemaUpgradeNeeded) {
        showToast(
          lang === 'ml'
            ? `"${partData.name}" മാറ്റി! ഫോട്ടോയും പാർട്ട് നമ്പറും സൂക്ഷിക്കാൻ സുപാബേസിൽ SQL റൺ ചെയ്യുക.`
            : `Updated "${partData.name}"! Run SQL upgrade in Supabase to save photos & part numbers.`
        );
      } else {
        showToast(
          lang === 'ml'
            ? `"${partData.name}" വിവരങ്ങൾ മാറ്റി`
            : `Updated "${partData.name}"`
        );
      }
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
          : `Added ${addQty} unit(s) to Supabase stock!`
      );
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'സ്റ്റോക്ക് കൂട്ടാൻ കഴിഞ്ഞില്ല' : 'Failed to add stock'), 'error');
    }
  };

  const handleDeletePart = async (id) => {
    const res = await deletePart(id);
    if (res.success) {
      showToast(lang === 'ml' ? 'പാർട്ട് ഒഴിവാക്കി' : 'Part deleted from Supabase');
      await loadData();
    } else {
      showToast(res.error || (lang === 'ml' ? 'ഡിലീറ്റ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to delete part'), 'error');
    }
  };

  // Invoice creation (Direct Supabase)
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
            ? `ബിൽ #${res.data.invoice_number} സുപാബേസിൽ സേവ് ചെയ്തു!`
            : `Invoice #${res.data.invoice_number} saved to Supabase!`
        );
        await loadData();
        setActiveInvoice(res.data);
        return true;
      } else {
        showToast(res.error || (lang === 'ml' ? 'ബിൽ ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to create invoice in Supabase'), 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message || 'An unexpected error occurred', 'error');
      return false;
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Start editing a saved vehicle invoice
  const handleStartEditInvoice = (inv) => {
    setActiveInvoice(null);
    setEditingInvoice(inv);
    setCurrentSection('invoice');
  };

  const handleCancelEditInvoice = () => {
    setEditingInvoice(null);
  };

  // Update existing invoice & reconcile stock (Direct Supabase)
  const handleUpdateInvoice = async ({ invoiceId, vehicleNumber, items, totalAmount }) => {
    setIsCreatingInvoice(true);
    try {
      const res = await updateInvoiceWithStockDeduction({
        invoiceId,
        vehicleNumber,
        items,
        totalAmount,
        workshopName: workshopConfig.workshopName,
      });

      if (res.success) {
        showToast(
          lang === 'ml'
            ? `ബിൽ #${res.data.invoice_number} മാറ്റങ്ങൾ സേവ് ചെയ്തു!`
            : `Invoice #${res.data.invoice_number} updated in Supabase!`
        );
        await loadData();
        setEditingInvoice(null);
        setActiveInvoice(res.data);
        return true;
      } else {
        showToast(
          res.error || (lang === 'ml' ? 'ബിൽ മാറ്റാൻ കഴിഞ്ഞില്ല' : 'Failed to update invoice in Supabase'),
          'error'
        );
        return false;
      }
    } catch (err) {
      showToast(err.message || 'An unexpected error occurred', 'error');
      return false;
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Invoice cancellation (Direct Supabase)
  const handleCancelInvoice = async (invoiceId) => {
    const res = await cancelInvoice(invoiceId);
    if (res.success) {
      showToast(
        lang === 'ml'
          ? 'ബിൽ റദ്ദാക്കി! സുപാബേസ് സ്റ്റോക്ക് തിരികെ ചേർത്തു.'
          : 'Invoice cancelled! Supabase stock restored.'
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

      {/* 2. SUPABASE SETUP REQUIRED BANNER (If tables not yet created) */}
      {isTableMissing && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-bold no-print">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-5 h-5 text-slate-900 flex-shrink-0" />
            <span className="truncate">
              {lang === 'ml'
                ? 'സുപാബേസ് ടേബിളുകൾ തയ്യാറായിട്ടില്ല. SQL റൺ ചെയ്യുക.'
                : 'Supabase setup required: Database tables not created yet.'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://supabase.com/dashboard/project/peqiwojcxtklbbvfctxt/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-amber-300 hover:text-white px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm"
            >
              <span>{lang === 'ml' ? 'SQL തുറക്കുക' : 'Run SQL'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={loadData}
              className="p-1 text-slate-900 hover:text-slate-800"
              title="Refresh"
              aria-label="Refresh connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. GLOBAL FLOATING TOAST NOTIFICATION */}
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

      {/* 4. MAIN CONTENT */}
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
            onBack={() => {
              setEditingInvoice(null);
              setCurrentSection('home');
            }}
            onCreateInvoice={handleCreateInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            editingInvoice={editingInvoice}
            onCancelEdit={handleCancelEditInvoice}
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
            onEditInvoice={handleStartEditInvoice}
            t={t}
            lang={lang}
          />
        )}
      </main>

      {/* 5. MOBILE BOTTOM NAVIGATION */}
      <BottomNav
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        partsCount={parts.length}
        invoicesCount={invoices.length}
        t={t}
        lang={lang}
      />

      {/* 6. AI ASSISTANT MODAL */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        parts={parts}
        invoices={invoices}
        lang={lang}
        t={t}
      />

      {/* 7. INVOICE DETAIL MODAL */}
      <InvoiceDetailModal
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        invoice={activeInvoice}
        workshopName={workshopConfig.workshopName}
        onCancelInvoice={handleCancelInvoice}
        onEditInvoice={handleStartEditInvoice}
        onCreateNew={() => {
          setEditingInvoice(null);
          setActiveInvoice(null);
          setCurrentSection('invoice');
        }}
        lang={lang}
        t={t}
      />

      {/* 8. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workshopConfig={workshopConfig}
        onSaveWorkshopConfig={handleSaveWorkshopConfig}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        t={t}
      />
    </div>
  );
}
