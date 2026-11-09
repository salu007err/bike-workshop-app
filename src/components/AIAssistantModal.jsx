import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Database,
  Trash2,
  Sparkles,
  Key,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  queryAIAssistant,
  getStoredGeminiKey,
  saveStoredGeminiKey,
  removeStoredGeminiKey,
} from '../services/aiAgent';

export default function AIAssistantModal({
  isOpen,
  onClose,
  parts = [],
  invoices = [],
  lang = 'en',
  t,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: t.aiAgent.welcomeMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [saveStatusMsg, setSaveStatusMsg] = useState('');

  const messagesEndRef = useRef(null);
  const geminiInfo = getStoredGeminiKey();
  const hasGeminiKey = !!geminiInfo?.key;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (geminiInfo?.isCustom) {
        setCustomKeyInput(geminiInfo.key);
      }
    }
  }, [messages, isOpen]);

  // Update welcome message if language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: t.aiAgent.welcomeMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [lang, t]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await queryAIAssistant({
        userQuery: textToSend,
        parts,
        invoices,
        lang,
      });

      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: res.text,
        engine: res.engine,
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'bot_err_' + Date.now(),
        sender: 'bot',
        text:
          lang === 'ml'
            ? 'ക്ഷമിക്കണം, മറുപടി നൽകാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക.'
            : 'Sorry, could not process request. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomKey = (e) => {
    e.preventDefault();
    const clean = (customKeyInput || '').trim();
    if (clean) {
      saveStoredGeminiKey(clean);
      setSaveStatusMsg(lang === 'ml' ? 'Gemini കീ സേവ് ചെയ്തു!' : 'Gemini API Key saved!');
    } else {
      removeStoredGeminiKey();
      setSaveStatusMsg(lang === 'ml' ? 'കീ നീക്കം ചെയ്തു' : 'Custom key removed');
    }
    setTimeout(() => {
      setSaveStatusMsg('');
      setShowKeyConfig(false);
    }, 2000);
  };

  const handleResetKey = () => {
    removeStoredGeminiKey();
    setCustomKeyInput('');
    setSaveStatusMsg(lang === 'ml' ? 'ഡീഫോൾട്ട് സെറ്റിംഗ് പുനഃസ്ഥാപിച്ചു' : 'Reset to default');
    setTimeout(() => {
      setSaveStatusMsg('');
      setShowKeyConfig(false);
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        text: t.aiAgent.welcomeMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Curated bilingual suggestions mixing workshop live data & bike mechanic troubleshooting
  const defaultSuggestions =
    lang === 'ml'
      ? [
          'ബൈക്ക് സ്റ്റാർട്ട് ആവാത്തതിന് കാരണങ്ങൾ എന്തൊക്കെ?',
          'എൻജിൻ ഓയിൽ മാറ്റേണ്ട സമയം എങ്ങനെ അറിയാം?',
          'സ്റ്റോക്ക് തീർന്ന പാർട്സുകൾ ഏതൊക്കെ?',
          'ആകെ സ്റ്റോക്ക് മൂല്യം എത്ര?',
          'പുതിയ ബിൽ എങ്ങനെ ഉണ്ടാക്കാം?',
          'വാട്സാപ്പിൽ ബിൽ അയക്കുന്നത് എങ്ങനെ?',
        ]
      : [
          'Why does bike engine overheat?',
          'How to check if spark plug is good?',
          'What parts are out of stock?',
          'What is my total stock value?',
          'How to create a new invoice?',
          'How does WhatsApp sharing work?',
        ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
      <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col h-[88vh] sm:h-[620px] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">{t.aiAgent.title}</h3>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                    hasGeminiKey
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30 hover:bg-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30'
                  }`}
                  title="Configure Google Gemini API Key"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{hasGeminiKey ? 'Gemini AI Active' : 'Setup Gemini Key'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {parts.length} {t.aiAgent.partsCount} • {invoices.length} {t.aiAgent.invoicesCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors ${
                showKeyConfig ? 'text-blue-400 bg-slate-800' : 'text-slate-400'
              }`}
              title="API Key Settings"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Drawer */}
        {showKeyConfig && (
          <div className="bg-slate-900 border-b border-slate-800 p-3 text-xs text-slate-300 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini AI API Key</span>
              </span>
              <button
                type="button"
                onClick={() => setShowKeyConfig(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              {lang === 'ml'
                ? 'Google AI Studio (aistudio.google.com) വഴി ലഭിക്കുന്ന API കീ നൽകി തത്സമയ ബൈക്ക് റിപ്പയർ AI നിർദ്ദേശങ്ങൾ ഉപയോഗിക്കാം.'
                : 'Enter your API key from Google AI Studio (aistudio.google.com) for unlimited motorcycle diagnosis & mechanic advice.'}
            </p>
            <form onSubmit={handleSaveCustomKey} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ml' ? 'സേവ്' : 'Save'}</span>
                </button>
                {geminiInfo?.isCustom && (
                  <button
                    type="button"
                    onClick={handleResetKey}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                    title="Reset to default key"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {saveStatusMsg && (
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>✓ {saveStatusMsg}</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/70">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isGemini = msg.engine === 'gemini';
            const isStored = msg.engine === 'stored';

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div
                    className={`w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${
                      isGemini
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {isGemini ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-xs whitespace-pre-wrap ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {/* Origin Badge */}
                  {isBot && (isGemini || isStored) && (
                    <div className="mb-1.5">
                      {isGemini ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                          <span>Google Gemini AI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          <Database className="w-2.5 h-2.5 text-slate-500" />
                          <span>{lang === 'ml' ? 'വർക്ക്ഷോപ്പ് ഡാറ്റ' : 'Workshop Data'}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div>{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right font-medium ${
                      isBot ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 items-center text-slate-500 text-xs font-semibold p-2 bg-white rounded-xl border border-slate-200 w-fit animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>
                {lang === 'ml' ? 'AI ആലോചിക്കുന്നു...' : 'AI is thinking...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Questions (Horizontal Scroll) */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          {defaultSuggestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 safe-pb flex-shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              lang === 'ml'
                ? 'എന്തും ചോദിക്കാം (ഉദാ: ബൈക്ക് വൈബ്രേഷൻ, ഓയിൽ സംശയങ്ങൾ, സ്റ്റോക്ക് വിവരങ്ങൾ)...'
                : 'Ask anything (e.g. engine knocking causes, oil grade, stock status)...'
            }
            className="flex-1 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
