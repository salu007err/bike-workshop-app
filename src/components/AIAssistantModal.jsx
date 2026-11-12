import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Database,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { queryAIAssistant } from '../services/aiAgent';

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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
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
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">{t.aiAgent.title}</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Gemini AI</span>
                </span>
              </div>
              <p className="text-[10px] text-indigo-200 font-medium">
                {parts.length} {t.aiAgent.partsCount} • {invoices.length} {t.aiAgent.invoicesCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

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
