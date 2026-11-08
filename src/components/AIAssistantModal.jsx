import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Database,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { queryAIAssistant, getStoredGeminiKey } from '../services/aiAgent';

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
  const geminiInfo = getStoredGeminiKey();
  const hasGeminiKey = !!(typeof geminiInfo === 'string' ? geminiInfo : geminiInfo?.key);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
      <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col h-[85vh] sm:h-[650px] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{t.aiAgent.title}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% Free
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                {t.aiAgent.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Data Badge Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.aiAgent.liveDataConnected}:</span>
            <span className="text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-extrabold">
              {parts.length} {t.aiAgent.partsCount} • {invoices.length} {t.aiAgent.invoicesCount}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:inline">
            {hasGeminiKey ? 'Gemini 1.5 Flash Connected' : 'Built-in Workshop AI'}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`text-[10px] mt-1.5 text-right font-medium ${
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
            <div className="flex gap-2.5 items-center text-slate-500 text-xs font-semibold p-2 bg-white rounded-2xl border border-slate-200 w-fit">
              <Bot className="w-4 h-4 animate-bounce text-blue-600" />
              <span>
                {lang === 'ml' ? 'AI ആലോചിക്കുന്നു...' : 'AI is thinking...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 px-1">
              <HelpCircle className="w-3.5 h-3.5 inline mr-1" />
            </span>
            {t.aiAgent.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t.aiAgent.placeholder}
            className="flex-1 text-sm font-semibold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
