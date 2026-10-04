import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Bug,
  BookOpen,
  Zap,
  FlaskConical,
  Lightbulb,
  Target,
  ArrowLeftRight,
  Play,
  Scale,
  History,
  MessageSquareCode,
  Sun,
  Moon,
  Home,
  PlusCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../pages/Dashboard';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onNewSession: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  chatMessageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onNewSession,
  theme,
  onToggleTheme,
  onToggleChat,
  isChatOpen,
  chatMessageCount,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(e.target as Node)) {
        setIsMobileMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
        setIsMobileMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const primaryNavItems: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'generate', label: 'Logic → Code', icon: Code2 },
    { id: 'debug', label: 'Debug', icon: Bug },
    { id: 'explain', label: 'Explain', icon: BookOpen },
    { id: 'optimize', label: 'Optimize', icon: Zap },
    { id: 'practice', label: 'Practice', icon: Target },
  ];

  const secondaryNavItems: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'test', label: 'Test My Code', icon: FlaskConical },
    { id: 'validate', label: 'Validate Logic', icon: Lightbulb },
    { id: 'convert', label: 'Convert Code', icon: ArrowLeftRight },
    { id: 'dry-run', label: 'Run Dry Run', icon: Play },
    { id: 'logic-vs-code', label: 'Logic vs Code', icon: Scale },
    { id: 'combined', label: 'Combined Analysis', icon: Sparkles },
    { id: 'history', label: 'History', icon: History },
  ];

  // Mobile navigation partitioning (Requirement 21)
  const mobilePrimaryItems: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'generate', label: 'Logic → Code', icon: Code2 },
    { id: 'debug', label: 'Debug', icon: Bug },
    { id: 'explain', label: 'Explain', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Target },
  ];

  const mobileSecondaryItems: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'optimize', label: 'Optimize', icon: Zap },
    { id: 'test', label: 'Test My Code', icon: FlaskConical },
    { id: 'validate', label: 'Validate Logic', icon: Lightbulb },
    { id: 'convert', label: 'Convert Code', icon: ArrowLeftRight },
    { id: 'dry-run', label: 'Run Dry Run', icon: Play },
    { id: 'logic-vs-code', label: 'Logic vs Code', icon: Scale },
    { id: 'combined', label: 'Combined Analysis', icon: Sparkles },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand with Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                Logic2Code AI
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Think. Code. Debug. Understand.
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800/80">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More Modes Dropdown */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                secondaryNavItems.some((s) => s.id === activeTab)
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsMoreOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Action Controls: New Session, AI Chat, Theme */}
        <div className="flex items-center gap-2">
          {/* New Session Button */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Start fresh with a blank workspace and reset chat"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          {/* AI Chat Drawer Toggle */}
          <button
            onClick={onToggleChat}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isChatOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Ask follow-up questions about current problem or code"
          >
            <MessageSquareCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">AI Chat</span>
            {chatMessageCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-600 text-white rounded-full">
                {chatMessageCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar (Section 21) */}
      <div className="lg:hidden relative border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70" ref={mobileMoreRef}>
        <div className="flex items-center justify-between px-3 py-1.5 gap-1 overflow-x-auto scrollbar-none">
          {mobilePrimaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              mobileSecondaryItems.some((s) => s.id === activeTab) || isMobileMoreOpen
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            aria-expanded={isMobileMoreOpen}
          >
            <span>More</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isMobileMoreOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Secondary Features Panel */}
        {isMobileMoreOpen && (
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 grid grid-cols-2 sm:grid-cols-3 gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
            {mobileSecondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
