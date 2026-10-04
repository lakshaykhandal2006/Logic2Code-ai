import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  CornerDownLeft,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { ChatMessage, SupportedLanguage } from '../types';
import { chatAboutCode } from '../services/api';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession?: () => void;
  context: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  };
  onMessageCountChange?: (count: number) => void;
}

const QUICK_PROMPTS = [
  'Explain this loop.',
  'Why did you use this variable?',
  'Can you make this code easier for a beginner?',
  'Convert this code to C++.',
  'Give me another algorithmic approach.',
  'What happens if the input is empty?',
  'Can you optimize the time complexity?',
  'Are there any hidden edge cases?',
];

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  onNewSession,
  context,
  onMessageCountChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Hello! I am your AI coding assistant. Ask me anything about your current logic, code implementation, algorithmic complexity, or alternate approaches!',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keyboard Escape listener (Requirement 6 & 22)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Exclude initial welcome message from badge count
    const userAndAiReplies = messages.filter((m) => m.id !== 'welcome' && m.id !== 'welcome_reset');
    onMessageCountChange?.(userAndAiReplies.length);
  }, [messages, onMessageCountChange]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setLastUserPrompt(text);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send conversation to server
      const apiHistory = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await chatAboutCode({
        message: text,
        history: apiHistory,
        context: {
          language: context.language,
          code: context.code,
          problem: context.problem,
          logic: context.logic,
        },
      });

      const modelMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: 'AI service is temporarily unavailable. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setCopyErrorId(null);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Failed to copy chat text', err);
      setCopyErrorId(id);
      setTimeout(() => setCopyErrorId(null), 2500);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'model',
        content:
          'Chat history cleared. I am ready to answer new questions about your current code or algorithm.',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleNewSessionClick = () => {
    handleClearChat();
    onNewSession?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for click outside & mobile dismissal (Requirement 6) */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              AI Code Assistant
            </h3>
            <p className="text-[11px] text-slate-400">Context-aware follow-up chat</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNewSessionClick}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Start a new chat session"
          >
            New Session
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-300">Active Context:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            {context.language || 'Python'}
          </span>
          <span className="truncate">
            {context.problem || context.code ? 'Code/Problem loaded' : 'No active code snippet'}
          </span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`group relative max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>

                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.id.startsWith('err_') && lastUserPrompt && (
                      <button
                        onClick={() => handleSend(lastUserPrompt)}
                        disabled={isLoading}
                        className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-white cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : copyErrorId === msg.id ? (
                        <span className="text-[10px] text-rose-400 font-medium">Failed</span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Thinking and analyzing code...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center justify-between">
          <span>Quick Follow-Ups</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <span>{prompt}</span>
              <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this code or logic..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </>
);
};
