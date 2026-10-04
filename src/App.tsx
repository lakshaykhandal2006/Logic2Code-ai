/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AiChatDrawer } from './components/AiChatDrawer';
import { Dashboard } from './pages/Dashboard';
import { GeneratorPage } from './pages/GeneratorPage';
import { DebugPage } from './pages/DebugPage';
import { ExplainerPage } from './pages/ExplainerPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { TesterPage } from './pages/TesterPage';
import { LogicValidatorPage } from './pages/LogicValidatorPage';
import { LogicVsCodePage } from './pages/LogicVsCodePage';
import { PracticePage, PracticeStatePayload } from './pages/PracticePage';
import { ConverterPage } from './pages/ConverterPage';
import { DryRunPage } from './pages/DryRunPage';
import { CombinedAnalysisPage } from './pages/CombinedAnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import {
  SupportedLanguage,
  PresetLogicExample,
  HistoryItem,
  NavigationTab,
  CodeGenResult,
  CodeDebugResult,
  CodeExplanationResult,
  CodeOptimizationResult,
  CodeTestCasesResult,
  LogicValidationResult,
  LogicCodeMatchResult,
  CodeConvertResult,
  DedicatedDryRunResult,
  CombinedAnalysisResult,
} from './types';
import { validateSupportedLanguage } from './services/aiValidators';
import {
  getStoredTheme,
  setStoredTheme,
  getHistory,
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessageCount, setChatMessageCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState(0);

  // Active workspace state shared across tabs
  const [activePreset, setActivePreset] = useState<PresetLogicExample | null>(null);
  const [generatorInitialResult, setGeneratorInitialResult] = useState<CodeGenResult | null>(null);

  const [checkerInitialCode, setCheckerInitialCode] = useState<string>('');
  const [checkerInitialLanguage, setCheckerInitialLanguage] = useState<SupportedLanguage>('python');
  const [checkerInitialResult, setCheckerInitialResult] = useState<CodeDebugResult | null>(null);

  const [explainerInitialCode, setExplainerInitialCode] = useState<string>('');
  const [explainerInitialLanguage, setExplainerInitialLanguage] = useState<SupportedLanguage>('python');
  const [explainerInitialResult, setExplainerInitialResult] = useState<CodeExplanationResult | null>(null);

  const [optimizerInitialResult, setOptimizerInitialResult] = useState<CodeOptimizationResult | null>(null);
  const [testerInitialResult, setTesterInitialResult] = useState<CodeTestCasesResult | null>(null);

  const [combinedInitialProblem, setCombinedInitialProblem] = useState<string>('');
  const [combinedInitialLogic, setCombinedInitialLogic] = useState<string>('');
  const [combinedInitialCode, setCombinedInitialCode] = useState<string>('');
  const [combinedInitialLanguage, setCombinedInitialLanguage] = useState<SupportedLanguage>('python');
  const [combinedInitialResult, setCombinedInitialResult] = useState<CombinedAnalysisResult | null>(null);

  const [validatorInitialResult, setValidatorInitialResult] = useState<LogicValidationResult | null>(null);
  const [logicVsCodeInitialResult, setLogicVsCodeInitialResult] = useState<LogicCodeMatchResult | null>(null);
  const [converterInitialResult, setConverterInitialResult] = useState<CodeConvertResult | null>(null);
  const [dryRunInitialSampleInput, setDryRunInitialSampleInput] = useState<string | undefined>(undefined);
  const [dryRunInitialResult, setDryRunInitialResult] = useState<DedicatedDryRunResult | null>(null);
  const [practiceInitialState, setPracticeInitialState] = useState<PracticeStatePayload | null>(null);

  // Active context for the AI Chat Drawer
  const [chatContext, setChatContext] = useState<{
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }>({
    language: 'python',
  });

  // Initialize theme and load history safely
  useEffect(() => {
    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setHistory(getHistory());

    const handleStorageError = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setStorageWarning(
        customEvent.detail ||
          'The current session is still available, but it could not be saved to local history.'
      );
    };
    window.addEventListener('logic2code:storage_error', handleStorageError);
    return () => window.removeEventListener('logic2code:storage_error', handleStorageError);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRefreshHistory = () => {
    setHistory(getHistory());
  };

  // Section 4: Complete clean workspace reset without deleting saved history
  const handleNewSession = () => {
    setActivePreset(null);
    setGeneratorInitialResult(null);

    setCheckerInitialCode('');
    setCheckerInitialLanguage('python');
    setCheckerInitialResult(null);

    setExplainerInitialCode('');
    setExplainerInitialLanguage('python');
    setExplainerInitialResult(null);

    setOptimizerInitialResult(null);
    setTesterInitialResult(null);

    setCombinedInitialProblem('');
    setCombinedInitialLogic('');
    setCombinedInitialCode('');
    setCombinedInitialLanguage('python');
    setCombinedInitialResult(null);

    setValidatorInitialResult(null);
    setLogicVsCodeInitialResult(null);
    setConverterInitialResult(null);
    setDryRunInitialSampleInput(undefined);
    setDryRunInitialResult(null);
    setPracticeInitialState(null);

    setChatContext({
      language: 'python',
      code: '',
      problem: '',
      logic: '',
    });
    setChatMessageCount(0);
    setChatSessionId((prev) => prev + 1);
    setActiveTab('dashboard');
  };

  const handleSelectPresetFromDashboard = (preset: PresetLogicExample) => {
    setActivePreset(preset);
    setGeneratorInitialResult(null);
    setChatContext({
      language: validateSupportedLanguage(preset.language, 'python'),
      problem: preset.problem,
      logic: preset.logic,
    });
    setActiveTab('generate');
  };

  // Section 5: Transitions carry forward code automatically
  const handleSendToExplainer = (code: string, language: SupportedLanguage) => {
    const safeLang = validateSupportedLanguage(language, 'python');
    setExplainerInitialCode(code);
    setExplainerInitialLanguage(safeLang);
    setExplainerInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      code,
      language: safeLang,
    }));
    setActiveTab('explain');
  };

  const handleSendToDebug = (code: string, language: SupportedLanguage) => {
    const safeLang = validateSupportedLanguage(language, 'python');
    setCheckerInitialCode(code);
    setCheckerInitialLanguage(safeLang);
    setCheckerInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      code,
      language: safeLang,
    }));
    setActiveTab('debug');
  };

  const handleSendToOptimizer = (code: string, language: SupportedLanguage) => {
    const safeLang = validateSupportedLanguage(language, 'python');
    setCheckerInitialCode(code);
    setCheckerInitialLanguage(safeLang);
    setOptimizerInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      code,
      language: safeLang,
    }));
    setActiveTab('optimize');
  };

  const handleSendToTester = (code: string, language: SupportedLanguage) => {
    const safeLang = validateSupportedLanguage(language, 'python');
    setCheckerInitialCode(code);
    setCheckerInitialLanguage(safeLang);
    setTesterInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      code,
      language: safeLang,
    }));
    setActiveTab('test');
  };

  const handleSendToDryRun = (code: string, language: SupportedLanguage) => {
    const safeLang = validateSupportedLanguage(language, 'python');
    setCheckerInitialCode(code);
    setCheckerInitialLanguage(safeLang);
    setDryRunInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      code,
      language: safeLang,
    }));
    setActiveTab('dry-run');
  };

  const handleSendToGenerator = (problem: string, logic: string) => {
    setActivePreset({
      title: 'Generated from Logic Validation',
      description: '',
      problem,
      logic,
      language: 'python',
      difficulty: 'Beginner',
    });
    setGeneratorInitialResult(null);
    setChatContext((prev) => ({
      ...prev,
      problem,
      logic,
    }));
    setActiveTab('generate');
  };

  // Section 3: Full history restoration with all previous results and inputs
  const handleOpenHistoryItem = (item: HistoryItem) => {
    const itemLang = validateSupportedLanguage(item.language, 'python');

    if (item.type === 'generation') {
      setActivePreset({
        title: item.title,
        description: '',
        problem: item.problemStatement || '',
        logic: item.logic || '',
        language: itemLang,
        difficulty: 'Beginner',
      });
      setGeneratorInitialResult(item.result || null);
      setActiveTab('generate');
    } else if (item.type === 'debug' || (item.type as string) === 'review') {
      setCheckerInitialCode(item.code || '');
      setCheckerInitialLanguage(itemLang);
      setCheckerInitialResult(item.result || null);
      setActiveTab('debug');
    } else if (item.type === 'explanation') {
      setExplainerInitialCode(item.code || '');
      setExplainerInitialLanguage(itemLang);
      setExplainerInitialResult(item.result || null);
      setActiveTab('explain');
    } else if (item.type === 'optimization') {
      setCheckerInitialCode(item.code || '');
      setCheckerInitialLanguage(itemLang);
      setOptimizerInitialResult(item.result || null);
      setActiveTab('optimize');
    } else if (item.type === 'test') {
      setCheckerInitialCode(item.code || '');
      setCheckerInitialLanguage(itemLang);
      setTesterInitialResult(item.result || null);
      setActiveTab('test');
    } else if (item.type === 'validation') {
      setCombinedInitialProblem(item.problemStatement || '');
      setCombinedInitialLogic(item.logic || '');
      setValidatorInitialResult(item.result || null);
      setActiveTab('validate');
    } else if (item.type === 'logic-vs-code') {
      setCombinedInitialProblem(item.problemStatement || '');
      setCombinedInitialLogic(item.logic || '');
      setCombinedInitialCode(item.code || '');
      setCombinedInitialLanguage(itemLang);
      setLogicVsCodeInitialResult(item.result || null);
      setActiveTab('logic-vs-code');
    } else if (item.type === 'practice') {
      if (item.result) {
        setPracticeInitialState(item.result);
      } else {
        setPracticeInitialState({
          problem: item.problemStatement
            ? {
                id: `prob_${item.id}`,
                title: item.title,
                problemStatement: item.problemStatement,
                difficulty: 'Easy',
                topic: 'Arrays',
                constraints: [],
                examples: [],
              }
            : null,
          userLogic: item.logic || '',
          language: itemLang,
        });
      }
      setActiveTab('practice');
    } else if (item.type === 'convert') {
      setCheckerInitialCode(item.code || '');
      setCheckerInitialLanguage(itemLang);
      setConverterInitialResult(item.result || null);
      setActiveTab('convert');
    } else if (item.type === 'dry-run') {
      setCheckerInitialCode(item.code || '');
      setCheckerInitialLanguage(itemLang);
      setDryRunInitialSampleInput(item.result?.sampleInput);
      setDryRunInitialResult(item.result || null);
      setActiveTab('dry-run');
    } else if (item.type === 'combined') {
      setCombinedInitialProblem(item.problemStatement || '');
      setCombinedInitialLogic(item.logic || '');
      setCombinedInitialCode(item.code || '');
      setCombinedInitialLanguage(itemLang);
      setCombinedInitialResult(item.result || null);
      setActiveTab('combined');
    }

    setChatContext({
      language: itemLang,
      code: item.code,
      problem: item.problemStatement,
      logic: item.logic,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewSession={handleNewSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        chatMessageCount={chatMessageCount}
      />

      {/* Storage Warning Banner (Section 5) */}
      {storageWarning && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{storageWarning}</span>
            </div>
            <button
              onClick={() => setStorageWarning(null)}
              className="text-xs px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={setActiveTab}
            onSelectPreset={handleSelectPresetFromDashboard}
            recentHistory={history}
            onOpenHistoryItem={handleOpenHistoryItem}
          />
        )}

        {activeTab === 'generate' && (
          <GeneratorPage
            initialPreset={activePreset}
            initialResult={generatorInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onSendToChecker={handleSendToDebug}
            onSendToTester={handleSendToTester}
            onSendToDryRun={handleSendToDryRun}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {(activeTab === 'debug' || (activeTab as string) === 'check') && (
          <DebugPage
            initialCode={checkerInitialCode}
            initialLanguage={checkerInitialLanguage}
            initialResult={checkerInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onSendToOptimizer={handleSendToOptimizer}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'explain' && (
          <ExplainerPage
            initialCode={explainerInitialCode}
            initialLanguage={explainerInitialLanguage}
            initialResult={explainerInitialResult}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'optimize' && (
          <OptimizerPage
            initialCode={checkerInitialCode}
            initialLanguage={checkerInitialLanguage}
            initialResult={optimizerInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'test' && (
          <TesterPage
            initialCode={checkerInitialCode}
            initialLanguage={checkerInitialLanguage}
            initialResult={testerInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onSendToDebug={handleSendToDebug}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'validate' && (
          <LogicValidatorPage
            initialProblem={combinedInitialProblem}
            initialLogic={combinedInitialLogic}
            initialResult={validatorInitialResult}
            onSendToGenerator={handleSendToGenerator}
            onUpdateActiveContext={(ctx) => {
              setChatContext((prev) => ({ ...prev, ...ctx }));
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'logic-vs-code' && (
          <LogicVsCodePage
            initialProblem={combinedInitialProblem}
            initialLogic={combinedInitialLogic}
            initialCode={combinedInitialCode}
            initialLanguage={combinedInitialLanguage}
            initialResult={logicVsCodeInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onUpdateActiveContext={(ctx) => {
              setChatContext((prev) => ({ ...prev, ...ctx }));
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'practice' && (
          <PracticePage
            initialState={practiceInitialState}
            onSendToGenerator={handleSendToGenerator}
            onSendToExplainer={handleSendToExplainer}
            onUpdateActiveContext={(ctx) => {
              setChatContext((prev) => ({ ...prev, ...ctx }));
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'convert' && (
          <ConverterPage
            initialCode={checkerInitialCode}
            initialLanguage={checkerInitialLanguage}
            initialResult={converterInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onUpdateActiveContext={(ctx) => {
              setChatContext((prev) => ({ ...prev, ...ctx }));
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'dry-run' && (
          <DryRunPage
            initialCode={checkerInitialCode}
            initialLanguage={checkerInitialLanguage}
            initialSampleInput={dryRunInitialSampleInput}
            initialResult={dryRunInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onUpdateActiveContext={(ctx) => {
              setChatContext((prev) => ({ ...prev, ...ctx }));
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'combined' && (
          <CombinedAnalysisPage
            initialProblem={combinedInitialProblem}
            initialLogic={combinedInitialLogic}
            initialCode={combinedInitialCode}
            initialLanguage={combinedInitialLanguage}
            initialResult={combinedInitialResult}
            onSendToExplainer={handleSendToExplainer}
            onSendToChecker={handleSendToDebug}
            onUpdateActiveContext={(ctx) => {
              setChatContext(ctx);
              handleRefreshHistory();
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            onRefresh={handleRefreshHistory}
            onOpenItem={handleOpenHistoryItem}
          />
        )}
      </main>

      {/* AI Context Chat Drawer */}
      <AiChatDrawer
        key={chatSessionId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNewSession={handleNewSession}
        context={chatContext}
        onMessageCountChange={setChatMessageCount}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              Logic2Code AI
            </span>
            <span>·</span>
            <span>Think. Code. Debug. Understand.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Supported: Python · C · C++ · Java · JavaScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
