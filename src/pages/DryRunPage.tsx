import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCw,
  AlertCircle,
  FileCode,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { SupportedLanguage, DedicatedDryRunResult } from '../types';
import { runDryRun } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';

interface DryRunPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialSampleInput?: string;
  initialResult?: DedicatedDryRunResult | null;
  onSendToExplainer?: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
  }) => void;
}

const SAMPLE_CODE_FOR_DRY_RUN = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`;

export const DryRunPage: React.FC<DryRunPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialSampleInput = 'n = 4',
  initialResult,
  onSendToExplainer,
  onUpdateActiveContext,
}) => {
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_CODE_FOR_DRY_RUN);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [sampleInput, setSampleInput] = useState(initialSampleInput);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DedicatedDryRunResult | null>(initialResult || null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [copyTraceError, setCopyTraceError] = useState(false);

  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialSampleInput !== undefined) setSampleInput(initialSampleInput);
    if (initialResult !== undefined) {
      setResult(initialResult);
      setActiveStepIndex(0);
    }
  }, [initialCode, initialLanguage, initialSampleInput, initialResult]);

  const handleCopyTrace = async () => {
    if (!result) return;
    const lines = [
      `Sample Input: ${result.sampleInput}`,
      `Final Output: ${result.finalOutput}`,
      result.explanation ? `Summary: ${result.explanation}` : '',
      '',
      'Trace Steps:',
      ...result.traceSteps.map(
        (s) => `Step ${s.step}: [${s.currentLineOrAction}] -> State: ${s.state} (${s.explanation})`
      ),
    ].filter(Boolean).join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(lines);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = lines;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedTrace(true);
      setCopyTraceError(false);
      setTimeout(() => setCopiedTrace(false), 2000);
    } catch {
      setCopyTraceError(true);
      setTimeout(() => setCopyTraceError(false), 2500);
    }
  };

  const handleExecuteDryRun = async () => {
    if (!code.trim()) {
      setError('Please provide code to dry run.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveStepIndex(0);

    try {
      const data = await runDryRun({
        code,
        language,
        sampleInput,
      });

      setResult(data);

      saveHistoryItem({
        type: 'dry-run',
        title: `Dry Run: ${sampleInput || language}`,
        language,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while running the dry run. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevStep = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    if (!result) return;
    setActiveStepIndex((prev) => Math.min(result.traceSteps.length - 1, prev + 1));
  };

  const handleResetSteps = () => {
    setActiveStepIndex(0);
  };

  const currentStep = result?.traceSteps[activeStepIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Play className="w-6 h-6 text-cyan-500 fill-cyan-500/20" />
            <span>AI-Based Dry Run</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate step-by-step program execution with variable trackers, loop iteration states, and call-stack visualization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setCode(SAMPLE_CODE_FOR_DRY_RUN);
              setLanguage('python');
              setSampleInput('n = 4');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Recursion Example
          </button>
          <button
            onClick={() => {
              setCode('');
              setSampleInput('');
              setResult(null);
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Dry Run Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleExecuteDryRun}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code & Sample Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-500" />
                <span>Source Code & Input</span>
              </h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sample Input To Trace <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                placeholder="e.g. nums = [10, 25, 7, 42] or n = 4"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Source Code <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={11}
                placeholder="Paste code to simulate..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <button
              onClick={handleExecuteDryRun}
              disabled={isLoading || !code.trim() || !sampleInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Simulating Program Trace...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Dry Run</span>
                </>
              )}
            </button>
          </div>

          {onSendToExplainer && code.trim() && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <span className="text-slate-500">Need conceptual explanation?</span>
              <button
                onClick={() => onSendToExplainer(code, language)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Step-by-Step Execution */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Mandatory Transparency Notice (Phase 7 Distinction) */}
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/40 text-xs flex items-start gap-2.5 text-cyan-950 dark:text-cyan-200 shadow-xs">
                <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">AI Execution Walkthrough Disclaimer</span>
                  <span className="text-cyan-800 dark:text-cyan-300 text-[11px] leading-relaxed">
                    This is an AI-generated execution walkthrough and does not represent actual program execution.
                  </span>
                </div>
              </div>

              {/* Execution Summary & Final Output */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono font-semibold text-slate-500">
                      Execution Trace
                    </span>
                    <button
                      onClick={handleCopyTrace}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                      title="Copy trace steps to clipboard"
                    >
                      {copiedTrace ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : copyTraceError ? (
                        <>
                          <span className="text-rose-400">Copy Failed</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Trace</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs flex items-center gap-1.5">
                    <span className="text-slate-500">Final Output:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                      {result.finalOutput}
                    </span>
                  </div>
                </div>
                {result.explanation && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {result.explanation}
                  </p>
                )}
              </div>

              {/* Phase 9 Interactive Stepper Player */}
              {result.traceSteps.length > 0 && currentStep && (
                <div className="p-5 rounded-xl border-2 border-cyan-500/40 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-600 text-white">
                        Step {currentStep.step} of {result.traceSteps.length}
                      </span>
                      <span className="font-mono text-xs text-slate-500 hidden sm:inline">
                        Interactive Step Player
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleResetSteps}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Reset to step 1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>

                      <button
                        onClick={handlePrevStep}
                        disabled={activeStepIndex === 0}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                        title="Previous step"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous Step</span>
                      </button>

                      <button
                        onClick={handleNextStep}
                        disabled={activeStepIndex === result.traceSteps.length - 1}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                        title="Next step"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Step Details */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">
                          Current Action / Line
                        </span>
                        <span className="font-mono font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {currentStep.currentLineOrAction}
                        </span>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">
                          Variable State
                        </span>
                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800 inline-block">
                          {currentStep.state || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">
                        Step Explanation:
                      </span>
                      {currentStep.explanation}
                    </div>

                    {/* Recursion Call Stack if available */}
                    {currentStep.callStack && currentStep.callStack.length > 0 && (
                      <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                        <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Active Call Stack Progression</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                          {currentStep.callStack.map((frame, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/80 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700 shadow-xs"
                            >
                              {frame}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trace Steps Timeline List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  All Steps Timeline ({result.traceSteps.length} Steps)
                </span>

                <div className="space-y-2">
                  {result.traceSteps.map((step, idx) => {
                    const isSelected = activeStepIndex === idx;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`w-full text-left cursor-pointer p-3 rounded-xl border transition-all text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/30 shadow-xs ring-1 ring-cyan-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {step.step}
                            </span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                              {step.currentLineOrAction}
                            </span>
                          </div>

                          <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-900 shrink-0">
                            {step.state}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                          {step.explanation}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <Play className="w-8 h-8 text-cyan-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Interactive Dry Run Simulator</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Provide sample inputs on the left and click &quot;Run Dry Run&quot; to step through variable mutations, loops, and recursive call frames.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
